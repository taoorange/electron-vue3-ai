import { defineStore } from 'pinia'
import { deleteChatSessionApi, listChatSessionsApi } from '@/api/chat'
import type { ChatSession } from '@/api/types'

function tsRank(row: ChatSession): number {
  const raw = row.last_message_at || row.updated_at || row.created_at || ''
  const ms = raw ? Date.parse(String(raw)) : NaN
  return Number.isFinite(ms) ? ms : 0
}

function canUseElectronChatDb() {
  return typeof window !== 'undefined' && Boolean(window.electronAPI?.db?.isAvailable)
}

function normalizeElectronSession(row: any): ChatSession {
  return {
    id: typeof row?.id === 'number' ? row.id : undefined,
    session_uuid: String(row?.sessionUuid || row?.session_uuid || ''),
    title: String(row?.title || ''),
    created_at: String(row?.createdAt || row?.created_at || ''),
    updated_at: String(row?.updatedAt || row?.updated_at || ''),
    last_message_at: (row?.lastMessageAt || row?.last_message_at || null) as string | null,
  }
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    sessions: [] as ChatSession[],
    currentSessionUuid: '' as string,
    loadingSessions: false,
    jobSourceSessions: {} as Record<string, string>,
  }),
  actions: {
    setCurrentSession(sessionUuid: string) {
      this.currentSessionUuid = String(sessionUuid || '')
    },
    clearCurrentSession() {
      this.currentSessionUuid = ''
    },
    upsertSession(session: ChatSession) {
      const uuid = String(session?.session_uuid || '')
      if (!uuid) return
      const idx = this.sessions.findIndex((s) => s.session_uuid === uuid)
      const merged = idx >= 0 ? { ...this.sessions[idx], ...session } : { ...session }
      if (idx >= 0) this.sessions.splice(idx, 1, merged)
      else this.sessions.unshift(merged)
      this.sessions = [...this.sessions].sort((a, b) => tsRank(b) - tsRank(a)).slice(0, 50)
    },
    async refreshSessions(limit = 50) {
      this.loadingSessions = true
      try {
        if (canUseElectronChatDb() && await window.electronAPI.db.isAvailable()) {
          const rows = await window.electronAPI.db.listChatSessions(limit)
          this.sessions = rows.map((row) => normalizeElectronSession(row)).sort((a, b) => tsRank(b) - tsRank(a))
          return
        }
        const res = await listChatSessionsApi(limit)
        this.sessions = [...(res.items || [])].sort((a, b) => tsRank(b) - tsRank(a))
      } finally {
        this.loadingSessions = false
      }
    },
    async deleteSession(sessionUuid: string) {
      if (canUseElectronChatDb() && await window.electronAPI.db.isAvailable()) {
        await window.electronAPI.db.deleteChatSession(sessionUuid)
      } else {
        await deleteChatSessionApi(sessionUuid)
      }
      this.sessions = this.sessions.filter((s) => s.session_uuid !== sessionUuid)
      if (this.currentSessionUuid === sessionUuid) this.currentSessionUuid = ''
      for (const [jobId, sid] of Object.entries(this.jobSourceSessions)) {
        if (sid === sessionUuid) delete this.jobSourceSessions[jobId]
      }
    },
    bindJobToSession(jobId: string, sessionUuid: string) {
      const jid = String(jobId || '').trim()
      const sid = String(sessionUuid || '').trim()
      if (!jid || !sid) return
      this.jobSourceSessions[jid] = sid
    },
    getJobSourceSession(jobId: string) {
      return String(this.jobSourceSessions[String(jobId || '')] || '')
    },
  },
  persist: {
    pick: ['currentSessionUuid', 'jobSourceSessions'],
  },
})
