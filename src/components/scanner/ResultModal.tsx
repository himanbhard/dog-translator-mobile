import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../../styles/theme';
import { Button } from '../ui/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ResultModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    result: {
        explanation: string;
        confidence: number;
        breed?: string;
    } | null;
    imageUri: string | null;
}

export const ResultModal: React.FC<ResultModalProps> = ({ visible, onClose, onSave, result, imageUri }) => {
    if (!result) return null;

    const confidencePct = Math.round(result.confidence * 100);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Interpretation</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {imageUri && (
                            <Image source={{ uri: imageUri }} style={styles.image} />
                        )}

                        <View style={styles.confidenceContainer}>
                            <Text style={styles.confidenceLabel}>Confidence Score</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progress, { width: `${confidencePct}%` }]} />
                            </View>
                            <Text style={styles.confidenceValue}>{confidencePct}%</Text>
                        </View>

                        <Text style={styles.explanationTitle}>Your Dog Says:</Text>
                        <View style={styles.explanationBox}>
                            <Text style={styles.explanationText}>{result.explanation}</Text>
                        </View>

                        {result.breed && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Estimated Breed:</Text>
                                <Text style={styles.detailValue}>{result.breed}</Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button title="Save to History" onPress={onSave} style={styles.saveButton} />
                        <TouchableOpacity onPress={onClose} style={styles.doneButton}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        maxHeight: '90%',
        padding: theme.spacing.l,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    title: {
        ...theme.typography.h2,
    },
    content: {
        flexGrow: 0,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
    },
    confidenceContainer: {
        marginBottom: theme.spacing.m,
    },
    confidenceLabel: {
        ...theme.typography.caption,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        backgroundColor: theme.colors.success,
    },
    confidenceValue: {
        ...theme.typography.caption,
        textAlign: 'right',
        marginTop: 4,
    },
    explanationTitle: {
        ...theme.typography.headline,
        marginBottom: theme.spacing.s,
    },
    explanationBox: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        marginBottom: theme.spacing.m,
    },
    explanationText: {
        ...theme.typography.body,
        lineHeight: 24,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.l,
    },
    detailLabel: {
        ...theme.typography.body,
        fontWeight: '600',
    },
    detailValue: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    footer: {
        marginTop: theme.spacing.m,
        gap: theme.spacing.m,
    },
    saveButton: {
        width: '100%',
    },
    doneButton: {
        alignItems: 'center',
        padding: theme.spacing.m,
    },
    doneButtonText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    }
});
