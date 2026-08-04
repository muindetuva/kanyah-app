import { SymbolView } from 'expo-symbols'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { KanyahScreenBackground } from '@/components/kanyah-screen-background'
import { MobileFrame } from '@/components/mobile-frame'
import { appColors, appPalette } from '@/theme/colors'

type AuthIconName = 'arrowBack' | 'arrowForward' | 'eye' | 'eyeOff' | 'lock' | 'lockReset' | 'person' | 'phone'

const iconNames = {
  arrowBack: { ios: 'arrow.left' as const, android: 'arrow_back' as const, web: 'arrow_back' as const },
  arrowForward: { ios: 'arrow.right' as const, android: 'arrow_forward' as const, web: 'arrow_forward' as const },
  eye: { ios: 'eye' as const, android: 'visibility' as const, web: 'visibility' as const },
  eyeOff: { ios: 'eye.slash' as const, android: 'visibility_off' as const, web: 'visibility_off' as const },
  lock: { ios: 'lock' as const, android: 'lock_outline' as const, web: 'lock_outline' as const },
  lockReset: { ios: 'lock.rotation' as const, android: 'lock_reset' as const, web: 'lock_reset' as const },
  person: { ios: 'person' as const, android: 'person_outline' as const, web: 'person_outline' as const },
  phone: { ios: 'phone' as const, android: 'phone' as const, web: 'phone' as const },
} as const

type AuthIconProps = {
  color?: string
  name: AuthIconName
  size?: number
}

export function AuthIcon({ color = appPalette.colors.brown[500], name, size = 21 }: AuthIconProps) {
  return <SymbolView name={iconNames[name]} size={size} tintColor={color} />
}

type AuthShellProps = {
  children: ReactNode
  contentStyle?: StyleProp<ViewStyle>
}

export function AuthShell({ children, contentStyle }: AuthShellProps) {
  return (
    <MobileFrame
      backgroundColor={appColors.backgrounds.primary}
      frameColor={appColors.backgrounds.secondary}
    >
      <KanyahScreenBackground>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <ScrollView
              bounces={false}
              contentContainerStyle={[styles.scrollContent, contentStyle]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.screenContent}>{children}</View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </KanyahScreenBackground>
    </MobileFrame>
  )
}

type AuthBackButtonProps = {
  onPress: () => void
}

export function AuthBackButton({ onPress }: AuthBackButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <AuthIcon name="arrowBack" size={24} />
    </Pressable>
  )
}

type AuthFieldProps = TextInputProps & {
  error?: string
  icon: Extract<AuthIconName, 'lock' | 'lockReset' | 'person' | 'phone'>
  label: string
  passwordToggle?: boolean
}

export function AuthField({ error, icon, label, passwordToggle = false, secureTextEntry, ...inputProps }: AuthFieldProps) {
  const [focused, setFocused] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isSecure = passwordToggle ? !passwordVisible : secureTextEntry

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputFrame, focused && styles.inputFrameFocused, error && styles.inputFrameError]}>
        <AuthIcon name={icon} />
        <TextInput
          {...inputProps}
          onBlur={(event) => {
            setFocused(false)
            inputProps.onBlur?.(event)
          }}
          onFocus={(event) => {
            setFocused(true)
            inputProps.onFocus?.(event)
          }}
          placeholderTextColor={appPalette.colors.neutral[400]}
          secureTextEntry={isSecure}
          style={styles.input}
        />
        {passwordToggle ? (
          <Pressable
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={({ pressed }) => [styles.inputAction, pressed && styles.pressed]}
          >
            <AuthIcon name={passwordVisible ? 'eyeOff' : 'eye'} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  )
}

type AuthPrimaryButtonProps = {
  disabled?: boolean
  label: string
  onPress: () => void
}

export function AuthPrimaryButton({ disabled = false, label, onPress }: AuthPrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.primaryButtonLabel}>{label}</Text>
      <AuthIcon color={appColors.text.onPrimary} name="arrowForward" size={20} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  screenContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 390,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  pressed: {
    opacity: 0.72,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: appPalette.colors.neutral[1000],
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  inputFrame: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: appPalette.colors.secondary[100],
    borderRadius: 12,
    backgroundColor: appColors.backgrounds.secondary,
  },
  inputFrameFocused: {
    borderColor: appPalette.colors.secondary[300],
  },
  inputFrameError: {
    borderColor: appPalette.colors.primary[300],
  },
  fieldError: {
    color: appPalette.colors.primary[500],
    fontSize: 12,
    lineHeight: 16,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    minWidth: 0,
    paddingVertical: 0,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    color: appPalette.colors.neutral[1000],
    fontSize: 16,
    lineHeight: 21,
    outlineColor: 'transparent',
    outlineStyle: 'solid',
    outlineWidth: 0,
    textAlignVertical: 'center',
  },
  inputAction: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -6,
  },
  primaryButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: appColors.actions.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonLabel: {
    color: appColors.text.onPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
})
