
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

export default function RootLayout() {
  React.useEffect(() => {
    // Initialize DB on start
    const setup = async () => {
      try {
        const { initHistoryDB } = await import('../src/services/historyDatabase');
        await initHistoryDB();
      } catch (e) {
        console.error("DB Init failed:", e);
      }
    };
    setup();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="history" options={{
          headerShown: true,
          headerTitle: 'Journey Log',
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff'
        }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
