import { SymbolView } from 'expo-symbols'
import { StyleSheet, View } from 'react-native'

import { appPalette } from '@/theme/colors'

export type ProfileAvatarId = 'explorer' | 'hare' | 'parent' | 'paw' | 'rocket'

const avatarStyles = {
  explorer: {
    backgroundColor: appPalette.colors.yellow[100],
    color: appPalette.colors.deepIndigo[400],
    icon: { ios: 'face.smiling' as const, android: 'face' as const, web: 'face' as const },
  },
  hare: {
    backgroundColor: appPalette.colors.magenta[100],
    color: appPalette.colors.magenta[400],
    icon: { ios: 'hare.fill' as const, android: 'cruelty_free' as const, web: 'cruelty_free' as const },
  },
  parent: {
    backgroundColor: appPalette.colors.purple[100],
    color: appPalette.colors.deepIndigo[400],
    icon: { ios: 'person.fill' as const, android: 'person' as const, web: 'person' as const },
  },
  paw: {
    backgroundColor: appPalette.colors.brown[100],
    color: appPalette.colors.brown[500],
    icon: { ios: 'pawprint.fill' as const, android: 'pets' as const, web: 'pets' as const },
  },
  rocket: {
    backgroundColor: appPalette.colors.purple[100],
    color: appPalette.colors.purple[400],
    icon: { ios: 'airplane' as const, android: 'rocket_launch' as const, web: 'rocket_launch' as const },
  },
} as const

type ProfileAvatarProps = {
  avatar: ProfileAvatarId
  selected?: boolean
  size?: number
}

export function ProfileAvatar({ avatar, selected = false, size = 64 }: ProfileAvatarProps) {
  const avatarStyle = avatarStyles[avatar]
  const iconSize = Math.round(size * 0.46)

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: avatarStyle.backgroundColor,
        },
        selected && styles.avatarSelected,
      ]}
    >
      <SymbolView name={avatarStyle.icon} size={iconSize} tintColor={avatarStyle.color} />
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.92)',
  },
  avatarSelected: {
    borderColor: appPalette.colors.secondary[300],
  },
})
