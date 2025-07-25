import type { Database as GeneratedDatabase } from './database.types';
export type Database = GeneratedDatabase
export type TopicMetaData = {
  icon: string;
  color: string;
  bgColor: string;
  decorationEmojis: string[];
};

export type Topic = Database["public"]["Tables"]["topics"]["Row"] & {
  meta_data: TopicMetaData;
};

export type Story = Database["public"]["Tables"]["stories"]["Row"]
export type StorySegment = Database["public"]["Tables"]["story_segments"]["Row"] & {
  story_id: string;
}

export type StoryWithSegments = Story & {
  story_segments: StorySegment[];
}