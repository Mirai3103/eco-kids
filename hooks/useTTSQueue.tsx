import { useAudioPlayer } from "expo-audio";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import PQueue from "p-queue";
import { useCallback, useRef, useState } from "react";

export default function useTTSQueue() {
  const [queue] = useState<PQueue>(() => new PQueue({ concurrency: 1 }));
  const player = useAudioPlayer({ uri: "" });
  const listenerRef = useRef<((status: any) => void) | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const prefetchAudio = useCallback(
    async (audioUrl: string): Promise<string> => {
      // Check cache
      if (cacheRef.current.has(audioUrl)) {
        return cacheRef.current.get(audioUrl)!;
      }

      // Download to cache
      const filename = `tts_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.mp3`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      try {
        const downloadResult = await FileSystem.downloadAsync(
          audioUrl,
          fileUri,
          {
            headers: {
              "api-key": Constants.expoConfig?.extra?.supabaseAnonKey,
              Authorization: `Bearer ${Constants.expoConfig?.extra?.supabaseAnonKey}`,
            },
          }
        );

        cacheRef.current.set(audioUrl, downloadResult.uri);
        return downloadResult.uri;
      } catch (error) {
        console.error("Prefetch failed:", error);
        return audioUrl; // Fallback to original URL
      }
    },
    []
  );

  const playAudio = useCallback(
    (audioUrl: string, originalUrl: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          if (listenerRef.current) {
            player.removeAllListeners("playbackStatusUpdate");
            listenerRef.current = null;
          }

          player.replace({ uri: audioUrl });

          const handleStatus = (status: any) => {
            if (status.didJustFinish) {
              player.removeAllListeners("playbackStatusUpdate");
              listenerRef.current = null;
              
              // Cleanup async (không block resolve)
              (async () => {
                cacheRef.current.delete(originalUrl);
                if (audioUrl.startsWith("file://")) {
                  try {
                    await FileSystem.deleteAsync(audioUrl, { idempotent: true });
                  } catch (err) {
                    console.error("Failed to delete file:", err);
                  }
                }
              })();
              
              resolve();
            }
          };

          listenerRef.current = handleStatus;
          player.addListener("playbackStatusUpdate", handleStatus);

          player.seekTo(0);
          player.play();
        } catch (error) {
          reject(error);
        }
      });
    },
    [player]
  );

  const playFastTTS = useCallback(
    async (text: string) => {
      const encodedText = encodeURIComponent(text);
      const audioUrl = `${Constants.expoConfig?.extra?.supabaseUrl}/functions/v1/tts-fast?text=${encodedText}&voiceId=5t6jb0zrz2vdJqomDzJI`;

      // Prefetch ngay lập tức (không đợi queue)
      const prefetchPromise = prefetchAudio(audioUrl);

      // Add vào queue
      return queue.add(async () => {
        const cachedUri = await prefetchPromise; // Đợi prefetch xong
        return playAudio(cachedUri, audioUrl);
      });
    },
    [playAudio, queue, prefetchAudio]
  );

  const clearCache = useCallback(async () => {
    for (const uri of cacheRef.current.values()) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (error) {
        console.error("Failed to delete cache:", error);
      }
    }
    cacheRef.current.clear();
  }, []);

  const forceStop = useCallback(() => {
    queue.clear();
    if (listenerRef.current) {
      player.removeAllListeners("playbackStatusUpdate");
      listenerRef.current = null;
    }
    player.pause();
    player.seekTo(0);
    clearCache();

  }, [player, queue, clearCache]);

  return {
    playFastTTS,
    forceStop,
    clearCache,
  };
}