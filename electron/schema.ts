import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// system_setting
export const systemSetting = sqliteTable('system_setting', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  templateBaseUrl: text('template_base_url').notNull(),
  reportSave: text('report_save').notNull(),
  status: integer('status').notNull(),
  createdAt: text('created_at').notNull().default("datetime('now')"),
})

// report_template
export const reportTemplate = sqliteTable('report_template', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileUrl: text('file_url').notNull(),
  createdAt: text('created_at').notNull().default("datetime('now')"),
})

// report_result_template
export const reportResultTemplate = sqliteTable('report_result_template', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileUrl: text('file_url').notNull(),
  createdAt: text('created_at').notNull().default("datetime('now')"),
})

// chat_session
export const chatSession = sqliteTable('chat_session', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionUuid: text('session_uuid').notNull().unique(),
  title: text('title').notNull().default(''),
  createdAt: text('created_at').notNull().default("datetime('now')"),
  updatedAt: text('updated_at').notNull().default("datetime('now')"),
  lastMessageAt: text('last_message_at'),
})

// chat_message
export const chatMessage = sqliteTable('chat_message', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionUuid: text('session_uuid').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull().default(''),
  metaJson: text('meta_json'),
  createdAt: text('created_at').notNull().default("datetime('now')"),
})

