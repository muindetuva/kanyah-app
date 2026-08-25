import { Platform } from 'react-native'

const PENDING_COMPLETIONS_KEY = 'kanyah.pendingStoryCompletions'

export type PendingStoryCompletion = {
  childProfileId: number
  queuedAt: string
  slug: string
}

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

export function getPendingStoryCompletions(): PendingStoryCompletion[] {
  const value = getWebStorage()?.getItem(PENDING_COMPLETIONS_KEY)

  if (!value) {
    return []
  }

  try {
    const completions = JSON.parse(value) as PendingStoryCompletion[]
    return Array.isArray(completions) ? completions : []
  } catch {
    return []
  }
}

function savePendingStoryCompletions(completions: PendingStoryCompletion[]) {
  try {
    getWebStorage()?.setItem(PENDING_COMPLETIONS_KEY, JSON.stringify(completions))
  } catch {
    // Online completion remains available if local storage cannot accept the queue.
  }
}

export function queueStoryCompletion(childProfileId: number, slug: string) {
  const completions = getPendingStoryCompletions()
  const alreadyQueued = completions.some(
    (completion) =>
      completion.childProfileId === childProfileId && completion.slug === slug,
  )

  if (!alreadyQueued) {
    savePendingStoryCompletions([
      ...completions,
      { childProfileId, queuedAt: new Date().toISOString(), slug },
    ])
  }
}

export function removePendingStoryCompletion(childProfileId: number, slug: string) {
  savePendingStoryCompletions(
    getPendingStoryCompletions().filter(
      (completion) =>
        completion.childProfileId !== childProfileId || completion.slug !== slug,
    ),
  )
}
