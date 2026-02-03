import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { login, register } from '../api/auth';
import { isAppleAuthAvailable, signInWithAppleToken, signInWithGoogleToken } from '../api/socialAuth';
import { theme } from '../styles/theme';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Button } from '../components/ui/Button';

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

    useEffect(() => {
        checkAppleAuth();
        configureGoogleSignIn();
    }, []);

    const configureGoogleSignIn = () => {
        GoogleSignin.configure({
            webClientId: '736369571076-4oag5ad2rss77dflac5uiemfiohk3cn7.apps.googleusercontent.com',
            offlineAccess: true,
        });
    };

    const checkAppleAuth = async () => {
        const available = await isAppleAuthAvailable();
        setAppleAuthAvailable(available);
    };

    const handleGoogleToken = async (token: string) => {
        setLoading(true);
        try {
            await signInWithGoogleToken(token);
        } catch (error: any) {
            Alert.alert('Google Login Failed', error.message);
            setLoading(false);
        }
    };

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Required Fields', 'Please enter both your email and password.');
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
            Alert.alert('Authentication Failed', error.message);
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const token = userInfo.data?.idToken;
            if (token) {
                handleGoogleToken(token);
            } else {
                throw new Error('No ID token from Google');
            }
        } catch (error: any) {
            if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
                console.error("Google Sign-In Exception:", error);
                Alert.alert('Google Sign-In Error', error.message || 'Unknown error');
            }
        }
    };

    return (
        <ScreenWrapper statusBarStyle="dark-content">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="paw" size={60} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.title}>Dog Translator</Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Welcome back! Sign in to continue.' : 'Create an account to save your dog translations.'}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <Button
                            title={isLogin ? 'Sign In' : 'Create Account'}
                            onPress={handleAuth}
                            loading={loading}
                            style={styles.submitButton}
                        />

                        <TouchableOpacity 
                            onPress={() => setIsLogin(!isLogin)} 
                            style={styles.switchButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.switchText}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <Text style={styles.switchAction}>{isLogin ? 'Sign Up' : 'Log In'}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialContainer}>
                            <Button
                                title="Google"
                                variant="secondary"
                                icon={<Ionicons name="logo-google" size={20} color={theme.colors.primary} />}
                                onPress={handleGoogleSignIn}
                                style={styles.socialButton}
                            />

                            {appleAuthAvailable && (
                                <Button
                                    title="Apple"
                                    variant="secondary"
                                    icon={<Ionicons name="logo-apple" size={20} color="#000" />}
                                    onPress={() => Alert.alert('Coming Soon', 'Apple Sign-In will be available in the next update.')}
                                    style={styles.socialButton}
                                />
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.l,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        ...theme.shadows.card,
    },
    title: {
        ...theme.typography.h1,
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        ...theme.typography.subheadline,
        textAlign: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: theme.spacing.m,
    },
    label: {
        ...theme.typography.caption,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
        marginLeft: theme.spacing.xs,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 16,
        color: theme.colors.text,
        fontSize: 17,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
    },
    submitButton: {
        marginTop: theme.spacing.m,
    },
    switchButton: {
        marginTop: theme.spacing.l,
        alignItems: 'center',
    },
    switchText: {
        ...theme.typography.subheadline,
    },
    switchAction: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    footer: {
        marginTop: theme.spacing.xl,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.separator,
    },
    dividerText: {
        ...theme.typography.caption,
        fontWeight: '700',
        paddingHorizontal: theme.spacing.m,
        color: theme.colors.textSecondary,
    },
    socialContainer: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    socialButton: {
        flex: 1,
    }
});
