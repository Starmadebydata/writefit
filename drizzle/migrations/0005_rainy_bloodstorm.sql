CREATE TABLE `anon_usage_records` (
	`id` text PRIMARY KEY NOT NULL,
	`ip_hash` text NOT NULL,
	`date` text NOT NULL,
	`endpoint` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `anon_usage_hash_date_endpoint` ON `anon_usage_records` (`ip_hash`,`date`,`endpoint`);