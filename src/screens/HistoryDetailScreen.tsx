import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';
import { getImageUri } from '../services/fileStorage';
import ExplanationModal from '../components/ExplanationModal';
import { updateHistoryItem } from '../services/historyDatabase';

export default function HistoryDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const params = route.params as any;
    const viewShotRef = useRef<ViewShot>(null);

    // Parse params
    const item = {
        id: params.id,
        filename: params.filename as string,
        explanation: params.explanation as string,
        confidence: Number(params.confidence),
        breed: params.breed as string || 'Unknown Mix',
        tone: params.tone as string,
        timestamp: params.timestamp as string,
        share_id: params.share_id as string,
        detailed_explanation: params.detailed_explanation as string,
        educational_links: params.educational_links as string,
    };

    // State to persist explanation updates locally without reload
    const [explanationVisible, setExplanationVisible] = useState(false);
    const [detailedExplanation, setDetailedExplanation] = useState<string | undefined>(item.detailed_explanation);
    const [educationalLinks, setEducationalLinks] = useState<string | undefined>(item.educational_links);

    const imageSource = { uri: getImageUri(item.filename) };
    const date = new Date(item.timestamp).toLocaleDateString();
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleShare = async () => {
        try {
            let message = `🐾 My dog is feeling ${item.tone}!\n\n"${item.explanation}"\n\nDetected Breed: ${item.breed}\n\nTranslated with Dog Translator App 🐕`;

            if (item.share_id) {
                message += `\n\nSee full report: https://dog-translator-service-736369571076.us-east1.run.app/share/${item.share_id}`;
            }

            // In a real app with ViewShot, we could capture the card as an image.
            // For now, we share the text and optionally the image URI if supported by the platform share.
            await Share.share({
                message,
                title: "Dog Translation",
            });
        } catch (error) {
            Alert.alert("Error", "Could not share content.");
        }
    };

    return (
        <ScreenWrapper withScrollView>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Memory Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
                    <Card variant="default" style={styles.card}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={imageSource}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <View style={styles.toneBadge}>
                                <Text style={styles.toneText}>{item.tone}</Text>
                            </View>
                        </View>

                        <View style={styles.detailsContainer}>
                            <View style={styles.metaRow}>
                                <View style={styles.badge}>
                                    <Ionicons name="paw" size={12} color={theme.colors.primary} />
                                    <Text style={styles.badgeText}>{item.breed}</Text>
                                </View>
                                <Text style={styles.dateText}>{date} • {time}</Text>
                            </View>

                            <Text style={styles.explanation}>{item.explanation}</Text>

                            <View style={styles.confidenceRow}>
                                <Text style={styles.label}>AI Confidence</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${item.confidence * 100}%` }]} />
                                </View>
                                <Text style={styles.confidenceValue}>{(item.confidence * 100).toFixed(0)}%</Text>
                            </View>
                        </View>
                    </Card>
                </ViewShot>

                <View style={styles.actions}>
                    {/* Explain Button */}
                    <Button
                        title={detailedExplanation ? "View Explanation" : "Explain Behavior"}
                        onPress={() => setExplanationVisible(true)}
                        icon={<Ionicons name={detailedExplanation ? "bulb" : "sparkles"} size={20} color="#FFF" />}
                        variant="primary"
                        style={{ marginBottom: 12, borderWidth: 2, borderColor: '#FFF' }} // Added border for visibility
                    />

                    <Button
                        title="Share with Friends"
                        onPress={handleShare}
                        icon={<Ionicons name="share-social-outline" size={20} color="#FFF" />}
                        style={styles.shareButton}
                    />
                </View>
            </ScrollView>

            <ExplanationModal
                visible={explanationVisible}
                onClose={() => setExplanationVisible(false)}
                translation={item.explanation}
                breed={item.breed}
                initialExplanation={detailedExplanation}
                initialLinks={educationalLinks ? JSON.parse(educationalLinks) : undefined}
                onSave={async (expl, links) => {
                    // Update local state and DB
                    setDetailedExplanation(expl);
                    setEducationalLinks(JSON.stringify(links));

                    if (item.id) {
                        await updateHistoryItem(Number(item.id), {
                            detailed_explanation: expl,
                            educational_links: JSON.stringify(links)
                        });
                    }
                }}
            />
        </ScreenWrapper >
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.m,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...theme.typography.h3,
    },
    content: {
        padding: theme.spacing.m,
    },
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 300,
        width: '100%',
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    toneBadge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    toneText: {
        color: '#FFF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 14,
    },
    detailsContainer: {
        padding: theme.spacing.l,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6
    },
    badgeText: {
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    explanation: {
        ...theme.typography.body,
        fontSize: 18,
        lineHeight: 28,
        marginBottom: theme.spacing.xl,
        color: '#FFF',
    },
    label: {
        ...theme.typography.caption,
        marginBottom: 8,
    },
    confidenceRow: {
        marginBottom: theme.spacing.s,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.success,
        borderRadius: 3,
        marginBottom: 8,
    },
    confidenceValue: {
        alignSelf: 'flex-end',
        color: theme.colors.success,
        fontWeight: 'bold',
        fontSize: 12,
    },
    actions: {
        marginTop: theme.spacing.l,
    },
    shareButton: {
        marginBottom: theme.spacing.m,
    }
});
