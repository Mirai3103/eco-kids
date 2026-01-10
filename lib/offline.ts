import useTTS, { getOfflineAudioUri } from "@/hooks/useTTS";
import { db } from "@/stores/db";
import { useSettingStore } from "@/stores/setting.store";
import { audioSegments, stories, storySegments } from "@/stores/sqlite.schema";
import { StoryWithSegments } from "@/types";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import { Image as ExpoImage } from "expo-image";
import * as Network from "expo-network";
import React, { useState } from "react";
import { supabase } from "./supabase";
export async function createOfflineImageCache(
  imageUrl: string
): Promise<string> {
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
  const [progress, setProgress] = useState<number>(0);

  React.useEffect(() => {
    async function checkDownloaded() {
      try {
        const story = await db.query.stories.findFirst({
          where: (stories, { eq, and }) =>
            and(eq(stories.id, storyId), eq(stories.isDownloaded, true)),
        });
        if (story) {
          setStatus("completed");
          setProgress(100);
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
    setProgress(0);

    try {
      // Step 1: Fetch story data (0% -> 5%)
      const { data: storyData } = await supabase
        .from("stories")
        .select("*, story_segments(*)")
        .eq("id", storyId)
        .single();

      if (!storyData) {
        throw new Error("Story not found");
      }
      setProgress(5);

      // Step 2: Cache cover image (5% -> 10%)
      let cachedCoverUrl = storyData?.cover_image_url || "";
      if (storyData?.cover_image_url) {
        try {
          cachedCoverUrl = await createOfflineImageCache(
            storyData.cover_image_url
          );
          console.log("📥 Cached story cover");
        } catch (error) {
          console.error("❌ Failed to cache cover:", error);
        }
      }
      setProgress(10);

      // Step 3: Fetch story segments with audio (10% -> 15%)
      const { data: segmentsData } = await supabase
        .from("story_segments")
        .select("*, audio_segments(*)")
        .eq("story_id", storyId);

      setProgress(15);

      const totalSegments = segmentsData?.length || 0;
      if (totalSegments === 0) {
        throw new Error("No segments found");
      }

      // Step 4: Cache segment images song song (15% -> 60%)
      let completedImages = 0;
      const segmentsWithCachedImages = await Promise.all(
        segmentsData!.map(async (segment) => {
          let cachedImageUrl = segment.image_url || "";

          if (segment.image_url) {
            try {
              cachedImageUrl = await createOfflineImageCache(segment.image_url);
              console.log(`📥 Cached segment image: ${segment.segment_index}`);
            } catch (error) {
              console.error(`❌ Failed to cache segment image:`, error);
            }
          }

          completedImages++;
          const imageProgress = 15 + (completedImages / totalSegments) * 45;
          setProgress(Math.round(imageProgress));

          return {
            ...segment,
            image_url: cachedImageUrl,
          };
        })
      );

      const syncedAt = Date.now();

      // Step 5: Save story to SQLite (60% -> 65%)
      await db
        .insert(stories)
        .values({
          id: storyData.id,
          title: storyData.title || "",
          description: storyData.description || "",
          coverImageUrl: cachedCoverUrl,
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
            coverImageUrl: cachedCoverUrl,
            isDownloaded: true,
            syncedAt,
          },
        });
      setProgress(65);

      // Step 6: Save segments and audio song song (65% -> 100%)
      if (segmentsWithCachedImages.length > 0) {
        let completedItems = 0;
        const totalItems = segmentsWithCachedImages.reduce(
          (sum, seg) => sum + 1 + (seg.audio_segments?.length || 0),
          0
        );

        // Save tất cả segments song song
        await Promise.all(
          segmentsWithCachedImages.map(async (segment) => {
            // Save segment
            await db
              .insert(storySegments)
              .values({
                id: segment.id,
                storyId: segment.story_id || "",
                segmentIndex: segment.segment_index || 0,
                viText: segment.vi_text || "",
                enText: segment.en_text || "",
                imageUrl: segment.image_url || "",
                syncedAt,
              })
              .onConflictDoUpdate({
                target: storySegments.id,
                set: {
                  viText: segment.vi_text || "",
                  enText: segment.en_text || "",
                  imageUrl: segment.image_url || "",
                  syncedAt,
                },
              });

            completedItems++;
            const saveProgress = 65 + (completedItems / totalItems) * 35;
            setProgress(Math.round(saveProgress));

            // Save audio segments song song
            const audioSegs = segment.audio_segments;
            if (audioSegs && audioSegs.length > 0) {
              await Promise.all(
                audioSegs.map(async (audio) => {
                  if (!audio.audio_url) {
                    completedItems++;
                    return;
                  }

                  try {
                    const localUri = await getOfflineAudioUri(audio.audio_url || "");
                    await db
                      .insert(audioSegments)
                      .values({
                        id: audio.id,
                        segmentId: audio.segment_id || "",
                        audioUrl: localUri,
                        gender: audio.gender || "",
                        language: audio.language || "",
                        transcript: JSON.stringify(audio.transcript || {}),
                        createdAt: audio.created_at || "",
                        syncedAt,
                      })
                      .onConflictDoUpdate({
                        target: audioSegments.id,
                        set: {
                          audioUrl: localUri,
                          syncedAt,
                        },
                      });
                  } catch (error) {
                    console.error("❌ Failed to save audio:", error);
                  }

                  completedItems++;
                  const saveProgress = 65 + (completedItems / totalItems) * 35;
                  setProgress(Math.round(saveProgress));
                })
              );
            }
          })
        );
      }

      setProgress(100);
      setStatus("completed");
      console.log("✅ Download completed successfully");
    } catch (error) {
      console.error("❌ Error downloading story:", error);
      setStatus("error");
      setProgress(0);
    }
  };
  return { status, progress, startDownload };
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

    const segmentsWithAudio = await Promise.all(segments.map(async (seg) =>{
      const audioSegments = await db.query.audioSegments.findMany({
        where: (audioSegments, { eq }) => eq(audioSegments.segmentId, seg.id),
      });
      return  ({
        id: seg.id,
        story_id: seg.storyId,
        segment_index: seg.segmentIndex,
        audio_segments: audioSegments,
        vi_text: seg.viText,
        en_text: seg.enText,
        image_url: seg.imageUrl,
      })
    }));
    return segmentsWithAudio;
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
        if (file.endsWith(".jpg")) {
          await FileSystem.deleteAsync(`${cacheDir}${file}`, {
            idempotent: true,
          });
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
