import { Database } from "@/types";
import { google } from "@ai-sdk/google";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
const prompt = (
  content: string
) => `Bạn là hệ thống chuẩn bị dữ liệu cho mô hình tìm kiếm ngữ nghĩa (semantic search).  
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
embedding_text (một đoạn văn duy nhất bằng tiếng Việt, không markdown)
`;

async function generateEmbeddingText(content: string) {
  if (!content) return "";
  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: prompt(content),
  });
  return text;
}

const { data, error } = await supabase
  .from("stories")
  .select("*,story_segments(*),topics(*)")
  // .is("embed_text", null);
if (data?.length === 0) {
  console.log("No stories found");
  process.exit(0);
}
for (const story of data || []) {
  let embeddingText = "Tên truyện: " + story.title + "\n Nội dung: ";
  for (const segment of story.story_segments) {
    embeddingText += segment.vi_text + "\n";
  }
  embeddingText = await generateEmbeddingText(embeddingText);
  embeddingText = `Tên truyện: ${story.title} có Thể loại: ${
    story.topics!.name
  } Nội dung về ${embeddingText}`;
  await supabase
    .from("stories")
    .update({ embed_text: embeddingText.trim() })
    .eq("id", story.id);
  console.log(`updated ${story.id} length ${embeddingText.length}`);
  await new Promise((resolve) => setTimeout(resolve, 25000));
}
