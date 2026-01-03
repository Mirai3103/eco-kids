import useTTS from "@/hooks/useTTS";
import { useSettingStore } from "@/stores/setting.store";
import { StoryWithSegments } from "@/types";
import { db } from "@/stores/db";
import { stories, storySegments, audioSegments } from "@/stores/sqlite.schema";
import { eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system";
import { Image as ExpoImage } from "expo-image";
import * as Network from "expo-network";
import React, { useState } from "react";
import { supabase } from "./supabase";
import * as Crypto from "expo-crypto";
export async function createOfflineImageCache(imageUrl: string) : Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.MD5,
    imageUrl
  );
  const fileUri = `${FileSystem.cacheDirectory}${hash}.jpg`;
  const info = await FileSystem.getInfoAsync(fileUri);
  if (info.exists) {
    console.log("Image file found in storage", fileUri);
    return fileUri;
  }
  console.log("Image file not found in storage", fileUri);
  const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
  return uri;
}
export const isOffline = async () => {
  return !(await isOnline());
};

export const isOnline = async () => {
  const state = await Network.getNetworkStateAsync();
  console.log("state", state);
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
      try {
        const story = await db.query.stories.findFirst({
          where: (stories, { eq, and }) =>
            and(eq(stories.id, storyId), eq(stories.isDownloaded, true)),
        });
        if (story) {
          setStatus("completed");
        }
      } catch (error) {
        console.error("Error checking download status:", error);
      }
    }
    checkDownloaded();
  }, [storyId]);

  const startDownload = async () => {
    if (["completed", "downloading"].includes(status)) {
      return;
    }
    setStatus("downloading");

    try {
      // Fetch story data from Supabase
      const { data: storyData } = await supabase
        .from("stories")
        .select("*, story_segments(*)")
        .eq("id", storyId)
        .single();

      if (!storyData) {
        throw new Error("Story not found");
      }

      // Cache cover image
      let cachedCoverUrl = storyData?.cover_image_url || "";
      if (storyData?.cover_image_url) {
        try {
          cachedCoverUrl = await createOfflineImageCache(storyData.cover_image_url);
          console.log("📥 Cached story cover");
        } catch (error) {
          console.error("❌ Failed to cache cover:", error);
        }
      }

      // Fetch story segments with audio
      const { data: segmentsData } = await supabase
        .from("story_segments")
        .select("*, audio_segments(*)")
        .eq("story_id", storyId);

      // Cache segment images and prefetch audio
      const segmentsWithCachedImages = await Promise.all(
        (segmentsData || []).map(async (segment) => {
          let cachedImageUrl = segment.image_url || "";
          
          // Cache segment image nếu có
          if (segment.image_url) {
            try {
              cachedImageUrl = await createOfflineImageCache(segment.image_url);
              console.log(`📥 Cached segment image: ${segment.segment_index}`);
            } catch (error) {
              console.error(`❌ Failed to cache segment image:`, error);
            }
          }

          // Prefetch audio
          prefetchAudio(
            defaultLanguage === "vi"
              ? segment.vi_text || ""
              : segment.en_text || "",
            defaultGender || "female",
            defaultLanguage || "vi",
            segment.id!
          )
            .then((audioUrl) => {
              console.log("audioUrl", audioUrl);
            })
            .catch((error) => {
              console.log("prefetchAudio error", error);
            });

          return {
            ...segment,
            image_url: cachedImageUrl, // Thay thế bằng URI cache
          };
        })
      );

      const syncedAt = Date.now();

      // Save story to SQLite and mark as downloaded
      await db
        .insert(stories)
        .values({
          id: storyData.id,
          title: storyData.title || "",
          description: storyData.description || "",
          coverImageUrl: cachedCoverUrl, // Lưu URI cache
          topicId: storyData.topic_id || "",
          tags: JSON.stringify(storyData.tags || []),
          isActive: storyData.is_active || false,
          createdAt: storyData.created_at || "",
          viewsCount: storyData.views_count || 0,
          embedText: storyData.embed_text || "",
          embedding: storyData.embedding || "",
          isDownloaded: true,
          syncedAt,
        })
        .onConflictDoUpdate({
          target: stories.id,
          set: {
            coverImageUrl: cachedCoverUrl, // Update cover cache
            isDownloaded: true,
            syncedAt,
          },
        });

      // Save segments to SQLite với cached images
      if (segmentsWithCachedImages && segmentsWithCachedImages.length > 0) {
        for (const segment of segmentsWithCachedImages) {
          await db
            .insert(storySegments)
            .values({
              id: segment.id,
              storyId: segment.story_id || "",
              segmentIndex: segment.segment_index || 0,
              viText: segment.vi_text || "",
              enText: segment.en_text || "",
              imageUrl: segment.image_url || "", // Đã là URI cache
              syncedAt,
            })
            .onConflictDoUpdate({
              target: storySegments.id,
              set: {
                viText: segment.vi_text || "",
                enText: segment.en_text || "",
                imageUrl: segment.image_url || "", // Update với URI cache
                syncedAt,
              },
            });

          // Save audio segments if any
          const audioSegs = segment.audio_segments as any[];
          if (audioSegs && audioSegs.length > 0) {
            for (const audio of audioSegs) {
              await db
                .insert(audioSegments)
                .values({
                  id: audio.id,
                  segmentId: audio.segment_id || "",
                  audioUrl: audio.audio_url || "",
                  gender: audio.gender || "",
                  language: audio.language || "",
                  transcript: JSON.stringify(audio.transcript || {}),
                  createdAt: audio.created_at || "",
                  syncedAt,
                })
                .onConflictDoUpdate({
                  target: audioSegments.id,
                  set: {
                    audioUrl: audio.audio_url || "",
                    syncedAt,
                  },
                });
            }
          }
        }
      }

      setStatus("completed");
    } catch (error) {
      console.error("Error downloading story:", error);
      setStatus("error");
    }
  };

  return { status, startDownload };
};

// Lấy story offline theo ID (tương thích với code cũ)
export const getStoryOfflineById = async (
  storyId: string
): Promise<StoryWithSegments | null> => {
  try {
    const story = await db.query.stories.findFirst({
      where: (stories, { eq }) => eq(stories.id, storyId),
    });

    if (!story) {
      return null;
    }

    const segments = await db.query.storySegments.findMany({
      where: (storySegments, { eq }) => eq(storySegments.storyId, storyId),
    });

    return {
      ...story,
      tags: story.tags ? JSON.parse(story.tags) : [],
      cover_image_url: story.coverImageUrl,
      topic_id: story.topicId,
      is_active: story.isActive,
      created_at: story.createdAt,
      views_count: story.viewsCount,
      embed_text: story.embedText,
      story_segments: segments.map((seg) => ({
        id: seg.id,
        story_id: seg.storyId,
        segment_index: seg.segmentIndex,
        vi_text: seg.viText,
        en_text: seg.enText,
        image_url: seg.imageUrl,
      })),
    } as any;
  } catch (error) {
    console.error("Error getting offline story:", error);
    return null;
  }
};

// Lấy segments của story (tương thích với code cũ)
export const getStorySegmentsOfflineById = async (storyId: string) => {
  try {
    const segments = await db.query.storySegments.findMany({
      where: (storySegments, { eq }) => eq(storySegments.storyId, storyId),
    });

    return segments.map((seg) => ({
      id: seg.id,
      story_id: seg.storyId,
      segment_index: seg.segmentIndex,
      vi_text: seg.viText,
      en_text: seg.enText,
      image_url: seg.imageUrl,
    }));
  } catch (error) {
    console.error("Error getting offline segments:", error);
    return null;
  }
};

// Lấy tất cả stories đã download (tương thích với code cũ)
export const getAllOfflineStories = async (limit?: number) => {
  try {
    const storyList = await db.query.stories.findMany({
      // downloaded at first
      orderBy: (stories, { asc }) => asc(stories.isDownloaded),
      limit: limit,
    });

    const listPromise = storyList.map(async (story) => {
      const segments = await db.query.storySegments.findMany({
        where: (storySegments, { eq }) => eq(storySegments.storyId, story.id),
      });
      return {
        ...story,
        cover_image_url: story.coverImageUrl,
        topic_id: story.topicId,
        tags: story.tags ? JSON.parse(story.tags) : [],
        story_segments: segments,
        is_active: story.isActive,
        created_at: story.createdAt,
        views_count: story.viewsCount,
        embed_text: story.embedText,
      };
    });
    return await Promise.all(listPromise);
  } catch (error) {
    console.error("Error getting offline stories:", error);
    return [];
  }
};

// Xóa story offline
export const deleteOfflineStory = async (storyId: string) => {
  try {
    // Mark story as not downloaded
    await db
      .update(stories)
      .set({ isDownloaded: false })
      .where(eq(stories.id, storyId));

    // Optionally delete segments and audio segments
    await db.delete(storySegments).where(eq(storySegments.storyId, storyId));

    // Delete audio segments for this story
    const segments = await db.query.storySegments.findMany({
      where: (storySegments, { eq }) => eq(storySegments.storyId, storyId),
    });

    for (const segment of segments) {
      await db
        .delete(audioSegments)
        .where(eq(audioSegments.segmentId, segment.id));
    }

    console.log(`✅ Deleted offline story: ${storyId}`);
  } catch (error) {
    console.error("❌ Error deleting offline story:", error);
    throw error;
  }
};

// Xóa tất cả stories offline
export const clearAllOfflineStories = async () => {
  try {
    // Mark all stories as not downloaded
    await db.update(stories).set({ isDownloaded: false });

    // Clear FileSystem cache
    const cacheDir = FileSystem.cacheDirectory;
    if (cacheDir) {
      const files = await FileSystem.readDirectoryAsync(cacheDir);
      for (const file of files) {
        if (file.endsWith('.jpg')) {
          await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
        }
      }
    }

    // Clear expo-image cache (for memory cache)
    await ExpoImage.clearDiskCache();

    console.log("✅ Cleared all offline stories and cached images");
  } catch (error) {
    console.error("❌ Error clearing offline stories:", error);
    throw error;
  }
};

// Lấy kích thước storage (ước tính)
export const getOfflineStorageSize = async () => {
  try {
    const storyList = await getAllOfflineStories();
    if (!storyList || storyList.length === 0) return 0;

    let totalSize = 0;

    // Calculate approximate size
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
