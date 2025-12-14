import {
  navigate_to_story_tool,
  similarity_search_tool,
} from "@/lib/semilarity_search";
import { IMessage, useChatStore } from "@/stores/chat.store";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText, stepCountIs } from "ai";
import Constants from "expo-constants";
import React, { useCallback, useRef } from "react";

const deepseek = createDeepSeek({
  apiKey: Constants.expoConfig?.extra?.deepseekApiKey,
});

const model = deepseek("deepseek-chat");

type Status = "submitted" | "streaming" | "ready" | "error";

export function getMessageContent(message: any) {
   if (typeof message.content === "string") {
    return message.content;
   }  else if (typeof message.content === "object" && Array.isArray(message.content)) {
    return message.content.map((text: any) => text.text).join("");
   }
   console.log(message.content, "message.content");
   return "";
}

type UseAiReturn = {
  messages: IMessage[];
  status: Status;
  error: Error | undefined;
  sendMessage: (message: string) => Promise<void>;
  stop: () => void;
  setMessages: (
    messages: IMessage[] | ((messages: IMessage[]) => IMessage[])
  ) => void;
  clearMessages: () => void;
};

interface IUseAiOptions {
  onLLMGenerated?: (message: string) => void;
}

const SYSTEM_PROMPT = `Bạn là Greenie(một nhân vật trong mobile app "EcoKids") – người bạn AI dễ thương của trẻ nhỏ là 1 trợ lý A.i của app "EcoKids". 
Nhiệm vụ của bạn là trò chuyện cho trẻ từ 3 đến 5 tuổi về chủ đề bảo vệ môi trường xanh và tình yêu thiên nhiên và nói chuyện như 1 người bạn cùng tuổi.

🌱 NGUYÊN TẮC TRẢ LỜI:
1. Luôn nói ngắn gọn, rõ ràng, dễ hiểu. 
   - Mỗi câu trả lời chỉ 1–3 câu là đủ.
   - Dùng câu ngắn, từ đơn giản, ví dụ: "Cây giúp không khí sạch hơn."
2. Khi trẻ gõ sai chính tả, hãy cố gắng hiểu ý và trả lời đúng ngữ cảnh. 
   - Không chê lỗi sai. 
   - Nếu cần, có thể nhẹ nhàng nhắc lại từ đúng, ví dụ: "À, cậu muốn nói 'cây xanh' đúng không?"
3. Giọng điệu vui vẻ, ấm áp, khuyến khích.  
   - Dùng từ như "tốt lắm", "giỏi quá".
4. **Khi bé hỏi về một câu chuyện cụ thể hoặc nhân vật cụ thể thì có thể:
   → Hãy **gọi tool similarity_search_tool** để tìm các câu chuyện tương tự trong cơ sở dữ liệu.
   - Nếu tìm thấy, dùng câu chuyện đó để trả lời dựa trên câu hỏi của bé, đừng đọc toàn bộ câu chuyện.
   - Nếu muốn đọc toàn bộ câu chuyện, hãy gọi tool navigate_to_story_tool để điều hướng đến trang câu chuyện.
   - Nếu không có kết quả, trả lời:
     "Tới chưa biết điều này, mình cùng tìm hiểu sau nhé!"
5. Khi trả lời câu hỏi:  
   - Giải thích bằng ví dụ thật đơn giản.  
   - Không dùng khái niệm phức tạp như "carbon dioxide" hay "ô nhiễm vi mô".
6. Nếu bé hỏi điều không có trong dữ liệu:  
   Nói nhẹ nhàng: "Tới chưa biết điều này, mình cùng tìm hiểu sau nhé!"
7. Tuyệt đối không nói về: chính trị, tôn giáo, người lớn, hay nội dung tiêu cực.
8. Khi bé hỏi về 1 chủ đề ví dụ "tại sao phải tiết kiệm nước" cố gắng dùng tool similarity_search_tool để tìm các câu chuyện tương tự trong cơ sở dữ liệu để minh họa cho bé nhưng đừng spoil câu chuyện, hãy hướng bé đọc câu chuyện đó.

🎯 Mục tiêu:  
Giúp trẻ hiểu, yêu và bảo vệ môi trường thông qua những câu chuyện và câu trả lời ngắn gọn, vui vẻ, an toàn.`;
export const useAi = (options: IUseAiOptions = {}): UseAiReturn => {
  const { messages, addMessage, addMessages, setMessages, clearMessages } = useChatStore();
  const mesagesRef = useRef<IMessage[]>([]);
  const [status, setStatus] = React.useState<Status>("ready");
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const controllerRef = useRef<AbortController | null>(null);
  const { onLLMGenerated } = options;
  // const { forceStop,playFastTTS,clearCache } = useTTSQueue();
  React.useEffect(() => {
    mesagesRef.current = [...messages];
  }, [messages]);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus("ready");
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      // Validation
      if (!message.trim()) return;

      // Prevent sending while streaming
      if (status === "streaming" || status === "submitted") {
        console.warn("Already processing a message");
        return;
      }

      // Reset error state
      setError(undefined);
      setStatus("submitted");

      const userMessage: IMessage = {
        role: "user",
        content: message,
      };

      // Add user message immediately

      try {
        const controller = new AbortController();
        controllerRef.current = controller;
        setStatus("streaming");

        const currentMessages = [...mesagesRef.current, userMessage];
        console.log(
          currentMessages.length,
          "currentMessages length",

          currentMessages
        );

        const { text, response, request } = await generateText({
          model,
          messages: currentMessages as any,
          abortSignal: controller.signal,
          tools: {
            similarity_search_tool,
            navigate_to_story_tool,
          },
          system: SYSTEM_PROMPT,
          stopWhen: stepCountIs(5),
        });

        // Add assistant's response
        console.log(response.messages.length > 0, "response.messages");

        if (response.messages && response.messages.length > 0) {
          addMessages([userMessage, ...(response.messages as any)]);
        }

        // Callback with final text
        onLLMGenerated?.(text);
        setStatus("ready");
        controllerRef.current = null;
      } catch (err: any) {
        // Handle abort gracefully
        if (err.name === "AbortError") {
          console.log("Stream aborted by user");
          setStatus("ready");
          return;
        }

        // Handle other errors
        console.error("AI Generation Error:", err);
        setStatus("error");
        setError(err);
      }
    },
    [status, onLLMGenerated, addMessages]
  );

  return {
    messages,
    status,
    error,
    sendMessage,
    stop,
    setMessages,
    clearMessages,
  };
};
