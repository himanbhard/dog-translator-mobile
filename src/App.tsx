import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { auth } from './config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { RootNavigator } from './navigation';
import { ErrorBoundary } from './components/ErrorBoundary';

import { initHistoryDB } from './services/historyDatabase';

const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize Database
        initHistoryDB();

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) return null;

    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <NavigationContainer>
                    <RootNavigator user={user} />
                </NavigationContainer>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
};

export default App;
