import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // window.electronAPI.openMainWindow() -> ask main to open main window
  openMainWindow: () => ipcRenderer.send('open-main-window'),
  // window.electronAPI.logoutToLoginWindow() -> ask main to close main and open login
  logoutToLoginWindow: () => ipcRenderer.send('logout-to-login'),
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  receive: (channel: string, func: (...args: any[]) => void) =>
    ipcRenderer.on(channel, (_, ...args) => func(...args)),
  invoke: (channel: string, data?: any) => ipcRenderer.invoke(channel, data),
  db: {
    isAvailable: () => ipcRenderer.invoke('db:isAvailable') as Promise<boolean>,
    // system_setting
    insertSystemSetting: (templateBaseUrl: string, reportSave: string) =>
      ipcRenderer.invoke('db:insertSystemSetting', { templateBaseUrl, reportSave }) as Promise<number>,
    getSystemSetting: () => ipcRenderer.invoke('db:getSystemSetting') as Promise<{
      id: number
      templateBaseUrl: string
      reportSave: string
      status: number
      createdAt: string
    } | null>,
    updateSystemSetting: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('db:updateSystemSetting', { id, data }) as Promise<void>,

    // report_template
    insertTemplate: (fileUrl: string) => ipcRenderer.invoke('db:insertTemplate', { fileUrl }) as Promise<number>,
    listTemplates: () => ipcRenderer.invoke('db:listTemplates') as Promise<Array<{ id: number; fileUrl: string; createdAt: string }>>,
    deleteTemplate: (id: number) => ipcRenderer.invoke('db:deleteTemplate', { id }) as Promise<void>,

    // 兼容旧通道名
    addTemplate: (fileUrl: string) => ipcRenderer.invoke('db:addTemplate', { fileUrl }) as Promise<number>,

    // chat_session / chat_message
    upsertChatSession: (payload: {
      sessionUuid: string
      title?: string
      lastMessageAt?: string | null
      updatedAt?: string
    }) => ipcRenderer.invoke('db:upsertChatSession', payload) as Promise<{
      id: number
      sessionUuid: string
      title: string
      createdAt: string
      updatedAt: string
      lastMessageAt?: string | null
    } | null>,
    listChatSessions: (limit = 50) => ipcRenderer.invoke('db:listChatSessions', { limit }) as Promise<Array<{
      id: number
      sessionUuid: string
      title: string
      createdAt: string
      updatedAt: string
      lastMessageAt?: string | null
    }>>,
    deleteChatSession: (sessionUuid: string) =>
      ipcRenderer.invoke('db:deleteChatSession', { sessionUuid }) as Promise<void>,
    saveChatMessage: (payload: {
      sessionUuid: string
      role: string
      content: string
      meta?: Record<string, unknown> | null
      createdAt?: string
    }) => ipcRenderer.invoke('db:saveChatMessage', payload) as Promise<number>,
    listChatMessages: (sessionUuid: string, limit = 100) =>
      ipcRenderer.invoke('db:listChatMessages', { sessionUuid, limit }) as Promise<Array<{
        id: number
        role: string
        content: string
        meta?: Record<string, unknown>
        created_at?: string
      }>>,
    replaceChatSessionMessages: (payload: {
      sessionUuid: string
      title?: string
      items: Array<{
        role: string
        content: string
        meta?: Record<string, unknown> | null
        createdAt?: string
      }>
    }) => ipcRenderer.invoke('db:replaceChatSessionMessages', payload) as Promise<void>,
  },
})
