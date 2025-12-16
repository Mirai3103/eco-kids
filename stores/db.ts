import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { conversations, messages } from "./sqlite.schema";
const expo = openDatabaseSync("db.db");
export const db = drizzle(expo,{schema:{
    conversations,
    messages,
}});

