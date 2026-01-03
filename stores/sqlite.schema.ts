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

// Bảng topics để sync từ Supabase
export const topics = sqliteTable("topics", {
  id: text("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  metaData: text("meta_data"),  // JSON string
  syncedAt: integer("synced_at").notNull(),  // timestamp khi sync
});

// Bảng stories để sync từ Supabase
export const stories = sqliteTable("stories", {
  id: text("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  topicId: text("topic_id"),
  tags: text("tags"),  // JSON array string
  isActive: integer("is_active", { mode: "boolean" }),
  createdAt: text("created_at"),
  viewsCount: integer("views_count"),
  embedText: text("embed_text"),
  embedding: text("embedding"),
  isDownloaded: integer("is_downloaded", { mode: "boolean" }).default(false),  // đã tải về offline chưa
  syncedAt: integer("synced_at").notNull(),  // timestamp khi sync
});

// Bảng story_segments để lưu nội dung chi tiết của story
export const storySegments = sqliteTable("story_segments", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull(),
  segmentIndex: integer("segment_index"),
  viText: text("vi_text"),
  enText: text("en_text"),
  imageUrl: text("image_url"),
  syncedAt: integer("synced_at").notNull(),
});

// Bảng audio_segments để lưu thông tin audio của từng segment
export const audioSegments = sqliteTable("audio_segments", {
  id: text("id").primaryKey(),
  segmentId: text("segment_id").notNull(),
  audioUrl: text("audio_url"),
  gender: text("gender"),  // male/female
  language: text("language"),  // vi/en
  transcript: text("transcript"),  // JSON
  createdAt: text("created_at"),
  syncedAt: integer("synced_at").notNull(),
});
