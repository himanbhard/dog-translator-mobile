import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary to prevent white-screen crashes.
 * Follows HIG for error presentation.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("🛡️ [ErrorBoundary] Uncaught error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.safe}>
                    <View style={styles.container}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="alert-circle" size={60} color={theme.colors.error} />
                        </View>
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.subtitle}>
                            An unexpected error occurred. Our team has been notified.
                        </Text>
                        
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText} numberOfLines={3}>
                                {this.state.error?.message || 'Unknown Error'}
                            </Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={this.handleRetry}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    iconContainer: {
        marginBottom: theme.spacing.l,
    },
    title: {
        ...theme.typography.h2,
        textAlign: 'center',
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    errorBox: {
        width: '100%',
        backgroundColor: theme.colors.surfaceSecondary,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.xxl,
    },
    errorText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: theme.borderRadius.round,
        ...theme.shadows.button,
    },
    buttonText: {
        ...theme.typography.button,
    },
});
