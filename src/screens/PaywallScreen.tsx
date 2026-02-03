import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../styles/theme';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';

interface PaywallScreenProps {
    onClose: () => void;
}

export default function PaywallScreen({ onClose }: PaywallScreenProps) {
    const { setPremiumStatus } = useSettingsStore();

    const handleMockPurchase = () => {
        setPremiumStatus(true);
        onClose();
    };

    return (
        <ScreenWrapper statusBarStyle="dark-content" backgroundColor="#FFF">
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={32} color={theme.colors.separator} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="star" size={50} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.title}>Go Premium</Text>
                    <Text style={styles.subtitle}>Unlock the full potential of your bond with your pet.</Text>
                </View>

                <View style={styles.features}>
                    <FeatureItem icon="infinite" title="Unlimited Scans" description="Translate as much as you want without daily limits." />
                    <FeatureItem icon="search" title="Breed Analysis" description="Get specialized insights based on your dog's breed." />
                    <FeatureItem icon="share" title="Premium Sharing" description="Beautiful cards to share your translations with friends." />
                </View>

                <View style={styles.cta}>
                    <TouchableOpacity style={styles.planCard} onPress={handleMockPurchase} activeOpacity={0.9}>
                        <View style={styles.planInfo}>
                            <Text style={styles.planTitle}>LIFETIME ACCESS</Text>
                            <Text style={styles.planPrice}>$29.99</Text>
                        </View>
                        <View style={styles.bestValueBadge}>
                            <Text style={styles.bestValueText}>BEST VALUE</Text>
                        </View>
                    </TouchableOpacity>

                    <Button title="Subscribe Now" onPress={handleMockPurchase} style={styles.buyButton} />
                    
                    <Text style={styles.disclaimer}>
                        Payments will be charged to your App Store account. You can manage your subscription in settings.
                    </Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

function FeatureItem({ icon, title, description }: { icon: any; title: string; description: string }) {
    return (
        <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
                <Ionicons name={icon} size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: theme.spacing.l,
        paddingTop: 40,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    title: {
        ...theme.typography.h1,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.typography.subheadline,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    features: {
        marginBottom: 40,
    },
    featureItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        ...theme.typography.headline,
        marginBottom: 2,
    },
    featureDescription: {
        ...theme.typography.subheadline,
        color: theme.colors.textSecondary,
    },
    cta: {
        width: '100%',
    },
    planCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.l,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        marginBottom: theme.spacing.m,
        ...theme.shadows.card,
    },
    planInfo: {
        flex: 1,
    },
    planTitle: {
        ...theme.typography.caption,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    planPrice: {
        ...theme.typography.h2,
        color: '#FFF',
    },
    bestValueBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    bestValueText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    buyButton: {
        marginBottom: theme.spacing.m,
    },
    disclaimer: {
        ...theme.typography.caption,
        textAlign: 'center',
        color: theme.colors.textSecondary,
        paddingHorizontal: 20,
    }
});
