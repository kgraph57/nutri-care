import { Badge } from '../ui'

interface PercentileBadgeProps {
  readonly value: number
  readonly label?: string
}

function getPercentileVariant(
  value: number,
): 'success' | 'warning' | 'danger' {
  if (value >= 25 && value <= 75) return 'success'
  if ((value >= 10 && value < 25) || (value > 75 && value <= 90))
    return 'warning'
  return 'danger'
}

function formatPercentileText(value: number, label?: string): string {
  const text = `${Math.round(value)}%ile`
  return label ? `${label} ${text}` : text
}

export function PercentileBadge({ value, label }: PercentileBadgeProps) {
  return (
    <Badge variant={getPercentileVariant(value)}>
      {formatPercentileText(value, label)}
    </Badge>
  )
}
