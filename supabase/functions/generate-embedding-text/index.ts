// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { google } from "@ai-sdk/google";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import type { Database } from '../../../types/database.types';
const prompt = (
  content: string,
) => (`Bạn là hệ thống chuẩn bị dữ liệu cho mô hình tìm kiếm ngữ nghĩa (semantic search).  
Hãy đọc toàn bộ nội dung một truyện thiếu nhi song ngữ (chỉ dùng tiếng Việt) rồi viết lại thành một đoạn văn ngắn gọn, súc tích, giữ ý chính.  

Yêu cầu:  
- Giữ tên truyện.  
- Tóm tắt nội dung chính: nhân vật, bối cảnh, hành động, thông điệp về môi trường.  
- Không cần giữ nguyên văn từng đoạn, chỉ chọn lọc ý quan trọng.  
- Viết liền mạch, ngắn gọn, không xuống dòng, không thêm lời giải thích.  
- Kết quả sẽ được dùng làm embedding_text.  

Dữ liệu đầu vào:
${content}

Dữ liệu đầu ra:
embedding_text (một đoạn văn duy nhất bằng tiếng Việt, súc tích)
`);

async function generateEmbeddingText(content: string) {
  if (!content) return "";
  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: prompt(content),
  });
  return text;
}

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  // get all stories that field embed_text is empty or null
  const { data, error } = await supabase.from("stories").select(
    "*,story_segments(*)",
  ).is("embed_text", null);
  if (data?.length === 0) {
    return new Response(JSON.stringify({ message: "No stories found" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  for (const story of data || []) {
    let embeddingText = "Tên truyện: " + story.title + "\n Nội dung: ";
    for (const segment of story.story_segments) {
      embeddingText += segment.vi_text + "\n";
    }
    embeddingText = await generateEmbeddingText(embeddingText);
    await supabase.from("stories").update({ embed_text: embeddingText }).eq("id", story.id);
  }
  return new Response(JSON.stringify({ message: "Stories updated" }), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-embedding-text' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
