import { router } from 'expo-router'
import { useState } from 'react'
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native'

import {
  AuthBackButton,
  AuthField,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/components/auth-ui'
import { useAuth } from '@/features/auth/context/auth-context'
import { getApiErrorMessage, getApiFieldError } from '@/lib/api/client'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

function goBack() {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.replace('/')
}

export default function SignUpScreen() {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const { register } = useAuth()

  async function handleSubmit() {
    Keyboard.dismiss()
    setError(null)
    setIsSubmitting(true)

    try {
      await register({
        name: name.trim(),
        phone,
        password,
        password_confirmation: confirmPassword,
        terms: agreedToTerms,
      })
      router.dismissAll()
      router.replace('/create-profile')
    } catch (submissionError) {
      setError(submissionError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell contentStyle={styles.scrollContent}>
      <AuthBackButton onPress={goBack} />

      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          CREATE YOUR{`\n`}ACCOUNT
        </Text>
        <Text style={styles.subtitle}>Join our storytelling adventure.</Text>
      </View>

      <View style={styles.card}>
        <View accessibilityElementsHidden style={styles.cardDecoration} />

        <View style={styles.form}>
          <AuthField
            autoComplete="name"
            editable={!isSubmitting}
            error={getApiFieldError(error, 'name')}
            icon="person"
            label="FULL NAME"
            onChangeText={setName}
            placeholder="Your full name"
            returnKeyType="next"
            textContentType="name"
            value={name}
          />
          <AuthField
            autoComplete="tel"
            editable={!isSubmitting}
            error={getApiFieldError(error, 'phone')}
            icon="phone"
            keyboardType="phone-pad"
            label="PHONE NUMBER"
            onChangeText={setPhone}
            placeholder="+254 712345678"
            returnKeyType="next"
            textContentType="telephoneNumber"
            value={phone}
          />
          <AuthField
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!isSubmitting}
            error={getApiFieldError(error, 'password')}
            icon="lock"
            label="PASSWORD"
            onChangeText={setPassword}
            passwordToggle
            placeholder="Min. 8 characters"
            returnKeyType="next"
            textContentType="newPassword"
            value={password}
          />
          <AuthField
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!isSubmitting}
            error={getApiFieldError(error, 'password_confirmation')}
            icon="lockReset"
            label="CONFIRM PASSWORD"
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            returnKeyType="done"
            secureTextEntry
            textContentType="newPassword"
            value={confirmPassword}
          />
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreedToTerms }}
          onPress={() => setAgreedToTerms((agreed) => !agreed)}
          style={({ pressed }) => [styles.termsRow, pressed && styles.pressed]}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.linkText}>Terms</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </Pressable>
        {getApiFieldError(error, 'terms') ? (
          <Text style={styles.termsError}>{getApiFieldError(error, 'terms')}</Text>
        ) : null}

        {error ? (
          <Text accessibilityRole="alert" style={styles.submissionError}>
            {getApiErrorMessage(error, 'We could not create your account. Please try again.')}
          </Text>
        ) : null}

        <AuthPrimaryButton
          disabled={isSubmitting}
          label={isSubmitting ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
          onPress={() => void handleSubmit()}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => router.replace('/login')}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.footerLink}>Log in here</Text>
          </Pressable>
        </View>
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    marginTop: 34,
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
    marginTop: 6,
    color: appPalette.colors.brown[500],
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 30,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    borderRadius: 28,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 14px 28px rgba(90, 52, 28, 0.13)',
  },
  cardDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 130,
    height: 92,
    borderBottomLeftRadius: 110,
    backgroundColor: '#FBF8FF',
    pointerEvents: 'none',
  },
  form: {
    gap: 17,
  },
  termsRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  termsError: {
    marginTop: -8,
    color: appPalette.colors.primary[500],
    fontSize: 12,
    lineHeight: 16,
  },
  submissionError: {
    marginBottom: 10,
    color: appPalette.colors.primary[500],
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: appPalette.colors.secondary[100],
    borderRadius: 4,
    backgroundColor: appColors.backgrounds.secondary,
  },
  checkboxChecked: {
    borderColor: appColors.actions.secondary,
    backgroundColor: appColors.actions.secondary,
  },
  checkmark: {
    color: appColors.text.onPrimary,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  termsText: {
    flex: 1,
    color: appPalette.colors.brown[500],
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: appColors.actions.secondary,
  },
  footerRow: {
    minHeight: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  footerText: {
    color: appPalette.colors.brown[500],
    fontSize: 14,
    lineHeight: 20,
  },
  footerLink: {
    color: appColors.actions.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
})
