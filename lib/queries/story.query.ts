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
  user_id?: string,
  last_read_story_id?: string, // truyện vừa đọc xong
  limit: number = 10
): UseQueryOptions<
  unknown,
  Error,
  Story[] | undefined, 
  ["recommended_stories", string | undefined, string | undefined, number]> => ({
  queryKey: ["recommended_stories", user_id, last_read_story_id, limit],
  queryFn: async () => {
    const timeStart = performance.now();
    if (!user_id) {
      throw new Error("user_id is required");
    }

    // Lấy thông tin user (recommend_vector) và truyện vừa đọc (embedding)
    const [userRes, lastStoryRes, readHistoryRes] = await Promise.all([
      supabase
        .from("users")
        .select("recommend_vector")
        .eq("id", user_id)
        .single(),
      
      last_read_story_id
        ? supabase
            .from("stories")
            .select("embedding")
            .eq("id", last_read_story_id)
            .single()
        : Promise.resolve({ data: null }),
      
      // Lấy danh sách truyện đã đọc để loại bỏ
      supabase
        .from("reading_history")
        .select("story_id")
        .eq("user_id", user_id)
        .order("read_at", { ascending: false })
        .limit(3)
    ]);

   

    const userVector = userRes.data?.recommend_vector;
    const storyEmbedding = lastStoryRes.data?.embedding;
    const readStoryIds = readHistoryRes.data?.map(h => h.story_id) || [];

    // Nếu user chưa có vector và chưa có truyện vừa đọc → fallback về popular
    if (!userVector && !storyEmbedding) {
      const { data } = await supabase
        .from("stories")
        .select("*")
        .eq("is_active", true)
        .not("id", "in", `(${readStoryIds.join(",")})`)
        .order("views_count", { ascending: false })
        .limit(limit);
      console.log("data", data);
      return data || [];
    }
    
    // Truy vấn song song 2 nhánh
    const contentBasedPromise = storyEmbedding
      ? supabase.rpc("match_stories", {
          query_embedding: storyEmbedding,
          match_count: Math.ceil(limit / 2), // lấy 50% từ content-based
          match_threshold: 0.5,
        })
      : Promise.resolve({ data: [] });
    const userBasedPromise = userVector
      ? supabase.rpc("match_stories", {
          query_embedding: userVector,
          match_count: 10,
          match_threshold: 0.5,
        })
      : Promise.resolve({ data: [] });

    const [contentRes, userRes1] = await Promise.all([
      contentBasedPromise,
      userBasedPromise,
    ]);
 
    const contentBased = contentRes.data || [];
    const userBased = userRes1.data || [];

    // Gộp kết quả theo kiểu xen kẽ (interleaving)
    const combined = new Map<string, Story>();
    let contentIdx = 0;
    let userIdx = 0;
    while (combined.size < limit) {
      // Xen kẽ lấy từ content-based
      if (contentIdx < contentBased.length) {
        const story = contentBased[contentIdx];
        if (!readStoryIds.includes(story.id) && !combined.has(story.id)) {
          combined.set(story.id, story as any);
        }
        contentIdx++;
      }

      if (userIdx < userBased.length && combined.size < limit) {
        const story = userBased[userIdx];
        if (!readStoryIds.includes(story.id) && !combined.has(story.id)) {
          combined.set(story.id, story as any);
        }
        userIdx++;
      }

      // Nếu cả 2 nguồn đều hết → break
      if (contentIdx >= contentBased.length && userIdx >= userBased.length) {
        console.log("break", combined);
        break;
      }
    }

    const ids = Array.from(combined.keys());
    const finalData = await supabase
      .from("stories")
      .select("id,title,cover_image_url,tags,views_count")
      .in("id", ids)
      .then((res) => res.data);
      const timeEnd = performance.now();
      console.log("time taken", timeEnd - timeStart);
    return finalData as Story[] | undefined;
  },
  enabled: !!user_id,
  select: (data) => data as Story[] | undefined,
});
export const searchStoriesInfinite = async ({
  searchQuery,
  topicId,
  pageParam = 0,
  limit = 10,
}: {
  searchQuery: string;
  topicId?: string;
  pageParam?: number;
  limit?: number;
}) => {
  let query = supabase
    .from("stories")
    .select("*")
    .ilike("title", `%${searchQuery}%`);

  if (topicId) {
    query = query.eq("topic_id", topicId);
  }

  const { data, error } = await query
    .range(pageParam * limit, (pageParam + 1) * limit - 1)
    .order("title", { ascending: true });

  if (error) throw error;
  return {
    data: data as Story[],
    nextPage: data.length === limit ? pageParam + 1 : undefined,
  };
};
