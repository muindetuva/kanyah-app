import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { AuthPrimaryButton, AuthShell } from '@/features/auth/components/auth-ui'
import { useAuth } from '@/features/auth/context/auth-context'
import type { DeviceMode } from '@/features/auth/storage/device-setup'
import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import { getApiErrorMessage } from '@/lib/api/client'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const deviceOptions = [
  {
    backgroundColor: appPalette.colors.purple[10],
    color: appPalette.colors.purple[500],
    description: 'Open to your dashboard and manage the family experience.',
    icon: {
      ios: 'person.crop.circle.fill' as const,
      android: 'account_circle' as const,
      web: 'account_circle' as const,
    },
    label: 'PARENT ONLY',
    mode: 'parent' as const,
  },
  {
    backgroundColor: appPalette.colors.secondary[10],
    color: appPalette.colors.secondary[500],
    description: 'Let everyone choose who is reading whenever Kanyah opens.',
    icon: {
      ios: 'person.2.fill' as const,
      android: 'groups' as const,
      web: 'groups' as const,
    },
    label: 'SHARED WITH MY CHILDREN',
    mode: 'shared' as const,
  },
  {
    backgroundColor: appPalette.colors.primary[10],
    color: appPalette.colors.primary[500],
    description: 'Open directly to one child’s stories and keep parent areas locked.',
    icon: {
      ios: 'ipad' as const,
      android: 'tablet_android' as const,
      web: 'tablet_android' as const,
    },
    label: 'ONE CHILD ONLY',
    mode: 'child' as const,
  },
] satisfies readonly {
  description: string
  backgroundColor: string
  color: string
  icon: ComponentProps<typeof SymbolView>['name']
  label: string
  mode: DeviceMode
}[]

export default function DeviceSetupScreen() {
  const [error, setError] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMode, setSelectedMode] = useState<DeviceMode | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const { configureDevice, isRestoring, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    }
  }, [isRestoring, user])

  async function continueSetup() {
    if (!selectedMode || !user) {
      return
    }

    const selectedProfile =
      selectedMode === 'child'
        ? user.child_profiles.find((profile) => profile.id === selectedProfileId) ?? null
        : null

    if (selectedMode === 'child' && user.child_profiles.length > 0 && !selectedProfile) {
      setError(new Error('Choose the child who will use this device.'))
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await configureDevice(selectedMode, selectedProfile)

      if (user.child_profiles.length === 0) {
        router.replace('/create-profile')
      } else if (selectedMode === 'parent') {
        router.replace('/parent-home')
      } else if (!user.has_parent_pin) {
        router.replace('/parent-pin')
      } else if (selectedMode === 'shared') {
        router.replace('/shared-device-ready')
      } else {
        router.replace('/home')
      }
    } catch (setupError) {
      setError(setupError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell contentStyle={styles.scrollContent}>
      <View style={styles.panel}>
        <View style={styles.deviceBadge}>
          <SymbolView
            name={{ ios: 'macbook.and.iphone', android: 'devices', web: 'devices' }}
            size={30}
            tintColor={appColors.text.onPrimary}
          />
        </View>

        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            SET UP THIS DEVICE
          </Text>
          <Text style={styles.subtitle}>Choose what Kanyah should show when it opens.</Text>
        </View>

        <View accessibilityRole="radiogroup" style={styles.options}>
          {deviceOptions.map((option) => {
            const selected = option.mode === selectedMode

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                disabled={isSubmitting}
                key={option.mode}
                onPress={() => {
                  setSelectedMode(option.mode)
                  setError(null)
                }}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: option.backgroundColor },
                  selected && { borderColor: option.color },
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                  <SymbolView name={option.icon} size={24} tintColor={appColors.text.onPrimary} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={[styles.radio, selected && { borderColor: option.color }]}>
                  {selected ? <View style={[styles.radioDot, { backgroundColor: option.color }]} /> : null}
                </View>
              </Pressable>
            )
          })}
        </View>

        {selectedMode === 'child' && user?.child_profiles.length ? (
          <View style={styles.childSection}>
            <Text style={styles.childSectionLabel}>CHOOSE A CHILD</Text>
            <View style={styles.profileList}>
              {user.child_profiles.map((profile) => {
                const selected = profile.id === selectedProfileId

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    key={profile.id}
                    onPress={() => {
                      setSelectedProfileId(profile.id)
                      setError(null)
                    }}
                    style={({ pressed }) => [styles.profileOption, pressed && styles.pressed]}
                  >
                    <ProfileAvatar
                      avatar={profile.avatar_key}
                      imageUrl={profile.avatar_url}
                      selected={selected}
                      size={58}
                    />
                    <Text numberOfLines={1} style={styles.profileName}>
                      {profile.display_name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        ) : null}

        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {getApiErrorMessage(error, 'We could not save this device setup.')}
          </Text>
        ) : null}

        <View style={styles.action}>
          <AuthPrimaryButton
            disabled={!selectedMode || isSubmitting || isRestoring || !user}
            label={isSubmitting ? 'SAVING…' : 'CONTINUE'}
            onPress={() => void continueSetup()}
          />
        </View>
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingTop: 66,
    paddingBottom: 36,
  },
  panel: {
    position: 'relative',
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 20,
    borderRadius: 28,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 14px 28px rgba(90, 52, 28, 0.13)',
  },
  deviceBadge: {
    position: 'absolute',
    top: -34,
    alignSelf: 'center',
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: appPalette.grays.white,
    borderRadius: 34,
    backgroundColor: appPalette.colors.primary[500],
    boxShadow: '0 6px 14px rgba(90, 52, 28, 0.2)',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 38,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 300,
    marginTop: 8,
    color: appColors.text.secondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  options: {
    gap: 12,
    marginTop: 26,
  },
  option: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 13,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 16,
  },
  optionIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
  },
  optionCopy: {
    flex: 1,
  },
  optionLabel: {
    color: appColors.text.primary,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  optionDescription: {
    marginTop: 4,
    color: appColors.text.secondary,
    fontSize: 12,
    lineHeight: 17,
  },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: appPalette.colors.neutral[300],
    borderRadius: 11,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  childSection: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: appPalette.colors.brown[100],
  },
  childSectionLabel: {
    color: appPalette.colors.neutral[1000],
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  profileList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 13,
  },
  profileOption: {
    width: 72,
    alignItems: 'center',
  },
  profileName: {
    width: '100%',
    marginTop: 7,
    color: appPalette.colors.neutral[1000],
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    marginTop: 16,
    color: appPalette.colors.primary[500],
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  action: {
    marginTop: 20,
  },
  pressed: {
    opacity: 0.72,
  },
})
