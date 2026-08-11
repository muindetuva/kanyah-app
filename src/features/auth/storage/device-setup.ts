import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

export type DeviceMode = 'child' | 'parent' | 'shared'

export type StoredDeviceSetup = {
  mode: DeviceMode
  profileId: number | null
  userId: number
}

const DEVICE_SETUP_KEY = 'kanyah.deviceSetup'

function getWebStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

function parseDeviceSetup(value: string | null, userId: number): StoredDeviceSetup | null {
  if (!value) {
    return null
  }

  try {
    const setup: unknown = JSON.parse(value)

    if (
      typeof setup !== 'object' ||
      setup === null ||
      !('userId' in setup) ||
      setup.userId !== userId ||
      !('mode' in setup) ||
      !['child', 'parent', 'shared'].includes(String(setup.mode))
    ) {
      return null
    }

    const profileId =
      'profileId' in setup && typeof setup.profileId === 'number' ? setup.profileId : null

    return {
      mode: setup.mode as DeviceMode,
      profileId,
      userId,
    }
  } catch {
    return null
  }
}

export async function getDeviceSetup(userId: number): Promise<StoredDeviceSetup | null> {
  const value =
    Platform.OS === 'web'
      ? (getWebStorage()?.getItem(DEVICE_SETUP_KEY) ?? null)
      : await SecureStore.getItemAsync(DEVICE_SETUP_KEY)

  return parseDeviceSetup(value, userId)
}

export async function setDeviceSetup(setup: StoredDeviceSetup): Promise<void> {
  const value = JSON.stringify(setup)

  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(DEVICE_SETUP_KEY, value)
    return
  }

  await SecureStore.setItemAsync(DEVICE_SETUP_KEY, value)
}
