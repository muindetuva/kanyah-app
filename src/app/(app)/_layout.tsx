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
      <Tabs.Screen name="watch" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="stories" />
    </Tabs>
  )
}
