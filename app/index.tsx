import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../src/config/firebase';
import LoginScreen from '../src/screens/LoginScreen';
import { theme } from '../src/styles/theme';

import { Redirect } from 'expo-router';

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthenticatedUser(user);
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!authenticatedUser) {
        return <LoginScreen onLoginSuccess={() => { }} />;
    }

    return <Redirect href="/(tabs)" />;
}
