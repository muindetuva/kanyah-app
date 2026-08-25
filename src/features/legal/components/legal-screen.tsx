import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

import { AuthBackButton, AuthShell } from '@/features/auth/components/auth-ui'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

export type LegalSection = {
  body: string
  title: string
}

type LegalScreenProps = {
  intro: string
  sections: LegalSection[]
  title: string
}

export function LegalScreen({ intro, sections, title }: LegalScreenProps) {
  function goBack() {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/signup')
  }

  return (
    <AuthShell contentStyle={styles.content}>
      <AuthBackButton onPress={goBack} />

      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.updated}>Last updated: 25 August 2026</Text>
      </View>

      <View style={styles.document}>
        <Text style={styles.intro}>{intro}</Text>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {section.title}
            </Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
  },
  header: {
    marginTop: 28,
  },
  title: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
  },
  updated: {
    marginTop: 6,
    color: appPalette.colors.neutral[600],
    fontSize: 13,
    lineHeight: 18,
  },
  document: {
    gap: 22,
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 26,
    borderRadius: 24,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 12px 26px rgba(90, 52, 28, 0.12)',
  },
  intro: {
    color: appColors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    gap: 7,
  },
  sectionTitle: {
    color: appColors.text.primary,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
  body: {
    color: appPalette.colors.neutral[800],
    fontSize: 15,
    lineHeight: 23,
  },
})
