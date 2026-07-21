import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useInstallPrompt } from '@/features/pwa/hooks/use-install-prompt'

const colors = {
  blue: '#2671B8',
  charcoal: '#272827',
  indigo: '#39205B',
  marigold: '#EF9E23',
  offWhite: '#F0EFEF',
}

export function InstallKanyahPrompt() {
  const { canPromptInstall, dismiss, isIos, isVisible, promptInstall } = useInstallPrompt()

  if (!isVisible) {
    return null
  }

  return (
    <View pointerEvents="box-none" style={styles.shell}>
      <View style={styles.prompt}>
        <View style={styles.copy}>
          <Text style={styles.title}>Install Kanyah</Text>
          <Text style={styles.text}>
            {isIos && !canPromptInstall ? 'Share, then Add to Home Screen.' : 'Open it like an app.'}
          </Text>
        </View>

        <View style={styles.actions}>
          {canPromptInstall ? (
            <Pressable accessibilityRole="button" onPress={promptInstall} style={styles.installButton}>
              <Text style={styles.installButtonText}>Install</Text>
            </Pressable>
          ) : null}

          <Pressable accessibilityLabel="Dismiss install prompt" accessibilityRole="button" onPress={dismiss} style={styles.dismissButton}>
            <Text style={styles.dismissButtonText}>{canPromptInstall ? 'Later' : 'Got it'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    right: 14,
    bottom: 18,
    left: 14,
    zIndex: 20,
  },
  prompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 3,
    borderColor: colors.charcoal,
    borderRadius: 24,
    backgroundColor: colors.offWhite,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: colors.charcoal,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    color: colors.indigo,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 19,
  },
  text: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8,
  },
  installButton: {
    borderRadius: 999,
    backgroundColor: colors.marigold,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  installButtonText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 15,
  },
  dismissButton: {
    borderWidth: 2,
    borderColor: colors.indigo,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dismissButtonText: {
    color: colors.indigo,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 15,
  },
})
