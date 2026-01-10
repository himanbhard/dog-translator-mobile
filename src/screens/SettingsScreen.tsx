import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { logout } from '../api/auth';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../styles/theme';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function SettingsScreen() {
    const [notifications, setNotifications] = useState(true);
    const [dataSaver, setDataSaver] = useState(false);

    // Global Settings
    const { autoSpeak, toggleAutoSpeak } = useSettingsStore();

    // Debug settings
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
                    <Ionicons name={icon} size={20} color="#fff" />
                </View>
                <Text style={styles.settingTitle}>{title}</Text>
            </View>
            {showToggle ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
                    thumbColor={value ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            )}
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper withScrollView>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Badge */}
                <Card variant="glass" style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>🐶</Text>
                        </View>
                        <View>
                            <Text style={styles.profileName}>Dog Lover</Text>
                            <Text style={styles.profileEmail}>user@example.com</Text>
                        </View>
                        {/* Premium Badge */}
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            {useSettingsStore().isPremium ? (
                                <View style={styles.premiumBadge}>
                                    <Text style={styles.premiumText}>PRO</Text>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={() => useSettingsStore.getState().setPremiumStatus(true)}>
                                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>UPGRADE</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </Card>

                {/* Preferences */}
                <Text style={styles.sectionHeader}>PREFERENCES</Text>
                <Card variant="default" style={styles.card}>
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
                </Card>

                {/* Developer */}
                <Text style={styles.sectionHeader}>DEVELOPER</Text>
                <Card variant="default" style={styles.card}>
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
                </Card>

                {/* Actions */}
                <View style={styles.actionContainer}>
                    <Button
                        title="Log Out"
                        onPress={handleLogout}
                        variant="outline"
                        style={{ borderColor: theme.colors.error }}
                        textStyle={{ color: theme.colors.error }}
                        icon={<Ionicons name="log-out-outline" size={20} color={theme.colors.error} />}
                    />
                </View>

                <Text style={styles.versionText}>Dog Translator v1.0.0</Text>
                <Text style={styles.copyrightText}>Made with ❤️ for pets</Text>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: theme.spacing.m,
        paddingBottom: 100,
    },
    sectionHeader: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.s,
        marginTop: theme.spacing.l,
        marginLeft: theme.spacing.xs,
        letterSpacing: 1,
    },
    card: {
        padding: 0,
    },
    profileCard: {
        marginBottom: theme.spacing.m,
        borderColor: theme.colors.primary,
        borderWidth: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    avatarText: {
        fontSize: 24,
    },
    profileName: {
        ...theme.typography.h3,
        marginBottom: 2,
    },
    profileEmail: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.m,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: theme.colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    settingTitle: {
        ...theme.typography.body,
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.cardBorder,
        marginLeft: 56, // Align with text
    },
    actionContainer: {
        marginTop: theme.spacing.xl,
    },
    versionText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: theme.spacing.xl,
    },
    copyrightText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.2)',
        fontSize: 10,
        marginTop: 4,
    },
    premiumBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    premiumText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    }
});
