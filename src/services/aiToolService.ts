import type Anthropic from '@anthropic-ai/sdk'

// ── Types ──

export interface AiToolProperty {
  readonly type: string
  readonly description?: string
  readonly items?: AiToolProperty
  readonly properties?: Record<string, AiToolProperty>
  readonly required?: readonly string[]
  readonly enum?: readonly string[]
}

export interface AiTool {
  readonly name: string
  readonly description: string
  readonly input_schema: {
    readonly type: 'object'
    readonly properties: Record<string, AiToolProperty>
    readonly required: readonly string[]
  }
}

export interface ToolCallResult<T = unknown> {
  readonly toolName: string
  readonly input: T
  readonly textBefore: string
}

export interface CallWithToolsOptions {
  readonly systemPrompt: string
  readonly userMessage: string
  readonly tools: readonly AiTool[]
  readonly model?: 'haiku' | 'sonnet'
  readonly maxTokens?: number
  readonly toolChoice?: { type: 'tool'; name: string } | { type: 'auto' } | { type: 'any' }
}

export interface StreamWithToolsOptions extends CallWithToolsOptions {
  readonly onChunk?: (text: string) => void
  readonly onToolUse?: <T>(toolName: string, input: T) => void
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

// ── Non-streaming tool call ──

export async function callWithTools<T = unknown>(
  client: Anthropic,
  options: CallWithToolsOptions,
): Promise<ToolCallResult<T>> {
  const {
    systemPrompt,
    userMessage,
    tools,
    model = 'sonnet',
    maxTokens = 4096,
    toolChoice,
  } = options

  const response = await client.messages.create({
    model: resolveModelId(model),
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    tools: tools as Anthropic.Messages.Tool[],
    tool_choice: toolChoice as Anthropic.Messages.ToolChoice | undefined,
  })

  let textBefore = ''
  let toolName = ''
  let input: unknown = {}

  for (const block of response.content) {
    if (block.type === 'text') {
      textBefore += block.text
    } else if (block.type === 'tool_use') {
      toolName = block.name
      input = block.input
    }
  }

  return {
    toolName,
    input: input as T,
    textBefore,
  }
}

// ── Streaming with tool use detection ──

export async function streamWithTools(
  client: Anthropic,
  options: StreamWithToolsOptions,
): Promise<{ text: string; toolCalls: readonly ToolCallResult[] }> {
  const {
    systemPrompt,
    userMessage,
    tools,
    model = 'sonnet',
    maxTokens = 4096,
    toolChoice,
    onChunk,
    onToolUse,
    signal,
  } = options

  const stream = client.messages.stream({
    model: resolveModelId(model),
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    tools: tools as Anthropic.Messages.Tool[],
    tool_choice: toolChoice as Anthropic.Messages.ToolChoice | undefined,
  })

  if (signal) {
    signal.addEventListener('abort', () => stream.abort(), { once: true })
  }

  let fullText = ''
  const toolCalls: ToolCallResult[] = []

  let currentToolName = ''
  let currentToolInput = ''

  for await (const event of stream) {
    if (event.type === 'content_block_start') {
      const block = event.content_block
      if (block.type === 'tool_use') {
        currentToolName = block.name
        currentToolInput = ''
      }
    } else if (event.type === 'content_block_delta') {
      if (event.delta.type === 'text_delta') {
        fullText += event.delta.text
        onChunk?.(event.delta.text)
      } else if (event.delta.type === 'input_json_delta') {
        currentToolInput += event.delta.partial_json
      }
    } else if (event.type === 'content_block_stop') {
      if (currentToolName) {
        const parsed = currentToolInput
          ? JSON.parse(currentToolInput)
          : {}
        toolCalls.push({
          toolName: currentToolName,
          input: parsed,
          textBefore: fullText,
        })
        onToolUse?.(currentToolName, parsed)
        currentToolName = ''
        currentToolInput = ''
      }
    }
  }

  return { text: fullText, toolCalls }
}
