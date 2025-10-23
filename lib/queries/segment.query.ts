import { StorySegment } from "@/types";
import { UseQueryOptions } from "@tanstack/react-query";
import { getStorySegmentsOfflineById } from "../offline";
import { supabase } from "../supabase";

export const getAllStorySegmentsQueryByStoryIdOptions = (
  storyId: string
): UseQueryOptions<
  unknown,
  Error,
  StorySegment[] | undefined,
  ["story_segments", string]
> => ({
  queryKey: ["story_segments", storyId],
  queryFn: async () => {
    const storySegments = await getStorySegmentsOfflineById(storyId);
    if (storySegments) {
      console.log("get cached story segments success");
      return storySegments as StorySegment[] | undefined;
    }
    return await supabase
      .from("story_segments")
      .select("*, audio_segments(*)")
      .eq("story_id", storyId)
      .then((res) => {
        return res.data;
      });
  },
  select: (data) => data as StorySegment[] | undefined,
});
