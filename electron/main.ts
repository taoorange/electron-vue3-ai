import { app, BrowserWindow, ipcMain } from 'electron'
import type { BrowserWindowConstructorOptions } from 'electron'
import path from 'path'

let loginWindow: BrowserWindow | null = null
let mainWindow: BrowserWindow | null = null

/**
 * 主界面与「独立登录窗口」共用同一套尺寸与可缩放行为，避免任意一条路径（如退出登录后）仍停留在 330×500 且无法最大化。
 * 若需单独做小登录窗，可再拆出 login 专用选项，但需保证 maximizable/resizable 与产品预期一致。
 */
function getDefaultWindowOptions(): BrowserWindowConstructorOptions {
  return {
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    resizable: true,
    fullscreenable: true,
    maximizable: true,
    minimizable: true,
    frame: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  }
}

const loadUrlWithHash = (win: BrowserWindow, hash: string) => {
  if (process.env.VITE_DEV_SERVER_URL) {
    const base = process.env.VITE_DEV_SERVER_URL.endsWith('/')
      ? process.env.VITE_DEV_SERVER_URL.slice(0, -1)
      : process.env.VITE_DEV_SERVER_URL
    win.loadURL(`${base}/#${hash}`)
    if (process.env.OPEN_DEVTOOLS === '1') {
      win.webContents.openDevTools()
    }
  } else {
    // In production, load built file with hash
    win.loadFile(path.join(__dirname, '../dist/index.html'), { hash })
  }
}

const createLoginWindow = () => {
  if (loginWindow) return loginWindow
  loginWindow = new BrowserWindow(getDefaultWindowOptions())

  loadUrlWithHash(loginWindow, '/login')

  loginWindow.on('closed', () => {
    loginWindow = null
  })
  return loginWindow
}

const createMainWindow = () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
    return mainWindow
  }
  mainWindow = new BrowserWindow(getDefaultWindowOptions())

  loadUrlWithHash(mainWindow, '/')

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  return mainWindow
}

function registerDbFallbackHandlers(reason: unknown) {
  console.warn('[electron-main] SQLite/Drizzle 模块不可用，启用无数据库降级模式', reason)

  ipcMain.handle('db:insertSystemSetting', async () => 0)
  ipcMain.handle('db:getSystemSetting', async () => null)
  ipcMain.handle('db:updateSystemSetting', async () => undefined)

  ipcMain.handle('db:insertTemplate', async () => 0)
  ipcMain.handle('db:addTemplate', async () => 0)
  ipcMain.handle('db:listTemplates', async () => [])
  ipcMain.handle('db:deleteTemplate', async () => undefined)
  ipcMain.handle('db:upsertChatSession', async () => null)
  ipcMain.handle('db:listChatSessions', async () => [])
  ipcMain.handle('db:deleteChatSession', async () => undefined)
  ipcMain.handle('db:saveChatMessage', async () => 0)
  ipcMain.handle('db:listChatMessages', async () => [])
  ipcMain.handle('db:replaceChatSessionMessages', async () => undefined)

  ipcMain.handle('db:isAvailable', async () => false)
}

async function registerDbHandlers() {
  if (process.env.ELECTRON_DISABLE_SQLITE === '1') {
    registerDbFallbackHandlers('ELECTRON_DISABLE_SQLITE=1')
    return
  }

  try {
    const dbMod = await import('./db')
    const repoMod = await import('./repository')

    // 启动自动建表 + 默认数据
    dbMod.initDatabase()

    // IPC handlers (Drizzle + better-sqlite3)
    ipcMain.handle('db:insertSystemSetting', (_e, payload: { templateBaseUrl: string; reportSave: string }) => {
      return repoMod.insertSystemSetting(payload.templateBaseUrl, payload.reportSave)
    })
    ipcMain.handle('db:getSystemSetting', () => {
      return repoMod.getSystemSetting()
    })
    ipcMain.handle('db:updateSystemSetting', (_e, payload: { id: number; data: Record<string, unknown> }) => {
      return repoMod.updateSystemSetting(payload.id, payload.data as any)
    })

    ipcMain.handle('db:insertTemplate', (_e, payload: { fileUrl: string }) => {
      return repoMod.insertTemplate(payload.fileUrl)
    })
    // 兼容旧通道名（如之前使用过）
    ipcMain.handle('db:addTemplate', (_e, payload: { fileUrl: string }) => {
      return repoMod.insertTemplate(payload.fileUrl)
    })
    ipcMain.handle('db:listTemplates', () => {
      return repoMod.listTemplates()
    })
    ipcMain.handle('db:deleteTemplate', (_e, payload: { id: number }) => {
      return repoMod.deleteTemplate(payload.id)
    })

    ipcMain.handle(
      'db:upsertChatSession',
      (_e, payload: { sessionUuid: string; title?: string; lastMessageAt?: string | null; updatedAt?: string }) => {
        return repoMod.upsertChatSession(payload)
      },
    )
    ipcMain.handle('db:listChatSessions', (_e, payload?: { limit?: number }) => {
      return repoMod.listChatSessions(payload?.limit || 50)
    })
    ipcMain.handle('db:deleteChatSession', (_e, payload: { sessionUuid: string }) => {
      return repoMod.deleteChatSession(payload.sessionUuid)
    })
    ipcMain.handle(
      'db:saveChatMessage',
      (_e, payload: { sessionUuid: string; role: string; content: string; meta?: Record<string, unknown> | null; createdAt?: string }) => {
        return repoMod.saveChatMessage(payload)
      },
    )
    ipcMain.handle('db:listChatMessages', (_e, payload: { sessionUuid: string; limit?: number }) => {
      return repoMod.listChatMessages(payload.sessionUuid, payload.limit || 100)
    })
    ipcMain.handle(
      'db:replaceChatSessionMessages',
      (_e, payload: {
        sessionUuid: string
        title?: string
        items: Array<{
          role: string
          content: string
          meta?: Record<string, unknown> | null
          createdAt?: string
        }>
      }) => {
        return repoMod.replaceChatSessionMessages(payload)
      },
    )

    ipcMain.handle('db:isAvailable', async () => true)
    console.log('[electron-main] SQLite/Drizzle 数据库模块已启用')
  } catch (e) {
    registerDbFallbackHandlers(e)
  }
}

app.whenReady().then(async () => {
  await registerDbHandlers()

  // 默认打开主窗口（大屏可缩放）；登录小窗仅在退出登录后由 logout-to-login 打开
  createMainWindow()

  // 从登录小窗切换到主窗口（登录成功后）
  ipcMain.on('open-main-window', () => {
    createMainWindow()
    if (loginWindow) {
      loginWindow.close()
      loginWindow = null
    }
  })

  // Logout: return to login window and close main window
  ipcMain.on('logout-to-login', () => {
    createLoginWindow()
    if (mainWindow) {
      mainWindow.close()
      mainWindow = null
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})
