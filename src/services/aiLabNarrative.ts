import type Anthropic from '@anthropic-ai/sdk'
import type { LabData } from '../types/labData'
import { callWithTools } from './aiToolService'
import type { AiTool } from './aiToolService'
import { analyzeLabData, getAbnormalFindings } from './labAnalyzer'

// ── Types ──

export interface LabNarrative {
  readonly narrative: string
  readonly trend_summary: string
  readonly today_suggestion: string
}

// ── Tool definition ──

const LAB_NARRATIVE_TOOL: AiTool = {
  name: 'lab_narrative',
  description: '検査値の臨床ナラティブと本日の栄養介入提案を出力する。',
  input_schema: {
    type: 'object',
    properties: {
      narrative: {
        type: 'string',
        description: '検査値の臨床的解釈（2-3文）。数値を含め、何が問題でなぜ問題かを説明。',
      },
      trend_summary: {
        type: 'string',
        description: '検査値トレンドの要約（1文）。改善中/悪化中/安定 を明示。',
      },
      today_suggestion: {
        type: 'string',
        description: '本日の栄養介入で最も重要な1アクション（具体的に）。',
      },
    },
    required: ['narrative', 'trend_summary', 'today_suggestion'],
  },
}

// ── System prompt ──

const LAB_NARRATIVE_SYSTEM = `あなたは臨床栄養管理チームの一員です。
検査値データから臨床的に重要なナラティブを作成し、本日の回診で提案すべき栄養介入を1つ提案してください。

## ルール
- 回答は日本語
- narrative: 異常値の臨床的意味を簡潔に（「Alb 2.1g/dL→低栄養状態」のように数値を含める）
- trend_summary: 「改善傾向」「横ばい」「悪化傾向」のように端的に
- today_suggestion: 具体的なアクション1つ（「高カロリー輸液の増量を検討」「リン補充を開始」等）
- lab_narrativeツールで必ず回答すること`

// ── Helper ──

function buildLabContext(labData: LabData): string {
  const interpretations = analyzeLabData(labData)
  const abnormal = getAbnormalFindings(interpretations)

  const lines = [`検査日: ${labData.date}`]

  if (abnormal.length > 0) {
    lines.push('異常所見:')
    for (const item of abnormal) {
      lines.push(`  ${item.label}: ${item.value} ${item.unit} (${item.status}) - ${item.message}`)
    }
  }

  // Add all available values
  const entries: Array<[string, number | undefined]> = [
    ['Alb', labData.albumin],
    ['PreAlb', labData.prealbumin],
    ['BUN', labData.bun],
    ['Cr', labData.creatinine],
    ['BS', labData.bloodSugar],
    ['Na', labData.sodium],
    ['K', labData.potassium],
    ['P', labData.phosphorus],
    ['Mg', labData.magnesium],
    ['Ca', labData.calcium],
    ['CRP', labData.crp],
    ['Hb', labData.hemoglobin],
    ['TG', labData.triglycerides],
  ]

  const allValues = entries
    .filter((e): e is [string, number] => e[1] !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')

  if (allValues) {
    lines.push(`全検査値: ${allValues}`)
  }

  return lines.join('\n')
}

// ── Main export ──

export async function generateLabNarrative(
  client: Anthropic,
  labData: LabData,
): Promise<LabNarrative> {
  const labContext = buildLabContext(labData)

  const result = await callWithTools<LabNarrative>(client, {
    systemPrompt: LAB_NARRATIVE_SYSTEM,
    userMessage: labContext,
    tools: [LAB_NARRATIVE_TOOL],
    model: 'haiku',
    toolChoice: { type: 'tool', name: 'lab_narrative' },
  })

  return {
    narrative: result.input.narrative ?? '',
    trend_summary: result.input.trend_summary ?? '',
    today_suggestion: result.input.today_suggestion ?? '',
  }
}
