import { useState, useCallback, useMemo } from 'react'
import { Sparkles, Check, RefreshCw } from 'lucide-react'
import type { Patient, NutritionType } from '../../types'
import type { LabData } from '../../types/labData'
import { createAnthropicClient, isApiKeyConfigured } from '../../lib/anthropic'
import {
  generateAiPlan,
  type AiGeneratedPlan,
} from '../../services/aiPlanGenerator'
import styles from './AiGenerateButton.module.css'

type Product = Record<string, string | number>

interface AiGenerateButtonProps {
  readonly patient: Patient
  readonly products: readonly Product[]
  readonly nutritionType: NutritionType
  readonly labData?: LabData
  readonly onApply: (
    items: Array<{
      product: Product
      volume: number
      frequency: number
    }>,
    rationale: string,
  ) => void
}

export function AiGenerateButton({
  patient,
  products,
  nutritionType,
  labData,
  onApply,
}: AiGenerateButtonProps) {
  const [plan, setPlan] = useState<AiGeneratedPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const client = useMemo(() => createAnthropicClient(), [])

  const handleGenerate = useCallback(async () => {
    if (!client) return

    setIsLoading(true)
    setError(null)
    setPlan(null)

    try {
      const result = await generateAiPlan(
        client,
        patient,
        products,
        nutritionType,
        labData,
      )
      setPlan(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'プラン生成に失敗しました'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [client, patient, products, nutritionType, labData])

  const handleApply = useCallback(() => {
    if (!plan) return
    const items = plan.items.map((item) => ({
      product: item.product,
      volume: item.volume,
      frequency: item.frequency,
    }))
    onApply(items, plan.overall_rationale)
    setPlan(null)
  }, [plan, onApply])

  if (!isApiKeyConfigured()) {
    return null
  }

  return (
    <div className={styles.container}>
      {!plan && !isLoading && (
        <button
          type="button"
          className={styles.generateButton}
          onClick={handleGenerate}
          disabled={isLoading || products.length === 0}
        >
          <Sparkles size={16} />
          AIで栄養プランを自動生成
        </button>
      )}

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          AIが最適なプランを検討中...
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {plan && !isLoading && (
        <div className={styles.result}>
          <div className={styles.rationale}>{plan.overall_rationale}</div>

          <div className={styles.itemList}>
            {plan.items.map((item) => {
              const name = String(item.product['製剤名'] ?? '')
              return (
                <div key={name} className={styles.item}>
                  <div>
                    <div className={styles.itemName}>{name}</div>
                    <div className={styles.itemDetail}>{item.rationale}</div>
                  </div>
                  <div className={styles.itemVolume}>
                    {item.volume}ml x {item.frequency}回/日
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.applyButton}
              onClick={handleApply}
            >
              <Check size={14} />
              このプランを適用
            </button>
            <button
              type="button"
              className={styles.retryButton}
              onClick={handleGenerate}
            >
              <RefreshCw size={14} />
              再生成
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
