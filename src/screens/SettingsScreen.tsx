import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View, TouchableOpacity } from 'react-native';
import { logout } from '../api/auth';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../styles/theme';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
    const { autoSpeak, toggleAutoSpeak, isPremium } = useSettingsStore();
    const user = auth.currentUser;
    const navigation = useNavigation<any>();

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out of your account?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: () => logout() }
            ]
        );
    };

    const SettingItem = ({ icon, title, value, onToggle, last = false }: any) => (
        <View style={[styles.settingItem, !last && styles.borderBottom]}>
            <View style={styles.settingLeft}>
                <Ionicons name={icon} size={22} color={theme.colors.primary} />
                <Text style={styles.settingTitle}>{title}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: theme.colors.surfaceSecondary, true: theme.colors.primary }}
                ios_backgroundColor={theme.colors.surfaceSecondary}
            />
        </View>
    );

    return (
        <ScreenWrapper statusBarStyle="dark-content">
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Settings</Text>

                {/* Profile Section */}
                <Card variant="elevated" style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={30} color={theme.colors.textSecondary} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>Account</Text>
                            <Text style={styles.profileEmail}>{user?.email || 'Not Signed In'}</Text>
                        </View>
                    </View>
                </Card>

                {/* App Settings */}
                <Text style={styles.sectionTitle}>PREFERENCES</Text>
                <Card style={styles.settingsCard}>
                    <SettingItem
                        icon="volume-high"
                        title="Auto-speak results"
                        value={autoSpeak}
                        onToggle={toggleAutoSpeak}
                    />
                    <SettingItem
                        icon="notifications"
                        title="Enable Notifications"
                        value={true}
                        onToggle={() => { }}
                        last
                    />
                </Card>

                {/* Subscription */}
                <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
                <Card style={styles.settingsCard}>
                    <TouchableOpacity style={styles.premiumRow}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="star" size={22} color="#FFD700" />
                            <View style={{ marginLeft: theme.spacing.m }}>
                                <Text style={styles.settingTitle}>Premium Status</Text>
                                <Text style={styles.subtext}>
                                    {isPremium ? 'Active Plan' : 'Free Plan (30 scans / day)'}
                                </Text>
                            </View>
                        </View>
                        {!isPremium && <Ionicons name="chevron-forward" size={20} color={theme.colors.separator} />}
                    </TouchableOpacity>
                </Card>

                {/* Developer / Debug */}
                <Text style={styles.sectionTitle}>DEVELOPER</Text>
                <Card style={styles.settingsCard}>
                    <TouchableOpacity
                        style={styles.premiumRow}
                        onPress={() => navigation.navigate('Diagnostics')}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="bug-outline" size={22} color={theme.colors.primary} />
                            <View style={{ marginLeft: theme.spacing.m }}>
                                <Text style={styles.settingTitle}>Diagnostics</Text>
                                <Text style={styles.subtext}>
                                    Test API connectivity & debug issues
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.separator} />
                    </TouchableOpacity>
                </Card>

                <View style={styles.footer}>
                    <Button
                        title="Log Out"
                        onPress={handleLogout}
                        variant="ghost"
                        textStyle={{ color: theme.colors.error }}
                    />
                    <Text style={styles.version}>Version 1.0.0 (Build 42)</Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: theme.spacing.m,
    },
    header: {
        ...theme.typography.h1,
        marginBottom: theme.spacing.l,
    },
    profileCard: {
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.m,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        marginLeft: theme.spacing.m,
    },
    profileName: {
        ...theme.typography.headline,
    },
    profileEmail: {
        ...theme.typography.subheadline,
    },
    sectionTitle: {
        ...theme.typography.caption,
        fontWeight: '600',
        marginBottom: theme.spacing.s,
        marginLeft: theme.spacing.xs,
        color: theme.colors.textSecondary,
    },
    settingsCard: {
        padding: 0,
        marginBottom: theme.spacing.xl,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.m,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.separator,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingTitle: {
        ...theme.typography.body,
        marginLeft: theme.spacing.m,
    },
    premiumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.m,
    },
    subtext: {
        ...theme.typography.caption,
        marginTop: 2,
    },
    footer: {
        marginTop: theme.spacing.xl,
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    version: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    }
});
