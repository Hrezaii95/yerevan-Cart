CREATE TABLE `search_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`expires` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `search_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`used` integer NOT NULL
);
