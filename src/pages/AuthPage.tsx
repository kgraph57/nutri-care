import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, Button } from '../components/ui'
import styles from './AuthPage.module.css'

type AuthMode = 'signin' | 'signup'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const errorMessage =
        mode === 'signin'
          ? await signIn(email, password)
          : await signUp(email, password)

      if (errorMessage) {
        setError(errorMessage)
      } else if (mode === 'signup') {
        setSignUpSuccess(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMode = () => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
    setError(null)
    setSignUpSuccess(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.logo}>
          <h1 className={styles.logoText}>NutriCare</h1>
          <p className={styles.logoSub}>ICU栄養管理システム</p>
        </div>

        <Card className={styles.card}>
          <h2 className={styles.title}>
            {mode === 'signin' ? 'ログイン' : 'アカウント作成'}
          </h2>

          {signUpSuccess ? (
            <div className={styles.successMessage}>
              確認メールを送信しました。メール内のリンクをクリックして
              アカウントを有効化してください。
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6文字以上"
                  required
                  minLength={6}
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <Button
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting
                  ? '処理中...'
                  : mode === 'signin'
                    ? 'ログイン'
                    : 'アカウント作成'}
              </Button>
            </form>
          )}

          <p className={styles.switchText}>
            {mode === 'signin'
              ? 'アカウントをお持ちでない方は'
              : 'すでにアカウントをお持ちの方は'}
            <button
              type="button"
              className={styles.switchButton}
              onClick={toggleMode}
            >
              {mode === 'signin' ? '新規登録' : 'ログイン'}
            </button>
          </p>
        </Card>
      </div>
    </div>
  )
}
