import { useAudioPlayer } from "expo-audio";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import PQueue from "p-queue";
import React, { useCallback, useRef, useState } from "react";
import { nativeTTS } from "./useTTS";

export default function useTTSQueue() {
  const [queue] = useState<PQueue>(() => new PQueue({ concurrency: 1 }));
  const player = useAudioPlayer({ uri: "" });
  const listenerRef = useRef<((status: any) => void) | null>(null);
  
  const playTTSOffline = React.useCallback(
    async (
      text: string,
      language: "vi-VN" | "en-US",
      onFinish?: () => void
    ) => {
      return nativeTTS(text, language, onFinish);
    },
    [nativeTTS]
  );
  const playAudio = useCallback(
    (audioUrl: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          // Cleanup listener cũ
          if (listenerRef.current) {
            player.removeAllListeners("playbackStatusUpdate");
            listenerRef.current = null;
          }

          // QUAN TRỌNG: Stop player để reset state
          player.pause();

          // Replace player URI
          player.replace({ uri: audioUrl });

          const handleStatus = (status: any) => {
            if (status.didJustFinish) {
              player.removeAllListeners("playbackStatusUpdate");
              listenerRef.current = null;

              // Cleanup file sau khi phát
              if (audioUrl.startsWith("file://")) {
                FileSystem.deleteAsync(audioUrl, { idempotent: true }).catch(
                  (err) => console.error("Failed to delete file:", err)
                );
              }

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
      console.log("add to queue", text, "time:", new Date().toISOString());

      const encodedText = encodeURIComponent(text);
      const audioUrl = `${Constants.expoConfig?.extra?.supabaseUrl}/functions/v1/tts-fast?text=${encodedText}&voiceId=5t6jb0zrz2vdJqomDzJI`;

      // Add vào queue
      return queue.add(async () => {
        try {
          console.log("downloading", text, "time:", new Date().toISOString());

          // Download file mới mỗi lần
          const filename = `tts_${Date.now()}_${Math.random()
            .toString(36)
            .substring(7)}.mp3`;
          const fileUri = `${FileSystem.cacheDirectory}${filename}`;

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

          console.log("play audio", text, "time:", new Date().toISOString());

          // Play audio (tự động cleanup file sau khi xong)
          await playAudio(downloadResult.uri);

          console.log("finished audio", text, "time:", new Date().toISOString());
        } catch (error) {
          console.error("Play failed:", error);
          throw error;
        }
      });
    },
    [playAudio, queue]
  );
  const queueTTSOffline = useCallback(
    async (text: string, language: "vi-VN" | "en-US") => {
      return queue.add(async () => {
        return new Promise((resolve, reject) => {
          playTTSOffline(text, language, () => {
            resolve(void 0);
          });
        });
      });
    },
    [playTTSOffline, queue]
  );

  const forceStop = useCallback(() => {
    // Clear queue
    queue.clear();

    // Cleanup listener
    if (listenerRef.current) {
      player.removeAllListeners("playbackStatusUpdate");
      listenerRef.current = null;
    }

    // Stop player
    player.pause();
    player.seekTo(0);

    // Cleanup all cache files
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
        .catch((err) => console.error("Failed to clear cache:", err));
    }
  }, [player, queue]);

  return {
    playFastTTS,
    forceStop,
    queueTTSOffline,
  };
}