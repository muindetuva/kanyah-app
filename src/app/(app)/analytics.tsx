import { router } from 'expo-router'
import { useEffect } from 'react'

import { useAuth } from '@/features/auth/context/auth-context'
import { AppEmptyState } from '@/features/navigation/components/app-empty-state'
import { ParentAppShell } from '@/features/navigation/components/child-app-shell'

export default function AnalyticsScreen() {
  const { isRestoring, readerMode, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    } else if (!isRestoring && user && readerMode !== 'parent') {
      router.replace('/who-is-reading')
    }
  }, [isRestoring, readerMode, user])

  return (
    <ParentAppShell activeTab="analytics">
      <AppEmptyState
        body="Reading progress will appear after your children begin completing stories."
        icon={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }}
        title="PROGRESS OVERVIEW"
      />
    </ParentAppShell>
  )
}
