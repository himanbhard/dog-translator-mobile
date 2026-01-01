import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login, register } from '../api/auth';
import { isAppleAuthAvailable, signInWithAppleToken, signInWithGoogleToken } from '../api/socialAuth';
import { theme } from '../styles/theme';

WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

    // Google Sign-In Hook
    // Construct the Proxy Redirect URI dynamically
    const owner = Constants.expoConfig?.owner || 'anonymous';
    const slug = Constants.expoConfig?.slug || 'dog-translator-android';
    const proxyRedirectUri = `https://auth.expo.io/@${owner}/${slug}`;

    // Google Sign-In Hook - using the proxy URI for Expo Go compatibility
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: '736369571076-4oag5ad2rss77dflac5uiemfiohk3cn7.apps.googleusercontent.com',
        iosClientId: '736369571076-4oag5ad2rss77dflac5uiemfiohk3cn7.apps.googleusercontent.com',
        androidClientId: '736369571076-4oag5ad2rss77dflac5uiemfiohk3cn7.apps.googleusercontent.com',
        redirectUri: proxyRedirectUri
    });

    useEffect(() => {
        checkAppleAuth();
    }, []);

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleToken(id_token);
        } else if (response?.type === 'error') {
            Alert.alert('Google Sign-In Error', response.error?.message || 'Unknown error');
            setLoading(false);
        }
    }, [response]);

    const checkAppleAuth = async () => {
        const available = await isAppleAuthAvailable();
        setAppleAuthAvailable(available);
    };

    const handleGoogleToken = async (token: string) => {
        setLoading(true);
        try {
            await signInWithGoogleToken(token);
            // Success handled by auth listener in App.tsx
        } catch (error: any) {
            Alert.alert('Google Login Failed', error.message);
            setLoading(false);
        }
    };

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
        } catch (error: any) {
            const message = error.message || (isLogin ? 'Login failed' : 'Registration failed');
            Alert.alert('Error', message);
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        // Use expo-auth-session prompt
        try {
            console.log("🔵 DEBUG: Starting Google Sign-In");
            console.log("   🔗 REQUIRED REDIRECT URI (USE THIS):", proxyRedirectUri);
            console.log("   (Add this exact URI to Google Cloud Console > Web Client ID)");

            await promptAsync();
        } catch (error: any) {
            console.error("🔴 Google Sign-In Exception:", error);
            Alert.alert('Google Sign-In Error', error.message);
            setLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setLoading(true);
        try {
            // Check if Apple Authentication is available (iOS 13+)
            const isAvailable = await AppleAuthentication.isAvailableAsync();
            if (!isAvailable) throw new Error('Apple Sign-In is not available');

            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            // Sign in with Firebase using the Apple credential
            if (credential.identityToken) {
                await signInWithAppleToken(credential.identityToken, credential.authorizationCode!);
            } else {
                throw new Error('No identity token received from Apple');
            }
            // Success handled by auth listener
        } catch (error: any) {
            if (error.code !== 'ERR_REQUEST_CANCELED') {
                Alert.alert('Apple Sign-In Failed', error.message);
            }
            setLoading(false);
        }
    };



    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAuth}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or continue with</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialContainer}>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <Ionicons name="logo-google" size={24} color="white" />
                        <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>

                    {appleAuthAvailable && (
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleAppleSignIn}
                            disabled={loading}
                        >
                            <Ionicons name="logo-apple" size={24} color="white" />
                            <Text style={styles.socialButtonText}>Apple</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                    <Text style={styles.switchText}>
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        padding: 30,
        backgroundColor: theme.colors.glass,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: theme.colors.textSecondary,
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 12,
        padding: 15,
        color: theme.colors.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    switchButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.glassBorder,
    },
    dividerText: {
        color: theme.colors.textSecondary,
        paddingHorizontal: 10,
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 10,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    socialButtonText: {
        color: 'white',
        marginLeft: 10,
        fontWeight: '600',
    }
});
