import { useSpeechRecognize } from "@/hooks/useSpeechRecognize";
import useTTSQueue from "@/hooks/useTTSQueue";
import * as Crypto from "expo-crypto";
import { useCallback, useRef, useState } from "react";
import { generate } from "./flow";
import { SUPPORT_PROMPT } from "./prompt";
export default function useSupporter() {
  const [id] = useState(() => Crypto.randomUUID());
  const { playFastTTS, queueTTSOffline } = useTTSQueue();
  const contextRef = useRef("");

  const abortController = useRef<AbortController>(new AbortController());
  const [status, setStatus] = useState<
    "streaming" | "submitted" | "ready" | "error"
  >("ready");
  const [testText, setTestText] = useState("");

  const streamBuffer = useRef("");
  const lastPlayedSentence = useRef("");

  const handleSendMessage = useCallback(
    async (message: string, context?: string) => {
      context =context || contextRef.current;
      abortController.current.abort();
      abortController.current = new AbortController();

      // Reset buffer khi bắt đầu stream mới
      streamBuffer.current = "";
      lastPlayedSentence.current = "";

      function onChunk(chunk: string) {
        setTestText((prev) => prev + chunk);

        // Thêm chunk vào buffer
        streamBuffer.current += chunk;

        // Tìm câu hoàn chỉnh (kết thúc bằng .!?)
        const sentenceRegex = /[^.!?]*[.!?]+/g;
        const sentences = streamBuffer.current.match(sentenceRegex);

        if (sentences && sentences.length > 0) {
          // Lấy câu cuối cùng hoàn chỉnh
          const completeSentence = sentences[sentences.length - 1].trim();

          // Chỉ phát nếu câu này chưa được phát
          if (
            completeSentence &&
            completeSentence !== lastPlayedSentence.current
          ) {
            lastPlayedSentence.current = completeSentence;

            // Phát audio cho câu này
            queueTTSOffline(completeSentence, "vi-VN").catch((err) => {
              console.error("TTS error:", err);
            });

            // Xóa các câu đã phát khỏi buffer, giữ lại phần chưa hoàn chỉnh
            const lastSentenceEnd =
              streamBuffer.current.lastIndexOf(completeSentence) +
              completeSentence.length;
            streamBuffer.current =
              streamBuffer.current.substring(lastSentenceEnd);
          }
        }
      }

      try {
        setStatus("streaming");
        await generate({
          input: message,
          chatId: id,
          abortSignal: abortController.current.signal,
          onChunk,
          context,
          prompt:SUPPORT_PROMPT,
          withTool:false
        });

        // Sau khi stream xong, phát phần còn lại (nếu có)
        if (
          streamBuffer.current.trim() &&
          streamBuffer.current.trim() !== lastPlayedSentence.current
        ) {
          await queueTTSOffline(streamBuffer.current.trim(), "vi-VN");
        }
      } catch (error) {
        console.log(error);
        setTestText("");
        setStatus("error");
      } finally {
        setStatus("ready");
        setTestText("");
        streamBuffer.current = "";
        lastPlayedSentence.current = "";
      }
    },
    [id, playFastTTS]
  );
  const { isRecording, startRecognize, stopRecognize } = useSpeechRecognize({
    onSpeechStart() {},
    onSpeechResults(e) {
      console.log(e.value, "speechResults");
      if (e.value.length === 0) {
        return;
      }
      const recognizedText = e.value[0];
      handleSendMessage(recognizedText);
    },
  });
  const setContext = useCallback((context: string) => {
    contextRef.current = context;
  }, []);
  return {
    isRecording,
    startRecognize,
    stopRecognize,
    setContext,
  };
}
