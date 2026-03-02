import type Anthropic from '@anthropic-ai/sdk'
import type { NutritionContext } from './aiContextBuilder'
import { callWithTools } from './aiToolService'
import type { AiTool } from './aiToolService'

// ── Types ──

export type ReviewSeverity = 'critical' | 'warning' | 'info'
export type ReviewArea =
  | 'energy'
  | 'protein'
  | 'electrolyte'
  | 'safety'
  | 'cost'
  | 'protocol'
  | 'interaction'

export interface ReviewIssue {
  readonly severity: ReviewSeverity
  readonly area: ReviewArea
  readonly message: string
  readonly suggestion: string
}

export interface PlanReview {
  readonly score: number
  readonly issues: readonly ReviewIssue[]
  readonly strengths: readonly string[]
  readonly summary: string
}

// ── Tool definition ──

const REVIEW_TOOL: AiTool = {
  name: 'review_plan',
  description: '栄養プランの構造化レビューを出力する。スコア、問題点、強み、サマリーを含む。',
  input_schema: {
    type: 'object',
    properties: {
      score: {
        type: 'number',
        description: '0-100のスコア。80以上=良好、60-79=改善推奨、60未満=要修正',
      },
      issues: {
        type: 'array',
        description: '問題点リスト',
        items: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              enum: ['critical', 'warning', 'info'],
              description: 'critical=即対応、warning=改善推奨、info=参考',
            },
            area: {
              type: 'string',
              enum: [
                'energy',
                'protein',
                'electrolyte',
                'safety',
                'cost',
                'protocol',
                'interaction',
              ],
              description: '問題の分野',
            },
            message: {
              type: 'string',
              description: '問題の説明',
            },
            suggestion: {
              type: 'string',
              description: '具体的な改善案',
            },
          },
          required: ['severity', 'area', 'message', 'suggestion'],
        },
      },
      strengths: {
        type: 'array',
        description: 'プランの良い点（1-3項目）',
        items: { type: 'string' },
      },
      summary: {
        type: 'string',
        description: '1-2文の総評',
      },
    },
    required: ['score', 'issues', 'strengths', 'summary'],
  },
}

// ── System prompt ──

const REVIEW_SYSTEM_PROMPT = `あなたは臨床栄養管理の専門家です。
栄養プランをレビューし、review_planツールで構造化されたフィードバックを返してください。

## 評価基準
- エネルギー充足率（目標±10%が理想）
- タンパク質充足率（ASPEN/ESPENガイドライン準拠）
- 電解質バランス（腎機能・心機能に応じた調整）
- 安全性（Refeeding, アレルギー, 薬剤相互作用）
- 投与プロトコルの適切性（速度、段階的増量）

## スコアリング
- 90-100: 優秀 - ガイドライン準拠、改善点なし
- 80-89: 良好 - 軽微な調整で最適化可能
- 60-79: 改善推奨 - いくつかの重要な修正が必要
- 40-59: 要修正 - 複数の問題あり
- 0-39: 危険 - 即座の修正が必要

必ずreview_planツールを使って回答してください。`

// ── Main export ──

export async function reviewPlan(
  client: Anthropic,
  context: NutritionContext,
): Promise<PlanReview> {
  const userMessage = [
    context.patientSummary,
    context.labSummary,
    context.menuSummary,
    context.ruleBasedAnalysis,
    context.protocolSummary,
    '',
    'このプランをレビューしてください。',
  ].join('\n\n')

  const result = await callWithTools<PlanReview>(client, {
    systemPrompt: REVIEW_SYSTEM_PROMPT,
    userMessage,
    tools: [REVIEW_TOOL],
    model: 'sonnet',
    toolChoice: { type: 'tool', name: 'review_plan' },
  })

  return {
    score: result.input.score ?? 0,
    issues: result.input.issues ?? [],
    strengths: result.input.strengths ?? [],
    summary: result.input.summary ?? '',
  }
}
