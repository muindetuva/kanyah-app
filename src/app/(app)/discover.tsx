import { router } from 'expo-router'
import { useEffect } from 'react'

import { useAuth } from '@/features/auth/context/auth-context'
import { AppEmptyState } from '@/features/navigation/components/app-empty-state'
import { ChildAppShell } from '@/features/navigation/components/child-app-shell'

export default function DiscoverScreen() {
  const { activeProfile, isRestoring, readerMode, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    } else if (!isRestoring && user && (readerMode !== 'child' || !activeProfile)) {
      router.replace(readerMode === 'parent' ? '/parent-home' : '/who-is-reading')
    }
  }, [activeProfile, isRestoring, readerMode, user])

  return (
    <ChildAppShell activeTab="discover">
      <AppEmptyState
        body="Fresh recommendations and newly published stories will appear here."
        icon={{ ios: 'star.fill', android: 'star', web: 'star' }}
        title="DISCOVER"
      />
    </ChildAppShell>
  )
}
