import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'elevated' | 'glass';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'default'
}) => {
    return (
        <View style={[
            styles.container,
            variant === 'elevated' && theme.shadows.medium,
            variant === 'glass' && styles.glass,
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        width: '100%',
    },
    glass: {
        backgroundColor: theme.colors.glass,
        borderColor: theme.colors.glassBorder,
    }
});
