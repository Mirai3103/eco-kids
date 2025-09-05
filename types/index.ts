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
export type AudioSegment = Database["public"]["Tables"]["audio_segments"]["Row"]
export type Question = Database["public"]["Tables"]["questions"]["Row"]
export type Quiz = Question
export type StorySegment = Database["public"]["Tables"]["story_segments"]["Row"] & {
  story_id: string;
  audio_segments: AudioSegment[];
}

export type StoryWithSegments = Story & {
  story_segments: StorySegment[];
}

export interface ISegment {
  id: string;
  content_vi: string;
  content_en: string;
  audio?: string;
  index: number;
  image_url?: string;
}