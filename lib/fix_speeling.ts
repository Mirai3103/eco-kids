import { model } from "@/hooks/useAi";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import Constants from "expo-constants";
import { fetch as expoFetch } from "expo/fetch";
import { z } from "zod/v4";
import { supabase } from "./supabase";
import * as crypto from "expo-crypto";
const google = createGoogleGenerativeAI({
  apiKey: Constants.expoConfig?.extra?.googleApiKey,
  fetch: expoFetch as unknown as typeof globalThis.fetch,
});
function formatFewShotExamples(fewShotExamples: { confidence_score: number; corrected_text: string; raw_candidate_top: string; raw_unaccent: string; }[]) {
  return fewShotExamples.map(example => `- ${example.raw_candidate_top} -> ${example.corrected_text} (Độ tin cậy: ${example.confidence_score})`).join('\n');
}
const prompt = (candidates: string[], context?: string,fewShotExamples?: { confidence_score: number; corrected_text: string; raw_candidate_top: string; raw_unaccent: string; }[]) => `
    Bạn là một chuyên gia ngôn ngữ trẻ em đang trò chuyện với bé về vấn đề môi trường. 
    Trò chuyện với bé về các chủ đề như nước, rừng cây, cối, năng lượng, biển, động vật,...
    ${context ? `Dựa vào ngữ cảnh: "${context}"` : ''}
    ${fewShotExamples && fewShotExamples.length > 0 ? `Đây là ví dụ: \n${formatFewShotExamples(fewShotExamples)}` : ''}
    Và danh sách kết quả STT (từ trẻ 3 tuổi nói ngọng, nói lắp, sai chính tả): ${JSON.stringify(candidates)}

    Nhiệm vụ: Chọn hoặc chỉnh sửa lại 1 câu đúng nhất. 
    Yêu cầu nghiêm ngặt: 
    - CHỈ trả về câu đã sửa, thêm bớt từ, cho đúng ý định của bé
    - Không giải thích
    - Nếu hoàn toàn không hiểu, trả về 'unknown'.
  Ví dụ với câu "ại phao mình hải ảo vệ ướt" -> "Tại sao mình phải bảo vệ nước"
  Trả về json shema:
  {
    text: string,
    confidence: number,
  }
`;
const returnSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1).describe("Độ tin cậy của câu đã sửa"),
});
export const fixSpelling = async (candidates: string[], context: string) => {
  const response = await generateText({
    model: google("gemma-3-12b-it"),
    prompt: prompt(candidates, context),
    temperature: 0.3,
  });
  if (response.text.includes("unknown")) {
    return candidates[0];
  }
  return response.text;
};

export const fixSpellingWithConfidence = async (candidates: string[], context: string, storyId?: string) => {
  // todo: full text search raw_candidate_top to few shot candidates
  const { data, error } = await supabase.rpc('rpc_fewshot_lookup_fix_spelling', {
    p_input_text: 'on ỏ ăn ái',
    p_limit: 10,
    p_threshold: 0.25,
  });
  
  const response = await generateObject({
    model: model,
    prompt: prompt(candidates, context, data || undefined),
    temperature: 0.7,
    schema: returnSchema,
  });
  console.log(response)
  supabase.from("fix_spelling_logs").insert({
    raw_candidate_top: candidates[0],
    corrected_text: response.object.text,
    confidence_score: response.object.confidence,
    created_at: new Date().toISOString(),
    id: crypto.randomUUID(),
    story_id: storyId,
    context: context,
    
  }).then(({error}) => {
    if (error) {
      console.error("insert error", error);
    }
  });
  if (response.object.confidence < 0.6) {
    return "Hãy yêu cầu bé nói lại.";
  }
  return response.object.text;
};

// select
//   raw_candidate_top,
//   corrected_text,
//   similarity(
//     raw_unaccent,
//     unaccent(lower($1))
//   ) as score
// from fix_spelling_logs
// where story_id = $2
// order by score desc
// limit 10;