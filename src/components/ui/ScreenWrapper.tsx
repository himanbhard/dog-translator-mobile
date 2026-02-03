import React from 'react';
import { StyleSheet, ViewStyle, StatusBar, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    withScrollView?: boolean;
    statusBarStyle?: 'light-content' | 'dark-content';
    backgroundColor?: string;
}

/**
 * Standard Screen Wrapper following iOS HIG.
 * Handles Safe Areas, Status Bar, and optional Scrolling.
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    withScrollView = false,
    statusBarStyle = 'dark-content',
    backgroundColor = theme.colors.background
}) => {
    const insets = useSafeAreaInsets();

    const contentStyle = [
        styles.content,
        { 
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor
        },
        style
    ];

    if (withScrollView) {
        return (
            <View style={[styles.container, { backgroundColor }]}>
                <StatusBar barStyle={statusBarStyle} />
                <ScrollView 
                    style={styles.container} 
                    contentContainerStyle={contentStyle}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar barStyle={statusBarStyle} />
            <View style={contentStyle}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});
