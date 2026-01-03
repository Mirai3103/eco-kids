import { Topic } from "@/types";
import { UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { isOffline } from "../offline";
import { db } from "@/stores/db";
import { topics } from "@/stores/sqlite.schema";
import { eq } from "drizzle-orm";

export const getAllTopicsQueryOptions = (): UseQueryOptions<
  unknown,
  Error,
  Topic[] | undefined,
  ["topics"]
> => ({
  queryKey: ["topics"],
  queryFn: async () =>
   {
    console.log('fetching data............')
    if (await isOffline()) {
      return await db.select().from(topics).then((res) => {
        return res.map((topic) => ({
          ...topic,
          meta_data: JSON.parse(topic.metaData || "{}"),
        }));
      });
    }
    return  await supabase
    .from("topics")
    .select("*")
    .then((res) => res.data)
   },
  select: (data) => data as Topic[] | undefined,
});

export const getTopicByIdQueryOptions = (
  id: string,
): UseQueryOptions<unknown, Error, Topic | undefined, ["topics", string]> => ({
  queryKey: ["topics", id],
  queryFn: async () => {
    console.log("getTopicByIdQueryOptions", id);
    if (await isOffline()) {
      const topic = await db.select().from(topics).where(eq(topics.id, id)).then((res) => {
        return res.map((topic) => ({
          ...topic,
          meta_data: JSON.parse(topic.metaData || "{}"),
        }));
      });
      return topic?.[0];
    }
    return await supabase
      .from("topics")
      .select("*")
      .eq("id", id)
      .then((res) => res.data?.[0])
    },
  select: (data) => data as Topic | undefined,
});
