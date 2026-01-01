import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { logout } from '../api/auth';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../styles/theme';

export default function SettingsScreen() {
    // Stub functionality
    const [notifications, setNotifications] = useState(true);
    const [dataSaver, setDataSaver] = useState(false);

    // Global Settings
    const { autoSpeak, toggleAutoSpeak } = useSettingsStore();

    // Debug settings (moved from Scanner)
    const [debugMode, setDebugMode] = useState(false);
    const [useFetch, setUseFetch] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, value, onToggle, showToggle = true, onPress }: any) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer]}>
                    <Ionicons name={icon} size={22} color="#fff" />
                </View>
                <Text style={styles.settingTitle}>{title}</Text>
            </View>
            {showToggle ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: '#767577', true: theme.colors.primary }}
                    thumbColor={value ? '#fff' : '#f4f3f4'}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={StyleSheet.absoluteFill}
            />
            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Account</Text>
                    <View style={styles.card}>
                        <View style={styles.profileHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>🐶</Text>
                            </View>
                            <View>
                                <Text style={styles.profileName}>Dog Lover</Text>
                                <Text style={styles.profileEmail}>user@example.com</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* General Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Preferences</Text>
                    <View style={styles.card}>
                        <SettingItem
                            icon="volume-high-outline"
                            title="Auto-Speak Results"
                            value={autoSpeak}
                            onToggle={toggleAutoSpeak}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="notifications-outline"
                            title="Notifications"
                            value={notifications}
                            onToggle={setNotifications}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="cellular-outline"
                            title="Data Saver"
                            value={dataSaver}
                            onToggle={setDataSaver}
                        />
                    </View>
                </View>

                {/* Developer Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Developer</Text>
                    <View style={styles.card}>
                        <SettingItem
                            icon="construct-outline"
                            title="Debug Mode"
                            value={debugMode}
                            onToggle={setDebugMode}
                        />
                        {debugMode && (
                            <>
                                <View style={styles.divider} />
                                <SettingItem
                                    icon="swap-horizontal-outline"
                                    title="Use Fetch API (Legacy)"
                                    value={useFetch}
                                    onToggle={setUseFetch}
                                />
                            </>
                        )}
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.versionText}>Dog Translator v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingTitle: {
        color: '#fff',
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginLeft: 60,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 24,
    },
    profileName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileEmail: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    logoutButton: {
        padding: 16,
        alignItems: 'center',
    },
    logoutText: {
        color: '#ff4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        marginTop: 10,
    }
});
