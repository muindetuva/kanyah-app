import { Tabs } from 'expo-router'

export default function AppTabsLayout() {
  return (
    <Tabs
      backBehavior="history"
      initialRouteName="home"
      screenOptions={{ headerShown: false }}
      tabBar={() => null}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="parent-home" />
      <Tabs.Screen name="stories" />
    </Tabs>
  )
}
