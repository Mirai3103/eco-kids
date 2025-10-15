import { createMistral } from "@ai-sdk/mistral";
import { embed } from "ai";
import Constants from "expo-constants";
import { supabase } from "./supabase";

// const { data, error } = await supabase
//   .from("stories")
//   .select("*,story_segments(*),topics(*)")
//   .not("embed_text", "is", null);

const mistral = createMistral({
  apiKey: Constants.expoConfig?.extra?.mistralApiKey,
});
const model = mistral.textEmbedding("mistral-embed");
// for (const story of data || []) {
//   const embed_text = story.embed_text;
//   const { embedding } = await embed({
//     model,
//     value: embed_text,
//   });
//   await supabase
//     .from("stories")
//     .update({ embedding: JSON.stringify(embedding) })
//     .eq("id", story.id);
// }
import { tool } from "ai";
import { z } from "zod/v4";
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
export async function similarity_search(query: string, top_k: number = 5) {
  const { embedding } = await embed({
    model,
    value: query,
  });
  const { data, error } = await supabase.rpc("match_stories", {
    query_embedding: JSON.stringify(embedding), // vector 1024 chiều từ Mistral Embed
    match_threshold: 0.75,
    match_count: top_k,
  });
  return data;
}
