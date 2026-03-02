import type Anthropic from '@anthropic-ai/sdk'
import type { Patient, NutritionType } from '../types'
import type { LabData } from '../types/labData'
import { callWithTools } from './aiToolService'
import type { AiTool } from './aiToolService'
import {
  compressForAI,
  findProductByName,
} from './productContextCompressor'

// ── Types ──

type Product = Record<string, string | number>

export interface AiGeneratedItem {
  readonly product: Product
  readonly volume: number
  readonly frequency: number
  readonly rationale: string
}

export interface AiGeneratedPlan {
  readonly items: readonly AiGeneratedItem[]
  readonly overall_rationale: string
  readonly nutritionType: NutritionType
}

interface ToolPlanItem {
  readonly product_name: string
  readonly volume_ml: number
  readonly frequency_per_day: number
  readonly rationale: string
}

interface ToolPlanInput {
  readonly items: readonly ToolPlanItem[]
  readonly overall_rationale: string
}

// ── Tool definition ──

const GENERATE_PLAN_TOOL: AiTool = {
  name: 'create_nutrition_plan',
  description: '患者に最適な栄養プランを構造化出力する。利用可能な製品リストから選択し、容量と回数を決定する。',
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: '選択した製品と投与計画',
        items: {
          type: 'object',
          properties: {
            product_name: {
              type: 'string',
              description: '製剤名（利用可能リストから正確に選択）',
            },
            volume_ml: {
              type: 'number',
              description: '1回あたりの投与量(ml)',
            },
            frequency_per_day: {
              type: 'number',
              description: '1日の投与回数',
            },
            rationale: {
              type: 'string',
              description: 'この製品を選んだ理由（簡潔に）',
            },
          },
          required: ['product_name', 'volume_ml', 'frequency_per_day', 'rationale'],
        },
      },
      overall_rationale: {
        type: 'string',
        description: 'プラン全体の根拠（2-3文）',
      },
    },
    required: ['items', 'overall_rationale'],
  },
}

// ── System prompt ──

function buildGeneratorSystemPrompt(
  patientSummary: string,
  condition: string,
  nutritionTypeLabel: string,
  candidateList: string,
): string {
  return `あなたは臨床栄養管理の専門AIです。

## 役割
患者情報に基づいて最適な${nutritionTypeLabel}プランを作成してください。

## 患者
${patientSummary}

## 診断カテゴリ
${condition}

## 利用可能な製品
${candidateList}

## ルール
- 上記の利用可能リストからのみ製品を選択すること（製剤名は正確に一致させること）
- ASPEN/ESPENガイドラインに準拠
- エネルギー・蛋白質の充足を最優先
- 患者の病態（腎機能、肝機能、心機能等）に応じた電解質制限を考慮
- Refeeding症候群リスクがある場合は低カロリーから開始
- 通常2-4製品で構成（必要に応じて増減可）
- 容量は25ml刻み（経腸）または50ml刻み（静脈）で指定
- create_nutrition_planツールで回答すること`
}

// ── Main export ──

export async function generateAiPlan(
  client: Anthropic,
  patient: Patient,
  products: readonly Product[],
  nutritionType: NutritionType,
  labData?: LabData,
): Promise<AiGeneratedPlan> {
  const compressed = compressForAI(products, patient, nutritionType, labData)

  const candidateList = compressed.candidates
    .map((c) => `- ${c.name} (${c.kcal_ml}kcal/ml, 蛋白${c.protein_100ml}g/100ml, ${c.subcategory}, ${c.key_features})`)
    .join('\n')

  const systemPrompt = buildGeneratorSystemPrompt(
    compressed.patient_summary,
    compressed.condition,
    compressed.nutrition_type_label,
    candidateList,
  )

  const result = await callWithTools<ToolPlanInput>(client, {
    systemPrompt,
    userMessage: 'この患者に最適な栄養プランを作成してください。',
    tools: [GENERATE_PLAN_TOOL],
    model: 'sonnet',
    toolChoice: { type: 'tool', name: 'create_nutrition_plan' },
  })

  const planInput = result.input
  const items: AiGeneratedItem[] = (planInput.items ?? [])
    .map((item) => {
      const product = findProductByName(products, item.product_name)
      if (!product) return null
      return {
        product,
        volume: item.volume_ml,
        frequency: item.frequency_per_day,
        rationale: item.rationale,
      }
    })
    .filter((item): item is AiGeneratedItem => item !== null)

  return {
    items,
    overall_rationale: planInput.overall_rationale ?? '',
    nutritionType,
  }
}
