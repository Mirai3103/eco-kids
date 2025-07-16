

import { Story } from "@/types";
import { UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "../supabase";

export const getAllStoriesQueryByTopicIdOptions = (topicId: string): UseQueryOptions<
  unknown,
  Error,
  Story[] | undefined,
  ["stories", string]
> => ({
  queryKey: ["stories", topicId],
  queryFn: async () =>
    await supabase
      .from("stories")
      .select("*")
      .eq("topic_id", topicId)
      .then((res) => res.data),
  select: (data) => data as Story[] | undefined,
});