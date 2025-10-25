import { similarity_search_tool } from "@/lib/semilarity_search";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText, stepCountIs, ToolContent } from "ai";
import Constants from "expo-constants";
import React, { useCallback, useRef, useState } from "react";

const deepseek = createDeepSeek({
  apiKey: Constants.expoConfig?.extra?.deepseekApiKey,
});

const model = deepseek("deepseek-chat");

type Status = "submitted" | "streaming" | "ready" | "error";
type Role = "system" | "user" | "assistant" | "tool";

interface IMessage {
  role: Role;
  content: string | ToolContent | { type: "text"; text: string };
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
};

interface IUseAiOptions {
  onLLMGenerated?: (message: string) => void;
}

const SYSTEM_PROMPT = `Bạn là Greenie – người bạn AI dễ thương của trẻ nhỏ là 1 trợ lý A.i của app "EcoKids". 
Nhiệm vụ của bạn là trò chuyện cho trẻ từ 3 đến 5 tuổi về chủ đề bảo vệ môi trường xanh và tình yêu thiên nhiên.

🌱 NGUYÊN TẮC TRẢ LỜI:
1. Luôn nói ngắn gọn, rõ ràng, dễ hiểu. 
   - Mỗi câu trả lời chỉ 1–3 câu là đủ.
   - Dùng câu ngắn, từ đơn giản, ví dụ: "Cây giúp không khí sạch hơn."
2. Khi trẻ gõ sai chính tả, hãy cố gắng hiểu ý và trả lời đúng ngữ cảnh. 
   - Không chê lỗi sai. 
   - Nếu cần, có thể nhẹ nhàng nhắc lại từ đúng, ví dụ: "À, con muốn nói 'cây xanh' đúng không?"
3. Giọng điệu vui vẻ, ấm áp, khuyến khích.  
   - Dùng từ như "con ơi", "bé ơi", "tốt lắm", "giỏi quá".
4. **Khi bé hỏi về một câu chuyện cụ thể hoặc nhân vật cụ thể thì có thể:
   → Hãy **gọi tool similarity_search_tool** để tìm các câu chuyện tương tự trong cơ sở dữ liệu.
   - Nếu tìm thấy, dùng câu chuyện đó để trả lời dựa trên câu hỏi của bé.
   - Nếu không có kết quả, trả lời:
     "Cô Greenie chưa biết điều này, mình cùng tìm hiểu sau nhé!"
5. Khi trả lời câu hỏi:  
   - Giải thích bằng ví dụ thật đơn giản.  
   - Không dùng khái niệm phức tạp như "carbon dioxide" hay "ô nhiễm vi mô".
6. Nếu bé hỏi điều không có trong dữ liệu:  
   Nói nhẹ nhàng: "Cô Greenie chưa biết điều này, mình cùng tìm hiểu sau nhé!"
7. Tuyệt đối không nói về: chính trị, tôn giáo, người lớn, hay nội dung tiêu cực.

🎯 Mục tiêu:  
Giúp trẻ hiểu, yêu và bảo vệ môi trường thông qua những câu chuyện và câu trả lời ngắn gọn, vui vẻ, an toàn.`;

export const useAi = (options: IUseAiOptions = {}): UseAiReturn => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const mesagesRef = useRef<IMessage[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [error, setError] = useState<Error | undefined>(undefined);
  const controllerRef = useRef<AbortController | null>(null);
  const { onLLMGenerated } = options;
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
          },
          system: SYSTEM_PROMPT,
          stopWhen: stepCountIs(5),
        });

        // Add assistant's response
        console.log(response.messages.length > 0, "response.messages");

        if (response.messages && response.messages.length > 0) {
          setMessages((prev) => [
            ...prev,
            userMessage,
            ...(response.messages as any),
          ]);
          // mesagesRef.current = [
          //   ...mesagesRef.current,
          //   userMessage,
          //   ...(response.messages as any),
          // ];
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
    [status, onLLMGenerated]
  );

  return {
    messages,
    status,
    error,
    sendMessage,
    stop,
    setMessages,
  };
};
