# `electron/` 目录说明

本目录为 **Electron 主进程与本地数据层** 源码，经 TypeScript 编译后输出到项目根目录的 `dist-electron/`，供 `package.json` 中的 `"main": "dist-electron/main.js"` 加载。

与 `src/`（Vue 渲染进程）的分工如下：

- **渲染进程**：界面、路由、调用 `window.electronAPI`。
- **主进程**（本目录）：窗口生命周期、IPC、`better-sqlite3` 数据库访问（Node 能力不暴露给页面）。

---

## 文件一览

| 文件 | 作用概要 |
|------|----------|
| `main.ts` | 应用入口：创建窗口、注册 IPC、在合适时机初始化 SQLite；失败或关闭 DB 时走降级逻辑。 |
| `preload.ts` | 预加载脚本：通过 `contextBridge` 向页面注入安全的 `window.electronAPI`（窗口切换、通用 IPC、`db.*` 等）。 |
| `db.ts` | 创建/连接本地 `app.db`、启动时 `CREATE TABLE IF NOT EXISTS`、默认目录与初始配置。 |
| `schema.ts` | Drizzle ORM 的表结构定义（与 `db.ts` 中实际表名、列名一致）。 |
| `repository.ts` | 数据访问层：对外的增删改查与聊天会话相关业务逻辑，供 `main.ts` 的 IPC handler 调用。 |
| `tsconfig.json` | 仅编译本目录 TS 的配置：输出 `dist-electron/`、CommonJS、与 Vite 的前端构建分离。 |

---

## 各文件说明

### `main.ts`

- 作为 Electron **主进程入口**（编译后为 `dist-electron/main.js`）。
- **窗口**：创建主窗口（及可选的登录小窗）、加载带 Hash 的路由（开发走 `VITE_DEV_SERVER_URL`，生产走 `dist/index.html`）。
- **IPC**：监听如 `open-main-window`、`logout-to-login`；注册 `db:*` 系列 `ipcMain.handle`，内部调用 `repository`。
- **数据库**：在应用就绪时 `import('./db')` 并调用 `initDatabase()`；若 `ELECTRON_DISABLE_SQLITE=1` 或模块加载失败，则注册**空实现**的 DB handler，避免应用崩溃。

### `preload.ts`

- 在 **渲染进程页面脚本执行前**运行，可访问 `electron` 部分 API，并通过 **`contextBridge.exposeInMainWorld`** 暴露给页面。
- 页面侧使用 **`window.electronAPI`**，例如：
  - `openMainWindow` / `logoutToLoginWindow`
  - 通用 `send` / `receive` / `invoke`
  - **`db.*`**：全部通过 `ipcRenderer.invoke` 转到主进程，由主进程访问 SQLite。

这样避免在渲染进程直接 `require('better-sqlite3')`，符合安全隔离模型。

### `db.ts`

- 使用 **`better-sqlite3`** 打开数据库文件：路径为 `app.getPath('userData')/app.db`。
- 导出 **`drizzle(sqlite)`** 实例供 `repository.ts` 使用。
- **`initDatabase()`**：执行建表 SQL（若表不存在则创建），并执行 **`systemInit()`**（例如在尚无有效 `system_setting` 时写入默认行、创建模板/报告目录等）。

### `schema.ts`

- 使用 **Drizzle** 定义与 SQLite 表对应的 TypeScript 结构（列类型、主键等）。
- 与 `db.ts` 里的原生 `CREATE TABLE` 保持同一套表名与字段，便于类型安全查询与维护迁移。

### `repository.ts`

- **业务数据访问层**：封装对 `system_setting`、`report_template`、聊天 `chat_session` / `chat_message` 等的查询与写入。
- **`main.ts` 不直接写 SQL**，而是通过调用本文件中的函数，便于单测与复用。

### `tsconfig.json`

- 将 `electron/**/*.ts` 编译到 **`../dist-electron`**，模块格式为 **CommonJS**，与前端 Vite 的 ESM 构建相互独立。
- 构建命令一般为：`tsc -p electron/tsconfig.json`（见根目录 `package.json` 的 `build` 脚本）。

---

## 数据与调用关系（简图）

```text
Vue 页面
  └── window.electronAPI.db.* / openMainWindow 等
        └── preload.ts（invoke/send）
              └── main.ts（ipcMain.handle）
                    └── repository.ts
                          └── db.ts + schema（Drizzle + better-sqlite3）
```

---

## 相关配置

- 根目录 `package.json` 的 `"main"` 指向编译后的主进程入口。
- 打包时 `electron-builder` 的 `files` 需包含 `dist-electron/**/*`（已在项目 `package.json` 的 `build.files` 中配置）。

如需改窗口大小、是否可缩放等，请编辑 **`main.ts`** 中 `BrowserWindow` 的选项。
