import { useRouter, useSegments, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, User } from 'firebase/auth';
import React from 'react';
import 'react-native-reanimated';
import { auth } from '../src/config/firebase';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isInitialised, setIsInitialised] = React.useState(false);

  React.useEffect(() => {
    // 1. Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsInitialised(true);
    });

    // 2. Initialize DB on start
    const setup = async () => {
      try {
        const { initHistoryDB } = await import('../src/services/historyDatabase');
        await initHistoryDB();
      } catch (e) {
        console.error("Critical: DB Init failed in RootLayout:", e);
      }
    };
    setup().catch(err => {
      console.error("Unhandled rejection in RootLayout setup():", err);
    });

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (!isInitialised) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      // Logic for redirecting to login if not authenticated
      router.replace('/');
    } else if (user && !inAuthGroup) {
      // Logic for redirecting to app if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, isInitialised]);

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
