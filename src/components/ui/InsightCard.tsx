import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../styles/theme';

interface InsightCardProps {
    title: string;
    snippet: string;
    source: string;
    onPress: () => void;
}

/**
 * A tappable card component displaying an insight article.
 */
export const InsightCard: React.FC<InsightCardProps> = ({
    title,
    snippet,
    source,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityLabel={`Open article: ${title}`}
            accessibilityRole="button"
        >
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
                <Text style={styles.snippet} numberOfLines={3}>
                    {snippet}
                </Text>
                <View style={styles.footer}>
                    <Ionicons name="globe-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.source}>{source}</Text>
                </View>
            </View>
            <View style={styles.iconContainer}>
                <Ionicons name="open-outline" size={20} color={theme.colors.primary} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.s,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        ...theme.shadows.card,
    },
    content: {
        flex: 1,
        marginRight: theme.spacing.s,
    },
    title: {
        ...theme.typography.headline,
        marginBottom: 4,
    },
    snippet: {
        ...theme.typography.subheadline,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.s,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    source: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    iconContainer: {
        padding: theme.spacing.xs,
    },
});
