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

  const startRecognize = useCallback(async (locale: string = "en-US") => {
    try {
      setError(null);
      setSpeechResults([]);
      await Voice.start(locale);
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
