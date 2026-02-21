import { useMemo } from 'react'
import { Check } from 'lucide-react'
import type {
  WeaningPhaseConfig,
  WeaningPhase,
  WeaningProgress,
} from '../../types/weaningPlan'
import styles from './WeaningPhaseTimeline.module.css'

/* ---- Props ---- */

interface WeaningPhaseTimelineProps {
  readonly phases: readonly WeaningPhaseConfig[]
  readonly currentPhase: WeaningPhase
  readonly progress: WeaningProgress
}

/* ---- Status ---- */

type PhaseStatus = 'completed' | 'current' | 'future'

function resolvePhaseStatus(
  phase: WeaningPhase,
  currentPhase: WeaningPhase,
  phases: readonly WeaningPhaseConfig[],
): PhaseStatus {
  if (currentPhase === 'completed') return 'completed'
  const phaseIndex = phases.findIndex((p) => p.phase === phase)
  const currentIndex = phases.findIndex((p) => p.phase === currentPhase)
  if (phaseIndex < 0 || currentIndex < 0) return 'future'
  if (phaseIndex < currentIndex) return 'completed'
  if (phaseIndex === currentIndex) return 'current'
  return 'future'
}

/* ---- Short labels for compact display ---- */

const SHORT_PHASE_LABELS: Record<WeaningPhase, string> = {
  assessment: '評価',
  trophic: '微量経腸',
  advancing: '増量',
  'full-enteral': '全量経腸',
  'oral-introduction': '経口導入',
  'oral-transition': '経口移行',
  'full-oral': '完全経口',
  completed: '完了',
}

/* ---- Step node ---- */

function StepNode({
  config,
  status,
  prevStatus,
  isFirst,
  isLast,
}: {
  readonly config: WeaningPhaseConfig
  readonly status: PhaseStatus
  readonly prevStatus: PhaseStatus | null
  readonly isFirst: boolean
  readonly isLast: boolean
}) {
  const leftStatus = isFirst ? null : prevStatus
  const rightStatus = isLast ? null : status

  return (
    <div className={styles.step} aria-current={status === 'current' ? 'step' : undefined}>
      {/* Connector row: [left line] [dot] [right line] */}
      <div className={styles.connectorRow}>
        <div
          className={`${styles.halfLine} ${
            leftStatus === null
              ? styles.lineInvisible
              : leftStatus === 'completed'
                ? styles.lineCompleted
                : leftStatus === 'current'
                  ? styles.lineCurrent
                  : styles.lineFuture
          }`}
        />
        <div
          className={`${styles.dot} ${
            status === 'completed'
              ? styles.dotCompleted
              : status === 'current'
                ? styles.dotCurrent
                : styles.dotFuture
          }`}
        >
          {status === 'completed' && <Check size={8} className={styles.checkIcon} />}
          {status === 'current' && <div className={styles.currentInner} />}
        </div>
        <div
          className={`${styles.halfLine} ${
            rightStatus === null
              ? styles.lineInvisible
              : rightStatus === 'completed'
                ? styles.lineCompleted
                : rightStatus === 'current'
                  ? styles.lineCurrent
                  : styles.lineFuture
          }`}
        />
      </div>

      {/* Label */}
      <div
        className={`${styles.stepLabel} ${
          status === 'completed'
            ? styles.labelCompleted
            : status === 'current'
              ? styles.labelCurrent
              : styles.labelFuture
        }`}
      >
        {SHORT_PHASE_LABELS[config.phase]}
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
  void progress

  const nodes = useMemo(
    () =>
      phases.map((cfg) => ({
        config: cfg,
        status: resolvePhaseStatus(cfg.phase, currentPhase, phases),
      })),
    [phases, currentPhase],
  )

  return (
    <div className={styles.stepper}>
      {nodes.map((node, idx) => (
        <StepNode
          key={node.config.phase}
          config={node.config}
          status={node.status}
          prevStatus={idx > 0 ? nodes[idx - 1].status : null}
          isFirst={idx === 0}
          isLast={idx === nodes.length - 1}
        />
      ))}
    </div>
  )
}
