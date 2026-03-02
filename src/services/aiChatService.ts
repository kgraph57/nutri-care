import type Anthropic from "@anthropic-ai/sdk";

// ── Types ──

export interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: string;
}

export interface StreamOptions {
  readonly systemPrompt: string;
  readonly messages: readonly ChatMessage[];
  readonly model: "haiku" | "sonnet";
  readonly maxTokens?: number;
  readonly onChunk?: (text: string) => void;
  readonly signal?: AbortSignal;
}

// ── Model mapping ──

function resolveModelId(model: "haiku" | "sonnet"): string {
  switch (model) {
    case "haiku":
      return "claude-haiku-4-5-20251001";
    case "sonnet":
      return "claude-sonnet-4-5-20250929";
  }
}

// ── Streaming chat ──

export async function streamChatResponse(
  client: Anthropic,
  options: StreamOptions,
): Promise<string> {
  const {
    systemPrompt,
    messages,
    model,
    maxTokens = 1024,
    onChunk,
    signal,
  } = options;

  const apiMessages: Array<{ role: "user" | "assistant"; content: string }> =
    messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

  let fullText = "";

  const stream = client.messages.stream({
    model: resolveModelId(model),
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: apiMessages,
  });

  if (signal) {
    signal.addEventListener(
      "abort",
      () => {
        stream.abort();
      },
      { once: true },
    );
  }

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullText += event.delta.text;
      onChunk?.(event.delta.text);
    }
  }

  return fullText;
}

// ── Streaming chat with tool use ──

export interface ChatToolCall {
  readonly toolName: string;
  readonly input: Record<string, unknown>;
}

export interface StreamWithToolsOptions extends StreamOptions {
  readonly tools?: readonly Anthropic.Messages.Tool[];
  readonly onToolUse?: (toolCall: ChatToolCall) => void;
}

export async function streamChatWithTools(
  client: Anthropic,
  options: StreamWithToolsOptions,
): Promise<{ text: string; toolCalls: readonly ChatToolCall[] }> {
  const {
    systemPrompt,
    messages,
    model,
    maxTokens = 2048,
    onChunk,
    signal,
    tools,
    onToolUse,
  } = options;

  const apiMessages: Array<{ role: "user" | "assistant"; content: string }> =
    messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

  const streamParams: Record<string, unknown> = {
    model: resolveModelId(model),
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: apiMessages,
  };

  if (tools && tools.length > 0) {
    streamParams["tools"] = tools;
  }

  const stream = client.messages.stream(
    streamParams as Parameters<typeof client.messages.stream>[0],
  );

  if (signal) {
    signal.addEventListener("abort", () => stream.abort(), { once: true });
  }

  let fullText = "";
  const toolCalls: ChatToolCall[] = [];
  let currentToolName = "";
  let currentToolInput = "";

  for await (const event of stream) {
    if (event.type === "content_block_start") {
      const block = event.content_block;
      if (block.type === "tool_use") {
        currentToolName = block.name;
        currentToolInput = "";
      }
    } else if (event.type === "content_block_delta") {
      if (event.delta.type === "text_delta") {
        fullText += event.delta.text;
        onChunk?.(event.delta.text);
      } else if (event.delta.type === "input_json_delta") {
        currentToolInput += event.delta.partial_json;
      }
    } else if (event.type === "content_block_stop") {
      if (currentToolName) {
        const parsed = currentToolInput ? JSON.parse(currentToolInput) : {};
        const call: ChatToolCall = { toolName: currentToolName, input: parsed };
        toolCalls.push(call);
        onToolUse?.(call);
        currentToolName = "";
        currentToolInput = "";
      }
    }
  }

  return { text: fullText, toolCalls };
}

// ── Menu manipulation tools for chat ──

export const MENU_CHAT_TOOLS: readonly Anthropic.Messages.Tool[] = [
  {
    name: "update_menu_item",
    description: "メニュー内の製品の容量または回数を変更する",
    input_schema: {
      type: "object" as const,
      properties: {
        product_name: { type: "string", description: "製剤名" },
        field: {
          type: "string",
          enum: ["volume", "frequency"],
          description: "変更するフィールド",
        },
        value: { type: "number", description: "新しい値" },
      },
      required: ["product_name", "field", "value"],
    },
  },
  {
    name: "add_product",
    description: "メニューに製品を追加する",
    input_schema: {
      type: "object" as const,
      properties: {
        product_name: { type: "string", description: "追加する製剤名" },
        volume: { type: "number", description: "容量(ml)" },
        frequency: { type: "number", description: "回数/日" },
      },
      required: ["product_name", "volume", "frequency"],
    },
  },
  {
    name: "remove_product",
    description: "メニューから製品を削除する",
    input_schema: {
      type: "object" as const,
      properties: {
        product_name: { type: "string", description: "削除する製剤名" },
      },
      required: ["product_name"],
    },
  },
];

// ── Quick actions ──

export interface QuickAction {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
  readonly mode: "clinical" | "education";
}

export const CLINICAL_QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: "issues",
    label: "問題点は？",
    prompt:
      "このメニューの問題点を指摘してください。改善すべき優先順位をつけてください。",
    mode: "clinical",
  },
  {
    id: "rationale",
    label: "なぜこの製品？",
    prompt:
      "現在選択されている製品の選択理由と、代替案があれば教えてください。",
    mode: "clinical",
  },
  {
    id: "trend",
    label: "トレンド分析",
    prompt:
      "検査値のトレンドから、栄養管理で今後注意すべき点を教えてください。",
    mode: "clinical",
  },
  {
    id: "priority",
    label: "優先介入は？",
    prompt:
      "この患者で最も優先すべき栄養介入は何ですか？根拠とともに教えてください。",
    mode: "clinical",
  },
  {
    id: "refeeding",
    label: "Refeedingリスク？",
    prompt: "この患者のRefeeding症候群リスクを評価し、予防策を教えてください。",
    mode: "clinical",
  },
];

export const EDUCATION_QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: "hint",
    label: "ヒントをください",
    prompt: "何から考えればいいか分かりません。ヒントをください。",
    mode: "education",
  },
  {
    id: "check",
    label: "ここまで合ってる？",
    prompt: "今のメニュー案について、方向性が合っているか確認してください。",
    mode: "education",
  },
  {
    id: "why",
    label: "なぜ重要？",
    prompt: "この症例で特に注意すべきポイントがなぜ重要なのか教えてください。",
    mode: "education",
  },
  {
    id: "guideline",
    label: "ガイドラインは？",
    prompt: "この症例に関連するガイドラインの推奨を教えてください。",
    mode: "education",
  },
];
