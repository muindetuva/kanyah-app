import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import { SymbolView } from 'expo-symbols'
import { type PropsWithChildren, useEffect, useRef, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import { appColors, appPalette } from '@/theme/colors'

type StoryNarrationPlayerProps = {
  narrationKey: number
  narrationUrl: string
  onFinished: () => void
}

const webGlassStyle = Platform.OS === 'web'
  ? ({ backdropFilter: 'blur(8px) saturate(120%)' } as never)
  : undefined

function NarrationSurface({ children }: PropsWithChildren) {
  if (isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="regular"
        style={styles.player}
        tintColor="rgba(255, 253, 249, 0.42)"
      >
        {children}
      </GlassView>
    )
  }

  return <View style={[styles.player, webGlassStyle]}>{children}</View>
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

  return (
    <NarrationSurface>
      <View style={styles.playbackControls}>
        {status.error ? (
          <Pressable
            accessibilityLabel="Retry narration"
            accessibilityRole="button"
            onPress={retryNarration}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <SymbolView
              name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
              size={18}
              tintColor={appColors.actions.secondary}
            />
            <Text style={styles.retryText}>TRY AGAIN</Text>
          </Pressable>
        ) : (
          <>
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
                size={22}
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
                size={22}
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
                size={22}
                tintColor={appPalette.colors.brown[500]}
              />
            </Pressable>
          </>
        )}
      </View>

      <View
        accessibilityLabel={`Narration progress ${Math.round(progress * 100)} percent`}
        accessibilityRole="progressbar"
        accessibilityValue={{ max: 100, min: 0, now: Math.round(progress * 100) }}
        style={styles.progressTrack}
      >
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </NarrationSurface>
  )
}

const styles = StyleSheet.create({
  listenButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: appPalette.grays.white,
    borderRadius: 26,
    backgroundColor: appColors.actions.primary,
    boxShadow: '0 8px 18px rgba(90, 52, 28, 0.24)',
  },
  player: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 253, 249, 0.58)',
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 8,
    boxShadow: '0 8px 22px rgba(90, 52, 28, 0.16)',
  },
  playbackControls: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  smallButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  playButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: appColors.actions.primary,
  },
  progressTrack: {
    height: 4,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginTop: 5,
    borderRadius: 2,
    backgroundColor: 'rgba(179, 177, 182, 0.55)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: appColors.actions.primary,
  },
  retryButton: {
    minHeight: 40,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 20,
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
