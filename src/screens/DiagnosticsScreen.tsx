import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { theme } from '../styles/theme';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Button } from '../components/ui/Button';
import { auth } from '../config/firebase';
import axios from 'axios';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Direct API URLs for testing (bypasses client interceptors)
// Direct API URLs for testing (bypasses client interceptors)
const API_URL = 'https://dog-translator-service-qmvz4dws7a-ue.a.run.app';
const API_URL_ALT = 'https://dog-translator-service-qmvz4dws7a-ue.a.run.app';

// Create a fresh axios instance with no interceptors
const freshAxios = axios.create({
    timeout: 15000,
    headers: {
        'Accept': 'application/json',
    },
});

interface DiagnosticResult {
    name: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    details?: string;
}

export default function DiagnosticsScreen() {
    const [results, setResults] = useState<DiagnosticResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const updateResult = (name: string, status: DiagnosticResult['status'], message: string, details?: string) => {
        setResults(prev => {
            const existing = prev.findIndex(r => r.name === name);
            const newResult = { name, status, message, details };
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = newResult;
                return updated;
            }
            return [...prev, newResult];
        });
    };

    const runDiagnostics = async () => {
        setIsRunning(true);
        setResults([]);

        // Test 1: Check Environment Variables
        updateResult('Environment', 'pending', 'Checking...');
        const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
        if (envApiUrl) {
            updateResult('Environment', 'success', 'API URL configured', `URL: ${envApiUrl}`);
        } else {
            updateResult('Environment', 'error', 'EXPO_PUBLIC_API_URL not set', 'Using fallback URL');
        }

        // Test 2: Check Firebase Auth State
        updateResult('Firebase Auth', 'pending', 'Checking...');
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                updateResult('Firebase Auth', 'success', 'User authenticated', `Email: ${currentUser.email}`);
            } else {
                updateResult('Firebase Auth', 'error', 'No user logged in', 'You must be logged in to use the app');
            }
        } catch (e: any) {
            updateResult('Firebase Auth', 'error', 'Firebase error', e.message);
        }

        // Test 3: Get Firebase Token
        updateResult('Firebase Token', 'pending', 'Getting token...');
        let idToken: string | null = null;
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                idToken = await currentUser.getIdToken();
                updateResult('Firebase Token', 'success', 'Token retrieved', `Length: ${idToken?.length} chars`);
            } else {
                updateResult('Firebase Token', 'error', 'No user to get token from', '');
            }
        } catch (e: any) {
            updateResult('Firebase Token', 'error', 'Failed to get token', e.message);
        }

        // Test 4: API Health Check using fresh AXIOS (no interceptors)
        updateResult('API (fresh axios)', 'pending', 'Checking backend...');
        try {
            const response = await freshAxios.get(`${API_URL}/health`);
            if (response.data?.status === 'ok') {
                updateResult('API (fresh axios)', 'success', 'Backend is healthy', JSON.stringify(response.data));
            } else {
                updateResult('API (fresh axios)', 'error', 'Unexpected response', JSON.stringify(response.data));
            }
        } catch (e: any) {
            const errorDetails = `Code: ${e.code || 'N/A'}, Message: ${e.message}, Config URL: ${e.config?.url || 'N/A'}`;
            updateResult('API (fresh axios)', 'error', 'Cannot reach backend', errorDetails);
        }

        // Test 4b: Try the alternate Cloud Run URL
        updateResult('API (alt URL)', 'pending', 'Trying alternate URL...');
        try {
            const response = await freshAxios.get(`${API_URL_ALT}/health`);
            if (response.data?.status === 'ok') {
                updateResult('API (alt URL)', 'success', 'Alt URL works!', `URL: ${API_URL_ALT}`);
            } else {
                updateResult('API (alt URL)', 'error', 'Unexpected response', JSON.stringify(response.data));
            }
        } catch (e: any) {
            updateResult('API (alt URL)', 'error', 'Alt URL failed too', e.message);
        }

        // Test 5: API Health Check (Authenticated)
        updateResult('API Health (Auth)', 'pending', 'Checking health with token...');
        if (idToken) {
            try {
                const response = await freshAxios.get(`${API_URL}/health`, {
                    headers: { Authorization: `Bearer ${idToken}` }
                });
                updateResult('API Health (Auth)', 'success', 'Authenticated health check OK', JSON.stringify(response.data));
            } catch (e: any) {
                updateResult('API Health (Auth)', 'error', 'Authenticated health failed', e.message);
            }
        } else {
            updateResult('API Health (Auth)', 'error', 'Skipped - no token', '');
        }

        // Test 6: API POST Check (No Image)
        updateResult('API POST Test', 'pending', 'Testing POST /api/v1/interpret...');
        if (idToken) {
            try {
                const response = await freshAxios.post(`${API_URL}/api/v1/interpret`,
                    { tone: 'playful' }, // Intentional missing image to see server response
                    { headers: { Authorization: `Bearer ${idToken}` } }
                );
                updateResult('API POST Test', 'success', 'POST reached server', JSON.stringify(response.data));
            } catch (e: any) {
                // 422 is expected here since image is missing, but it proves we reached the server!
                const status = e.response?.status;
                if (status === 422) {
                    updateResult('API POST Test', 'success', 'Reached server (422 = Image missing as expected)', JSON.stringify(e.response.data));
                } else {
                    updateResult('API POST Test', 'error', `POST failed with ${status || 'Network Error'}`, e.message);
                }
            }
        }

        // Test 7: API Health Check using native FETCH
        updateResult('API Health (fetch)', 'pending', 'Checking with fetch...');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const fetchResponse = await fetch(`${API_URL}/health`, {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const fetchData = await fetchResponse.text();
            if (fetchResponse.ok) {
                updateResult('API Health (fetch)', 'success', 'Fetch works!', `Status: ${fetchResponse.status}, Data: ${fetchData}`);
            } else {
                updateResult('API Health (fetch)', 'error', `HTTP ${fetchResponse.status}`, fetchData);
            }
        } catch (e: any) {
            updateResult('API Health (fetch)', 'error', 'Fetch failed', `${e.name}: ${e.message}`);
        }

        // Test 8: Test with different Cloud Run URL (HTTP/2 issue detection)
        updateResult('Alt Endpoint', 'pending', 'Testing alternate endpoint...');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${API_URL}/`, {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            updateResult('Alt Endpoint', 'success', `Root endpoint: ${response.status}`, `OK: ${response.ok}`);
        } catch (e: any) {
            updateResult('Alt Endpoint', 'error', 'Alt endpoint failed', e.message);
        }

        // Test 9: API Auth Check (requires token)
        updateResult('API Auth', 'pending', 'Testing authenticated request...');
        if (idToken) {
            try {
                const response = await axios.get(`${API_URL}/api/v1/me`, {
                    headers: { Authorization: `Bearer ${idToken}` },
                    timeout: 10000,
                });
                updateResult('API Auth', 'success', 'Auth working', JSON.stringify(response.data));
            } catch (e: any) {
                const status = e.response?.status;
                const data = e.response?.data;
                if (status === 401) {
                    updateResult('API Auth', 'error', '401 Unauthorized', 'Token may be invalid or expired');
                } else if (status === 404) {
                    updateResult('API Auth', 'success', 'Auth header sent (404 = endpoint not found)', '');
                } else if (e.code === 'ECONNABORTED') {
                    updateResult('API Auth', 'error', 'Request timeout', e.message);
                } else {
                    updateResult('API Auth', 'error', `Error ${status || 'NETWORK'}`, JSON.stringify(data) || e.message);
                }
            }
        } else {
            updateResult('API Auth', 'error', 'Skipped - no token available', '');
        }

        // Test 8: Network Reachability (Google)
        updateResult('Network (Google)', 'pending', 'Testing network...');
        try {
            const response = await axios.get('https://www.google.com', { timeout: 5000 });
            updateResult('Network (Google)', 'success', 'Internet connection OK', `Status: ${response.status}`);
        } catch (e: any) {
            updateResult('Network (Google)', 'error', 'No internet connection', e.message);
        }

        // Test 9: Test another Cloud Run service (to detect Cloud Run specific issues)
        updateResult('Cloud Run Test', 'pending', 'Testing Cloud Run connectivity...');
        try {
            // Test a known public Cloud Run service
            const response = await fetch('https://httpbin.org/get', { method: 'GET' });
            const data = await response.json();
            updateResult('Cloud Run Test', 'success', 'External HTTPS works', `Origin: ${data.origin}`);
        } catch (e: any) {
            updateResult('Cloud Run Test', 'error', 'HTTPS test failed', e.message);
        }

        // Test: Google Sign-In Configuration
        updateResult('Google Sign-In', 'pending', 'Checking Play Services...');
        try {
            await GoogleSignin.hasPlayServices();
            updateResult('Google Sign-In', 'success', 'Play Services available');
        } catch (e: any) {
            updateResult('Google Sign-In', 'error', 'Play Services check failed', `${e.code}: ${e.message}`);
        }

        setIsRunning(false);
    };

    const copyResultsToClipboard = () => {
        const text = results.map(r =>
            `${r.status === 'success' ? '✅' : '❌'} ${r.name}: ${r.message}${r.details ? `\n   ${r.details}` : ''}`
        ).join('\n');
        Alert.alert('Diagnostic Results', text);
    };

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>🔧 Diagnostics</Text>
                <Text style={styles.subtitle}>
                    Test API connectivity and authentication
                </Text>

                <Button
                    title={isRunning ? "Running..." : "Run Diagnostics"}
                    onPress={runDiagnostics}
                    loading={isRunning}
                    style={styles.runButton}
                />

                {results.length > 0 && (
                    <View style={styles.resultsContainer}>
                        {results.map((result, index) => (
                            <View key={index} style={styles.resultItem}>
                                <View style={styles.resultHeader}>
                                    <Text style={styles.resultIcon}>
                                        {result.status === 'pending' ? '⏳' :
                                            result.status === 'success' ? '✅' : '❌'}
                                    </Text>
                                    <Text style={styles.resultName}>{result.name}</Text>
                                </View>
                                <Text style={[
                                    styles.resultMessage,
                                    result.status === 'error' && styles.errorText
                                ]}>
                                    {result.message}
                                </Text>
                                {result.details && (
                                    <Text style={styles.resultDetails}>{result.details}</Text>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={copyResultsToClipboard}
                        >
                            <Text style={styles.copyButtonText}>📋 Show Full Report</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Troubleshooting Tips:</Text>
                    <Text style={styles.infoText}>• If "Firebase Auth" fails: Log out and log back in</Text>
                    <Text style={styles.infoText}>• If "API Health" fails: Check internet connection</Text>
                    <Text style={styles.infoText}>• If "Firebase Token" fails: Reinstall the app</Text>
                    <Text style={styles.infoText}>• If "API Auth" shows 401: Token may be expired</Text>
                    <Text style={styles.infoText}>• If "Google Sign-In" fails (DEVELOPER_ERROR): Check SHA-1</Text>
                    <Text style={[styles.infoText, { fontFamily: 'Courier', fontSize: 10 }]}>  REQUIRED SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25</Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.l,
    },
    title: {
        ...theme.typography.h1,
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.l,
    },
    runButton: {
        marginBottom: theme.spacing.l,
    },
    resultsContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    resultItem: {
        marginBottom: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.separator,
        paddingBottom: theme.spacing.m,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    resultIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    resultName: {
        ...theme.typography.headline,
        fontWeight: '600',
    },
    resultMessage: {
        ...theme.typography.body,
        marginLeft: 24,
    },
    errorText: {
        color: theme.colors.error,
    },
    resultDetails: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginLeft: 24,
        marginTop: 4,
    },
    copyButton: {
        alignItems: 'center',
        padding: theme.spacing.m,
        marginTop: theme.spacing.m,
    },
    copyButtonText: {
        ...theme.typography.body,
        color: theme.colors.primary,
    },
    infoBox: {
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.xl,
    },
    infoTitle: {
        ...theme.typography.headline,
        marginBottom: theme.spacing.s,
    },
    infoText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
});
