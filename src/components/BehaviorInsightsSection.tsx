import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { getBehaviorInsights, InsightArticle } from '../api/insightsService';
import { InsightCard } from './ui/InsightCard';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface BehaviorInsightsSectionProps {
    behavior: string;
}

type LoadState = 'loading' | 'success' | 'error' | 'empty';

/**
 * A self-contained section that fetches and displays behavior insights.
 * Handles loading, success, error, and empty states internally.
 */
export const BehaviorInsightsSection: React.FC<BehaviorInsightsSectionProps> = ({ behavior }) => {
    const [state, setState] = useState<LoadState>('loading');
    const [articles, setArticles] = useState<InsightArticle[]>([]);

    useEffect(() => {
        if (behavior) {
            fetchInsights();
        }
    }, [behavior]);

    const fetchInsights = async () => {
        setState('loading');
        try {
            const results = await getBehaviorInsights(behavior);
            if (results.length > 0) {
                setArticles(results);
                setState('success');
            } else {
                setState('empty');
            }
        } catch (error) {
            setState('error');
        }
    };

    const handleOpenLink = async (url: string) => {
        try {
            await WebBrowser.openBrowserAsync(url);
        } catch (e) {
            console.warn('Failed to open link:', e);
        }
    };

    // Loading State
    if (state === 'loading') {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Research & Insights</Text>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Finding related articles...</Text>
                </View>
            </View>
        );
    }

    // Error State
    if (state === 'error') {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Research & Insights</Text>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cloud-offline-outline" size={32} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyText}>Could not load insights. Please try again later.</Text>
                </View>
            </View>
        );
    }

    // Empty State
    if (state === 'empty') {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Research & Insights</Text>
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={32} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyText}>No insights found for this behavior.</Text>
                </View>
            </View>
        );
    }

    // Success State
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Research & Insights</Text>
            <Text style={styles.sectionSubtitle}>Learn more about your dog's behavior</Text>
            {articles.map((article, index) => (
                <InsightCard
                    key={index}
                    title={article.title}
                    snippet={article.snippet}
                    source={article.source}
                    onPress={() => handleOpenLink(article.url)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.l,
    },
    sectionTitle: {
        ...theme.typography.h3,
        marginBottom: 4,
    },
    sectionSubtitle: {
        ...theme.typography.subheadline,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
        gap: theme.spacing.s,
    },
    loadingText: {
        ...theme.typography.subheadline,
        color: theme.colors.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
        gap: theme.spacing.s,
    },
    emptyText: {
        ...theme.typography.subheadline,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
