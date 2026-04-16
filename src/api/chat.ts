import { apiRequest, buildApiUrl, getAuthToken } from './client'
import type {
  AgentWorkflowStateResponse,
  ChatSelectCandidateVideoRequest,
  ChatSelectCandidateVideoResponse,
  ChatSelectCandidateVideosBatchRequest,
  ChatSelectCandidateVideosBatchResponse,
  ChatMessagesResponse,
  ChatModelsResponse,
  ChatPlaylistPreviewMessageRequest,
  ChatPlaylistPreviewMessageResponse,
  PlaylistEpisodeNoteBindingRequest,
  PlaylistEpisodeNotesResponse,
  PlaylistEpisodeNoteUpsertResponse,
  ChatJobNoteMessageRequest,
  ChatJobNoteMessageResponse,
  ChatImageDeleteResponse,
  ChatImageUploadResponse,
  PlaylistSeriesResolveRequest,
  PlaylistSeriesResolveResponse,
  ChatReplyRequest,
  ChatReplyResponse,
  ChatReplyStopRequest,
  ChatReplyStopResponse,
  ChatSessionsResponse,
  ChatSessionCreateResponse,
} from './types'

export function createChatSessionApi(title = '') {
  return apiRequest<ChatSessionCreateResponse>('/chat/sessions', {
    method: 'POST',
    body: { title },
    auth: true,
  })
}

export function listChatModelsApi() {
  return apiRequest<ChatModelsResponse>('/chat/models', {
    method: 'GET',
    auth: true,
  })
}

export function listChatSessionsApi(limit = 50) {
  return apiRequest<ChatSessionsResponse>(`/chat/sessions?limit=${limit}`, {
    method: 'GET',
    auth: true,
  })
}

export function deleteChatSessionApi(sessionUuid: string) {
  return apiRequest<{ ok: boolean; session_uuid: string }>(`/chat/sessions/${sessionUuid}`, {
    method: 'DELETE',
    auth: true,
  })
}

export function listChatMessagesApi(sessionUuid: string, limit = 100) {
  return apiRequest<ChatMessagesResponse>(`/chat/sessions/${sessionUuid}/messages?limit=${limit}`, {
    method: 'GET',
    auth: true,
  })
}

export function getAgentWorkflowStateApi(scope: 'chat' | 'job' | string, stateKey: string) {
  const q = new URLSearchParams({
    scope: String(scope || '').trim(),
    state_key: String(stateKey || '').trim(),
  })
  return apiRequest<AgentWorkflowStateResponse>(`/agent-workflows/state?${q.toString()}`, {
    method: 'GET',
    auth: true,
  })
}

export function sendChatMessageApi(sessionUuid: string, payload: ChatReplyRequest) {
  return apiRequest<ChatReplyResponse>(`/chat/sessions/${sessionUuid}/messages`, {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export function selectChatCandidateVideoApi(
  sessionUuid: string,
  jobId: string,
  payload: ChatSelectCandidateVideoRequest,
) {
  return apiRequest<ChatSelectCandidateVideoResponse>(`/chat/sessions/${sessionUuid}/jobs/${jobId}/select-video`, {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export function selectChatCandidateVideosBatchApi(
  sessionUuid: string,
  jobId: string,
  payload: ChatSelectCandidateVideosBatchRequest,
) {
  return apiRequest<ChatSelectCandidateVideosBatchResponse>(`/chat/sessions/${sessionUuid}/jobs/${jobId}/select-videos-batch`, {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export function resolvePlaylistSeriesApi(payload: PlaylistSeriesResolveRequest) {
  return apiRequest<PlaylistSeriesResolveResponse>('/resources/playlists/resolve', {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export function saveChatPlaylistPreviewMessageApi(
  sessionUuid: string,
  payload: ChatPlaylistPreviewMessageRequest,
) {
  return apiRequest<ChatPlaylistPreviewMessageResponse>(`/chat/sessions/${sessionUuid}/playlist-preview-message`, {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export function listPlaylistEpisodeNotesApi(sessionUuid: string, messageId: number) {
  return apiRequest<PlaylistEpisodeNotesResponse>(`/chat/sessions/${sessionUuid}/playlist-preview/${messageId}/episode-notes`, {
    method: 'GET',
    auth: true,
  })
}

export function savePlaylistEpisodeNoteApi(
  sessionUuid: string,
  messageId: number,
  payload: PlaylistEpisodeNoteBindingRequest,
) {
  return apiRequest<PlaylistEpisodeNoteUpsertResponse>(`/chat/sessions/${sessionUuid}/playlist-preview/${messageId}/episode-note`, {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export function saveChatJobNoteMessageApi(
  sessionUuid: string,
  jobId: string,
  payload: ChatJobNoteMessageRequest,
) {
  return apiRequest<ChatJobNoteMessageResponse>(`/chat/sessions/${sessionUuid}/jobs/${jobId}/note-message`, {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export async function uploadChatImageApi(
  file: File,
  options: { onProgress?: (percent: number) => void } = {},
) {
  const url = buildApiUrl('/chat/uploads/image')
  const form = new FormData()
  form.append('file', file)
  const headers: Record<string, string> = {}
  const token = getAuthToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return await new Promise<ChatImageUploadResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      const percent = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)))
      options.onProgress?.(percent)
    }
    xhr.onerror = () => {
      reject(new Error('上传图片失败，网络异常'))
    }
    xhr.onload = () => {
      const status = Number(xhr.status || 0)
      const text = String(xhr.responseText || '')
      if (status < 200 || status >= 300) {
        let err = `HTTP ${status}`
        try {
          const data = JSON.parse(text) as any
          err = data?.detail || data?.message || err
        } catch {
          if (text.trim()) err = text.trim()
        }
        reject(new Error(err))
        return
      }
      try {
        resolve(JSON.parse(text) as ChatImageUploadResponse)
      } catch {
        reject(new Error('上传图片失败，响应解析异常'))
      }
    }
    xhr.send(form)
  })
}

export function deleteChatImageApi(bucket: string, objectName: string) {
  const q = new URLSearchParams({
    bucket: String(bucket || ''),
    object_name: String(objectName || ''),
  })
  return apiRequest<ChatImageDeleteResponse>(`/chat/uploads/image?${q.toString()}`, {
    method: 'DELETE',
    auth: true,
  })
}

export function stopChatMessageStreamApi(sessionUuid: string, payload: ChatReplyStopRequest) {
  return apiRequest<ChatReplyStopResponse>(`/chat/sessions/${sessionUuid}/reply-stop`, {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

type StreamHandlers = {
  onMeta?: (data: any) => void
  onStart?: (data: any) => void
  onDelta?: (text: string, data: any) => void
  onDone?: (data: any) => void
  onSaved?: (data: any) => void
  onAgentUpdate?: (data: any) => void
  onSearchLog?: (data: any) => void
  onSearchResult?: (data: any) => void
  onSearchStatus?: (data: any) => void
  onSearchFocus?: (data: any) => void
  onUnknownEvent?: (eventName: string, data: any) => void
}

export function listActiveSearchTasksApi(limit = 50) {
  return apiRequest<{ ok: boolean; items: any[] }>(`/search/tasks/active?limit=${limit}`, {
    method: 'GET',
    auth: true,
  })
}

export async function sendChatMessageStreamApi(
  sessionUuid: string,
  payload: ChatReplyRequest,
  handlers: StreamHandlers = {},
) {
  const url = buildApiUrl(`/chat/sessions/${sessionUuid}/reply-stream`)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }
  const token = getAuthToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!resp.ok) {
    let message = `HTTP ${resp.status}`
    try {
      const ct = resp.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        const data = await resp.json() as any
        message = data?.detail || data?.message || message
      } else {
        const text = await resp.text()
        if (text) message = text
      }
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  if (!resp.body) throw new Error('流式响应不可用')
  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const dispatchEvent = (eventName: string, rawData: string) => {
    let data: any = {}
    try {
      data = rawData ? JSON.parse(rawData) : {}
    } catch {
      data = { raw: rawData }
    }
    if (eventName === 'meta') handlers.onMeta?.(data)
    else if (eventName === 'start') handlers.onStart?.(data)
    else if (eventName === 'delta') handlers.onDelta?.(String(data?.text || ''), data)
    else if (eventName === 'done') handlers.onDone?.(data)
    else if (eventName === 'saved') handlers.onSaved?.(data)
    else if (eventName === 'agent_update') handlers.onAgentUpdate?.(data)
    else if (eventName === 'search_log') handlers.onSearchLog?.(data)
    else if (eventName === 'search_result') handlers.onSearchResult?.(data)
    else if (eventName === 'search_status') handlers.onSearchStatus?.(data)
    else if (eventName === 'search_focus') handlers.onSearchFocus?.(data)
    else handlers.onUnknownEvent?.(eventName, data)
  }

  const flushBlocks = (final = false) => {
    const normalized = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const parts = normalized.split('\n\n')
    if (!final) {
      buffer = parts.pop() || ''
    } else {
      buffer = ''
    }

    for (const block of parts) {
      if (!block.trim()) continue
      const lines = block.split('\n')
      let eventName = 'message'
      const dataLines: string[] = []
      for (const line of lines) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim()
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
      }
      if (dataLines.length) dispatchEvent(eventName, dataLines.join('\n'))
    }
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      if (buffer.trim()) flushBlocks(true)
      break
    }
    buffer += decoder.decode(value, { stream: true })
    flushBlocks(false)
  }
}

/**
 * DashScope 兼容 OpenAI 的网关「根域名」（不含 path）。
 * 百炼文档中不同地域的域名不同；API Key 必须在对应地域创建，否则会常出现 **404** 或鉴权失败。
 * @see https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions
 */
const DASHSCOPE_REGION_HOST: Record<string, string> = {
  beijing: 'https://dashscope.aliyuncs.com',
  singapore: 'https://dashscope-intl.aliyuncs.com',
  us: 'https://dashscope-us.aliyuncs.com',
  virginia: 'https://dashscope-us.aliyuncs.com',
  hongkong: 'https://cn-hongkong.dashscope.aliyuncs.com',
}

function getDashScopeCompatBaseUrl(): string {
  const explicit = String(import.meta.env.VITE_DASHSCOPE_BASE_URL || '').trim().replace(/\/+$/, '')
  if (explicit) return explicit
  const region = String(import.meta.env.VITE_DASHSCOPE_REGION || 'beijing')
    .trim()
    .toLowerCase()
  return DASHSCOPE_REGION_HOST[region] ?? 'https://dashscope.aliyuncs.com'
}

function getAliQwenApiKey(): string {
  const k = import.meta.env.VITE_APP_ALI_QIANWEN_API_KEY as string | undefined
  return String(k || '').trim()
}

/** 调用通义时使用的默认模型（百炼短 id，如 qwen-turbo / qwen-plus）。 */
function getDefaultDashScopeQwenModel(): string {
  const fromEnv = String(import.meta.env.VITE_ALI_QWEN_API_MODEL || '').trim()
  return fromEnv || 'qwen-turbo'
}

/**
 * 将应用内/后端下发的 model_name 转成 DashScope OpenAI 兼容接口可用的模型 id。
 * 若仍传 HuggingFace 形态（如 `Qwen/Qwen3-VL-...`），百炼会报 model_not_found，需回落到默认短 id。
 */
function mapModelNameToQwen(modelName: string): string {
  const fallback = getDefaultDashScopeQwenModel()
  const m = String(modelName || '').trim()
  if (!m) return fallback
  // 带路径或仓库前缀的通常为 HF/其它平台 ID，百炼不认
  if (m.includes('/') || m.includes(':')) {
    return fallback
  }
  const lower = m.toLowerCase()
  // 百炼常见形态：qwen-turbo、qwen-plus、qwen-max、qwen2.5-7b-instruct 等（仅字母数字下划线与连字符）
  if (/^qwen[\w.-]*$/i.test(m)) {
    return lower
  }
  return fallback
}

export type AliQwenStreamOptions = {
  /** 中止流式请求（用于「停止回复」） */
  signal?: AbortSignal
  /** OpenAI 格式的对话历史；不传则仅使用 payload.content 作为单条 user */
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
}

/**
 * 使用阿里云 DashScope 兼容 OpenAI 的流式 Chat Completions（通义千问），
 * 将 SSE 增量映射为与 `sendChatMessageStreamApi` 相同的 `StreamHandlers` 语义。
 * 需配置环境变量 `VITE_APP_ALI_QIANWEN_API_KEY`。
 */
export async function sendChatMessageByAliQianwenApi(
  _sessionUuid: string,
  payload: ChatReplyRequest,
  handlers: StreamHandlers = {},
  options: AliQwenStreamOptions = {},
) {
  const apiKey = getAliQwenApiKey()
  if (!apiKey) {
    throw new Error('未配置通义 API Key：请在 .env 中设置 VITE_APP_ALI_QIANWEN_API_KEY')
  }

  const model = mapModelNameToQwen(payload.model_name || '')
  const userContent = String(payload.content || '').trim()
  const messages =
    Array.isArray(options.messages) && options.messages.length
      ? options.messages
      : [{ role: 'user' as const, content: userContent || ' ' }]

  const base = getDashScopeCompatBaseUrl()
  const url = `${base}/compatible-mode/v1/chat/completions`

  /**
   * 百炼「联网搜索」扩展参数（非 OpenAI 标准字段，兼容接口顶层传入）。
   * @see https://help.aliyun.com/zh/model-studio/web-search
   * 深度搜索：enable_search + search_options.search_strategy（agent 多轮整合；agent_max 含网页抓取，需模型支持）
   */
  const compatBody: Record<string, unknown> = {
    model,
    messages,
    stream: true,
  }
  if (payload.enable_deep_search) {
    compatBody.enable_search = true
    compatBody.search_options = {
      search_strategy: 'agent_max',
    }
  }

  const resp = await fetch(url, {
    method: 'POST',
    signal: options.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(compatBody),
  })

  if (!resp.ok) {
    let message = `HTTP ${resp.status}`
    try {
      const ct = resp.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        const data = (await resp.json()) as { error?: { message?: string }; message?: string }
        message = data?.error?.message || data?.message || message
      } else {
        const text = await resp.text()
        if (text) message = text.slice(0, 500)
      }
    } catch {
      // ignore
    }
    if (resp.status === 404) {
      message += `（路径或地域不匹配：请确认 Key 开通地域与节点一致。国际/新加坡 Key 请在 .env 设置 VITE_DASHSCOPE_REGION=singapore 或 VITE_DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com）`
    }
    if (/model_not_found|does not exist/i.test(message)) {
      message += `（请在控制台开通对应模型，或在 .env 设置 VITE_ALI_QWEN_API_MODEL 为账号已开通的模型 id，如 qwen-turbo）`
    }
    throw new Error(message)
  }

  if (!resp.body) throw new Error('流式响应不可用')

  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let lineBuffer = ''
  let fullText = ''

  handlers.onStart?.({})
  handlers.onMeta?.({})

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      lineBuffer += decoder.decode(value, { stream: true })
      const lines = lineBuffer.split('\n')
      lineBuffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) continue
        const dataStr = line.slice(5).trimStart()
        if (dataStr === '[DONE]') {
          handlers.onDone?.({ text: fullText })
          return
        }
        try {
          const json = JSON.parse(dataStr) as {
            error?: { message?: string; code?: string }
            choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }>
          }
          if (json.error) {
            throw new Error(json.error.message || json.error.code || '通义 API 错误')
          }
          const delta =
            json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.delta?.reasoning_content
          if (typeof delta === 'string' && delta) {
            fullText += delta
            handlers.onDelta?.(delta, json)
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue
          throw e
        }
      }
    }

    if (lineBuffer.trim()) {
      const line = lineBuffer.trim()
      if (line.startsWith('data:')) {
        const dataStr = line.slice(5).trimStart()
        if (dataStr && dataStr !== '[DONE]') {
          try {
            const json = JSON.parse(dataStr) as {
              choices?: Array<{ delta?: { content?: string } }>
            }
            const delta = json.choices?.[0]?.delta?.content
            if (typeof delta === 'string' && delta) {
              fullText += delta
              handlers.onDelta?.(delta, json)
            }
          } catch {
            // ignore trailing garbage
          }
        }
      }
    }
  } finally {
    reader.releaseLock?.()
  }

  handlers.onDone?.({ text: fullText })
}

/** @deprecated 拼写错误，请使用 sendChatMessageByAliQianwenApi */
export const sendChartMessageByAliQianwenApi = sendChatMessageByAliQianwenApi
