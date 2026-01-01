import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteImageFromStorage, getImageUri } from '../services/fileStorage';
import { HistoryItem, deleteHistoryItem, getHistoryItems } from '../services/historyDatabase';
import { theme } from '../styles/theme';

export default function HistoryScreen() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        setRefreshing(true);
        try {
            const items = await getHistoryItems();
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
        }, [])
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

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const date = new Date(item.timestamp).toLocaleDateString();
        const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const imageSource = { uri: getImageUri(item.filename) };

        return (
            <View style={styles.cardContainer}>
                <BlurView intensity={20} tint="dark" style={styles.card}>
                    <View style={styles.imageContainer}>
                        <Image source={imageSource} style={styles.image} resizeMode="cover" />
                        <View style={styles.toneBadge}>
                            <Text style={styles.toneText}>{item.tone || 'Neutral'}</Text>
                        </View>
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.dateText}>{date} • {time}</Text>
                            <TouchableOpacity onPress={() => handleDelete(item.id, item.filename)} hitSlop={10}>
                                <Text style={styles.deleteIcon}>🗑️</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.explanationText} numberOfLines={3}>
                            {item.explanation}
                        </Text>

                        {item.confidence > 0 && (
                            <Text style={styles.confidenceText}>
                                Confidence: {(item.confidence * 100).toFixed(0)}%
                            </Text>
                        )}
                    </View>
                </BlurView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={StyleSheet.absoluteFill}
            />
            {history.length === 0 && !refreshing ? (
                <View style={styles.emptyContainer}>
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
                        <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#fff" />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    cardContainer: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    imageContainer: {
        height: 200,
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    toneText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    contentContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    deleteIcon: {
        fontSize: 18,
        opacity: 0.8,
    },
    explanationText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 8,
    },
    confidenceText: {
        color: theme.colors.primary, // Using theme primary color if available, or fallback
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    emptyText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptySubText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        textAlign: 'center',
    },
});
