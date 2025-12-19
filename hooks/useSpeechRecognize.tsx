import Voice from "@laffy1309/react-native-voice-input";
import { useCallback, useEffect, useState } from "react";

interface UseSpeechRecognizeReturn {
  isRecording: boolean;
  speechResults: string[];
  startRecognize: (locale?: string) => Promise<void>;
  stopRecognize: () => Promise<void>;
  error: string | null;
}
interface IUseSpeechRecognizeOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechResults?: (e: { value: string[] }) => void;
  onSpeechError?: (e: { error: { message: string } }) => void;
}

export const useSpeechRecognize = (
  options: IUseSpeechRecognizeOptions = {}
): UseSpeechRecognizeReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechResults, setSpeechResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Đăng ký các event listeners
    Voice.onSpeechStart = () => {
      setIsRecording(true);
      setError(null);
      options.onSpeechStart?.();
    };

    Voice.onSpeechEnd = (e) => {
      setIsRecording(false);
    };

    Voice.onSpeechResults = (e) => {
      if (e.value) {
        setSpeechResults(e.value);
        options.onSpeechResults?.({
          value: e.value,
        });
      }
    };

    Voice.onSpeechError = (e) => {
      setError(e.error?.message || "Unknown error");
      console.log(e.error);
      setIsRecording(false);
    };

    // Cleanup khi component unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecognize = useCallback(async (locale: string = "vi-VN") => {
    try {
      setError(null);
      setSpeechResults([]);
      await Voice.start(locale, {
        EXTRA_MAX_RESULTS: 8,

        // Cho bé ngập ngừng chút không bị kết thúc sớm
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 12000,
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
        "android.speech.extra.DICTATION_MODE": true,
        "android.speech.extra.LANGUAGE_MODEL": "free_form",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start recognition"
      );
      setIsRecording(false);
    }
  }, []);

  const stopRecognize = useCallback(async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to stop recognition"
      );
    }
  }, []);

  return {
    isRecording,
    speechResults,
    startRecognize,
    stopRecognize,
    error,
  };
};
