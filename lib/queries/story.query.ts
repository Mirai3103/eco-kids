

import { Story, StoryWithSegments } from "@/types";
import { UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "../supabase";

export const getAllStoriesQueryByTopicIdOptions = (topicId: string): UseQueryOptions<
  unknown,
  Error,
  Story[] | undefined,
  ["stories", string]
> => ({
  queryKey: ["stories", topicId],
  queryFn: async () =>{
    console.log('fetching all stories data............')
    return await supabase
      .from("stories")
      .select("*")
      .eq("topic_id", topicId)
      .then((res) => res.data)
  },
  select: (data) => data as Story[] | undefined,
});
export const getStoryByIdQueryOptions = (id: string): UseQueryOptions<
  unknown,
  Error,
  Story | undefined,
  ["story", string]
> => ({
  queryKey: ["story", id],
  queryFn: async () => {
    console.log('fetching story detail data............')
    const { data, error } = await supabase
      .from("stories")
      .select("*, story_segments(*)")
      .eq("id", id)
      .single()
    
    return data as StoryWithSegments | undefined
  }
})