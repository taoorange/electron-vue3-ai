export {}

declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data: any) => void
      receive: (channel: string, func: (...args: any[]) => void) => void
      invoke: (channel: string, data?: any) => Promise<any>
      openMainWindow: () => void
      logoutToLoginWindow: () => void
      db: {
        isAvailable: () => Promise<boolean>
        insertSystemSetting: (templateBaseUrl: string, reportSave: string) => Promise<number>
        getSystemSetting: () => Promise<{
          id: number
          templateBaseUrl: string
          reportSave: string
          status: number
          createdAt: string
        } | null>
        updateSystemSetting: (id: number, data: Record<string, unknown>) => Promise<void>
        insertTemplate: (fileUrl: string) => Promise<number>
        addTemplate: (fileUrl: string) => Promise<number>
        listTemplates: () => Promise<Array<{ id: number; fileUrl: string; createdAt: string }>>
        deleteTemplate: (id: number) => Promise<void>
        upsertChatSession: (payload: {
          sessionUuid: string
          title?: string
          lastMessageAt?: string | null
          updatedAt?: string
        }) => Promise<{
          id: number
          sessionUuid: string
          title: string
          createdAt: string
          updatedAt: string
          lastMessageAt?: string | null
        } | null>
        listChatSessions: (limit?: number) => Promise<Array<{
          id: number
          sessionUuid: string
          title: string
          createdAt: string
          updatedAt: string
          lastMessageAt?: string | null
        }>>
        deleteChatSession: (sessionUuid: string) => Promise<void>
        saveChatMessage: (payload: {
          sessionUuid: string
          role: string
          content: string
          meta?: Record<string, unknown> | null
          createdAt?: string
        }) => Promise<number>
        listChatMessages: (sessionUuid: string, limit?: number) => Promise<Array<{
          id: number
          role: string
          content: string
          meta?: Record<string, unknown>
          created_at?: string
        }>>
        replaceChatSessionMessages: (payload: {
          sessionUuid: string
          title?: string
          items: Array<{
            role: string
            content: string
            meta?: Record<string, unknown> | null
            createdAt?: string
          }>
        }) => Promise<void>
      }
    }
  }
}
