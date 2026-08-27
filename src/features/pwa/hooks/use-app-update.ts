import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000

type AppUpdateState = {
  dismiss: () => void
  isUpdating: boolean
  isVisible: boolean
  updateNow: () => void
}

function getServiceWorkerContainer() {
  if (
    Platform.OS !== 'web' ||
    typeof window === 'undefined' ||
    !('serviceWorker' in window.navigator) ||
    ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ) {
    return null
  }

  return window.navigator.serviceWorker
}

export function useAppUpdate(): AppUpdateState {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const reloadRequested = useRef(false)

  useEffect(() => {
    const serviceWorkers = getServiceWorkerContainer()

    if (!serviceWorkers) {
      return
    }

    const serviceWorkerContainer: ServiceWorkerContainer = serviceWorkers
    let disposed = false
    let registration: ServiceWorkerRegistration | null = null
    const workerCleanups = new Set<() => void>()

    function showWaitingWorker(worker: ServiceWorker | null) {
      if (!disposed && worker && serviceWorkerContainer.controller) {
        setWaitingWorker(worker)
      }
    }

    function watchInstallingWorker(worker: ServiceWorker | null) {
      if (!worker) {
        return
      }

      const installingWorker: ServiceWorker = worker

      function handleStateChange() {
        if (installingWorker.state === 'installed') {
          showWaitingWorker(registration?.waiting ?? installingWorker)
        }
      }

      installingWorker.addEventListener('statechange', handleStateChange)
      workerCleanups.add(() =>
        installingWorker.removeEventListener('statechange', handleStateChange),
      )
      handleStateChange()
    }

    function handleUpdateFound() {
      watchInstallingWorker(registration?.installing ?? null)
    }

    async function checkForUpdate() {
      try {
        if (!registration) {
          registration = await serviceWorkerContainer.ready
          registration.addEventListener('updatefound', handleUpdateFound)
          showWaitingWorker(registration.waiting)
          watchInstallingWorker(registration.installing)
        }

        await registration.update()
        showWaitingWorker(registration.waiting)
      } catch {
        // Update checks should never interrupt normal app use.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void checkForUpdate()
      }
    }

    void checkForUpdate()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', checkForUpdate)
    const interval = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', checkForUpdate)
      window.clearInterval(interval)
      registration?.removeEventListener('updatefound', handleUpdateFound)
      workerCleanups.forEach((cleanup) => cleanup())
    }
  }, [])

  const updateNow = useCallback(() => {
    const serviceWorkers = getServiceWorkerContainer()

    if (!serviceWorkers || !waitingWorker || isUpdating) {
      return
    }

    setIsUpdating(true)
    reloadRequested.current = true

    function reloadWithNewWorker() {
      if (!reloadRequested.current) {
        return
      }

      reloadRequested.current = false
      window.location.reload()
    }

    serviceWorkers.addEventListener('controllerchange', reloadWithNewWorker, { once: true })
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    window.setTimeout(reloadWithNewWorker, 5000)
  }, [isUpdating, waitingWorker])

  return {
    dismiss: () => setIsDismissed(true),
    isUpdating,
    isVisible: waitingWorker !== null && !isDismissed,
    updateNow,
  }
}
