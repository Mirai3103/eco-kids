CREATE TABLE `stories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`description` text,
	`cover_image_url` text,
	`topic_id` text,
	`tags` text,
	`is_active` integer,
	`created_at` text,
	`views_count` integer,
	`embed_text` text,
	`embedding` text,
	`synced_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `story_segments` (
	`id` text PRIMARY KEY NOT NULL,
	`story_id` text NOT NULL,
	`segment_index` integer,
	`vi_text` text,
	`en_text` text,
	`image_url` text,
	`synced_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`meta_data` text,
	`synced_at` integer NOT NULL
);
