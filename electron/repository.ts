import { db } from './db'
import { chatMessage, chatSession, reportTemplate, systemSetting } from './schema'
import { desc, eq } from 'drizzle-orm'

export function insertSystemSetting(templateBaseUrl: string, reportSave: string) {
  const result = db.insert(systemSetting).values({
    templateBaseUrl,
    reportSave,
    status: 1,
  }).run()

  return result.lastInsertRowid as number
}

export function getSystemSetting() {
  const rows = db.select()
    .from(systemSetting)
    .where(eq(systemSetting.status, 1))
    .limit(1)
    .all()

  return rows[0] ?? null
}

export function listTemplates() {
  return db.select()
    .from(reportTemplate)
    .orderBy(reportTemplate.id)
    .all()
}

export function insertTemplate(fileUrl: string) {
  const res = db.insert(reportTemplate).values({ fileUrl }).run()
  return res.lastInsertRowid as number
}

export function updateSystemSetting(id: number, data: Partial<typeof systemSetting.$inferInsert>) {
  db.update(systemSetting)
    .set(data)
    .where(eq(systemSetting.id, id))
    .run()
}

export function deleteTemplate(id: number) {
  db.delete(reportTemplate)
    .where(eq(reportTemplate.id, id))
    .run()
}

type UpsertChatSessionPayload = {
  sessionUuid: string
  title?: string
  lastMessageAt?: string | null
  updatedAt?: string
}

type SaveChatMessagePayload = {
  sessionUuid: string
  role: string
  content: string
  meta?: Record<string, unknown> | null
  createdAt?: string
}

type ReplaceChatSessionMessagesPayload = {
  sessionUuid: string
  title?: string
  items: Array<{
    role: string
    content: string
    meta?: Record<string, unknown> | null
    createdAt?: string
  }>
}

function safeParseMeta(metaJson: string | null) {
  if (!metaJson) return {}
  try {
    const parsed = JSON.parse(metaJson)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function upsertChatSession(payload: UpsertChatSessionPayload) {
  const sessionUuid = String(payload.sessionUuid || '').trim()
  if (!sessionUuid) return null
  const now = payload.updatedAt || new Date().toISOString()
  const title = String(payload.title || '').trim()
  const existing = db.select()
    .from(chatSession)
    .where(eq(chatSession.sessionUuid, sessionUuid))
    .limit(1)
    .all()[0]

  if (existing) {
    db.update(chatSession)
      .set({
        title: title || existing.title || '',
        updatedAt: now,
        lastMessageAt: payload.lastMessageAt ?? existing.lastMessageAt ?? null,
      })
      .where(eq(chatSession.sessionUuid, sessionUuid))
      .run()
  } else {
    db.insert(chatSession).values({
      sessionUuid,
      title,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: payload.lastMessageAt ?? null,
    }).run()
  }

  return db.select()
    .from(chatSession)
    .where(eq(chatSession.sessionUuid, sessionUuid))
    .limit(1)
    .all()[0] ?? null
}

export function listChatSessions(limit = 50) {
  return db.select()
    .from(chatSession)
    .orderBy(desc(chatSession.lastMessageAt), desc(chatSession.updatedAt), desc(chatSession.id))
    .limit(Math.max(1, Math.min(200, Number(limit || 50))))
    .all()
}

export function deleteChatSession(sessionUuid: string) {
  const sid = String(sessionUuid || '').trim()
  if (!sid) return
  db.delete(chatMessage).where(eq(chatMessage.sessionUuid, sid)).run()
  db.delete(chatSession).where(eq(chatSession.sessionUuid, sid)).run()
}

export function saveChatMessage(payload: SaveChatMessagePayload) {
  const sessionUuid = String(payload.sessionUuid || '').trim()
  if (!sessionUuid) return 0
  const createdAt = payload.createdAt || new Date().toISOString()
  const role = String(payload.role || '').trim() || 'assistant'
  const content = String(payload.content || '')
  const metaJson = payload.meta ? JSON.stringify(payload.meta) : null
  upsertChatSession({
    sessionUuid,
    title: '',
    lastMessageAt: createdAt,
    updatedAt: createdAt,
  })
  const res = db.insert(chatMessage).values({
    sessionUuid,
    role,
    content,
    metaJson,
    createdAt,
  }).run()
  return Number(res.lastInsertRowid || 0)
}

export function listChatMessages(sessionUuid: string, limit = 100) {
  const sid = String(sessionUuid || '').trim()
  if (!sid) return []
  const rows = db.select()
    .from(chatMessage)
    .where(eq(chatMessage.sessionUuid, sid))
    .orderBy(desc(chatMessage.id))
    .limit(Math.max(1, Math.min(500, Number(limit || 100))))
    .all()
    .reverse()

  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    meta: safeParseMeta(row.metaJson ?? null),
    created_at: row.createdAt,
  }))
}

export function replaceChatSessionMessages(payload: ReplaceChatSessionMessagesPayload) {
  const sid = String(payload.sessionUuid || '').trim()
  if (!sid) return
  const title = String(payload.title || '').trim()
  const items = Array.isArray(payload.items) ? payload.items : []
  const now = new Date().toISOString()

  db.delete(chatMessage).where(eq(chatMessage.sessionUuid, sid)).run()

  for (const item of items) {
    const role = String(item?.role || '').trim()
    if (!role) continue
    const content = String(item?.content || '')
    const createdAt = String(item?.createdAt || '').trim() || now
    const metaJson = item?.meta ? JSON.stringify(item.meta) : null
    db.insert(chatMessage).values({
      sessionUuid: sid,
      role,
      content,
      metaJson,
      createdAt,
    }).run()
  }

  const latestTs = String(items[items.length - 1]?.createdAt || '').trim() || now
  upsertChatSession({
    sessionUuid: sid,
    title,
    lastMessageAt: latestTs,
    updatedAt: now,
  })
}

