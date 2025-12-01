import useTTS from "@/hooks/useTTS";
import { useSettingStore } from "@/stores/setting.store";
import { StoryWithSegments } from "@/types";
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
  const { prefetchAudio } = useTTS();
  const { defaultGender, defaultLanguage } = useSettingStore();
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
       prefetchAudio(
        defaultLanguage === "vi"
          ? segment.vi_text || ""
          : segment.en_text || "",
        defaultGender || "female",
        defaultLanguage || "vi",
        segment.id!
      ).then((audioUrl) => {
        console.log('audioUrl', audioUrl);
      }).catch((error) => {
        console.log('prefetchAudio error', error);
      });
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
  const story = await AsyncStorage.getItem(`story_${storyId}`);
  if (story) {
    return JSON.parse(story) as StoryWithSegments;
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
  return [];
};

export const deleteOfflineStory = async (storyId: string) => {
  try {
    // Get current story list
    const storyList = await AsyncStorage.getItem("storyList");
    if (!storyList) return;

    const stories = JSON.parse(storyList);
    
    // Remove story from list
    const updatedStories = stories.filter((story: any) => story.id !== storyId);
    await AsyncStorage.setItem("storyList", JSON.stringify(updatedStories));

    // Remove story segments
    await AsyncStorage.removeItem(`story_segments_${storyId}`);
    
    // Note: Images are cached by expo-image, they'll be cleared by system cache management
    console.log(`✅ Deleted offline story: ${storyId}`);
  } catch (error) {
    console.error("❌ Error deleting offline story:", error);
    throw error;
  }
};

export const clearAllOfflineStories = async () => {
  try {
    const storyList = await AsyncStorage.getItem("storyList");
    if (!storyList) return;

    const stories = JSON.parse(storyList);
    
    // Remove all story segments
    for (const story of stories) {
      await AsyncStorage.removeItem(`story_segments_${story.id}`);
    }

    // Clear story list
    await AsyncStorage.removeItem("storyList");
    
    // Clear expo-image cache
    await ExpoImage.clearDiskCache();
    
    console.log("✅ Cleared all offline stories");
  } catch (error) {
    console.error("❌ Error clearing offline stories:", error);
    throw error;
  }
};

export const getOfflineStorageSize = async () => {
  try {
    const storyList = await getAllOfflineStories();
    if (!storyList || storyList.length === 0) return 0;

    let totalSize = 0;
    
    // Calculate approximate size (this is an estimate)
    // In reality, you'd need to track actual file sizes
    for (const story of storyList) {
      const segments = await getStorySegmentsOfflineById(story.id);
      if (segments) {
        totalSize += segments.length * 0.5; // Approximate 0.5MB per segment
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error("❌ Error getting storage size:", error);
    return 0;
  }
};

export default useOfflineStory;
