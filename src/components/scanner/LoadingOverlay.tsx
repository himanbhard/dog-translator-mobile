import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
    message = "Analyzing Body Language..." 
}) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    text: {
        ...theme.typography.headline,
        color: '#FFF',
        marginTop: 20,
    },
});
