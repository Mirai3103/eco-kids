// db/schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),            // uuid/text
  title: text("title"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),           // user | assistant | system | tool (tuỳ bạn)
  message: text("message").notNull(),     // JSON string (giữ nguyên struct theo lib)
  textContent: text("text_content"),
  createdAt: integer("created_at").notNull(),
});
