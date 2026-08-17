import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { AuthField, AuthPrimaryButton } from '@/features/auth/components/auth-ui'
import { useAuth } from '@/features/auth/context/auth-context'
import { ParentAppShell } from '@/features/navigation/components/child-app-shell'
import { getApiErrorMessage, getApiFieldError } from '@/lib/api/client'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

export default function AccountScreen() {
  const { deviceMode, isRestoring, logout, readerMode, updateAccount, updatePassword, user } =
    useAuth()
  const [accountError, setAccountError] = useState<unknown>(null)
  const [accountMessage, setAccountMessage] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSavingAccount, setIsSavingAccount] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [nameDraft, setNameDraft] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<unknown>(null)
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    if (!isRestoring && (!user || readerMode !== 'parent')) {
      router.replace(user ? '/who-is-reading' : '/login')
    }
  }, [isRestoring, readerMode, user])

  const name = nameDraft ?? user?.name ?? ''

  async function handleSaveAccount() {
    Keyboard.dismiss()
    setAccountError(null)
    setAccountMessage('')
    setIsSavingAccount(true)

    try {
      await updateAccount({ name })
      setNameDraft(null)
      setAccountMessage('Your account details have been updated.')
    } catch (submissionError) {
      setAccountError(submissionError)
    } finally {
      setIsSavingAccount(false)
    }
  }

  async function handleSavePassword() {
    Keyboard.dismiss()
    setPasswordError(null)
    setPasswordMessage('')
    setIsSavingPassword(true)

    try {
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      setConfirmPassword('')
      setCurrentPassword('')
      setNewPassword('')
      setPasswordMessage('Your password has been updated.')
      setIsChangingPassword(false)
    } catch (submissionError) {
      setPasswordError(submissionError)
    } finally {
      setIsSavingPassword(false)
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
    } catch {
      // Local credentials are cleared even when the server cannot be reached.
    } finally {
      router.replace('/')
      setIsLoggingOut(false)
    }
  }

  const deviceModeLabel =
    deviceMode === 'child'
      ? 'Child’s device'
      : deviceMode === 'shared'
        ? 'Shared family device'
        : 'Parent device'

  return (
    <ParentAppShell activeTab="profile">
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            PARENT PROFILE
          </Text>
          <Text style={styles.subtitle}>Manage your account and this device.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
          <View style={styles.formSection}>
            <AuthField
              autoCapitalize="words"
              autoComplete="name"
              editable={!isSavingAccount}
              error={getApiFieldError(accountError, 'name')}
              icon="person"
              label="NAME"
              onChangeText={(value) => {
                setNameDraft(value)
                setAccountMessage('')
              }}
              placeholder="Your full name"
              returnKeyType="done"
              textContentType="name"
              value={name}
            />
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PHONE NUMBER</Text>
            <Text style={styles.detailValue}>{user?.phone}</Text>
            <Text style={styles.helperText}>
              Phone number changes will be available once WhatsApp verification is connected.
            </Text>
          </View>
          {accountError ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {getApiErrorMessage(accountError, 'We could not update your account.')}
            </Text>
          ) : null}
          {accountMessage ? (
            <Text accessibilityRole="alert" style={styles.successText}>
              {accountMessage}
            </Text>
          ) : null}
          <AuthPrimaryButton
            disabled={isSavingAccount || !name.trim() || name.trim() === user?.name}
            label={isSavingAccount ? 'SAVING…' : 'SAVE DETAILS'}
            onPress={() => void handleSaveAccount()}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.passwordHeader}>
            <View style={styles.passwordCopy}>
              <Text style={styles.sectionTitle}>PASSWORD</Text>
              <Text style={styles.detailValue}>Keep your parent account secure.</Text>
            </View>
            {!isChangingPassword ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setIsChangingPassword(true)
                  setPasswordError(null)
                  setPasswordMessage('')
                }}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.changeDeviceLabel}>CHANGE</Text>
              </Pressable>
            ) : null}
          </View>

          {isChangingPassword ? (
            <View style={styles.passwordForm}>
              <AuthField
                autoCapitalize="none"
                autoComplete="current-password"
                editable={!isSavingPassword}
                error={getApiFieldError(passwordError, 'current_password')}
                icon="lock"
                label="CURRENT PASSWORD"
                onChangeText={setCurrentPassword}
                passwordToggle
                placeholder="Enter current password"
                textContentType="password"
                value={currentPassword}
              />
              <AuthField
                autoCapitalize="none"
                autoComplete="new-password"
                editable={!isSavingPassword}
                error={getApiFieldError(passwordError, 'password')}
                icon="lockReset"
                label="NEW PASSWORD"
                onChangeText={setNewPassword}
                passwordToggle
                placeholder="At least 8 characters"
                textContentType="newPassword"
                value={newPassword}
              />
              <AuthField
                autoCapitalize="none"
                autoComplete="new-password"
                editable={!isSavingPassword}
                error={getApiFieldError(passwordError, 'password_confirmation')}
                icon="lockReset"
                label="CONFIRM NEW PASSWORD"
                onChangeText={setConfirmPassword}
                passwordToggle
                placeholder="Repeat new password"
                returnKeyType="done"
                textContentType="newPassword"
                value={confirmPassword}
              />
              {passwordError ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {getApiErrorMessage(passwordError, 'We could not update your password.')}
                </Text>
              ) : null}
              <AuthPrimaryButton
                disabled={
                  isSavingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                label={isSavingPassword ? 'UPDATING…' : 'UPDATE PASSWORD'}
                onPress={() => void handleSavePassword()}
              />
              <Pressable
                accessibilityRole="button"
                disabled={isSavingPassword}
                onPress={() => {
                  setConfirmPassword('')
                  setCurrentPassword('')
                  setNewPassword('')
                  setPasswordError(null)
                  setIsChangingPassword(false)
                }}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              >
                <Text style={styles.cancelLabel}>CANCEL</Text>
              </Pressable>
            </View>
          ) : passwordMessage ? (
            <Text accessibilityRole="alert" style={styles.successText}>
              {passwordMessage}
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>DEVICE</Text>
          <View style={styles.divider} />
          <View style={styles.deviceRow}>
            <View style={styles.deviceCopy}>
              <Text style={styles.detailLabel}>THIS DEVICE</Text>
              <Text style={styles.detailValue}>{deviceModeLabel}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/device-setup')}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.changeDeviceLabel}>CHANGE</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isLoggingOut}
          onPress={() => void handleLogout()}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Text style={styles.logoutLabel}>{isLoggingOut ? 'LOGGING OUT…' : 'LOG OUT'}</Text>
        </Pressable>
      </ScrollView>
    </ParentAppShell>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 34,
    paddingBottom: 126,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 42,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 280,
    marginTop: 8,
    color: appPalette.colors.brown[500],
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  card: {
    gap: 18,
    marginTop: 22,
    borderRadius: 22,
    backgroundColor: appPalette.grays.white,
    padding: 20,
  },
  sectionTitle: {
    color: appColors.text.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  formSection: {
    gap: 16,
  },
  detailRow: {
    gap: 5,
  },
  detailLabel: {
    color: appPalette.colors.neutral[700],
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  detailValue: {
    color: appColors.text.primary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  helperText: {
    marginTop: 3,
    color: appPalette.colors.neutral[600],
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: appPalette.colors.red[200],
    fontSize: 13,
    lineHeight: 18,
  },
  successText: {
    color: appPalette.colors.green[200],
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  passwordCopy: {
    flex: 1,
    gap: 5,
  },
  passwordForm: {
    gap: 18,
  },
  cancelButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    color: appColors.actions.secondary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  deviceRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  deviceCopy: {
    flex: 1,
    gap: 5,
  },
  changeDeviceLabel: {
    color: appColors.actions.secondary,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: appPalette.colors.brown[100],
  },
  logoutButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    borderWidth: 2,
    borderColor: appColors.actions.primary,
    borderRadius: 999,
  },
  logoutLabel: {
    color: appColors.actions.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
})
