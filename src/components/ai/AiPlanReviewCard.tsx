import { useState, useCallback } from 'react'
import { ClipboardCheck, RefreshCw, Check, AlertTriangle, Info } from 'lucide-react'
import type Anthropic from '@anthropic-ai/sdk'
import type { NutritionContext } from '../../services/aiContextBuilder'
import { reviewPlan, type PlanReview, type ReviewSeverity } from '../../services/aiPlanReviewer'
import styles from './AiPlanReviewCard.module.css'

interface AiPlanReviewCardProps {
  readonly client: Anthropic | null
  readonly context: NutritionContext | null
}

function severityIcon(severity: ReviewSeverity) {
  switch (severity) {
    case 'critical':
      return <AlertTriangle size={12} />
    case 'warning':
      return <AlertTriangle size={12} />
    case 'info':
      return <Info size={12} />
  }
}

function severityClass(severity: ReviewSeverity): string {
  switch (severity) {
    case 'critical':
      return styles.issueCritical
    case 'warning':
      return styles.issueWarning
    case 'info':
      return styles.issueInfo
  }
}

function scoreClass(score: number): string {
  if (score >= 90) return styles.scoreExcellent
  if (score >= 80) return styles.scoreGood
  if (score >= 60) return styles.scoreWarning
  return styles.scorePoor
}

function scoreBarColor(score: number): string {
  if (score >= 90) return 'var(--color-success)'
  if (score >= 80) return '#22c55e'
  if (score >= 60) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

export function AiPlanReviewCard({ client, context }: AiPlanReviewCardProps) {
  const [review, setReview] = useState<PlanReview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReview = useCallback(async () => {
    if (!client || !context) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await reviewPlan(client, context)
      setReview(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'レビューに失敗しました'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [client, context])

  if (!client || !context) return null

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          <ClipboardCheck size={14} />
          AIプランレビュー
        </h4>
        <button
          type="button"
          className={styles.reviewButton}
          onClick={handleReview}
          disabled={isLoading}
        >
          <RefreshCw size={12} />
          {review ? '再レビュー' : 'レビュー開始'}
        </button>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          AIがプランを分析中...
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {review && !isLoading && (
        <>
          {/* Score */}
          <div className={styles.scoreSection}>
            <span className={`${styles.scoreValue} ${scoreClass(review.score)}`}>
              {review.score}
            </span>
            <div className={styles.scoreBar}>
              <div
                className={styles.scoreBarFill}
                style={{
                  width: `${review.score}%`,
                  backgroundColor: scoreBarColor(review.score),
                }}
              />
            </div>
          </div>

          {/* Summary */}
          <p className={styles.summary}>{review.summary}</p>

          {/* Issues */}
          {review.issues.length > 0 && (
            <div className={styles.issueList}>
              {review.issues.map((issue, i) => (
                <div
                  key={`${issue.area}-${i}`}
                  className={`${styles.issue} ${severityClass(issue.severity)}`}
                >
                  {severityIcon(issue.severity)}
                  <div className={styles.issueContent}>
                    <div className={styles.issueMessage}>{issue.message}</div>
                    <div className={styles.issueSuggestion}>{issue.suggestion}</div>
                  </div>
                  <span className={styles.issueArea}>{issue.area}</span>
                </div>
              ))}
            </div>
          )}

          {/* Strengths */}
          {review.strengths.length > 0 && (
            <div className={styles.strengthList}>
              {review.strengths.map((s, i) => (
                <div key={i} className={styles.strength}>
                  <Check size={12} />
                  {s}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
