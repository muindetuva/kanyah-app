import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { AuthBackButton, AuthShell } from '@/features/auth/components/auth-ui'
import {
  ProfileAvatar,
  type ProfileAvatarId,
} from '@/features/profiles/components/profile-avatar'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

type ProfileOptionProps = {
  avatar: ProfileAvatarId
  disabled?: boolean
  label: string
  role?: string
}

function ProfileOption({ avatar, disabled = false, label, role }: ProfileOptionProps) {
  return (
    <Pressable
      accessibilityHint={disabled ? 'Parent home will be added later' : 'Opens this child profile'}
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => router.replace('/home')}
      style={({ pressed }) => [styles.profileOption, pressed && styles.pressed]}
    >
      <ProfileAvatar avatar={avatar} size={86} />
      <Text style={styles.profileName}>{label}</Text>
      {role ? <Text style={styles.profileRole}>{role}</Text> : null}
    </Pressable>
  )
}

function goBack() {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.replace('/login')
}

export default function WhoIsReadingScreen() {
  return (
    <AuthShell contentStyle={styles.scrollContent}>
      <AuthBackButton onPress={goBack} />

      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          WHO&apos;S READING{`\n`}TODAY?
        </Text>
        <Text style={styles.subtitle}>Select a profile to continue</Text>
      </View>

      <View style={styles.profileGrid}>
        <ProfileOption avatar="paw" label="Kofi" />
        <ProfileOption avatar="explorer" label="Amara" />
        <ProfileOption avatar="parent" disabled label="Jane" role="Parent" />

        <Pressable
          accessibilityLabel="Add profile"
          accessibilityRole="button"
          onPress={() => router.push('/create-profile')}
          style={({ pressed }) => [styles.profileOption, pressed && styles.pressed]}
        >
          <View style={styles.addAvatar}>
            <Text style={styles.addSymbol}>+</Text>
          </View>
          <Text style={styles.profileName}>Add Profile</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/create-profile')}
        style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}
      >
        <Text style={styles.manageText}>Manage Profiles</Text>
      </Pressable>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 42,
  },
  title: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 43,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: appPalette.colors.brown[500],
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 34,
    marginTop: 52,
  },
  profileOption: {
    width: '50%',
    minHeight: 126,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  profileName: {
    marginTop: 10,
    color: appPalette.colors.neutral[1000],
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  profileRole: {
    marginTop: 1,
    color: appPalette.colors.brown[500],
    fontSize: 12,
    lineHeight: 16,
  },
  addAvatar: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: appPalette.colors.secondary[100],
    borderStyle: 'dashed',
    borderRadius: 43,
    backgroundColor: appPalette.colors.secondary[10],
  },
  addSymbol: {
    color: appColors.actions.secondary,
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
  },
  manageButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  manageText: {
    color: appColors.actions.secondary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
})
