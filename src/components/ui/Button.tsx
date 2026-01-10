import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';

    // Base container styles
    const containerStyles = [
        styles.container,
        disabled && styles.disabled,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        style
    ];

    const renderContent = () => (
        <>
            {loading ? (
                <ActivityIndicator color={isPrimary ? '#FFF' : theme.colors.primary} />
            ) : (
                <>
                    {icon && icon}
                    <Text style={[
                        styles.text,
                        isOutline && styles.textOutline,
                        isGhost && styles.textGhost,
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </>
    );

    if (isPrimary && !disabled && !isOutline && !isGhost) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={disabled} style={[styles.gradientContainer, style]}>
                <LinearGradient
                    colors={theme.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
            style={containerStyles}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        borderRadius: theme.borderRadius.l,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.l,
        backgroundColor: theme.colors.surfaceLight,
    },
    gradientContainer: {
        height: 50,
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.l,
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
        color: '#FFFFFF',
        marginLeft: theme.spacing.xs,
    },
    textOutline: {
        color: theme.colors.primary,
    },
    textGhost: {
        color: theme.colors.textSecondary,
    }
});
