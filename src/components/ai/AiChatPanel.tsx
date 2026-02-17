import { useState, useCallback, useRef, useEffect } from 'react'
import { Bot, ChevronDown, AlertCircle, Trash2 } from 'lucide-react'
import { createAnthropicClient, isApiKeyConfigured } from '../../lib/anthropic'
import {
  streamChatResponse,
  CLINICAL_QUICK_ACTIONS,
  EDUCATION_QUICK_ACTIONS,
} from '../../services/aiChatService'
import type { ChatMessage as ChatMessageType, QuickAction } from '../../services/aiChatService'
import { useAiChat } from '../../hooks/useAiChat'
import { useSettings } from '../../hooks/useSettings'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { QuickActions } from './QuickActions'
import styles from './AiChatPanel.module.css'

interface AiChatPanelProps {
  readonly mode: 'clinical' | 'education'
  readonly systemPrompt: string
  readonly contextId: string
}

const TITLE_MAP: Readonly<Record<string, string>> = {
  clinical: 'AI アシスタント',
  education: 'AI チューター',
}

export function AiChatPanel({ mode, systemPrompt, contextId }: AiChatPanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const { settings } = useSettings()
  const { messages, addMessage, updateLastAssistantMessage, clearMessages } =
    useAiChat(contextId)

  const quickActions =
    mode === 'clinical' ? CLINICAL_QUICK_ACTIONS : EDUCATION_QUICK_ACTIONS

  const apiKeyReady = isApiKeyConfigured()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cancel streaming on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const handleSend = useCallback(
    async (content: string) => {
      const client = createAnthropicClient()
      if (!client) return

      addMessage('user', content)

      // Create a placeholder assistant message
      addMessage('assistant', '')
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      // Build message list including the new user message
      const allMessages: readonly ChatMessageType[] = [
        ...messages,
        { role: 'user' as const, content, timestamp: new Date().toISOString() },
      ]

      let accumulated = ''

      try {
        await streamChatResponse(client, {
          systemPrompt,
          messages: allMessages,
          model: settings.aiModel,
          onChunk: (chunk) => {
            accumulated = accumulated + chunk
            updateLastAssistantMessage(accumulated)
          },
          signal: controller.signal,
        })
      } catch (error) {
        if (controller.signal.aborted) return

        const errorMessage =
          error instanceof Error ? error.message : '不明なエラーが発生しました'
        updateLastAssistantMessage(
          `エラーが発生しました: ${errorMessage}`,
        )
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [messages, systemPrompt, settings.aiModel, addMessage, updateLastAssistantMessage],
  )

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      handleSend(action.prompt)
    },
    [handleSend],
  )

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      clearMessages()
    },
    [clearMessages],
  )

  const title = TITLE_MAP[mode] ?? 'AI アシスタント'

  return (
    <div className={styles.panel}>
      {/* ── Header ── */}
      <div className={styles.header} onClick={handleToggle}>
        <div className={styles.headerLeft}>
          <Bot size={16} className={styles.botIcon} />
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.headerRight}>
          {messages.length > 0 && (
            <button
              className={styles.clearButton}
              onClick={handleClear}
              type="button"
              aria-label="チャット履歴を削除"
              title="チャット履歴を削除"
            >
              <Trash2 size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
        </div>
      </div>

      {/* ── Body ── */}
      {isOpen && (
        <div className={styles.body}>
          {!apiKeyReady ? (
            <ApiKeyNotice />
          ) : (
            <>
              {/* Messages area */}
              <div className={styles.messagesArea}>
                {messages.length === 0 && (
                  <p className={styles.emptyHint}>
                    質問やリクエストを入力してください
                  </p>
                )}
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={`${msg.timestamp}-${index}`}
                    message={msg}
                    isStreaming={
                      isStreaming &&
                      index === messages.length - 1 &&
                      msg.role === 'assistant'
                    }
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions */}
              <QuickActions
                actions={quickActions}
                onSelect={handleQuickAction}
                disabled={isStreaming}
              />

              {/* Input */}
              <ChatInput
                onSend={handleSend}
                disabled={isStreaming}
                placeholder={
                  isStreaming
                    ? '応答を生成中...'
                    : 'メッセージを入力...'
                }
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── API key not configured notice ──

function ApiKeyNotice() {
  return (
    <div className={styles.notice}>
      <AlertCircle size={20} className={styles.noticeIcon} />
      <p className={styles.noticeText}>
        AI機能を使用するにはAPIキーが必要です。
        <br />
        <span className={styles.noticeLink}>
          設定ページでAPIキーを設定してください
        </span>
      </p>
    </div>
  )
}
