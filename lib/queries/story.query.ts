import { Story, StoryWithSegments } from "@/types";
import { UseQueryOptions } from "@tanstack/react-query";
import {
  getAllOfflineStories,
  getStoryOfflineById,
  isOffline,
} from "../offline";
import { supabase } from "../supabase";

export const getAllStoriesQueryByTopicIdOptions = (
  topicId: string
): UseQueryOptions<
  unknown,
  Error,
  Story[] | undefined,
  ["stories", string]
> => ({
  queryKey: ["stories", topicId],
  queryFn: async () => {
    console.log("fetching all stories data............");
    return await supabase
      .from("stories")
      .select("*")
      .eq("topic_id", topicId)
      .then((res) => res.data);
  },
  select: (data) => data as Story[] | undefined,
});
export const getStoryByIdQueryOptions = (
  id: string
): UseQueryOptions<unknown, Error, Story | undefined, ["story", string]> => ({
  queryKey: ["story", id],
  queryFn: async () => {
    const story = await getStoryOfflineById(id);
    if (story) {
      console.log("get cached story success");
      return story as StoryWithSegments | undefined;
    }
    const { data } = await supabase
      .from("stories")
      .select("*, story_segments(*)")
      .eq("id", id)
      .single();
    return data as StoryWithSegments | undefined;
  },
});

export const getAllStoriesQueryOptions = (
  skip: number,
  limit: number
): UseQueryOptions<unknown, Error, Story[] | undefined, ["stories"]> => ({
  queryKey: ["stories"],
  queryFn: async () => {
    if (await isOffline()) {
      const storyList = await getAllOfflineStories();
      return storyList as Story[] | undefined;
    }
    return await supabase
      .from("stories")
      .select("*")
      .range(skip, skip + limit)
      .then((res) => res.data || []);
  },
  select: (data) => data as Story[] | undefined,
});

export const getAllRecommendedStoriesQueryOptions = (
  user_id: string,
  limit: number = 10
): UseQueryOptions<
  unknown,
  Error,
  Story[] | undefined,
  ["recommended_stories", string, number]
> => ({
  queryKey: ["recommended_stories", user_id, limit],
  queryFn: async () => {
    if (!user_id) {
      throw new Error("user_id is required");
    }
    return await supabase
      .rpc("get_recommended_stories_for_user", {
        p_user_id: user_id,
        p_limit: limit,
      })
      .then((res) => res.data || []);
  },
  enabled: !!user_id,
  select: (data) => data as Story[] | undefined,
});
