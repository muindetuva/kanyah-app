import type { ReactNode } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'

type MobileFrameProps = {
  backgroundColor: string
  children: ReactNode
  frameColor: string
}

export function MobileFrame({ backgroundColor, children, frameColor }: MobileFrameProps) {
  const { width } = useWindowDimensions()
  const shouldFrame = width >= 768

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor,
        },
        shouldFrame && styles.rootDesktop,
      ]}
    >
      <View
        style={[
          styles.frame,
          {
            backgroundColor: frameColor,
          },
          shouldFrame && styles.frameDesktop,
        ]}
      >
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootDesktop: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  frame: {
    flex: 1,
    width: '100%',
  },
  frameDesktop: {
    maxWidth: 560,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#F0EFEF',
    borderRadius: 30,
  },
})
