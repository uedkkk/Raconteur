CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`description` text,
	`width` integer,
	`height` integer,
	`aspect_ratio` real,
	`date_taken` text,
	`storage_key` text,
	`thumbnail_key` text,
	`file_size` integer,
	`last_modified` text,
	`original_url` text,
	`thumbnail_url` text,
	`thumbnail_hash` text,
	`tags` text,
	`exif` text,
	`latitude` real,
	`longitude` real,
	`country` text,
	`city` text,
	`location_name` text,
	`is_live_photo` integer DEFAULT 0 NOT NULL,
	`live_photo_video_url` text,
	`live_photo_video_key` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photos_id_unique` ON `photos` (`id`);--> statement-breakpoint
CREATE TABLE `pipeline_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payload` text DEFAULT '{"type":"photo","storageKey":""}' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`status_stage` text,
	`error_message` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`excerpt` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`published_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`namespace` text DEFAULT 'common' NOT NULL,
	`key` text NOT NULL,
	`type` text NOT NULL,
	`value` text,
	`default_value` text,
	`label` text,
	`description` text,
	`is_public` integer DEFAULT false NOT NULL,
	`is_readonly` integer DEFAULT false NOT NULL,
	`is_secret` integer DEFAULT false NOT NULL,
	`enum` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` integer,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_namespace_key` ON `settings` (`namespace`,`key`);--> statement-breakpoint
CREATE TABLE `settings_storage_providers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`config` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`avatar` text,
	`created_at` integer NOT NULL,
	`is_admin` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);