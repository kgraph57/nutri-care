import { Search } from 'lucide-react'
import styles from './SearchInput.module.css'

interface SearchInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = '検索...',
  className,
}: SearchInputProps) {
  const containerClassNames = [styles.container, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassNames}>
      <span className={styles.iconWrapper}>
        <Search size={18} />
      </span>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  )
}
