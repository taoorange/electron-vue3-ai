CREATE TABLE IF NOT EXISTS `chat_session` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `session_uuid` TEXT NOT NULL,
  `title` TEXT DEFAULT '' NOT NULL,
  `created_at` TEXT DEFAULT (datetime('now')) NOT NULL,
  `updated_at` TEXT DEFAULT (datetime('now')) NOT NULL,
  `last_message_at` TEXT
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `chat_session_session_uuid_unique` ON `chat_session` (`session_uuid`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_chat_session_last_message_at` ON `chat_session` (`last_message_at`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `chat_message` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `session_uuid` TEXT NOT NULL,
  `role` TEXT NOT NULL,
  `content` TEXT DEFAULT '' NOT NULL,
  `meta_json` TEXT,
  `created_at` TEXT DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_chat_message_session_id` ON `chat_message` (`session_uuid`, `id`);
