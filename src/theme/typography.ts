import { Platform } from 'react-native'

export const appTypography = {
  displayFont: Platform.select({
    android: 'sans-serif-condensed',
    ios: 'Arial Rounded MT Bold',
    web: "Impact, 'Arial Black', sans-serif",
    default: 'System',
  }),
} as const
