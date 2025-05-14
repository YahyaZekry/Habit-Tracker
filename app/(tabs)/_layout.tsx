import { Tabs } from 'expo-router';
import {
  Calendar,
  Chrome as Home,
  ChartBar as BarChart3,
  Settings,
} from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { COLORS, LIGHT_THEME, DARK_THEME } from '../../utils/colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === null ? false : colorScheme === 'dark';
  const tabBarActiveTintColor = isDark
    ? COLORS.primary.light
    : COLORS.primary.main;
  const tabBarInactiveTintColor = isDark ? COLORS.grey[400] : COLORS.grey[500];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0.5,
          borderTopColor: isDark ? DARK_THEME.divider : LIGHT_THEME.divider,
          backgroundColor: isDark
            ? DARK_THEME.background.paper
            : LIGHT_THEME.background.paper,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark
            ? DARK_THEME.background.paper
            : LIGHT_THEME.background.paper,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: isDark ? DARK_THEME.text.primary : LIGHT_THEME.text.primary,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
