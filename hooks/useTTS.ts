import { useAudioPlayer } from "expo-audio";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import * as Speech from "expo-speech";
import React from "react";
const getOfflineAudioUri = async (audioUrl: string) => {
  // Hash URL → tên file sạch
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.MD5,
    audioUrl
  );

  const fileUri = FileSystem.documentDirectory + hash + ".mp3";

  const info = await FileSystem.getInfoAsync(fileUri);
  if (info.exists) {
    console.log("Audio file found in storage", fileUri);
    return fileUri;
  }
  console.log("Audio file not found in storage", fileUri);

  const { uri } = await FileSystem.downloadAsync(audioUrl, fileUri,{
    headers: {
      "api-key": Constants.expoConfig?.extra?.supabaseAnonKey,
      Authorization: `Bearer ${Constants.expoConfig?.extra?.supabaseAnonKey}`,
    },
  });
  return uri;
};
// "language": "ta-IN", "latency": 200, "name": "ta-in-x-tad-network", "networkConnectionRequired": true, "notInstalled": true, "quality": 400}, {"id": "yue-hk-x-yue-network", "language": "yue-HK", "latency": 200, "name": "yue-hk-x-yue-network", "networkConnectionRequired": true, "notInstalled": true, "quality": 400}, {"id": "lv-lv-x-imr-network", "language": "lv-LV", "latency": 200, "name": "lv-lv-x-imr-network", "networkConnectionRequired": true, "notInstalled": true, "quality": 400}, {"id": "en-us-x-iol-local", "language": "en-US", "latency": 200, "name": "en-us-x-iol-local", "networkConnectionRequired": false, "notInstalled": false, "quality": 400}]
const voices = Speech.getAvailableVoicesAsync().then((voices) => {
  const viVoice = voices.filter((voice) => voice.language === "vi-VN");
  const enVoice = voices.filter((voice) => voice.language === "en-US");
  return {
    viVoice,
    enVoice,
  };
});

export async function nativeTTS(
  text: string,
  language: "vi-VN" | "en-US",
  onFinish?: () => void
) {
  // const awaitedVoices = await voices
  // const voice = language === "vi-VN" ? awaitedVoices.viVoice[0] : awaitedVoices.enVoice[0]
  Speech.stop();
  Speech.speak(text, {
    language,
    onDone() {
      onFinish?.();
    },
  });
}
export default function useTTS() {
  const player = useAudioPlayer({
    uri: "",
  });

  const playAudio = React.useCallback(
    (audioUrl: string, onFinish?: () => void) => {
      if (audioUrl.startsWith("file://")) {
        player.replace({
          uri: audioUrl,
        });
        player.seekTo(0);
        player.play();
      } else {
        player.replace({
          uri: audioUrl,
          headers: {
            "api-key": Constants.expoConfig?.extra?.supabaseAnonKey,
            Authorization: `Bearer ${Constants.expoConfig?.extra?.supabaseAnonKey}`,
          },
        });
      }
      player.seekTo(0);
      player.addListener("playbackStatusUpdate", (status) => {
        if (status.didJustFinish) {
          onFinish?.();
          player.removeAllListeners("playbackStatusUpdate");
        }
      });
      player.play();
    },
    [player]
  );

  const pauseAudio = React.useCallback(() => {
    player.pause();
  }, [player]);

  const stopAudio = React.useCallback(() => {
    player.pause();
    player.seekTo(0);
  }, [player]);

  const playTTSOnline = React.useCallback(
    async (
      text: string,
      gender: "female" | "male",
      language: "vi" | "en",
      onFinish?: () => void,
      segmentId?: string
    ) => {
      console.log("playTTSOnline", text, gender, language, segmentId);
      let audioUrl = `${Constants.expoConfig?.extra?.supabaseUrl}/functions/v1/text-to-speech?text=${text}&gender=${gender}&lang=${language}`;

      if (segmentId) {
        audioUrl += `&segmentId=${segmentId}`;
      }

      // 👉 ưu tiên offline
      const uri = await getOfflineAudioUri(audioUrl);

      playAudio(uri, onFinish);
    },
    [player]
  );
  const playFastTTS = React.useCallback(
    async (text: string, onFinish?: () => void) => {
       const audioUrl = `${Constants.expoConfig?.extra?.supabaseUrl}/functions/v1/tts-fast?text=${text}&voiceId=5t6jb0zrz2vdJqomDzJI`;
       playAudio(audioUrl, onFinish);
    }, [playAudio]
  );

  const playTTSOffline = React.useCallback(
    async (
      text: string,
      language: "vi-VN" | "en-US",
      onFinish?: () => void
    ) => {
      nativeTTS(text, language, onFinish);
    },
    []
  );
  const stopAll = React.useCallback(() => {
    player.pause();
    player.seekTo(0);
    Speech.stop();
  }, [player]);

  const prefetchAudio = React.useCallback(
    async (
      text: string,
      gender: "female" | "male",
      language: "vi" | "en",
      segmentId?: string
    ) => {
      let audioUrl = `${Constants.expoConfig?.extra?.supabaseUrl}/functions/v1/text-to-speech?text=${text}&gender=${gender}&lang=${language}`;
      if (segmentId) {
        audioUrl += `&segmentId=${segmentId}`;
      }
      const fileUri = await getOfflineAudioUri(audioUrl);
      return audioUrl;
    },
    []
  );

  return {
    playAudio,
    pauseAudio,
    stopAudio,
    playTTSOnline,
    playTTSOffline,
    player,
    stopAll,
    prefetchAudio,
    playFastTTS,
    voices,
  };
}
