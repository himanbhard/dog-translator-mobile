import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { User } from 'firebase/auth';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ScannerScreen from '../screens/ScannerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PetListScreen from '../screens/PetListScreen';
import AddPetScreen from '../screens/AddPetScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const PetStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PetList" component={PetListScreen} />
        <Stack.Screen name="AddPet" component={AddPetScreen} />
    </Stack.Navigator>
);

const HistoryStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTitleStyle: theme.typography.headline,
            headerShadowVisible: false,
        }}
    >
        <Stack.Screen name="HistoryList" component={HistoryScreen} options={{ title: 'History' }} />
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ title: 'Analysis' }} />
    </Stack.Navigator>
);

const MainTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName = 'paw';
                if (route.name === 'Scan') iconName = focused ? 'scan' : 'scan-outline';
                else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
                else if (route.name === 'Pets') iconName = focused ? 'paw' : 'paw-outline';
                else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopWidth: 0.5,
                borderTopColor: theme.colors.separator
            },
            headerShown: false,
        })}
    >
        <Tab.Screen name="Scan" component={ScannerScreen} />
        <Tab.Screen name="Pets" component={PetStack} />
        <Tab.Screen name="History" component={HistoryStack} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
);

export const RootNavigator = ({ user }: { user: User | null }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                <Stack.Screen name="Auth" component={LoginScreen} />
            ) : (
                <>
                    <Stack.Screen name="Main" component={MainTabs} />
                    <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
                </>
            )}
        </Stack.Navigator>
    );
};
