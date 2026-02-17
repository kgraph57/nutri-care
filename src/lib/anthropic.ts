import Anthropic from '@anthropic-ai/sdk'

const API_KEY_STORAGE_KEY = 'nutri-care-anthropic-api-key'

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key)
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY)
    }
  } catch {
    // Storage write failed
  }
}

export function isApiKeyConfigured(): boolean {
  return getStoredApiKey().length > 0
}

export function createAnthropicClient(): Anthropic | null {
  const apiKey = getStoredApiKey()
  if (!apiKey) return null

  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}
