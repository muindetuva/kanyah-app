import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { appColors, appPalette } from '@/theme/colors'

type ParentPinInputProps = {
  autoFocus?: boolean
  disabled?: boolean
  error?: string
  label: string
  onChange: (value: string) => void
  value: string
}

export function ParentPinInput({
  autoFocus = false,
  disabled = false,
  error,
  label,
  onChange,
  value,
}: ParentPinInputProps) {
  const inputRef = useRef<TextInput>(null)
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="none"
        onPress={() => inputRef.current?.focus()}
        style={styles.slots}
      >
        {[0, 1, 2, 3].map((index) => {
          const filled = index < value.length
          const active = focused && index === Math.min(value.length, 3)

          return (
            <View
              key={index}
              style={[
                styles.slot,
                active && styles.slotActive,
                error && styles.slotError,
              ]}
            >
              <Text style={styles.dot}>{filled ? '•' : ''}</Text>
            </View>
          )
        })}
        <TextInput
          accessibilityLabel={label}
          autoComplete="off"
          autoFocus={autoFocus}
          caretHidden
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={4}
          onBlur={() => setFocused(false)}
          onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
          onFocus={() => setFocused(true)}
          ref={inputRef}
          style={styles.hiddenInput}
          value={value}
        />
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  group: {
    gap: 10,
  },
  label: {
    color: appPalette.colors.neutral[800],
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 18,
    textAlign: 'center',
  },
  slots: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  slot: {
    width: 54,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: appPalette.colors.neutral[200],
    borderRadius: 13,
    backgroundColor: appColors.backgrounds.secondary,
  },
  slotActive: {
    borderColor: appColors.actions.secondary,
    backgroundColor: appPalette.grays.white,
  },
  slotError: {
    borderColor: appPalette.colors.primary[300],
  },
  dot: {
    color: appColors.text.primary,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 30,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0,
    outlineColor: 'transparent',
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  error: {
    color: appPalette.colors.primary[500],
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
})
