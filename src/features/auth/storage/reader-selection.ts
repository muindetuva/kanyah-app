import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

export type StoredReaderSelection =
  | { mode: 'child'; profileId: number }
  | { mode: 'parent' }

const READER_SELECTION_KEY = 'kanyah.readerSelection'

function getWebStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

function parseSelection(value: string | null): StoredReaderSelection | null {
  if (!value) {
    return null
  }

  try {
    const selection: unknown = JSON.parse(value)

    if (
      typeof selection === 'object' &&
      selection !== null &&
      'mode' in selection &&
      selection.mode === 'parent'
    ) {
      return { mode: 'parent' }
    }

    if (
      typeof selection === 'object' &&
      selection !== null &&
      'mode' in selection &&
      selection.mode === 'child' &&
      'profileId' in selection &&
      typeof selection.profileId === 'number'
    ) {
      return { mode: 'child', profileId: selection.profileId }
    }
  } catch {
    return null
  }

  return null
}

export async function getReaderSelection(): Promise<StoredReaderSelection | null> {
  const value =
    Platform.OS === 'web'
      ? (getWebStorage()?.getItem(READER_SELECTION_KEY) ?? null)
      : await SecureStore.getItemAsync(READER_SELECTION_KEY)

  return parseSelection(value)
}

export async function setReaderSelection(selection: StoredReaderSelection): Promise<void> {
  const value = JSON.stringify(selection)

  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(READER_SELECTION_KEY, value)
    return
  }

  await SecureStore.setItemAsync(READER_SELECTION_KEY, value)
}

export async function clearReaderSelection(): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(READER_SELECTION_KEY)
    return
  }

  await SecureStore.deleteItemAsync(READER_SELECTION_KEY)
}
