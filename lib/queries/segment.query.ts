import { StorySegment } from "@/types";
import { UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "../supabase";




export const getAllStorySegmentsQueryByStoryIdOptions = (storyId: string): UseQueryOptions<
  unknown,
  Error,
  StorySegment[] | undefined,
  ["story_segments", string]
> => ({
  queryKey: ["story_segments", storyId],
  queryFn: async () =>{
    console.log('fetching all stories data............')
    return await supabase
      .from("story_segments")
      .select("*")
      .eq("story_id", storyId)
      .then((res) => res.data)
  },
  select: (data) => data as StorySegment[] | undefined,
});

