/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ALI_QIANWEN_API_KEY?: string
  /** DashScope 根域名，与 Key 地域一致 */
  readonly VITE_DASHSCOPE_BASE_URL?: string
  /** beijing | singapore | us | hongkong */
  readonly VITE_DASHSCOPE_REGION?: string
  /** 通义调用默认模型（百炼短 id），如 qwen-turbo、qwen-plus */
  readonly VITE_ALI_QWEN_API_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

