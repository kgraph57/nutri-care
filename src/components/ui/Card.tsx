import { type ReactNode, type HTMLAttributes } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode
  readonly className?: string
  readonly onClick?: () => void
}

export function Card({ children, className, onClick, ...rest }: CardProps) {
  const classNames = [
    styles.card,
    onClick ? styles.clickable : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} onClick={onClick} {...rest}>
      {children}
    </div>
  )
}
