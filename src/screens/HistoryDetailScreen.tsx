import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Alert, Share, StyleSheet, Text, View, Image } from 'react-native';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BehaviorInsightsSection } from '../components/BehaviorInsightsSection';
import { theme } from '../styles/theme';

export default function HistoryDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const params = route.params as any;

    // Safety check for item
    const item = params?.item;

    if (!item) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <Text style={theme.typography.body}>Analysis not found.</Text>
                    <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
                </View>
            </ScreenWrapper>
        );
    }

    const metadata = item.metadata;
    const date = new Date(item.timestamp).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleShare = async () => {
        try {
            let message = `🐾 My dog is feeling ${metadata.tone}!\n\n"${metadata.explanation}"\n\nTranslated with Dog Translator 🐕`;
            if (metadata.share_id) {
                message += `\n\nFull report: https://dog-translator-service-736369571076.us-east1.run.app/share/${metadata.share_id}`;
            }
            await Share.share({ message });
        } catch (error) {
            Alert.alert("Error", "Could not share analysis.");
        }
    };

    return (
        <ScreenWrapper withScrollView statusBarStyle="dark-content">
            <View style={styles.container}>
                <Card style={styles.imageCard}>
                    <Image
                        source={{ uri: 'file://' + item.local_file_path }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </Card>

                <View style={styles.headerInfo}>
                    <Text style={styles.date}>{date}</Text>
                    <Text style={styles.title}>Translation Result</Text>
                </View>

                <Card variant="elevated" style={styles.analysisCard}>
                    <View style={styles.tagRow}>
                        <View style={[styles.tag, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Text style={[styles.tagText, { color: theme.colors.primary }]}>{metadata.tone}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: theme.colors.success + '15' }]}>
                            <Text style={[styles.tagText, { color: theme.colors.success }]}>
                                {(metadata.confidence * 100).toFixed(0)}% Confidence
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.explanation}>{metadata.explanation}</Text>

                    {metadata.breed && (
                        <View style={styles.breedContainer}>
                            <Ionicons name="paw" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.breedText}>Likely Breed: {metadata.breed}</Text>
                        </View>
                    )}
                </Card>

                <BehaviorInsightsSection behavior={metadata.explanation} />

                <View style={styles.actions}>
                    <Button
                        title="Share Translation"
                        onPress={handleShare}
                        icon={<Ionicons name="share-outline" size={20} color="#FFF" />}
                        style={styles.shareButton}
                    />
                    <Button
                        title="Delete from History"
                        variant="ghost"
                        onPress={() => Alert.alert('Coming Soon', 'Delete functionality is being updated.')}
                        textStyle={{ color: theme.colors.error }}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.m,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageCard: {
        padding: 0,
        overflow: 'hidden',
        height: 350,
        marginBottom: theme.spacing.l,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    headerInfo: {
        marginBottom: theme.spacing.m,
    },
    date: {
        ...theme.typography.caption,
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        ...theme.typography.h2,
    },
    analysisCard: {
        padding: theme.spacing.l,
        marginBottom: theme.spacing.l,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: theme.spacing.m,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    explanation: {
        ...theme.typography.body,
        fontSize: 18,
        lineHeight: 26,
        marginBottom: theme.spacing.m,
    },
    breedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: theme.colors.separator,
        paddingTop: theme.spacing.m,
    },
    breedText: {
        ...theme.typography.subheadline,
        color: theme.colors.textSecondary,
    },
    actions: {
        gap: theme.spacing.s,
    },
    shareButton: {
        width: '100%',
    }
});
