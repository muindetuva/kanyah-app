import { useEffect } from 'react'
import { AppState } from 'react-native'

import {
  startReadingSession,
  updateReadingSession,
} from '@/features/stories/api/stories'

const heartbeatSeconds = 15

type UseReadingSessionOptions = {
  childProfileId?: number
  enabled: boolean
  slug?: string
}

export function useReadingSession({
  childProfileId,
  enabled,
  slug,
}: UseReadingSessionOptions) {
  useEffect(() => {
    if (!enabled || !childProfileId || !slug) {
      return
    }

    let active = AppState.currentState === 'active'
    let disposed = false
    let sessionId: number | null = null

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      active = nextState === 'active'
    })

    const heartbeat = setInterval(() => {
      if (active && sessionId) {
        void updateReadingSession(sessionId, heartbeatSeconds).catch(() => {})
      }
    }, heartbeatSeconds * 1000)

    void startReadingSession(childProfileId, slug)
      .then((session) => {
        sessionId = session.id

        if (disposed) {
          void updateReadingSession(session.id, 0, true).catch(() => {})
        }
      })
      .catch(() => {})

    return () => {
      disposed = true
      clearInterval(heartbeat)
      appStateSubscription.remove()

      if (sessionId) {
        void updateReadingSession(sessionId, 0, true).catch(() => {})
      }
    }
  }, [childProfileId, enabled, slug])
}
