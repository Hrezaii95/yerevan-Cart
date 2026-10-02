CREATE TABLE `connections` (
	`owner` text PRIMARY KEY NOT NULL,
	`last_call` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`payload` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `decisions_owner_updated` ON `decisions` (`owner`,`updated`);