import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { deleteImageFromStorage, getImageUri } from '../services/fileStorage';
import { HistoryItem, deleteHistoryItem, getHistoryItems } from '../services/historyDatabase';
import { theme } from '../styles/theme';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Card } from '../components/ui/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePetStore } from '../store/usePetStore';

export default function HistoryScreen() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const { activePetId } = usePetStore(); // Get active pet

    const loadData = async () => {
        setRefreshing(true);
        try {
            const items = await getHistoryItems(activePetId);
            setHistory(items);
        } catch (e) {
            console.error("Failed to load history", e);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [activePetId])
    );

    const handleDelete = (id: number, filename: string) => {
        Alert.alert(
            "Delete Entry",
            "Are you sure you want to delete this memory?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteHistoryItem(id);
                        await deleteImageFromStorage(filename);
                        loadData(); // Reload list
                    }
                }
            ]
        );
    };

    const handlePressItem = (item: HistoryItem) => {
        (navigation as any).navigate('HistoryDetail', {
            id: item.id,
            filename: item.filename,
            explanation: item.explanation,
            confidence: item.confidence,
            tone: item.tone,
            breed: item.breed || 'Unknown Mix',
            timestamp: item.timestamp,
            share_id: item.share_id,
            detailed_explanation: item.detailed_explanation,
            educational_links: item.educational_links
        });
    };

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const date = new Date(item.timestamp).toLocaleDateString();
        const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const imageSource = { uri: getImageUri(item.filename) };

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePressItem(item)}
                style={styles.cardWrapper}
            >
                <Card variant="default" style={styles.card}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={imageSource}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <View style={styles.toneBadge}>
                            <Text style={styles.toneText}>{item.tone || 'Neutral'}</Text>
                        </View>
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.headerRow}>
                            <View>
                                <Text style={styles.dateText}>{date} • {time}</Text>
                                {item.breed && <Text style={styles.breedText}>{item.breed}</Text>}
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id, item.filename)} hitSlop={10}>
                                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.explanationText} numberOfLines={2}>
                            {item.explanation}
                        </Text>

                        {item.confidence > 0 && (
                            <View style={styles.confidenceRow}>
                                <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.success} />
                                <Text style={styles.confidenceText}>
                                    {(item.confidence * 100).toFixed(0)}% Confidence
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper>
            {history.length === 0 && !refreshing ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="book-outline" size={60} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyText}>No memories yet.</Text>
                    <Text style={styles.emptySubText}>Translate some dog behaviors to start your journal!</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.colors.primary} />
                    }
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: theme.spacing.m,
        paddingBottom: 100, // Space for tab bar
    },
    cardWrapper: {
        marginBottom: theme.spacing.m,
    },
    card: {
        padding: 0, // Reset default padding for image layout
        overflow: 'hidden',
    },
    imageContainer: {
        height: 180,
        width: '100%',
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    toneBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    toneText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    contentContainer: {
        padding: theme.spacing.m,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    dateText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    breedText: {
        color: theme.colors.primary,
        fontSize: 12,
        marginTop: 2,
    },
    timeText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    explanationText: {
        ...theme.typography.body,
        fontSize: 14,
        marginBottom: theme.spacing.s,
    },
    confidenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    confidenceText: {
        color: theme.colors.success,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        ...theme.typography.h2,
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubText: {
        ...theme.typography.body,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
});
