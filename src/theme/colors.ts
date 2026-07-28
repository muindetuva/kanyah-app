export const appPalette = {
  brand: {
    ink: '#332256',
  },
  colors: {
    primary: {
      100: '#FACAB5',
      200: '#F6956C',
      300: '#F16022',
      400: '#C8450D',
      500: '#8D3109',
      10: 'rgba(241, 96, 34, 0.1)',
    },
    secondary: {
      100: '#AFD0EF',
      200: '#60A1DE',
      300: '#2671B8',
      400: '#1E588F',
      500: '#153F67',
      10: 'rgba(38, 113, 184, 0.1)',
    },
    neutral: {
      100: '#F0EFEF',
      200: '#D4D1D1',
      300: '#B8B4B4',
      400: '#9C9797',
      500: '#807B7A',
      600: '#63605F',
      700: '#484645',
      800: '#2F2E2D',
      900: '#20201F',
      1000: '#272827',
      10: 'rgba(39, 40, 39, 0.1)',
    },
    magenta: {
      100: '#F1BCD1',
      200: '#E478A3',
      300: '#D63575',
      400: '#AC2359',
      500: '#7A193F',
      10: 'rgba(214, 53, 117, 0.1)',
      50: 'rgba(214, 53, 117, 0.5)',
    },
    purple: {
      100: '#CFCBE2',
      200: '#A079C5',
      300: '#70439A',
      400: '#573478',
      500: '#3E2556',
      10: 'rgba(112, 67, 154, 0.1)',
      50: 'rgba(112, 67, 154, 0.5)',
    },
    deepIndigo: {
      100: '#AC8CD7',
      200: '#8253C3',
      300: '#5D3494',
      400: '#39205B',
      500: '#221337',
      10: 'rgba(57, 32, 91, 0.1)',
      50: 'rgba(57, 32, 91, 0.5)',
    },
    brown: {
      100: '#E7C7B3',
      200: '#D08F67',
      300: '#A15C32',
      400: '#7E4827',
      500: '#5A341C',
      10: 'rgba(161, 92, 50, 0.1)',
      50: 'rgba(161, 92, 50, 0.5)',
    },
    red: {
      100: '#FB3748',
      200: '#D00416',
      10: 'rgba(251, 55, 72, 0.1)',
    },
    yellow: {
      100: '#FFDB43',
      200: '#DFB400',
      10: 'rgba(255, 219, 67, 0.1)',
    },
    green: {
      100: '#84EBB4',
      200: '#1FC16B',
      10: 'rgba(31, 193, 107, 0.1)',
    },
  },
  grays: {
    white: '#FFFFFF',
  },
} as const

export const appColors = {
  actions: {
    primary: appPalette.colors.primary[300],
    secondary: appPalette.colors.secondary[300],
  },
  backgrounds: {
    primary: appPalette.grays.white,
    secondary: '#F2F2F7',
  },
  overlays: {
    marigoldWash: appPalette.colors.neutral[100],
  },
  text: {
    onPrimary: appPalette.grays.white,
    primary: appPalette.brand.ink,
    secondary: appPalette.colors.brown[500],
  },
} as const
