import type Anthropic from '@anthropic-ai/sdk'

// ── Types ──

export interface ChatMessage {
  readonly role: 'user' | 'assistant'
  readonly content: string
  readonly timestamp: string
}

export interface StreamOptions {
  readonly systemPrompt: string
  readonly messages: readonly ChatMessage[]
  readonly model: 'haiku' | 'sonnet'
  readonly maxTokens?: number
  readonly onChunk?: (text: string) => void
  readonly signal?: AbortSignal
}

// ── Model mapping ──

function resolveModelId(model: 'haiku' | 'sonnet'): string {
  switch (model) {
    case 'haiku':
      return 'claude-haiku-4-5-20251001'
    case 'sonnet':
      return 'claude-sonnet-4-5-20250929'
  }
}

// ── Streaming chat ──

export async function streamChatResponse(
  client: Anthropic,
  options: StreamOptions,
): Promise<string> {
  const { systemPrompt, messages, model, maxTokens = 1024, onChunk, signal } = options

  const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = messages.map(
    (m) => ({
      role: m.role,
      content: m.content,
    }),
  )

  let fullText = ''

  const stream = client.messages.stream({
    model: resolveModelId(model),
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: apiMessages,
  })

  if (signal) {
    signal.addEventListener('abort', () => {
      stream.abort()
    }, { once: true })
  }

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullText += event.delta.text
      onChunk?.(event.delta.text)
    }
  }

  return fullText
}

// ── Quick actions ──

export interface QuickAction {
  readonly id: string
  readonly label: string
  readonly prompt: string
  readonly mode: 'clinical' | 'education'
}

export const CLINICAL_QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: 'issues',
    label: '問題点は？',
    prompt: 'このメニューの問題点を指摘してください。改善すべき優先順位をつけてください。',
    mode: 'clinical',
  },
  {
    id: 'rationale',
    label: 'なぜこの製品？',
    prompt: '現在選択されている製品の選択理由と、代替案があれば教えてください。',
    mode: 'clinical',
  },
  {
    id: 'trend',
    label: 'トレンド分析',
    prompt: '検査値のトレンドから、栄養管理で今後注意すべき点を教えてください。',
    mode: 'clinical',
  },
  {
    id: 'priority',
    label: '優先介入は？',
    prompt: 'この患者で最も優先すべき栄養介入は何ですか？根拠とともに教えてください。',
    mode: 'clinical',
  },
  {
    id: 'refeeding',
    label: 'Refeedingリスク？',
    prompt: 'この患者のRefeeding症候群リスクを評価し、予防策を教えてください。',
    mode: 'clinical',
  },
]

export const EDUCATION_QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: 'hint',
    label: 'ヒントをください',
    prompt: '何から考えればいいか分かりません。ヒントをください。',
    mode: 'education',
  },
  {
    id: 'check',
    label: 'ここまで合ってる？',
    prompt: '今のメニュー案について、方向性が合っているか確認してください。',
    mode: 'education',
  },
  {
    id: 'why',
    label: 'なぜ重要？',
    prompt: 'この症例で特に注意すべきポイントがなぜ重要なのか教えてください。',
    mode: 'education',
  },
  {
    id: 'guideline',
    label: 'ガイドラインは？',
    prompt: 'この症例に関連するガイドラインの推奨を教えてください。',
    mode: 'education',
  },
]
