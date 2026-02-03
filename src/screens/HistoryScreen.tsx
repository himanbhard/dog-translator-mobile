import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllHistory } from '../services/historyDatabase';
import { theme } from '../styles/theme';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Card } from '../components/ui/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        const items = await getAllHistory();
        setHistory(items);
        setLoading(false);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            onPress={() => navigation.navigate('HistoryDetail', { item })}
            activeOpacity={0.7}
        >
            <Card style={styles.card}>
                <Image source={{ uri: 'file://' + item.local_file_path }} style={styles.image} />
                <View style={styles.info}>
                    <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                    <Text style={styles.explanation} numberOfLines={2}>
                        {item.metadata.explanation}
                    </Text>
                    <View style={styles.footer}>
                        <View style={[styles.badge, { backgroundColor: theme.colors.surfaceSecondary }]}>
                            <Text style={styles.badgeText}>{item.metadata.tone}</Text>
                        </View>
                        <Text style={styles.confidence}>
                            {(item.metadata.confidence * 100).toFixed(0)}% Match
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.separator} />
            </Card>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={80} color={theme.colors.separator} />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptySubtitle}>Start scanning your dog to see translations here!</Text>
        </View>
    );

    return (
        <ScreenWrapper backgroundColor={theme.colors.background}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={theme.colors.primary} size="large" />
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    list: {
        padding: theme.spacing.m,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        padding: theme.spacing.s,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: theme.colors.surfaceSecondary,
    },
    info: {
        flex: 1,
        marginLeft: theme.spacing.m,
    },
    date: {
        ...theme.typography.caption,
        fontWeight: '600',
        marginBottom: 2,
    },
    explanation: {
        ...theme.typography.headline,
        fontSize: 15,
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    confidence: {
        ...theme.typography.caption,
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        ...theme.typography.h3,
        marginTop: 20,
    },
    emptySubtitle: {
        ...theme.typography.subheadline,
        textAlign: 'center',
        marginTop: 8,
    }
});
