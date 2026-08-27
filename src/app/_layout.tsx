import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider, useSegments } from 'expo-router'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'

import { SessionLoadingScreen } from '@/features/auth/components/session-loading-screen'
import { AuthProvider, useAuth } from '@/features/auth/context/auth-context'
import { AppUpdatePrompt } from '@/features/pwa/components/app-update-prompt'
import { useOfflineProgressSync } from '@/features/stories/hooks/use-offline-progress-sync'

function AppNavigator() {
  const colorScheme = useColorScheme()
  const segments = useSegments()
  const { isRestoring, user } = useAuth()
  useOfflineProgressSync()
  const currentRoute = String(segments[0] ?? '')
  const isGuestOnlyRoute = currentRoute === 'login' || currentRoute === 'signup'

  useEffect(() => {
    if (!isRestoring && user && isGuestOnlyRoute) {
      router.replace('/')
    }
  }, [isGuestOnlyRoute, isRestoring, user])

  if (isRestoring || (user && isGuestOnlyRoute)) {
    return <SessionLoadingScreen />
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <AppUpdatePrompt />
    </ThemeProvider>
  )
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  )
}
