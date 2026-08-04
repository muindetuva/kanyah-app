import type { PropsWithChildren } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  getCurrentUser,
  login as requestLogin,
  logout as requestLogout,
  register as requestRegistration,
} from '@/features/auth/api/auth'
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '@/features/auth/storage/auth-token'
import type { AuthUser, ChildProfile, LoginInput, RegisterInput } from '@/features/auth/types'

type AuthContextValue = {
  activeProfile: ChildProfile | null
  addChildProfile: (profile: ChildProfile) => void
  isRestoring: boolean
  login: (input: LoginInput) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  selectProfile: (profile: ChildProfile) => void
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    async function restoreSession() {
      const token = await getAuthToken()

      if (!token) {
        setIsRestoring(false)
        return
      }

      try {
        setUser(await getCurrentUser())
      } catch {
        await clearAuthToken()
      } finally {
        setIsRestoring(false)
      }
    }

    void restoreSession()
  }, [])

  const authenticate = useCallback(async (request: Promise<{ token: string; user: AuthUser }>) => {
    const response = await request
    await setAuthToken(response.token)
    setActiveProfile(null)
    setUser(response.user)
    return response.user
  }, [])

  const login = useCallback(
    (input: LoginInput) => authenticate(requestLogin(input)),
    [authenticate],
  )

  const register = useCallback(
    (input: RegisterInput) => authenticate(requestRegistration(input)),
    [authenticate],
  )

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser()
    setActiveProfile((currentProfile) =>
      currentProfile
        ? currentUser.child_profiles.find((profile) => profile.id === currentProfile.id) ?? null
        : null,
    )
    setUser(currentUser)
    return currentUser
  }, [])

  const addChildProfile = useCallback((profile: ChildProfile) => {
    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, child_profiles: [...currentUser.child_profiles, profile] }
        : null,
    )
    setActiveProfile(profile)
  }, [])

  const logout = useCallback(async () => {
    try {
      await requestLogout()
    } finally {
      await clearAuthToken()
      setActiveProfile(null)
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      activeProfile,
      addChildProfile,
      isRestoring,
      login,
      logout,
      refreshUser,
      register,
      selectProfile: setActiveProfile,
      user,
    }),
    [activeProfile, addChildProfile, isRestoring, login, logout, refreshUser, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
