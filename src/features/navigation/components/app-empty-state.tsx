import { SymbolView } from 'expo-symbols'
import type { ComponentProps } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

type AppEmptyStateProps = {
  body: string
  icon: ComponentProps<typeof SymbolView>['name']
  title: string
}

export function AppEmptyState({ body, icon, title }: AppEmptyStateProps) {
  return (
    <View style={styles.page}>
      <View style={styles.iconFrame}>
        <SymbolView name={icon} size={34} tintColor={appPalette.colors.primary[500]} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    paddingTop: 48,
    paddingBottom: 118,
  },
  iconFrame: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 8px 18px rgba(90, 52, 28, 0.1)',
  },
  title: {
    marginTop: 22,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
    textAlign: 'center',
  },
  body: {
    maxWidth: 300,
    marginTop: 9,
    color: appColors.text.secondary,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
})
