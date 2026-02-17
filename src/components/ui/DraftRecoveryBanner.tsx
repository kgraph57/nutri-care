import { RotateCcw, X } from "lucide-react";
import { Button } from "./Button";
import styles from "./DraftRecoveryBanner.module.css";

interface DraftRecoveryBannerProps {
  readonly savedAt: string;
  readonly onRestore: () => void;
  readonly onDiscard: () => void;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DraftRecoveryBanner({
  savedAt,
  onRestore,
  onDiscard,
}: DraftRecoveryBannerProps) {
  return (
    <div className={styles.banner}>
      <div className={styles.message}>
        <RotateCcw size={16} />
        <span>
          下書きが見つかりました ({formatTime(savedAt)})
        </span>
      </div>
      <div className={styles.actions}>
        <Button variant="primary" size="sm" onClick={onRestore}>
          復元
        </Button>
        <button className={styles.discard} onClick={onDiscard}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
