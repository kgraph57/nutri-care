import { Component, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import styles from "./ErrorBoundary.module.css";

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <span className={styles.icon}>!</span>
            <h2 className={styles.title}>エラーが発生しました</h2>
            <p className={styles.description}>
              予期しないエラーが発生しました。ページを再読み込みしてください。
            </p>
            {this.state.error && (
              <details className={styles.details}>
                <summary className={styles.summary}>詳細情報</summary>
                <pre className={styles.errorText}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              type="button"
              className={styles.reloadButton}
              onClick={this.handleReload}
            >
              <RefreshCw size={16} />
              再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
