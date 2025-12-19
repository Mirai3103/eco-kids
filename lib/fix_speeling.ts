import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Constants from "expo-constants";
import { fetch as expoFetch } from "expo/fetch";

const google = createGoogleGenerativeAI({
  apiKey: Constants.expoConfig?.extra?.googleApiKey,
  fetch: expoFetch as unknown as typeof globalThis.fetch,
});

const prompt = (candidates: string[], context: string) => `
    Bạn là một chuyên gia ngôn ngữ trẻ em đang trò chuyện với bé về vấn đề môi trường. 
    Dựa vào ngữ cảnh: "${context}"
    Và danh sách kết quả STT (từ trẻ 3 tuổi nói ngọng): ${JSON.stringify(candidates)}

    Nhiệm vụ: Chọn hoặc chỉnh sửa lại 1 câu đúng nhất. 
    Yêu cầu nghiêm ngặt: 
    - CHỈ trả về câu đã sửa. 
    - Không giải thích, không thêm từ ngữ của bạn.
    - Nếu hoàn toàn không hiểu, trả về 'unknown'.
`;

export const fixSpelling = async (candidates: string[], context: string) => {
  const response = await generateText({
    model: google("gemma-3-4b"),
    prompt: prompt(candidates, context),
    temperature: 0.3,
  });
  if (response.text.includes("unknown")) {
    return candidates[0];
  }
  return response.text;
};
