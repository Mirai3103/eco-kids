import { useAudioPlayer } from "expo-audio";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import PQueue from "p-queue";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { nativeTTS } from "./useTTS";

type Lang = "vi" | "en";
type TTSLang = "vi-VN" | "en-US";

export default function useTTSQueue() {
  // 1 queue để PLAY (tuần tự)
  const [playQueue] = useState(() => new PQueue({ concurrency: 1 }));
  // 1 queue để DOWNLOAD (song song có giới hạn)
  const [downloadQueue] = useState(() => new PQueue({ concurrency: 3 }));

  const player = useAudioPlayer({ uri: "" });

  const listenerRef = useRef<((status: any) => void) | null>(null);

  // Session token: forceStop() sẽ tăng số này để invalidate mọi job cũ
  const sessionRef = useRef(0);

  // Track file đã tạo để cleanup
  const createdFilesRef = useRef(new Set<string>());

  // Cache theo (voiceId + text) để prefetch/reuse (tuỳ bạn có muốn reuse hay không)
  const cacheRef = useRef(new Map<string, string>());

  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const anonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

  const voiceId = "9toKzYEwXq5YS8A9nfcQ";

  const makeKey = useCallback((text: string) => `${voiceId}:${text}`, []);

  const cleanupFile = useCallback(async (uri: string) => {
    try {
      if (uri?.startsWith("file://")) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch {
      // ignore
    } finally {
      createdFilesRef.current.delete(uri);
    }
  }, []);

  const playAudio = useCallback(
    (audioUri: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          // cleanup listener cũ
          if (listenerRef.current) {
            player.removeAllListeners("playbackStatusUpdate");
            listenerRef.current = null;
          }

          // reset state
          player.pause();
          player.seekTo(0);

          // replace source
          player.replace({ uri: audioUri });

          const handleStatus = (status: any) => {
            if (status.didJustFinish) {
              player.removeAllListeners("playbackStatusUpdate");
              listenerRef.current = null;
              resolve();
            }
          };

          listenerRef.current = handleStatus;
          player.addListener("playbackStatusUpdate", handleStatus);

          player.seekTo(0);
          player.play();
        } catch (e) {
          reject(e);
        }
      });
    },
    [player]
  );

  const buildAudioUrl = useCallback(
    (text: string) => {
      const encodedText = encodeURIComponent(text);
      return `${supabaseUrl}/functions/v1/tts-fast?text=${encodedText}&voiceId=${voiceId}`;
    },
    [supabaseUrl]
  );

  const downloadToFile = useCallback(
    async (text: string) => {
      const url = buildAudioUrl(text);

      const filename = `tts_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.mp3`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      const res = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          "api-key": anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });

      createdFilesRef.current.add(res.uri);
      return res.uri;
    },
    [anonKey, buildAudioUrl]
  );

  // DOWNLOAD có cache + chạy trong downloadQueue
  const ensureDownloaded = useCallback(
    (text: string) => {
      const key = makeKey(text);

      // nếu đã có cache -> dùng lại luôn
      const cached = cacheRef.current.get(key);
      if (cached) return Promise.resolve(cached);

      // nếu chưa có -> đưa vào downloadQueue (có giới hạn concurrency)
      return downloadQueue.add(async () => {
        // double-check sau khi chờ queue
        const cached2 = cacheRef.current.get(key);
        if (cached2) return cached2;

        const uri = await downloadToFile(text);
        cacheRef.current.set(key, uri);
        return uri;
      });
    },
    [downloadQueue, downloadToFile, makeKey]
  );

  // PREFETCH: chỉ tải trước (không play)
  const prefetch = useCallback(
    async (text: string) => {
      await ensureDownloaded(text);
    },
    [ensureDownloaded]
  );

  // PLAY online: đảm bảo đúng thứ tự + tải song song
  const playFastTTS = useCallback(
    async (text: string, _lang?: Lang) => {
      const mySession = sessionRef.current;

      // kick download ngay (song song). Không await ngay ở đây cũng được,
      // nhưng mình vẫn để logic “chờ đúng file” khi tới lượt play.
      const downloadPromise = ensureDownloaded(text);

      // enqueue play theo thứ tự gọi
      return playQueue.add(async () => {
        // nếu forceStop đã xảy ra trước khi tới lượt play
        if (mySession !== sessionRef.current) return;

        const uri = await downloadPromise; // nếu chưa tải xong -> chờ ở đây

        // nếu forceStop xảy ra trong lúc chờ download
        if (mySession !== sessionRef.current) {
          // cleanup file đã tải (vì không play nữa)
          cacheRef.current.delete(makeKey(text));
          await cleanupFile(uri);
          return;
        }

        try {
          await playAudio(uri);
        } finally {
          // Nếu bạn muốn REUSE cache cho lần sau, comment 3 dòng dưới
          cacheRef.current.delete(makeKey(text));
          await cleanupFile(uri);
        }
      });
    },
    [ensureDownloaded, playQueue, playAudio, cleanupFile, makeKey]
  );

  // OFFLINE (nativeTTS) vẫn tuần tự
  const playTTSOffline = useCallback(
    async (text: string, language: TTSLang, onFinish?: () => void) => {
      return nativeTTS(text, language, onFinish);
    },
    []
  );

  const queueTTSOffline = useCallback(
    async (text: string, language: TTSLang) => {
      const mySession = sessionRef.current;

      return playQueue.add(
        () =>
          new Promise<void>((resolve) => {
            if (mySession !== sessionRef.current) return resolve();

            playTTSOffline(text, language, () => resolve());
          })
      );
    },
    [playQueue, playTTSOffline]
  );

  const forceStop = useCallback(() => {
    // invalidate mọi job cũ
    sessionRef.current += 1;

    // clear pending jobs (đang chạy thì không huỷ được, nhưng sẽ bị invalidate bởi sessionRef)
    playQueue.clear();
    downloadQueue.clear();

    // cleanup listener
    if (listenerRef.current) {
      player.removeAllListeners("playbackStatusUpdate");
      listenerRef.current = null;
    }

    // stop player
    try {
      player.pause();
      player.seekTo(0);
    } catch {
      // ignore
    }

    // cleanup cache map (uri sẽ được xoá bên dưới)
    cacheRef.current.clear();

    // xóa file đã tạo (best-effort)
    const uris = Array.from(createdFilesRef.current);
    uris.forEach((uri) => {
      cleanupFile(uri);
    });

    // thêm 1 lớp: dọn mọi file tts_ trong cacheDirectory (best-effort)
    if (FileSystem.cacheDirectory) {
      FileSystem.readDirectoryAsync(FileSystem.cacheDirectory)
        .then((files) => {
          const ttsFiles = files.filter((f) => f.startsWith("tts_"));
          return Promise.all(
            ttsFiles.map((f) =>
              FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${f}`, {
                idempotent: true,
              })
            )
          );
        })
        .catch(() => {});
    }
  }, [cleanupFile, downloadQueue, playQueue, player]);

  return {
    playFastTTS,
    prefetch,
    queueTTSOffline,
    forceStop,
  };
}
