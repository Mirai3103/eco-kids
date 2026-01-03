CREATE TABLE `audio_segments` (
	`id` text PRIMARY KEY NOT NULL,
	`segment_id` text NOT NULL,
	`audio_url` text,
	`gender` text,
	`language` text,
	`transcript` text,
	`created_at` text,
	`synced_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `stories` ADD `is_downloaded` integer DEFAULT false;