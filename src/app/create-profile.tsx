import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import {
  AuthBackButton,
  AuthField,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/components/auth-ui'
import {
  ProfileAvatar,
  type ProfileAvatarId,
} from '@/features/profiles/components/profile-avatar'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const avatarOptions: ProfileAvatarId[] = ['paw', 'explorer', 'rocket', 'hare']

function goBack() {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.replace('/signup')
}

export default function CreateProfileScreen() {
  const [age, setAge] = useState(5)
  const [avatar, setAvatar] = useState<ProfileAvatarId>('explorer')
  const [name, setName] = useState('')

  return (
    <AuthShell contentStyle={styles.scrollContent}>
      <AuthBackButton onPress={goBack} />

      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          CREATE THEIR{`\n`}PROFILE
        </Text>
        <Text style={styles.subtitle}>A few details help us find stories they&apos;ll love.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarPreview}>
          <ProfileAvatar avatar={avatar} selected size={92} />
        </View>

        <AuthField
          autoComplete="name"
          icon="person"
          label="CHILD'S NAME"
          onChangeText={setName}
          placeholder="Enter their name"
          returnKeyType="done"
          value={name}
        />

        <View style={styles.ageGroup}>
          <Text style={styles.fieldLabel}>AGE</Text>
          <View style={styles.ageStepper}>
            <Pressable
              accessibilityLabel="Decrease age"
              accessibilityRole="button"
              disabled={age <= 1}
              hitSlop={6}
              onPress={() => setAge((currentAge) => Math.max(1, currentAge - 1))}
              style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
            >
              <Text style={styles.stepperSymbol}>−</Text>
            </Pressable>
            <Text accessibilityLabel={`${age} years old`} style={styles.ageValue}>
              {age}
            </Text>
            <Pressable
              accessibilityLabel="Increase age"
              accessibilityRole="button"
              disabled={age >= 17}
              hitSlop={6}
              onPress={() => setAge((currentAge) => Math.min(17, currentAge + 1))}
              style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
            >
              <Text style={styles.stepperSymbol}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.avatarGroup}>
          <Text style={styles.fieldLabel}>CHOOSE AN AVATAR</Text>
          <View style={styles.avatarOptions}>
            {avatarOptions.map((option) => (
              <Pressable
                accessibilityLabel={`Choose ${option} avatar`}
                accessibilityRole="radio"
                accessibilityState={{ checked: avatar === option }}
                key={option}
                onPress={() => setAvatar(option)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ProfileAvatar avatar={option} selected={avatar === option} size={54} />
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.action}>
        <AuthPrimaryButton label="CREATE PROFILE" onPress={() => router.replace('/home')} />
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 16,
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
    maxWidth: 290,
    marginTop: 8,
    color: appPalette.colors.brown[500],
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    gap: 22,
    marginTop: 28,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 26,
    borderRadius: 28,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 14px 28px rgba(90, 52, 28, 0.13)',
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 2,
  },
  fieldLabel: {
    color: appPalette.colors.neutral[1000],
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  ageGroup: {
    gap: 8,
  },
  ageStepper: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: appPalette.colors.secondary[100],
    borderRadius: 12,
    backgroundColor: appColors.backgrounds.secondary,
  },
  stepperButton: {
    width: 54,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSymbol: {
    color: appPalette.colors.brown[500],
    fontSize: 22,
    lineHeight: 26,
  },
  ageValue: {
    color: appPalette.colors.neutral[1000],
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  avatarGroup: {
    gap: 12,
  },
  avatarOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  action: {
    marginTop: 26,
  },
  pressed: {
    opacity: 0.7,
  },
})
