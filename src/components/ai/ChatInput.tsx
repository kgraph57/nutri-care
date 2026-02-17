import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react'
import { SendHorizontal } from 'lucide-react'
import styles from './ChatInput.module.css'

interface ChatInputProps {
  readonly onSend: (message: string) => void
  readonly disabled?: boolean
  readonly placeholder?: string
}

const MAX_ROWS = 4
const LINE_HEIGHT_PX = 20

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'メッセージを入力...',
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const trimmedValue = value.trim()
  const canSend = trimmedValue.length > 0 && !disabled

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset to single line to get scrollHeight
    textarea.style.height = 'auto'
    const maxHeight = LINE_HEIGHT_PX * MAX_ROWS + 16 // 16px for padding
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${newHeight}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  const handleSend = useCallback(() => {
    if (!canSend) return
    onSend(trimmedValue)
    setValue('')
  }, [canSend, onSend, trimmedValue])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
  }, [])

  return (
    <div className={styles.container}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="チャットメッセージ"
      />
      <button
        className={styles.sendButton}
        onClick={handleSend}
        disabled={!canSend}
        type="button"
        aria-label="送信"
      >
        <SendHorizontal size={18} />
      </button>
    </div>
  )
}
