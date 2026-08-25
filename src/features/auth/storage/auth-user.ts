import { Platform } from 'react-native'

import type { AuthUser } from '@/features/auth/types'

const AUTH_USER_KEY = 'kanyah.authUser'

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

export async function getCachedAuthUser(): Promise<AuthUser | null> {
  const value = getWebStorage()?.getItem(AUTH_USER_KEY)

  if (!value) {
    return null
  }

  try {
    const user = JSON.parse(value) as AuthUser

    return user?.role === 'parent' && Array.isArray(user.child_profiles) ? user : null
  } catch {
    return null
  }
}

export async function setCachedAuthUser(user: AuthUser): Promise<void> {
  getWebStorage()?.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export async function clearCachedAuthUser(): Promise<void> {
  getWebStorage()?.removeItem(AUTH_USER_KEY)
}
