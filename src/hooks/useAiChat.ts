import { useState, useCallback, useEffect, useRef } from 'react'
import type { ChatMessage } from '../services/aiChatService'

// ── Constants ──

const STORAGE_KEY_PREFIX = 'nutri-care-chat-'
const MAX_MESSAGES = 50

// ── Return type ──

export interface UseAiChatReturn {
  readonly messages: readonly ChatMessage[]
  readonly addMessage: (role: 'user' | 'assistant', content: string) => void
  readonly updateLastAssistantMessage: (content: string) => void
  readonly clearMessages: () => void
}

// ── Storage helpers ──

function storageKey(contextId: string): string {
  return `${STORAGE_KEY_PREFIX}${contextId}`
}

function loadMessages(contextId: string): readonly ChatMessage[] {
  try {
    const raw = localStorage.getItem(storageKey(contextId))
    if (raw) {
      const parsed: readonly ChatMessage[] = JSON.parse(raw)
      return parsed.slice(-MAX_MESSAGES)
    }
  } catch (error) {
    console.error('Failed to load chat messages from localStorage:', error)
  }
  return []
}

function persistMessages(
  contextId: string,
  messages: readonly ChatMessage[],
): void {
  try {
    const trimmed = messages.slice(-MAX_MESSAGES)
    localStorage.setItem(storageKey(contextId), JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to persist chat messages to localStorage:', error)
  }
}

// ── Hook ──

export function useAiChat(contextId: string): UseAiChatReturn {
  const [messages, setMessages] = useState<readonly ChatMessage[]>(() =>
    loadMessages(contextId),
  )

  const contextIdRef = useRef(contextId)

  // Reload messages when contextId changes
  useEffect(() => {
    if (contextIdRef.current !== contextId) {
      contextIdRef.current = contextId
      setMessages(loadMessages(contextId))
    }
  }, [contextId])

  // Persist whenever messages change
  useEffect(() => {
    persistMessages(contextIdRef.current, messages)
  }, [messages])

  const addMessage = useCallback(
    (role: 'user' | 'assistant', content: string) => {
      const newMessage: ChatMessage = {
        role,
        content,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, newMessage].slice(-MAX_MESSAGES))
    },
    [],
  )

  const updateLastAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const lastAssistantIndex = findLastAssistantIndex(prev)
      if (lastAssistantIndex === -1) {
        return prev
      }
      return [
        ...prev.slice(0, lastAssistantIndex),
        {
          ...prev[lastAssistantIndex],
          content,
        },
        ...prev.slice(lastAssistantIndex + 1),
      ]
    })
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    try {
      localStorage.removeItem(storageKey(contextIdRef.current))
    } catch (error) {
      console.error('Failed to remove chat messages from localStorage:', error)
    }
  }, [])

  return { messages, addMessage, updateLastAssistantMessage, clearMessages }
}

// ── Helpers ──

function findLastAssistantIndex(
  messages: readonly ChatMessage[],
): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      return i
    }
  }
  return -1
}
