import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { getExplanation, ExplanationResponse } from '../api/analysisService';
import { PetJournalService } from '../services/petJournal';
import { theme } from '../styles/theme';

interface ExplanationModalProps {
    visible: boolean;
    onClose: () => void;
    translation: string;
    breed?: string;
    petId?: string; // Optional: if we want to update the journal entry
    journalEntryId?: string; // Optional: if we want to update the journal entry
    initialExplanation?: string;
    initialLinks?: { title: string; url: string }[];
    onSave?: (explanation: string, links: { title: string; url: string }[]) => Promise<void>;
}

export default function ExplanationModal({
    visible,
    onClose,
    translation,
    breed,
    petId,
    journalEntryId,
    initialExplanation,
    initialLinks,
    onSave
}: ExplanationModalProps) {
    const [loading, setLoading] = useState(!initialExplanation);
    const [data, setData] = useState<ExplanationResponse | null>(
        initialExplanation ? { explanation: initialExplanation, links: initialLinks || [] } : null
    );

    useEffect(() => {
        if (visible) {
            if (!initialExplanation && !data) {
                loadExplanation();
            }
        }
    }, [visible]);

    const loadExplanation = async () => {
        setLoading(true);
        const result = await getExplanation(translation, breed);

        if (result) {
            setData(result);

            // If we have pet/journal context, save it!
            if (petId && journalEntryId) {
                await PetJournalService.updateEntry(petId, journalEntryId, {
                    explanation: result.explanation,
                    educationalLinks: result.links
                });
            }

            // New Generic Save Callback (for SQLite or other)
            if (onSave) {
                await onSave(result.explanation, result.links);
            }
        } else {
            Alert.alert('Error', 'Could not fetch explanation. Please try again.');
            onClose();
        }
        setLoading(false);
    };

    const handleOpenLink = async (url: string) => {
        try {
            await WebBrowser.openBrowserAsync(url);
        } catch (e) {
            Alert.alert('Error', 'Could not open link.');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Why did your dog say that?</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={30} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={styles.loadingText}>Fetching insights from experts...</Text>
                        </View>
                    ) : data ? (
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <Text style={styles.explanationText}>{data.explanation}</Text>

                            {data.links && data.links.length > 0 && (
                                <>
                                    <Text style={styles.sectionTitle}>Learn More</Text>
                                    {data.links.map((link, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.linkCard}
                                            onPress={() => handleOpenLink(link.url)}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.linkTitle}>{link.title}</Text>
                                                <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
                                            </View>
                                            <Ionicons name="open-outline" size={20} color={theme.colors.primary} />
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}
                        </ScrollView>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Unavailable</Text>
                        </View>
                    )}

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#666',
        fontSize: 16,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    explanationText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        marginTop: 8,
    },
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    linkTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    linkUrl: {
        fontSize: 12,
        color: '#888',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        color: '#666'
    }
});
