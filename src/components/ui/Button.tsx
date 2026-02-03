import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { theme } from '../../styles/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

/**
 * Modern iOS-style Button component following HIG.
 */
export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon
}) => {
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';

    const containerStyles = [
        styles.container,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        disabled && styles.disabled,
        style
    ];

    const textStyles = [
        styles.text,
        isPrimary && styles.textPrimary,
        isSecondary && styles.textSecondary,
        isOutline && styles.textOutline,
        isGhost && styles.textGhost,
        textStyle
    ];

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled || loading}
            style={containerStyles}
        >
            {loading ? (
                <ActivityIndicator color={isPrimary ? '#FFFFFF' : theme.colors.primary} />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={textStyles}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50, // Standard iOS tap target
        minWidth: 44,
        borderRadius: theme.borderRadius.l,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: theme.spacing.s,
    },
    primary: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.button,
    },
    secondary: {
        backgroundColor: theme.colors.surfaceSecondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...theme.typography.button,
    },
    textPrimary: {
        color: '#FFFFFF',
    },
    textSecondary: {
        color: theme.colors.primary,
    },
    textOutline: {
        color: theme.colors.primary,
    },
    textGhost: {
        color: theme.colors.primary,
    }
});
