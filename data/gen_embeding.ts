import { createMistral } from "@ai-sdk/mistral";
import { embed } from "ai";
import { supabase } from "./utils";

const { data, error } = await supabase
  .from("stories")
  .select("*,story_segments(*),topics(*)")
  .not("embed_text", "is", null);

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});
const model = mistral.textEmbedding("mistral-embed");
for (const story of data || []) {
  const embed_text = story.embed_text;
  const { embedding } = await embed({
    model,
    value: embed_text,
  });
  await supabase
    .from("stories")
    .update({ embedding: JSON.stringify(embedding) })
    .eq("id", story.id);
}
