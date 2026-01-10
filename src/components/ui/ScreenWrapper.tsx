import React from 'react';
import { StyleSheet, ViewStyle, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    withScrollView?: boolean;
    statusBarStyle?: 'light-content' | 'dark-content';
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    statusBarStyle = 'light-content'
}) => {
    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
            colors={[...theme.gradients.background]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar barStyle={statusBarStyle} />
            <SafeAreaView style={[styles.content, { paddingTop: insets.top }, style]}>
                {children}
            </SafeAreaView>
        </LinearGradient>
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
