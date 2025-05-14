import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { HabitProvider } from '../context/HabitContext';
import { ThemeProvider, useAppTheme } from '../context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function AppContent() {
  const { effectiveTheme } = useAppTheme();

  return (
    <HabitProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
    </HabitProvider>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
