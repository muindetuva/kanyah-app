import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const AUTH_TOKEN_KEY = 'kanyah.authToken'

function getWebStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(AUTH_TOKEN_KEY) ?? null
  }

  return SecureStore.getItemAsync(AUTH_TOKEN_KEY)
}

export async function setAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(AUTH_TOKEN_KEY, token)
    return
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token)
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(AUTH_TOKEN_KEY)
    return
  }

  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY)
}
