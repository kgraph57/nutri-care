import { useMemo } from 'react'
import { Check } from 'lucide-react'
import type {
  WeaningPhaseConfig,
  WeaningPhase,
  WeaningProgress,
} from '../../types/weaningPlan'
import { WEANING_PHASE_LABELS } from '../../types/weaningPlan'
import styles from './WeaningPhaseTimeline.module.css'

/* ---- Props ---- */

interface WeaningPhaseTimelineProps {
  readonly phases: readonly WeaningPhaseConfig[]
  readonly currentPhase: WeaningPhase
  readonly progress: WeaningProgress
}

/* ---- Helpers ---- */

type PhaseStatus = 'completed' | 'current' | 'future'

function resolvePhaseStatus(
  phase: WeaningPhase,
  currentPhase: WeaningPhase,
  phases: readonly WeaningPhaseConfig[],
): PhaseStatus {
  const phaseIndex = phases.findIndex((p) => p.phase === phase)
  const currentIndex = phases.findIndex((p) => p.phase === currentPhase)
  if (phaseIndex < 0 || currentIndex < 0) return 'future'
  if (phaseIndex < currentIndex) return 'completed'
  if (phaseIndex === currentIndex) return 'current'
  return 'future'
}

function getDotClass(status: PhaseStatus): string {
  switch (status) {
    case 'completed':
      return styles.dotCompleted
    case 'current':
      return styles.dotCurrent
    case 'future':
      return styles.dotFuture
  }
}

function getLineClass(status: PhaseStatus): string {
  switch (status) {
    case 'completed':
      return styles.lineCompleted
    case 'current':
      return styles.lineCurrent
    case 'future':
      return styles.lineFuture
  }
}

function getNameClass(status: PhaseStatus): string {
  switch (status) {
    case 'current':
      return styles.phaseNameCurrent
    case 'future':
      return styles.phaseNameFuture
    default:
      return ''
  }
}

function formatPercent(enteral: number, oral: number, parenteral: number): string {
  const parts: string[] = []
  if (enteral > 0) parts.push(`経腸${enteral}%`)
  if (oral > 0) parts.push(`経口${oral}%`)
  if (parenteral > 0) parts.push(`静脈${parenteral}%`)
  return parts.join(' / ')
}

/* ---- Sub-component: TimelineNode ---- */

function TimelineNode({
  config,
  status,
  isLast,
}: {
  readonly config: WeaningPhaseConfig
  readonly status: PhaseStatus
  readonly isLast: boolean
}) {
  const dotClass = getDotClass(status)
  const lineClass = getLineClass(status)
  const nameClass = getNameClass(status)
  const showDetails = status === 'completed' || status === 'current'

  return (
    <div className={styles.node}>
      {/* Vertical line + dot */}
      <div className={styles.lineColumn}>
        <div className={`${styles.dot} ${dotClass}`}>
          {status === 'completed' && (
            <Check size={10} className={styles.checkIcon} />
          )}
        </div>
        <div
          className={`${styles.line} ${isLast ? styles.lineHidden : lineClass}`}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.phaseHeader}>
          <span className={`${styles.phaseName} ${nameClass}`}>
            {WEANING_PHASE_LABELS[config.phase]}
          </span>
        </div>

        {showDetails && (
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>配分:</span>
              <span className={styles.detailValue}>
                {formatPercent(
                  config.enteralPercent,
                  config.oralPercent,
                  config.parenteralPercent,
                )}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>期間:</span>
              <span className={styles.detailValue}>
                {config.durationDays}日間
              </span>
            </div>

            {status === 'current' && config.advanceCriteria.length > 0 && (
              <div className={styles.criteriaList}>
                {config.advanceCriteria.map((criterion) => (
                  <span
                    key={criterion}
                    className={`${styles.criteriaTag} ${styles.criteriaTagCurrent}`}
                  >
                    {criterion}
                  </span>
                ))}
              </div>
            )}

            {status === 'completed' && config.advanceCriteria.length > 0 && (
              <div className={styles.criteriaList}>
                {config.advanceCriteria.map((criterion) => (
                  <span key={criterion} className={styles.criteriaTag}>
                    {criterion}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---- Main component ---- */

export function WeaningPhaseTimeline({
  phases,
  currentPhase,
  progress,
}: WeaningPhaseTimelineProps) {
  const statusMap = useMemo(
    () =>
      phases.map((cfg) => ({
        config: cfg,
        status: resolvePhaseStatus(cfg.phase, currentPhase, phases),
      })),
    [phases, currentPhase],
  )

  // If plan is completed, mark all as completed
  const resolvedNodes = useMemo(() => {
    if (currentPhase === 'completed') {
      return statusMap.map((node) => ({
        ...node,
        status: 'completed' as PhaseStatus,
      }))
    }
    return statusMap
  }, [statusMap, currentPhase])

  void progress // progress available for future enhancements

  return (
    <div className={styles.container}>
      {resolvedNodes.map((node, idx) => (
        <TimelineNode
          key={node.config.phase}
          config={node.config}
          status={node.status}
          isLast={idx === resolvedNodes.length - 1}
        />
      ))}
    </div>
  )
}
