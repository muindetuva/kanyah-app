import { router } from 'expo-router'
import { useEffect } from 'react'

import { useAuth } from '@/features/auth/context/auth-context'
import { AppEmptyState } from '@/features/navigation/components/app-empty-state'
import {
  ChildAppShell,
  ParentAppShell,
} from '@/features/navigation/components/child-app-shell'

export default function WatchScreen() {
  const { isRestoring, readerMode, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    } else if (!isRestoring && user && !readerMode) {
      router.replace('/who-is-reading')
    }
  }, [isRestoring, readerMode, user])

  const content = (
    <AppEmptyState
      body="Narrated and watchable stories will appear here when they are ready."
      icon={{ ios: 'play.rectangle.fill', android: 'smart_display', web: 'smart_display' }}
      title="WATCH & LISTEN"
    />
  )

  return readerMode === 'parent' ? (
    <ParentAppShell activeTab="watch">{content}</ParentAppShell>
  ) : (
    <ChildAppShell activeTab="watch">{content}</ChildAppShell>
  )
}
