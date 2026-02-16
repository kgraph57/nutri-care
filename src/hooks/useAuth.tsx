import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthState {
  readonly user: User | null
  readonly session: Session | null
  readonly isLoading: boolean
}

interface AuthContextValue extends AuthState {
  readonly signUp: (email: string, password: string) => Promise<string | null>
  readonly signIn: (email: string, password: string) => Promise<string | null>
  readonly signOut: () => Promise<void>
  readonly isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: isSupabaseConfigured,
  })

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!supabase) return 'Supabase is not configured'

      const { error } = await supabase.auth.signUp({ email, password })
      return error?.message ?? null
    },
    []
  )

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!supabase) return 'Supabase is not configured'

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return error?.message ?? null
    },
    []
  )

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value: AuthContextValue = {
    ...state,
    signUp,
    signIn,
    signOut,
    isAuthenticated: state.user !== null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
