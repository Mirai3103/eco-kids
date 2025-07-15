import { Topic } from "@/types";
import { supabase } from "../supabase";
import { UseQueryOptions } from "@tanstack/react-query";

export const getAllTopicsQueryOptions = (): UseQueryOptions<
  unknown,
  Error,
  Topic[] | undefined,
  ["topics"]
> => ({
  queryKey: ["topics"],
  queryFn: async () =>
    await supabase
      .from("topics")
      .select("*")
      .then((res) => res.data),
  select: (data) => data as Topic[] | undefined,
});

export const getTopicByIdQueryOptions = (
  id: string,
): UseQueryOptions<unknown, Error, Topic | undefined, ["topics", string]> => ({
  queryKey: ["topics", id],
  queryFn: async () =>
    await supabase
      .from("topics")
      .select("*")
      .eq("id", id)
      .then((res) => res.data?.[0]),
  select: (data) => data as Topic | undefined,
});
