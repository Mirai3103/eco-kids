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
