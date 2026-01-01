import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { theme } from '../../src/styles/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    backgroundColor: 'transparent',
                    height: 80,
                },
                tabBarBackground: () => (
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                ),
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 10,
                    fontWeight: '600'
                },
                tabBarItemStyle: {
                    paddingTop: 10,
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Translate',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="camera-outline" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time-outline" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={28} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
