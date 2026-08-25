import type { PropsWithChildren } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  getCurrentUser,
  login as requestLogin,
  logout as requestLogout,
  register as requestRegistration,
  updateParentAccount as requestAccountUpdate,
} from '@/features/auth/api/auth'
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '@/features/auth/storage/auth-token'
import {
  clearCachedAuthUser,
  getCachedAuthUser,
  setCachedAuthUser,
} from '@/features/auth/storage/auth-user'
import {
  getDeviceSetup,
  setDeviceSetup,
  type DeviceMode,
  type StoredDeviceSetup,
} from '@/features/auth/storage/device-setup'
import {
  clearReaderSelection,
  setReaderSelection,
} from '@/features/auth/storage/reader-selection'
import type {
  AuthUser,
  ChildProfile,
  LoginInput,
  RegisterInput,
  UpdateParentAccountInput,
} from '@/features/auth/types'
import { ApiError } from '@/lib/api/client'

export type ReaderMode = 'child' | 'parent'

type AuthContextValue = {
  activeProfile: ChildProfile | null
  addChildProfile: (profile: ChildProfile, options?: { select?: boolean }) => void
  configureDevice: (mode: DeviceMode, profile?: ChildProfile | null) => Promise<void>
  deviceMode: DeviceMode | null
  deviceProfileId: number | null
  isRestoring: boolean
  login: (input: LoginInput) => Promise<AuthUser>
  logout: () => Promise<void>
  readerMode: ReaderMode | null
  removeChildProfile: (profileId: number) => void
  refreshUser: () => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  selectParent: () => void
  selectProfile: (profile: ChildProfile) => void
  updateAccount: (input: UpdateParentAccountInput) => Promise<AuthUser>
  updateChildProfile: (profile: ChildProfile) => void
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

function persistReaderSelection(selection: Parameters<typeof setReaderSelection>[0]) {
  void setReaderSelection(selection).catch(() => {})
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null)
  const [deviceMode, setDeviceMode] = useState<DeviceMode | null>(null)
  const [deviceProfileId, setDeviceProfileId] = useState<number | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const [readerMode, setReaderMode] = useState<ReaderMode | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  const applyDeviceSetup = useCallback(
    (currentUser: AuthUser, setup: StoredDeviceSetup | null) => {
      setActiveProfile(null)
      setDeviceMode(setup?.mode ?? null)
      setDeviceProfileId(setup?.profileId ?? null)
      setReaderMode(null)

      if (setup?.mode === 'parent') {
        setReaderMode('parent')
        return
      }

      if (setup?.mode === 'child' && setup.profileId) {
        const profile = currentUser.child_profiles.find(
          (childProfile) => childProfile.id === setup.profileId,
        )

        if (profile) {
          setActiveProfile(profile)
          setReaderMode('child')
        }
      }
    },
    [],
  )

  useEffect(() => {
    async function restoreSession() {
      const [token, cachedUser] = await Promise.all([getAuthToken(), getCachedAuthUser()])

      if (!token) {
        await clearCachedAuthUser()
        setIsRestoring(false)
        return
      }

      if (cachedUser) {
        const savedDeviceSetup = await getDeviceSetup(cachedUser.id)
        setUser(cachedUser)
        applyDeviceSetup(cachedUser, savedDeviceSetup)
        setIsRestoring(false)
      }

      try {
        const currentUser = await getCurrentUser()
        const savedDeviceSetup = await getDeviceSetup(currentUser.id)

        setUser(currentUser)
        applyDeviceSetup(currentUser, savedDeviceSetup)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await Promise.all([
            clearAuthToken(),
            clearCachedAuthUser(),
            clearReaderSelection(),
          ])
          setActiveProfile(null)
          setDeviceMode(null)
          setDeviceProfileId(null)
          setReaderMode(null)
          setUser(null)
        }
      } finally {
        setIsRestoring(false)
      }
    }

    void restoreSession()
  }, [applyDeviceSetup])

  useEffect(() => {
    if (user) {
      void setCachedAuthUser(user)
    }
  }, [user])

  const authenticate = useCallback(async (request: Promise<{ token: string; user: AuthUser }>) => {
    const response = await request
    const savedDeviceSetup = await getDeviceSetup(response.user.id)
    await Promise.all([setAuthToken(response.token), clearReaderSelection()])
    applyDeviceSetup(response.user, savedDeviceSetup)
    setUser(response.user)
    return response.user
  }, [applyDeviceSetup])

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

  const updateAccount = useCallback(async (input: UpdateParentAccountInput) => {
    const updatedUser = await requestAccountUpdate(input)
    setUser(updatedUser)
    return updatedUser
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

  const configureDevice = useCallback(
    async (mode: DeviceMode, profile: ChildProfile | null = null) => {
      if (!user) {
        throw new Error('Sign in before setting up this device.')
      }

      const profileId = mode === 'child' ? (profile?.id ?? null) : null

      await setDeviceSetup({ mode, profileId, userId: user.id })
      setDeviceMode(mode)
      setDeviceProfileId(profileId)
      setActiveProfile(null)
      setReaderMode(null)

      if (mode === 'parent') {
        setReaderMode('parent')
        persistReaderSelection({ mode: 'parent' })
      } else if (mode === 'child' && profile) {
        setActiveProfile(profile)
        setReaderMode('child')
        persistReaderSelection({ mode: 'child', profileId: profile.id })
      } else {
        await clearReaderSelection()
      }
    },
    [user],
  )

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
      await Promise.all([
        clearAuthToken(),
        clearCachedAuthUser(),
        clearReaderSelection(),
      ])
      setActiveProfile(null)
      setDeviceMode(null)
      setDeviceProfileId(null)
      setReaderMode(null)
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      activeProfile,
      addChildProfile,
      configureDevice,
      deviceMode,
      deviceProfileId,
      isRestoring,
      login,
      logout,
      readerMode,
      removeChildProfile,
      refreshUser,
      register,
      selectParent,
      selectProfile,
      updateAccount,
      updateChildProfile,
      user,
    }),
    [
      activeProfile,
      addChildProfile,
      configureDevice,
      deviceMode,
      deviceProfileId,
      isRestoring,
      login,
      logout,
      readerMode,
      removeChildProfile,
      refreshUser,
      register,
      selectParent,
      selectProfile,
      updateAccount,
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
