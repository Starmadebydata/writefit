CREATE TABLE `billing_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`event_type` text NOT NULL,
	`user_id` text,
	`processed_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan_interval` text;