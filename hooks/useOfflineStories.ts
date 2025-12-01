import {
    clearAllOfflineStories,
    deleteOfflineStory,
    getAllOfflineStories,
    getOfflineStorageSize,
} from "@/lib/offline";
import type { StoryWithSegments } from "@/types";
import { useCallback, useEffect, useState } from "react";

export const useOfflineStories = () => {
  const [stories, setStories] = useState<StoryWithSegments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageSize, setStorageSize] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadStories = useCallback(async () => {
    try {
      setIsLoading(true);
      const offlineStories = await getAllOfflineStories();
      setStories(offlineStories || []);
      
      const size = await getOfflineStorageSize();
      setStorageSize(size);
    } catch (error) {
      console.error("Error loading offline stories:", error);
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteStory = useCallback(
    async (storyId: string) => {
      try {
        setIsDeleting(true);
        await deleteOfflineStory(storyId);
        await loadStories(); // Reload list
      } catch (error) {
        console.error("Error deleting story:", error);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [loadStories]
  );

  const clearAll = useCallback(async () => {
    try {
      setIsDeleting(true);
      await clearAllOfflineStories();
      await loadStories(); // Reload list
    } catch (error) {
      console.error("Error clearing all stories:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [loadStories]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  return {
    stories,
    isLoading,
    isDeleting,
    storageSize,
    deleteStory,
    clearAll,
    refresh: loadStories,
  };
};

