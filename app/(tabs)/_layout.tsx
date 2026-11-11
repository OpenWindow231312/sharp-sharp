import { FloatingTabBar } from "@/components/ui/FloatingTabBar";
import { TabBarProvider } from "@/context/TabBarContext";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <TabBarProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tabs.Screen name="feed" options={{ title: "Feed" }} />
        <Tabs.Screen name="add" options={{ title: "Add" }} />
        <Tabs.Screen name="saved" options={{ title: "Saved" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </TabBarProvider>
  );
}
