/**
 * 阿里云 DashScope（百炼）OpenAI 兼容接口模型 id，与当前控制台可用列表对齐。
 * 实际是否可用以开通与计费为准。
 */

export type AliDashScopeModelEntry = { value: string; label: string }

export type AliDashScopeModelGroup = {
  label: string
  models: AliDashScopeModelEntry[]
}

/** 默认模型；请与控制台一致 */
export const DEFAULT_ALI_CHAT_MODEL = 'qwen-turbo'

const entry = (id: string): AliDashScopeModelEntry => ({ value: id, label: id })

/** 控制台导出的真实模型 id：按 classifyModelId 分组排序便于阅读；若存在重复 id，dedupe 时仅保留首次出现（本表已去重排序） */
const MODEL_IDS_RAW: string[] = [
  // 通义 · 通用（Plus / Max / Turbo / Long / Flash）
  'qwen-flash',
  'qwen-flash-2025-07-28',
  'qwen-flash-character',
  'qwen-flash-character-2026-02-26',
  'qwen-long',
  'qwen-long-2025-01-25',
  'qwen-long-latest',
  'qwen-max',
  'qwen-max-0428',
  'qwen-max-0919',
  'qwen-max-2025-01-25',
  'qwen-max-latest',
  'qwen-plus',
  'qwen-plus-0112',
  'qwen-plus-1220',
  'qwen-plus-2025-01-25',
  'qwen-plus-2025-04-28',
  'qwen-plus-2025-07-14',
  'qwen-plus-2025-07-28',
  'qwen-plus-2025-09-11',
  'qwen-plus-2025-12-01',
  'qwen-plus-character',
  'qwen-plus-character-2025-11-06',
  'qwen-plus-latest',
  'qwen-turbo',
  'qwen-turbo-1101',
  'qwen-turbo-2025-02-11',
  'qwen-turbo-2025-04-28',
  'qwen-turbo-2025-07-15',
  'qwen-turbo-latest',

  // 通义 · Qwen3 / 3.5 / 3.6
  'qwen3-0.6b',
  'qwen3-1.7b',
  'qwen3-14b',
  'qwen3-235b-a22b',
  'qwen3-235b-a22b-instruct-2507',
  'qwen3-235b-a22b-thinking-2507',
  'qwen3-30b-a3b',
  'qwen3-30b-a3b-instruct-2507',
  'qwen3-30b-a3b-thinking-2507',
  'qwen3-32b',
  'qwen3-4b',
  'qwen3-4b-instruct-2507',
  'qwen3-8b',
  'qwen3-max',
  'qwen3-max-2025-09-23',
  'qwen3-max-2026-01-23',
  'qwen3-max-preview',
  'qwen3-next-80b-a3b-instruct',
  'qwen3-next-80b-a3b-thinking',
  'qwen3.5-122b-a10b',
  'qwen3.5-27b',
  'qwen3.5-35b-a3b',
  'qwen3.5-397b-a17b',
  'qwen3.5-flash',
  'qwen3.5-flash-2026-02-23',
  'qwen3.5-plus',
  'qwen3.5-plus-2026-02-15',
  'qwen3.6-plus',
  'qwen3.6-plus-2026-04-02',

  // 通义 · Qwen2.5
  'qwen2.5-0.5b-instruct',
  'qwen2.5-1.5b-instruct',
  'qwen2.5-14b-instruct',
  'qwen2.5-14b-instruct-1m',
  'qwen2.5-32b-instruct',
  'qwen2.5-3b-instruct',
  'qwen2.5-72b-instruct',
  'qwen2.5-7b-instruct',
  'qwen2.5-7b-instruct-1m',
  'qwen2.5-coder-14b-instruct',
  'qwen2.5-coder-32b-instruct',
  'qwen2.5-coder-7b-instruct',
  'qwen2.5-math-72b-instruct',
  'qwen2.5-math-7b-instruct',

  // 通义 · VL / 多模态
  'qwen-vl-max',
  'qwen-vl-max-1119',
  'qwen-vl-max-1230',
  'qwen-vl-max-2025-01-25',
  'qwen-vl-max-2025-04-02',
  'qwen-vl-max-2025-04-08',
  'qwen-vl-max-2025-08-13',
  'qwen-vl-max-latest',
  'qwen-vl-plus',
  'qwen-vl-plus-0102',
  'qwen-vl-plus-2025-01-25',
  'qwen-vl-plus-2025-05-07',
  'qwen-vl-plus-2025-07-10',
  'qwen-vl-plus-2025-08-15',
  'qwen-vl-plus-latest',
  'qwen2.5-vl-32b-instruct',
  'qwen2.5-vl-3b-instruct',
  'qwen2.5-vl-72b-instruct',
  'qwen2.5-vl-7b-instruct',
  'qwen3-vl-1b-base',
  'qwen3-vl-235b-a22b-instruct',
  'qwen3-vl-235b-a22b-thinking',
  'qwen3-vl-30b-a3b-instruct',
  'qwen3-vl-30b-a3b-thinking',
  'qwen3-vl-32b-instruct',
  'qwen3-vl-32b-thinking',
  'qwen3-vl-4b-instruct',
  'qwen3-vl-8b-base',
  'qwen3-vl-8b-instruct',
  'qwen3-vl-8b-thinking',
  'qwen3-vl-flash',
  'qwen3-vl-flash-2025-10-15',
  'qwen3-vl-flash-2026-01-22',
  'qwen3-vl-plus',
  'qwen3-vl-plus-2025-09-23',
  'qwen3-vl-plus-2025-12-19',

  // 通义 · OCR
  'qwen-vl-ocr',
  'qwen-vl-ocr-1028',
  'qwen-vl-ocr-2025-04-13',
  'qwen-vl-ocr-2025-08-28',
  'qwen-vl-ocr-2025-11-20',
  'qwen-vl-ocr-latest',

  // 通义 · 数学
  'qwen-math-plus',
  'qwen-math-plus-0816',
  'qwen-math-plus-0919',
  'qwen-math-plus-latest',
  'qwen-math-turbo',
  'qwen-math-turbo-0919',
  'qwen-math-turbo-latest',

  // 通义 · 代码
  'qwen-coder-plus',
  'qwen-coder-plus-1106',
  'qwen-coder-plus-latest',
  'qwen-coder-turbo',
  'qwen-coder-turbo-0919',
  'qwen-coder-turbo-latest',
  'qwen3-coder-30b-a3b-instruct',
  'qwen3-coder-480b-a35b-instruct',
  'qwen3-coder-flash',
  'qwen3-coder-flash-2025-07-28',
  'qwen3-coder-next',
  'qwen3-coder-plus',
  'qwen3-coder-plus-2025-07-22',
  'qwen3-coder-plus-2025-09-23',

  // 通义 · 翻译
  'qwen-mt-flash',
  'qwen-mt-lite',
  'qwen-mt-plus',
  'qwen-mt-turbo',

  // 通义 · 深度研究
  'qwen-deep-research',
  'qwen-deep-research-2025-12-15',

  // 通义 · 文档
  'qwen-doc-turbo',

  // QVQ
  'qvq-72b-preview',
  'qvq-max',
  'qvq-max-2025-03-25',
  'qvq-max-2025-05-15',
  'qvq-max-latest',
  'qvq-plus',
  'qvq-plus-2025-05-15',
  'qvq-plus-latest',

  // QwQ
  'qwq-32b',
  'qwq-32b-preview',
  'qwq-plus',
  'qwq-plus-2025-03-05',

  // DeepSeek
  'deepseek-r1',
  'deepseek-r1-0528',
  'deepseek-r1-distill-llama-70b',
  'deepseek-r1-distill-llama-8b',
  'deepseek-r1-distill-qwen-1.5b',
  'deepseek-r1-distill-qwen-14b',
  'deepseek-r1-distill-qwen-32b',
  'deepseek-r1-distill-qwen-7b',
  'deepseek-v3',
  'deepseek-v3.1',
  'deepseek-v3.2',
  'deepseek-v3.2-exp',

  // GLM
  'glm-4.5',
  'glm-4.5-air',
  'glm-4.6',
  'glm-4.7',
  'glm-5',
  'glm-5.1',

  // MiniMax
  'MiniMax-M2.1',
  'MiniMax-M2.5',
  'MiniMax/MiniMax-M2.1',
  'MiniMax/MiniMax-M2.5',
  'MiniMax/MiniMax-M2.7',

  // Kimi
  'kimi-k2-thinking',
  'kimi-k2.5',
  'kimi/kimi-k2.5',

  // Moonshot
  'Moonshot-Kimi-K2-Instruct',

  // Llama
  'llama-4-maverick-17b-128e-instruct',
  'llama-4-scout-17b-16e-instruct',

  // SiliconFlow
  'siliconflow/deepseek-r1-0528',
  'siliconflow/deepseek-v3-0324',
  'siliconflow/deepseek-v3.1-terminus',
  'siliconflow/deepseek-v3.2',

  // Vanchin
  'vanchin/deepseek-ocr',
  'vanchin/deepseek-r1',
  'vanchin/deepseek-v3',
  'vanchin/deepseek-v3.1-terminus',
  'vanchin/deepseek-v3.2-speciale',
  'vanchin/deepseek-v3.2-think',

  // 通义 · 工具 / 其它
  'gui-plus',
  'gui-plus-2026-02-26',
  'tongyi-intent-detect-v3',
  'tongyi-xiaomi-analysis-flash',
  'tongyi-xiaomi-analysis-pro',
]
function dedupePreserveOrder(ids: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    const t = String(id || '').trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

const MODEL_IDS = dedupePreserveOrder(MODEL_IDS_RAW)

/** 分类规则顺序敏感：先匹配更具体的前缀 */
function classifyModelId(id: string): string {
  if (id.startsWith('qwq-')) return 'QwQ'
  if (id.startsWith('qvq-')) return 'QVQ'
  if (id.startsWith('siliconflow/')) return 'SiliconFlow'
  if (id.startsWith('vanchin/')) return 'Vanchin'
  if (id.startsWith('MiniMax/') || id.startsWith('MiniMax-')) return 'MiniMax'
  if (id.startsWith('kimi/') || id.startsWith('kimi-')) return 'Kimi'
  if (id.startsWith('Moonshot-')) return 'Moonshot'
  if (id.startsWith('llama-')) return 'Llama'
  if (id.startsWith('deepseek-')) return 'DeepSeek'
  if (id.startsWith('glm-')) return 'GLM'
  if (id.startsWith('qwen-deep-research')) return '通义 · 深度研究'
  if (id.startsWith('qwen-doc-')) return '通义 · 文档'
  if (id.startsWith('qwen-mt-')) return '通义 · 翻译'
  if (id.startsWith('qwen-vl-ocr')) return '通义 · OCR'
  if (id.startsWith('qwen-math-')) return '通义 · 数学'
  if (id.startsWith('qwen-coder-') || id.startsWith('qwen3-coder')) return '通义 · 代码'
  if (id.startsWith('qwen-vl-') || id.startsWith('qwen2.5-vl-') || id.startsWith('qwen3-vl')) {
    return '通义 · VL / 多模态'
  }
  if (id.startsWith('qwen2.5-')) return '通义 · Qwen2.5'
  if (id.startsWith('qwen3') || id.startsWith('qwen3.')) return '通义 · Qwen3 / 3.5 / 3.6'
  if (
    id.startsWith('qwen-plus')
    || id.startsWith('qwen-max')
    || id.startsWith('qwen-turbo')
    || id.startsWith('qwen-long')
    || id.startsWith('qwen-flash')
  ) {
    return '通义 · 通用（Plus / Max / Turbo / Long / Flash）'
  }
  if (id.startsWith('tongyi-') || id.startsWith('gui-')) return '通义 · 工具 / 其它'
  return '通义 · 工具 / 其它'
}

/** 分组在菜单中的顺序（与此前「通义 / 第三方」分区习惯一致） */
const GROUP_ORDER: string[] = [
  '通义 · 通用（Plus / Max / Turbo / Long / Flash）',
  '通义 · Qwen3 / 3.5 / 3.6',
  '通义 · Qwen2.5',
  '通义 · VL / 多模态',
  '通义 · OCR',
  '通义 · 数学',
  '通义 · 代码',
  '通义 · 翻译',
  '通义 · 深度研究',
  '通义 · 文档',
  'QVQ',
  'QwQ',
  'DeepSeek',
  'GLM',
  'MiniMax',
  'Kimi',
  'Moonshot',
  'Llama',
  'SiliconFlow',
  'Vanchin',
  '通义 · 工具 / 其它',
]

function buildGroups(ids: string[]): AliDashScopeModelGroup[] {
  const buckets = new Map<string, string[]>()
  for (const label of GROUP_ORDER) {
    buckets.set(label, [])
  }
  for (const id of ids) {
    const cat = classifyModelId(id)
    const list = buckets.get(cat)
    if (list) list.push(id)
    else {
      const fallback = buckets.get('通义 · 工具 / 其它')!
      fallback.push(id)
    }
  }
  return GROUP_ORDER.map((label) => ({
    label,
    models: (buckets.get(label) || []).map(entry),
  })).filter((g) => g.models.length > 0)
}

export const ALI_DASHSCOPE_MODEL_GROUPS: AliDashScopeModelGroup[] = buildGroups(MODEL_IDS)

const _ids = new Set<string>(MODEL_IDS)

/** 下拉中的全部模型 id（已去重） */
export const ALI_DASHSCOPE_MODEL_ID_SET: ReadonlySet<string> = _ids

export function findAliDashScopeModelLabel(modelId: string): string | undefined {
  const id = String(modelId || '').trim()
  if (!id) return undefined
  if (_ids.has(id)) return id
  return undefined
}
