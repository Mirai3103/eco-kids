import { db } from "@/stores/db";
import { supabase } from "@/lib/supabase";
import { topics, stories } from "@/stores/sqlite.schema";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tables } from "@/types/database.types";
import { ToastAndroid } from "react-native";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
const SYNC_FLAG_KEY = "offline_data_synced";

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
export function useSyncOfflineData(userId: string | undefined, isOfflineMode: boolean) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || isOfflineMode) {
      return;
    }

    async function syncData() {
      try {
        // Kiểm tra xem đã sync chưa
        const syncFlag = await AsyncStorage.getItem(SYNC_FLAG_KEY);
        if (syncFlag === "true") {
          console.log("📦 Data already synced, skipping...");
          return;
        }

        console.log("🔄 Starting offline data sync...");
        setIsSyncing(true);

        // 1. Fetch topics từ Supabase
        const { data: topicsData, error: topicsError } = await supabase
          .from("topics")
          .select("*");

        if (topicsError) throw topicsError;

        // 2. Fetch stories từ Supabase (chỉ metadata, không fetch segments)
        const { data: storiesData, error: storiesError } = await supabase
          .from("stories")
          .select("*")
          .eq("is_active", true);

        if (storiesError) throw storiesError;

        const syncedAt = Date.now();

        // 3. Download topic icons và insert topics vào SQLite
        if (topicsData && topicsData.length > 0) {
          const topicsWithCachedImages = await Promise.all(
            topicsData.map(async (topic: Tables<"topics">) => {
              const metaData = topic.meta_data as any;
              let cachedMetaData = metaData;
              
              // Cache topic icon nếu có
              if (metaData?.icon) {
                try {
                  const cachedIconUri = await createOfflineImageCache(metaData.icon);
                  cachedMetaData = {
                    ...metaData,
                    icon: cachedIconUri, // Thay thế URL gốc bằng URI cache
                  };
                  console.log(`📥 Cached topic icon: ${topic.name}`);
                } catch (error) {
                  console.error(`❌ Failed to cache icon for topic ${topic.name}:`, error);
                }
              }
              
              return {
                id: topic.id,
                name: topic.name || "",
                description: topic.description || "",
                metaData: JSON.stringify(cachedMetaData),
                syncedAt,
              };
            })
          );
          
          await db.insert(topics).values(topicsWithCachedImages);
          console.log(`✅ Synced ${topicsData.length} topics with cached images`);
        }

        // 4. Download story covers và insert stories vào SQLite
        if (storiesData && storiesData.length > 0) {
          const storiesWithCachedCovers = await Promise.all(
            storiesData.map(async (story: Tables<"stories">) => {
              let cachedCoverUrl = story.cover_image_url || "";
              
              // Cache story cover nếu có
              if (story.cover_image_url) {
                try {
                  cachedCoverUrl = await createOfflineImageCache(story.cover_image_url);
                  console.log(`📥 Cached cover: ${story.title}`);
                } catch (error) {
                  console.error(`❌ Failed to cache cover for story ${story.title}:`, error);
                  cachedCoverUrl = story.cover_image_url; // Fallback to original URL
                }
              }
              
              return {
                id: story.id,
                title: story.title || "",
                description: story.description || "",
                coverImageUrl: cachedCoverUrl, // Lưu URI cache thay vì URL gốc
                topicId: story.topic_id || "",
                tags: JSON.stringify(story.tags || []),
                isActive: story.is_active || false,
                createdAt: story.created_at || "",
                viewsCount: story.views_count || 0,
                embedText: "",
                embedding: "",
                isDownloaded: false,  // Chưa download offline, chỉ sync metadata
                syncedAt,
              };
            })
          );
          
          await db.insert(stories).values(storiesWithCachedCovers);
          console.log(`✅ Synced ${storiesData.length} stories with cached covers`);
        }

        // 5. Mark as synced (không cần prefetch nữa vì đã cache bằng FileSystem)
        await AsyncStorage.setItem(SYNC_FLAG_KEY, "true");
        console.log("✅ Offline data sync completed!");
        ToastAndroid.show("Sync offline data completed!", ToastAndroid.SHORT);

      } catch (error) {
        console.error("❌ Error syncing offline data:", error);
        setSyncError(error as Error);
      } finally {
        setIsSyncing(false);
      }
    }

    syncData();
  }, [userId, isOfflineMode]);

  return { isSyncing, syncError };
}
