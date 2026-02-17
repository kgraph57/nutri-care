import styles from './AdequacyScoreBadge.module.css';

interface AdequacyScoreBadgeProps {
  readonly score: number;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-warning)';
  if (score >= 40) return 'var(--color-warning-dark)';
  return 'var(--color-danger)';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return '良好';
  if (score >= 70) return '概ね良好';
  if (score >= 40) return '不十分';
  return '要改善';
}

export function AdequacyScoreBadge({
  score,
  size = 'md',
  showLabel = true,
}: AdequacyScoreBadgeProps) {
  const color = getScoreColor(score);
  const clampedScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (clampedScore / 100) * circumference;

  const sizeMap = { sm: 48, md: 72, lg: 96 } as const;
  const svgSize = sizeMap[size];
  const fontClass = size === 'sm' ? styles.scoreSm : size === 'lg' ? styles.scoreLg : styles.scoreMd;

  return (
    <div className={styles.wrapper}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 80 80"
        className={styles.ring}
      >
        <circle
          cx="40"
          cy="40"
          r="38"
          fill="none"
          stroke="var(--color-neutral-200)"
          strokeWidth="4"
        />
        <circle
          cx="40"
          cy="40"
          r="38"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          className={styles.progress}
        />
        <text
          x="40"
          y="40"
          textAnchor="middle"
          dominantBaseline="central"
          className={fontClass}
          fill="var(--color-neutral-800)"
        >
          {clampedScore}
        </text>
      </svg>
      {showLabel && (
        <span className={styles.label} style={{ color }}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
