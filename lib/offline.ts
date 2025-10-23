import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Image as ExpoImage } from "expo-image";
import * as Network from "expo-network";
import React, { useState } from "react";
import { supabase } from "./supabase";
async function cacheImage(url: string) {
  const filename = url.split("/").pop();
  const path = `${FileSystem.documentDirectory}${filename}`;
  const file = await FileSystem.getInfoAsync(path);
  if (!file.exists) {
    await FileSystem.downloadAsync(url, path);
  }
  return path;
}
export const isOffline = async () => {
  return !(await isOnline());
};
export const isOnline = async () => {
  const state = await Network.getNetworkStateAsync();
  return state.isConnected;
};

const useOfflineStory = (storyId: string) => {
  const [status, setStatus] = useState<
    "idle" | "downloading" | "completed" | "error"
  >("idle");
  React.useEffect(() => {
    async function checkDownloaded() {
      const storyList = await AsyncStorage.getItem("storyList");
      if (storyList) {
        const storyListData = JSON.parse(storyList);
        if (storyListData.some((story: any) => story.id === storyId)) {
          setStatus("completed");
        }
      }
    }
    checkDownloaded();
  }, []);

  const startDownload = async () => {
    if (["completed", "downloading"].includes(status)) {
      return;
    }
    setStatus("downloading");
    const { data: storyData } = await supabase
      .from("stories")
      .select("*, story_segments(*)")
      .eq("id", storyId)
      .single();
    const storyList = await AsyncStorage.getItem("storyList");
    await ExpoImage.prefetch(storyData?.cover_image_url || "", "disk");

    if (storyList) {
      const storyListData = JSON.parse(storyList);
      storyListData.push(storyData);
      await AsyncStorage.setItem("storyList", JSON.stringify(storyListData));
    } else {
      await AsyncStorage.setItem("storyList", JSON.stringify([storyData]));
    }

    const { data: storySegments } = await supabase
      .from("story_segments")
      .select("*, audio_segments(*)")
      .eq("story_id", storyId);
    for (const segment of storySegments || []) {
      if (segment.image_url) {
        await ExpoImage.prefetch(segment.image_url, "disk");
      }
      // tạm chưa prefetch audio
    }
    await AsyncStorage.setItem(
      `story_segments_${storyId}`,
      JSON.stringify(storySegments)
    );
    setStatus("completed");
  };
  return { status, startDownload };
};

export const getStoryOfflineById = async (storyId: string) => {
  const storyList = await AsyncStorage.getItem("storyList");
  if (storyList) {
    const storyListData = JSON.parse(storyList);
    return storyListData.find((story: any) => story.id === storyId);
  }
  return null;
};

export const getStorySegmentsOfflineById = async (storyId: string) => {
  const storySegments = await AsyncStorage.getItem(`story_segments_${storyId}`);
  if (storySegments) {
    return JSON.parse(storySegments);
  }
  return null;
};
export const getAllOfflineStories = async () => {
  const storyList = await AsyncStorage.getItem("storyList");
  if (storyList) {
    return JSON.parse(storyList);
  }
  return null;
};

export default useOfflineStory;
