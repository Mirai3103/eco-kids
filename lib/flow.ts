import {
  navigate_to_story_tool,
  similarity_search_tool,
} from "@/lib/semilarity_search_vecel";
import { db } from "@/stores/db";
import { conversations, messages } from "@/stores/sqlite.schema";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { ModelMessage, stepCountIs, streamText } from "ai";
import { asc, eq } from "drizzle-orm";
import Constants from "expo-constants";
import * as crypto from "expo-crypto";
import { fetch as expoFetch } from "expo/fetch";
import { SYSTEM_PROMPT } from "./prompt";


const deepseek = createDeepSeek({
  apiKey: Constants.expoConfig?.extra?.deepseekApiKey,
  fetch: expoFetch as unknown as typeof globalThis.fetch,
});

const model = deepseek("deepseek-chat");
const createConversationIfNotExist = async (id: string) => {
  const cv = await db.query.conversations.findFirst({
    where: eq(conversations.id, id),
  });
  if (!cv) {
    await db.insert(conversations).values({
      id,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });
  }
  return cv;
};
interface IGenerateOptions {
  input: string;
  chatId: string;
  abortSignal: AbortSignal;
  onChunk?: (chunk: string) => void;
  prompt?: string;
  context?: string;
  withTool?: boolean;
}
export async function generate(

  options: IGenerateOptions
) {
  const { input, chatId, abortSignal, onChunk, prompt=SYSTEM_PROMPT, context, withTool=true } = options;
  const timeStart = Date.now();
  const history = await db.query.messages.findMany({
    where: eq(messages.conversationId, chatId),
    orderBy: [asc(messages.createdAt)],
  });
  const payload: ModelMessage[] = history.map(
    (message) => JSON.parse(message.message) as ModelMessage
  );
  await createConversationIfNotExist(chatId);
 await db.insert(messages).values({
    conversationId: chatId,
    createdAt: new Date().getTime(),
    id: crypto.randomUUID(),
    message: JSON.stringify({ role: "user", content: input }),
    role: "user",
    textContent: input,
  });
  const inputWithContext = `Context: ${context}\nUser input: ${input}`;

  const { textStream, response } = streamText({
    model,
    // abortSignal,
    tools: withTool ? {
      similarity_search_tool,
      navigate_to_story_tool,
    } : undefined,
    system: prompt,
    messages: [...payload, { role: "user", content: inputWithContext }],
    stopWhen: stepCountIs(10),
    onFinish: async ({ response }) => {
      let time = new Date().getTime();
      for (const message of response.messages) {
        let textContent = "";
        if (typeof message.content != "string") {
          textContent = message.content
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join("\n");
        } else {
          textContent = message.content;
        }
        await db.insert(messages).values({
          conversationId: chatId,
          createdAt: time++,
          id: crypto.randomUUID(),
          message: JSON.stringify({
            role: message.role || "assistant",
            content: message.content,
          }),
          role: message.role || "assistant",
          textContent: textContent || "",
        });
      }
    },
  });
  let isFirstChunk = true;
  for await (const textPart of textStream) {
    if (isFirstChunk) {
      isFirstChunk = false;
      const timeEnd = Date.now();
      console.log(`generate executed in ${timeEnd - timeStart}ms`);
    }
    onChunk?.(textPart);
  }
}
