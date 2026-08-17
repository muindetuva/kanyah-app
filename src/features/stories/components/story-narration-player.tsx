import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { SymbolView } from 'expo-symbols'
import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { appColors, appPalette } from '@/theme/colors'

type StoryNarrationPlayerProps = {
  narrationKey: number
  narrationUrl: string
  onFinished: () => void
}

export function StoryNarrationPlayer({
  narrationKey,
  narrationUrl,
  onFinished,
}: StoryNarrationPlayerProps) {
  const player = useAudioPlayer(narrationUrl, { updateInterval: 250 })
  const status = useAudioPlayerStatus(player)
  const [isExpanded, setIsExpanded] = useState(false)
  const [continuousPlayback, setContinuousPlayback] = useState(false)
  const activeNarrationKey = `${narrationKey}:${narrationUrl}`
  const completedNarration = useRef<string | null>(null)
  const preparedNarration = useRef<string | null>(null)
  const startedNarration = useRef<string | null>(null)
  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    })
  }, [])

  useEffect(() => {
    if (preparedNarration.current === activeNarrationKey) {
      return
    }

    preparedNarration.current = activeNarrationKey
    completedNarration.current = null
    startedNarration.current = null

    if (continuousPlayback) {
      void player.seekTo(0).then(() => player.play())
    }
  }, [activeNarrationKey, continuousPlayback, player])

  useEffect(() => {
    if (status.playing) {
      startedNarration.current = activeNarrationKey
    }
  }, [activeNarrationKey, status.playing])

  useEffect(() => {
    if (
      !continuousPlayback ||
      !status.didJustFinish ||
      startedNarration.current !== activeNarrationKey ||
      completedNarration.current === activeNarrationKey
    ) {
      return
    }

    completedNarration.current = activeNarrationKey
    onFinished()
  }, [activeNarrationKey, continuousPlayback, onFinished, status.didJustFinish])

  async function startNarration() {
    setIsExpanded(true)
    setContinuousPlayback(true)

    if (status.duration > 0 && status.currentTime >= status.duration - 0.25) {
      await player.seekTo(0)
    }

    player.play()
  }

  async function togglePlayback() {
    if (status.playing) {
      player.pause()
      setContinuousPlayback(false)
      return
    }

    await startNarration()
  }

  function retryNarration() {
    completedNarration.current = null
    startedNarration.current = null
    player.replace(narrationUrl)
    setContinuousPlayback(true)
    player.play()
  }

  function rewindNarration() {
    void player.seekTo(Math.max(0, player.currentTime - 5))
  }

  function forwardNarration() {
    const targetTime = player.currentTime + 5

    void player.seekTo(player.duration > 0 ? Math.min(player.duration, targetTime) : targetTime)
  }

  if (!isExpanded) {
    return (
      <Pressable
        accessibilityHint="Starts narration and opens playback controls"
        accessibilityLabel={status.playing ? 'Open narration controls, audio playing' : 'Listen to this card'}
        accessibilityRole="button"
        onPress={() => void startNarration()}
        style={({ pressed }) => [styles.listenButton, pressed && styles.pressed]}
      >
        <SymbolView
          name={{ ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' }}
          size={27}
          tintColor={appColors.text.onPrimary}
        />
      </Pressable>
    )
  }

  const statusLabel = status.error
    ? 'NARRATION UNAVAILABLE'
    : status.isBuffering || !status.isLoaded
      ? 'LOADING AUDIO'
      : status.playing
        ? 'PLAYING NARRATION'
        : 'NARRATION PAUSED'

  return (
    <View style={styles.player}>
      <View style={styles.playerHeader}>
        <View style={styles.playerLabelGroup}>
          <SymbolView
            name={{ ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' }}
            size={18}
            tintColor={appPalette.colors.primary[400]}
          />
          <Text accessibilityLiveRegion="polite" style={styles.playerLabel}>
            {statusLabel}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Minimize narration controls"
          accessibilityRole="button"
          onPress={() => setIsExpanded(false)}
          style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}
        >
          <SymbolView
            name={{ ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' }}
            size={22}
            tintColor={appPalette.colors.brown[500]}
          />
        </Pressable>
      </View>

      {status.error ? (
        <Pressable
          accessibilityLabel="Retry narration"
          accessibilityRole="button"
          onPress={retryNarration}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <SymbolView
            name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
            size={19}
            tintColor={appColors.actions.secondary}
          />
          <Text style={styles.retryText}>TRY AGAIN</Text>
        </Pressable>
      ) : (
        <View style={styles.playbackContent}>
          <View style={styles.playbackControls}>
            <Pressable
              accessibilityLabel="Rewind narration 5 seconds"
              accessibilityRole="button"
              disabled={!status.isLoaded}
              onPress={rewindNarration}
              style={({ pressed }) => [
                styles.smallButton,
                !status.isLoaded && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{ ios: 'gobackward.5', android: 'replay_5', web: 'replay_5' }}
                size={24}
                tintColor={appPalette.colors.brown[500]}
              />
            </Pressable>

            <Pressable
              accessibilityLabel={status.playing ? 'Pause narration' : 'Play narration'}
              accessibilityRole="button"
              onPress={() => void togglePlayback()}
              style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}
            >
              <SymbolView
                name={
                  status.playing
                    ? { ios: 'pause.fill', android: 'pause', web: 'pause' }
                    : { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }
                }
                size={25}
                tintColor={appColors.text.onPrimary}
              />
            </Pressable>

            <Pressable
              accessibilityLabel="Forward narration 5 seconds"
              accessibilityRole="button"
              disabled={!status.isLoaded}
              onPress={forwardNarration}
              style={({ pressed }) => [
                styles.smallButton,
                !status.isLoaded && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{ ios: 'goforward.5', android: 'forward_5', web: 'forward_5' }}
                size={24}
                tintColor={appPalette.colors.brown[500]}
              />
            </Pressable>
          </View>

          <View
            accessibilityLabel={`Narration progress ${Math.round(progress * 100)} percent`}
            accessibilityRole="progressbar"
            accessibilityValue={{ max: 100, min: 0, now: Math.round(progress * 100) }}
            style={styles.progressTrack}
          >
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  listenButton: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: appPalette.grays.white,
    borderRadius: 29,
    backgroundColor: appColors.actions.primary,
    boxShadow: '0 8px 18px rgba(90, 52, 28, 0.24)',
  },
  player: {
    width: '100%',
    minHeight: 110,
    borderWidth: 1,
    borderColor: appPalette.colors.primary[100],
    borderRadius: 24,
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    boxShadow: '0 9px 24px rgba(90, 52, 28, 0.2)',
  },
  playerHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  playerLabel: {
    color: appPalette.colors.brown[500],
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  playbackContent: {
    marginTop: 5,
  },
  playbackControls: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  smallButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  playButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: appColors.actions.primary,
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
    marginTop: 9,
    borderRadius: 4,
    backgroundColor: appPalette.colors.neutral[200],
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: appColors.actions.primary,
  },
  retryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 5,
    borderRadius: 24,
    backgroundColor: appPalette.colors.secondary[10],
  },
  retryText: {
    color: appColors.actions.secondary,
    fontSize: 13,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.42,
  },
  pressed: {
    opacity: 0.76,
  },
})
