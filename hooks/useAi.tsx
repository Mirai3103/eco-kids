import { similarity_search_tool } from "@/lib/semilarity_search";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, stepCountIs, ToolContent } from "ai";
import Constants from "expo-constants";
import { useCallback, useRef, useState } from "react";
const google = createGoogleGenerativeAI({
  apiKey: Constants.expoConfig?.extra?.geminiApiKey,
});

// Bạn nên dùng model flash-1.5, mới hơn và tốt hơn
const model = google("gemini-2.0-flash");

type Status = "submitted" | "streaming" | "ready" | "error";
type Role = "system" | "user" | "assistant" | "tool";

interface IMessage {
  id: string;
  role: Role;
  content: string | ToolContent;
}

type UseAiReturn = {
  messages: IMessage[];
  status: Status;
  error: Error | undefined;
  sendMessage: (message: string) => Promise<void>;
  // regenerate: () => void; // Cân nhắc thêm vào sau
  stop: () => void;
  setMessages: (
    messages: IMessage[] | ((messages: IMessage[]) => IMessage[])
  ) => void;
};

interface IUseAiOptions {
  onLLMGenerated?: (message: string) => void;
}
export const useAi = (options: IUseAiOptions = {}): UseAiReturn => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [error, setError] = useState<Error | undefined>(undefined);
  const controllerRef = useRef<AbortController | null>(null);
  console.log("messages", messages.length, messages);

  const { onLLMGenerated } = options;

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    setStatus("ready");
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      setError(undefined);
      const userId = `${Date.now()}-user`;
      const userMessage: IMessage = {
        id: userId,
        role: "user",
        content: message,
      };

      // Cập nhật messages với tin nhắn mới của user
      const newMessages = [...messages, userMessage];
      setStatus("submitted");

      try {
        const controller = new AbortController();
        controllerRef.current = controller;

        setStatus("streaming");

        // Tạo sẵn một message rỗng cho assistant để cập nhật dần
        const assistantId = `${Date.now()}-assistant`;
        setMessages((prev) => [
          ...prev,
          userMessage,
          { id: assistantId, role: "assistant", content: "Đang suy nghĩ..." },
        ]);

        const { text } = await generateText({
          model,
          messages: newMessages as any, // Gửi toàn bộ lịch sử
          abortSignal: controller.signal,
          tools: {
            similarity_search_tool,
          },

          stopWhen: stepCountIs(5),
          onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
            if (toolCalls && toolCalls.length > 0) {
              const toolCall = toolCalls[0];
              const toolResult = (toolResults?.[0].output as any).results;
              console.log("toolResult", toolResult);
              setMessages((prev) => {
                const newMessages = [...prev];
                // tìm user message và thay thế content bằng tool result
                const userMessageIndex = newMessages.findIndex(
                  (m) => m.id === userId
                );
                if (userMessageIndex !== -1) {
                  newMessages[
                    userMessageIndex
                  ].content = `Đây là kết quả tìm kiếm tương tự: ${toolResult} \n hãy trả lời câu hỏi của bé: ${newMessages[userMessageIndex].content} `;
                }
                return newMessages;
              });
            }
          },
          system: `Bạn là Greenie – người bạn AI dễ thương của trẻ nhỏ là 1 trợ lý A.i của app "EcoKids". 
Nhiệm vụ của bạn là trò chuyện cho trẻ từ 3 đến 5 tuổi về chủ đề bảo vệ môi trường xanh và tình yêu thiên nhiên.

🌱 NGUYÊN TẮC TRẢ LỜI:
1. Luôn nói ngắn gọn, rõ ràng, dễ hiểu. 
   - Mỗi câu trả lời chỉ 1–3 câu là đủ.
   - Dùng câu ngắn, từ đơn giản, ví dụ: “Cây giúp không khí sạch hơn.”
2. Khi trẻ gõ sai chính tả, hãy cố gắng hiểu ý và trả lời đúng ngữ cảnh. 
   - Không chê lỗi sai. 
   - Nếu cần, có thể nhẹ nhàng nhắc lại từ đúng, ví dụ: “À, con muốn nói ‘cây xanh’ đúng không?”
3. Giọng điệu vui vẻ, ấm áp, khuyến khích.  
   - Dùng từ như “con ơi”, “bé ơi”, “tốt lắm”, “giỏi quá”.
 4. **Khi bé hỏi về một câu chuyện cụ thể hoặc nhân vật cụ thể nếu đã đề cập trong message trước đó thì trả lời ngay luôn, nếu không thì:
 → Hãy **gọi tool find_similar_story** để tìm các câu chuyện tương tự trong cơ sở dữ liệu.
- Nếu tìm thấy, dùng câu chuyện đó để trả lời dựa trên câu hỏi của bé.
 - Nếu không có kết quả, trả lời:
  “Cô Greenie chưa biết điều này, mình cùng tìm hiểu sau nhé!”
5. Khi trả lời câu hỏi:  
   - Giải thích bằng ví dụ thật đơn giản.  
   - Không dùng khái niệm phức tạp như “carbon dioxide” hay “ô nhiễm vi mô”.
6. Nếu bé hỏi điều không có trong dữ liệu:  
   Nói nhẹ nhàng: “Cô Greenie chưa biết điều này, mình cùng tìm hiểu sau nhé!”
7. Tuyệt đối không nói về: chính trị, tôn giáo, người lớn, hay nội dung tiêu cực.
🎯 Mục tiêu:  
Giúp trẻ hiểu, yêu và bảo vệ môi trường thông qua những câu chuyện và câu trả lời ngắn gọn, vui vẻ, an toàn.
`,
        });

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: text } : m))
        );
        onLLMGenerated?.(text);
        setStatus("ready");
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Stream aborted");
          return;
        }
        console.log({ error: err });
        setStatus("error");
        setError(err);
      }
    },
    [messages] // Thêm messages vào dependency array
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
