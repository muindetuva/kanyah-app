import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useAppUpdate } from '@/features/pwa/hooks/use-app-update'
import { appColors, appPalette } from '@/theme/colors'

export function AppUpdatePrompt() {
  const { dismiss, isUpdating, isVisible, updateNow } = useAppUpdate()

  if (!isVisible) {
    return null
  }

  return (
    <View pointerEvents="box-none" style={styles.shell}>
      <View accessibilityLiveRegion="polite" style={styles.prompt}>
        <View style={styles.copy}>
          <Text style={styles.title}>Kanyah is ready to update</Text>
          <Text style={styles.text}>Refresh to get the latest version.</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={isUpdating}
            onPress={updateNow}
            style={({ pressed }) => [
              styles.updateButton,
              pressed && styles.pressed,
              isUpdating && styles.disabled,
            ]}
          >
            <Text style={styles.updateButtonText}>{isUpdating ? 'Updating...' : 'Update now'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isUpdating}
            onPress={dismiss}
            style={({ pressed }) => [styles.laterButton, pressed && styles.pressed]}
          >
            <Text style={styles.laterButtonText}>Later</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    right: 0,
    bottom: 22,
    left: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  prompt: {
    width: '100%',
    maxWidth: 390,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: appPalette.colors.deepIndigo[400],
    borderRadius: 20,
    backgroundColor: appPalette.colors.neutral[100],
    paddingHorizontal: 14,
    paddingVertical: 12,
    boxShadow: '0 8px 24px rgba(39, 40, 39, 0.24)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    color: appColors.text.primary,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 19,
  },
  text: {
    color: appPalette.colors.brown[500],
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actions: {
    alignItems: 'stretch',
    flexShrink: 0,
    gap: 6,
  },
  updateButton: {
    borderRadius: 999,
    backgroundColor: appColors.actions.primary,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  updateButtonText: {
    color: appColors.text.onPrimary,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
    textAlign: 'center',
  },
  laterButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  laterButtonText: {
    color: appPalette.colors.deepIndigo[400],
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 15,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.6,
  },
})
