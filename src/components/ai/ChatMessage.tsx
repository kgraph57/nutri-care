import { type ReactNode, useMemo } from "react";
import styles from "./ChatMessage.module.css";
import type { ChatMessage as ChatMessageType } from "../../services/aiChatService";

interface ChatMessageProps {
  readonly message: ChatMessageType;
  readonly isStreaming?: boolean;
}

/**
 * Parse simple markdown-like formatting:
 *   **bold** -> <strong>
 *   `code`  -> <code>
 *   \n      -> <br />
 */
function renderContent(raw: string): readonly (string | ReactNode)[] {
  const lines = raw.split("\n");
  const result: (string | ReactNode)[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    if (lineIndex > 0) {
      result.push(<br key={`br-${lineIndex}`} />);
    }
    const parts = parseInlineFormatting(lines[lineIndex], lineIndex);
    result.push(...parts);
  }

  return result;
}

function parseInlineFormatting(
  text: string,
  lineIndex: number,
): readonly (string | ReactNode)[] {
  const tokens: (string | ReactNode)[] = [];
  // Match **bold** or `code` patterns
  const pattern = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      tokens.push(
        <strong key={`b-${lineIndex}-${match.index}`}>{match[2]}</strong>,
      );
    } else if (match[3]) {
      // `code`
      tokens.push(
        <code
          key={`c-${lineIndex}-${match.index}`}
          className={styles.inlineCode}
        >
          {match[3]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const formattedTime = useMemo(
    () => formatTimestamp(message.timestamp),
    [message.timestamp],
  );
  const renderedContent = useMemo(
    () => renderContent(message.content),
    [message.content],
  );

  const bubbleClass = [
    styles.bubble,
    isUser ? styles.user : styles.assistant,
  ].join(" ");

  const wrapperClass = [
    styles.wrapper,
    isUser ? styles.wrapperUser : styles.wrapperAssistant,
  ].join(" ");

  return (
    <div className={wrapperClass}>
      <div className={bubbleClass}>
        <div className={styles.content}>
          {renderedContent}
          {isStreaming && <span className={styles.cursor} />}
        </div>
      </div>
      <span className={styles.timestamp}>{formattedTime}</span>
    </div>
  );
}
