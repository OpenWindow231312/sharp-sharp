import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Book, PlusCircle, Bookmark, User } from 'phosphor-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { theme } from '@/constants/designTheme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.colors.indigo,
        tabBarInactiveTintColor: theme.colors.inkSoft,
        tabBarLabelStyle: { fontFamily: theme.fonts.bodySemibold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          ...theme.shadow.soft,
        },
      }}>
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Book size={24} weight={focused ? 'fill' : 'regular'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, focused }) => (
            <PlusCircle size={24} weight={focused ? 'fill' : 'regular'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <Bookmark size={24} weight={focused ? 'fill' : 'regular'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User size={24} weight={focused ? 'fill' : 'regular'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
