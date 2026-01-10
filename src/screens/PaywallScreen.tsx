import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../styles/theme';

interface PaywallScreenProps {
    visible: boolean;
    onClose: () => void;
}

export default function PaywallScreen({ visible, onClose }: PaywallScreenProps) {
    const { setPremiumStatus } = useSettingsStore();

    const handleMockPurchase = () => {
        // MOCK PURCHASE FOR DEV
        setPremiumStatus(true);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.container}>
                <BlurView blurType="dark" blurAmount={90} style={StyleSheet.absoluteFill} />

                <LinearGradient
                    colors={['rgba(80, 40, 200, 0.3)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="diamond" size={60} color={theme.colors.primary} />
                    </View>

                    <Text style={styles.title}>Unlock Unlimited Access</Text>
                    <Text style={styles.subtitle}>
                        You've reached your daily limit of free scans. Upgrade to continue interpreting your dog's feelings!
                    </Text>

                    <View style={styles.featuresList}>
                        <FeatureItem icon="infinite" text="Unlimited Translations" />
                        <FeatureItem icon="paw" text="Detailed Breed Detection" />
                        <FeatureItem icon="share-social" text="Premium Sharing Cards" />
                        <FeatureItem icon="ban" text="No Ads (Coming Soon)" />
                    </View>

                    <View style={styles.pricingContainer}>
                        <TouchableOpacity style={styles.planCard} onPress={handleMockPurchase}>
                            <View style={styles.planHeader}>
                                <Text style={styles.planName}>Lifetime</Text>
                                <View style={styles.badge}><Text style={styles.badgeText}>BEST VALUE</Text></View>
                            </View>
                            <Text style={styles.price}>$29.99</Text>
                            <Text style={styles.period}>one-time payment</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.disclaimer}>
                        This is a simulation. Tapping the card will simulate a successful purchase.
                    </Text>

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function FeatureItem({ icon, text }: { icon: any; text: string }) {
    return (
        <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
                <Ionicons name={icon} size={20} color="#FFF" />
            </View>
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '90%',
        backgroundColor: 'rgba(30, 30, 40, 0.8)',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(120, 80, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    featuresList: {
        width: '100%',
        marginBottom: 30,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 16,
    },
    featureIcon: {
        marginRight: 15,
    },
    featureText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
    },
    pricingContainer: {
        width: '100%',
        marginBottom: 20,
    },
    planCard: {
        backgroundColor: theme.colors.primary,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    planName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    badge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 10,
    },
    price: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    period: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    disclaimer: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 16,
    },
    closeButton: {
        padding: 10,
    },
    closeText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});
