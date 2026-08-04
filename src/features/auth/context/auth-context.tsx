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
import {
  clearReaderSelection,
  getReaderSelection,
  setReaderSelection,
} from '@/features/auth/storage/reader-selection'
import type { AuthUser, ChildProfile, LoginInput, RegisterInput } from '@/features/auth/types'

export type ReaderMode = 'child' | 'parent'

type AuthContextValue = {
  activeProfile: ChildProfile | null
  addChildProfile: (profile: ChildProfile, options?: { select?: boolean }) => void
  isRestoring: boolean
  login: (input: LoginInput) => Promise<AuthUser>
  logout: () => Promise<void>
  readerMode: ReaderMode | null
  removeChildProfile: (profileId: number) => void
  refreshUser: () => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  selectParent: () => void
  selectProfile: (profile: ChildProfile) => void
  updateChildProfile: (profile: ChildProfile) => void
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

function persistReaderSelection(selection: Parameters<typeof setReaderSelection>[0]) {
  void setReaderSelection(selection).catch(() => {})
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const [readerMode, setReaderMode] = useState<ReaderMode | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    async function restoreSession() {
      const token = await getAuthToken()

      if (!token) {
        setIsRestoring(false)
        return
      }

      try {
        const [currentUser, savedSelection] = await Promise.all([
          getCurrentUser(),
          getReaderSelection(),
        ])

        setUser(currentUser)

        if (savedSelection?.mode === 'parent') {
          setReaderMode('parent')
        } else if (savedSelection?.mode === 'child') {
          const savedProfile = currentUser.child_profiles.find(
            (profile) => profile.id === savedSelection.profileId,
          )

          if (savedProfile) {
            setActiveProfile(savedProfile)
            setReaderMode('child')
          } else {
            await clearReaderSelection()
          }
        }
      } catch {
        await Promise.all([clearAuthToken(), clearReaderSelection()])
      } finally {
        setIsRestoring(false)
      }
    }

    void restoreSession()
  }, [])

  const authenticate = useCallback(async (request: Promise<{ token: string; user: AuthUser }>) => {
    const response = await request
    await Promise.all([setAuthToken(response.token), clearReaderSelection()])
    setActiveProfile(null)
    setReaderMode(null)
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

  const addChildProfile = useCallback((profile: ChildProfile, options?: { select?: boolean }) => {
    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, child_profiles: [...currentUser.child_profiles, profile] }
        : null,
    )
    if (options?.select !== false) {
      setActiveProfile(profile)
      setReaderMode('child')
      persistReaderSelection({ mode: 'child', profileId: profile.id })
    }
  }, [])

  const updateChildProfile = useCallback((profile: ChildProfile) => {
    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            child_profiles: currentUser.child_profiles.map((currentProfile) =>
              currentProfile.id === profile.id ? profile : currentProfile,
            ),
          }
        : null,
    )
    setActiveProfile((currentProfile) =>
      currentProfile?.id === profile.id ? profile : currentProfile,
    )
  }, [])

  const removeChildProfile = useCallback((profileId: number) => {
    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            child_profiles: currentUser.child_profiles.filter(
              (profile) => profile.id !== profileId,
            ),
          }
        : null,
    )
    setActiveProfile((currentProfile) => {
      if (currentProfile?.id !== profileId) {
        return currentProfile
      }

      setReaderMode(null)
      void clearReaderSelection().catch(() => {})
      return null
    })
  }, [])

  const selectProfile = useCallback((profile: ChildProfile) => {
    setActiveProfile(profile)
    setReaderMode('child')
    persistReaderSelection({ mode: 'child', profileId: profile.id })
  }, [])

  const selectParent = useCallback(() => {
    setActiveProfile(null)
    setReaderMode('parent')
    persistReaderSelection({ mode: 'parent' })
  }, [])

  const logout = useCallback(async () => {
    try {
      await requestLogout()
    } finally {
      await Promise.all([clearAuthToken(), clearReaderSelection()])
      setActiveProfile(null)
      setReaderMode(null)
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
      readerMode,
      removeChildProfile,
      refreshUser,
      register,
      selectParent,
      selectProfile,
      updateChildProfile,
      user,
    }),
    [
      activeProfile,
      addChildProfile,
      isRestoring,
      login,
      logout,
      readerMode,
      removeChildProfile,
      refreshUser,
      register,
      selectParent,
      selectProfile,
      updateChildProfile,
      user,
    ],
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
