import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/shared/ui/haptic-tab';
import { IconSymbol } from '@/shared/ui/icon-symbol';
import { Colors } from '@/shared/theme/theme';
import { useColorScheme } from '@/shared/lib/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
