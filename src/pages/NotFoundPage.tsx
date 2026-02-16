import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>ページが見つかりません</h1>
        <p className={styles.description}>
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.link}>
            <Button variant="primary" icon={<Home size={16} />}>
              ダッシュボードへ
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className={styles.link}
          >
            <Button variant="secondary" icon={<ArrowLeft size={16} />}>
              前のページへ
            </Button>
          </button>
        </div>
      </div>
    </div>
  );
}
