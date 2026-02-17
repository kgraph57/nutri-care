import { useMemo } from 'react'
import { ArrowRightLeft, Plus, ChevronRight, Target } from 'lucide-react'
import { Card, Button, Badge, EmptyState } from '../../components/ui'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { WeaningPhaseTimeline } from '../../components/weaning/WeaningPhaseTimeline'
import { WeaningProgressCard } from '../../components/weaning/WeaningProgressCard'
import type { Patient } from '../../types'
import type { WeaningPlan } from '../../types/weaningPlan'
import { WEANING_PHASE_LABELS } from '../../types/weaningPlan'
import { calculateWeaningProgress } from '../../services/weaningPlanner'
import styles from './WeaningPanel.module.css'

/* ---- Props ---- */

interface WeaningPanelProps {
  readonly patientId: string
  readonly patient: Patient
  readonly plan?: WeaningPlan
  readonly onCreatePlan: () => void
  readonly onAdvancePhase: () => void
}

/* ---- Helpers ---- */

function getBadgeVariant(onTrack: boolean): 'success' | 'warning' {
  return onTrack ? 'success' : 'warning'
}

function getTrackLabel(onTrack: boolean): string {
  return onTrack ? '順調' : '遅延あり'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

function findCurrentPhaseConfig(plan: WeaningPlan) {
  return plan.phases.find((p) => p.phase === plan.currentPhase)
}

function formatNutritionSplit(
  enteral: number,
  oral: number,
  parenteral: number,
): string {
  const parts: string[] = []
  if (enteral > 0) parts.push(`経腸 ${enteral}%`)
  if (oral > 0) parts.push(`経口 ${oral}%`)
  if (parenteral > 0) parts.push(`静脈 ${parenteral}%`)
  return parts.join(' / ')
}

/* ---- Empty state ---- */

function WeaningEmptyState({
  onCreatePlan,
}: {
  readonly onCreatePlan: () => void
}) {
  return (
    <div className={styles.emptyWrapper}>
      <EmptyState
        icon={<ArrowRightLeft size={32} />}
        title="離脱計画がありません"
        description="栄養経路の離脱・移行計画を作成して、段階的な移行をサポートします"
        action={
          <Button
            size="sm"
            icon={<Plus size={16} />}
            onClick={onCreatePlan}
          >
            計画作成
          </Button>
        }
      />
    </div>
  )
}

/* ---- Main component ---- */

export function WeaningPanel({
  patientId,
  patient,
  plan,
  onCreatePlan,
  onAdvancePhase,
}: WeaningPanelProps) {
  const progress = useMemo(
    () => (plan ? calculateWeaningProgress(plan) : null),
    [plan],
  )

  const currentPhaseConfig = useMemo(
    () => (plan ? findCurrentPhaseConfig(plan) : null),
    [plan],
  )

  const currentPhaseLabel = plan
    ? WEANING_PHASE_LABELS[plan.currentPhase]
    : ''

  // Suppress unused-var warnings for required props
  void patientId
  void patient

  /* No plan: empty state */
  if (!plan || !progress) {
    return (
      <Card>
        <div className={styles.container}>
          <div className={styles.header}>
            <ArrowRightLeft size={20} className={styles.headerIcon} />
            <h3 className={styles.title}>離脱・移行計画</h3>
          </div>
          <WeaningEmptyState onCreatePlan={onCreatePlan} />
        </div>
      </Card>
    )
  }

  const isCompleted = plan.currentPhase === 'completed'
  const totalDays = progress.daysElapsed + progress.daysRemaining

  return (
    <Card>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <ArrowRightLeft size={20} className={styles.headerIcon} />
          <h3 className={styles.title}>離脱・移行計画</h3>
          <div className={styles.headerAction}>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCreatePlan}
            >
              編集
            </Button>
          </div>
        </div>

        {/* Overall progress */}
        <div className={styles.progressSection}>
          <div className={styles.progressBarWrapper}>
            <ProgressBar
              current={progress.completedPhases}
              max={progress.totalPhases}
              label="全体進捗"
              unit="フェーズ"
              showPercentage
            />
          </div>
          <div className={styles.progressCardWrapper}>
            <WeaningProgressCard
              progress={progress}
              currentPhaseLabel={currentPhaseLabel}
            />
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Current phase */}
        <div className={styles.currentPhaseSection}>
          <div className={styles.currentPhaseHeader}>
            <span className={styles.currentPhaseLabel}>現在のフェーズ</span>
            <Badge variant={getBadgeVariant(progress.onTrack)}>
              {getTrackLabel(progress.onTrack)}
            </Badge>
            {isCompleted && <Badge variant="success">完了</Badge>}
          </div>

          {currentPhaseConfig && (
            <div className={styles.phaseDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>フェーズ名</span>
                <span className={styles.detailValue}>
                  {currentPhaseLabel}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>栄養配分</span>
                <span className={styles.detailValue}>
                  {formatNutritionSplit(
                    currentPhaseConfig.enteralPercent,
                    currentPhaseConfig.oralPercent,
                    currentPhaseConfig.parenteralPercent,
                  )}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>目標期間</span>
                <span className={styles.detailValue}>
                  {currentPhaseConfig.durationDays}日間
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>進行基準</span>
                <span className={styles.detailValue}>
                  {currentPhaseConfig.advanceCriteria.join('、')}
                </span>
              </div>
            </div>
          )}
        </div>

        <hr className={styles.divider} />

        {/* Days in current phase */}
        <div className={styles.daysSection}>
          <span className={styles.daysLabel}>経過日数</span>
          <span className={styles.daysValue}>
            {progress.daysElapsed}日 / 全{totalDays}日
          </span>
        </div>

        <hr className={styles.divider} />

        {/* Next milestone */}
        {progress.nextMilestone && (
          <>
            <div className={styles.milestoneSection}>
              <span className={styles.milestoneSectionLabel}>
                <Target size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                次のマイルストーン
              </span>
              <div className={styles.milestoneCard}>
                <p className={styles.milestoneDescription}>
                  {progress.nextMilestone.description}
                </p>
                <span className={styles.milestoneDate}>
                  目標日: {formatDate(progress.nextMilestone.targetDate)}
                </span>
                {progress.nextMilestone.criteria.length > 0 && (
                  <div className={styles.milestoneCriteria}>
                    {progress.nextMilestone.criteria.map((c) => (
                      <span key={c} className={styles.milestoneCriteriaTag}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <hr className={styles.divider} />
          </>
        )}

        {/* Phase timeline */}
        <div className={styles.timelineSection}>
          <span className={styles.timelineSectionLabel}>フェーズタイムライン</span>
          <WeaningPhaseTimeline
            phases={plan.phases}
            currentPhase={plan.currentPhase}
            progress={progress}
          />
        </div>

        {/* Advance phase button */}
        {!isCompleted && (
          <>
            <hr className={styles.divider} />
            <div className={styles.advanceRow}>
              <Button
                size="sm"
                variant="secondary"
                icon={<ChevronRight size={16} />}
                onClick={onAdvancePhase}
              >
                次フェーズへ進行
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
