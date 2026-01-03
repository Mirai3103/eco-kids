import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { conversations, messages, topics, stories, storySegments, audioSegments } from "./sqlite.schema";
const expo = openDatabaseSync("db.db", { enableChangeListener: true });
export const db = drizzle(expo,{schema:{
    conversations,
    messages,
    topics,
    stories,
    storySegments,
    audioSegments,
}});

