import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../styles/theme';

interface CameraControlsProps {
    onCapture: () => void;
    onPickImage: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({ onCapture, onPickImage }) => {
    return (
        <View style={styles.container}>
            <View style={styles.controls}>
                <TouchableOpacity 
                    onPress={onPickImage} 
                    style={styles.secondaryButton}
                    accessibilityLabel="Select image from gallery"
                    accessibilityRole="button"
                >
                    <Ionicons name="images-outline" size={28} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={onCapture} 
                    style={styles.captureButton}
                    accessibilityLabel="Take dog photo"
                    accessibilityRole="button"
                    accessibilityHint="Captures a photo of your dog for translation"
                >
                    <View style={styles.captureInner} />
                </TouchableOpacity>

                <View style={styles.placeholder} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF',
    },
    secondaryButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        width: 50,
    }
});
