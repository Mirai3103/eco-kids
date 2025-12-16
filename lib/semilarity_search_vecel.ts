import { createMistral } from "@ai-sdk/mistral";
import { embed, tool } from "ai";
// import Constants from "expo-constants";
import Constants from "expo-constants";
import { z } from "zod/v4";
import { supabase } from "./supabase";


import { router } from "expo-router";

const mistral = createMistral({
  apiKey: Constants.expoConfig?.extra?.mistralApiKey,
});
const model = mistral.textEmbedding("mistral-embed");
export async function similarity_search(query: string, top_k: number = 5) {
  console.log("similarity_search", query, top_k);
  const { embedding } = await embed({
    model,
    value: query,
  });
  const { data, error } = await supabase.rpc("match_stories", {
    query_embedding: JSON.stringify(embedding), // vector 1024 chiều từ Mistral Embed
    match_threshold: 0.75,
    match_count: top_k,
  });
  return JSON.stringify(data);
}
export const similarity_search_tool = tool({
  description: "Get the similar stories from the database",
  inputSchema: z.object({
    query: z.string().describe("The query to search for"),
    top_k: z.number().describe("The number of results to return"),
  }),
  execute: async ({ query, top_k }) => ({
    query,
    top_k,
    results: await similarity_search(query, top_k),
  }),
});
export const navigate_to_story_tool = tool({
  description: "Navigate to the story page",
  inputSchema: z.object({
    story_id: z.string().describe("The id of the story to navigate to"),
  }),
  execute: async ({ story_id }) => {
    router.push(`/stories/${story_id}`);
    return {
      success: true,
      message: `Navigated to the story page: ${story_id}`,
    };
  },
});

