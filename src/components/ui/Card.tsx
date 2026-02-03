import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'elevated';
}

/**
 * Modern iOS-style Card component with standard padding and rounded corners.
 */
export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'default'
}) => {
    return (
        <View style={[
            styles.container,
            variant === 'elevated' && theme.shadows.card,
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l, // HIG consistent corner radius
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        width: '100%',
        // Default subtle shadow for better separation
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    }
});
