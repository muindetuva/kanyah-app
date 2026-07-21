import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

type InstallPromptState = {
  canPromptInstall: boolean
  dismiss: () => void
  isIos: boolean
  isVisible: boolean
  promptInstall: () => Promise<void>
}

const INSTALL_DISMISSED_KEY = 'kanyah:pwa-install-dismissed'

function getBrowserWindow() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null
  }

  return window
}

function isStandaloneDisplay() {
  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return false
  }

  const navigatorWithStandalone = browserWindow.navigator as Navigator & {
    standalone?: boolean
  }

  return (
    navigatorWithStandalone.standalone === true ||
    browserWindow.matchMedia('(display-mode: standalone)').matches
  )
}

function isIosBrowser() {
  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return false
  }

  return /iphone|ipad|ipod/i.test(browserWindow.navigator.userAgent)
}

function wasDismissed() {
  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return true
  }

  return browserWindow.localStorage.getItem(INSTALL_DISMISSED_KEY) === 'true'
}

function saveDismissed() {
  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return
  }

  browserWindow.localStorage.setItem(INSTALL_DISMISSED_KEY, 'true')
}

export function useInstallPrompt(): InstallPromptState {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isDismissed, setIsDismissed] = useState(wasDismissed)
  const [isStandalone] = useState(isStandaloneDisplay)
  const isIos = isIosBrowser()

  useEffect(() => {
    const browserWindow = getBrowserWindow()

    if (!browserWindow) {
      return
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      setIsDismissed(false)
    }

    browserWindow.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      browserWindow.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  function dismiss() {
    saveDismissed()
    setIsDismissed(true)
  }

  async function promptInstall() {
    if (!installEvent) {
      return
    }

    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
    dismiss()
  }

  return {
    canPromptInstall: Boolean(installEvent),
    dismiss,
    isIos,
    isVisible: !isStandalone && !isDismissed && (Boolean(installEvent) || isIos),
    promptInstall,
  }
}
