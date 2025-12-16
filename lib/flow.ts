import {
  navigate_to_story_tool,
  similarity_search_tool,
} from "@/lib/semilarity_search_vecel";
import { db } from "@/stores/db";
import { messages } from "@/stores/sqlite.schema";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { ModelMessage, stepCountIs, streamText } from "ai";
import { asc, eq } from "drizzle-orm";
import Constants from "expo-constants";
import * as crypto from "expo-crypto";
import { fetch as expoFetch } from "expo/fetch";
import { SYSTEM_PROMPT } from "./prompt";

export function makeDebugFetch(
  baseFetch: typeof globalThis.fetch,
  opts?: { label?: string }
): typeof globalThis.fetch {
  const label = opts?.label ?? "AI_FETCH";

  return (async (input: any, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input?.url;
    const method = init?.method ?? "GET";

    // Log request (đừng log apiKey)
    console.log(`[${label}] -> ${method} ${url}`);
    if (init?.headers) console.log(`[${label}] req headers:`, init.headers);

    const t0 = Date.now();
    const res = await baseFetch(input as any, init as any);
    const dt = Date.now() - t0;

    console.log(
      `[${label}] <- ${res.status} ${res.statusText} (${dt}ms) ${method} ${url}`
    );
    console.log(`[${label}] res headers:`, {
      "content-type": res.headers.get("content-type"),
      "content-encoding": res.headers.get("content-encoding"),
      "transfer-encoding": res.headers.get("transfer-encoding"),
      "content-length": res.headers.get("content-length"),
    });

    // Không đọc body => stream vẫn nguyên vẹn
    return res;
  }) as any;
}

// dùng:
export const debugFetch = makeDebugFetch(
  expoFetch as unknown as typeof globalThis.fetch,
  { label: "DEEPSEEK" }
);
const deepseek = createDeepSeek({
  apiKey: Constants.expoConfig?.extra?.deepseekApiKey,
  fetch: expoFetch as unknown as typeof globalThis.fetch,
});

const model = deepseek("deepseek-chat");

export async function generate(
  input: string,
  chatId: string,
  abortSignal: AbortSignal,
  onChunk?: (chunk: string) => void
) {
  const history = await db.query.messages.findMany({
    where: eq(messages.conversationId, chatId),
    orderBy: [asc(messages.createdAt)],
  });
  const payload: ModelMessage[] = history.map(
    (message) => JSON.parse(message.message) as ModelMessage
  );
  await db.insert(messages).values({
    conversationId: chatId,
    createdAt: new Date().getTime(),
    id: crypto.randomUUID(),
    message: JSON.stringify({ role: "user", content: input }),
    role: "user",
    textContent: input,
  });

  const { textStream, response } = streamText({
    model,
    // abortSignal,
    tools: {
      similarity_search_tool,
      navigate_to_story_tool,
    },
    system: SYSTEM_PROMPT,
    messages: [...payload, { role: "user", content: input }],
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
 
  for await (const textPart of textStream) {
    onChunk?.(textPart);
  }
}
