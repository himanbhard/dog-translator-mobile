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
                    <Ionicons name="images" size={28} color="#FFF" />
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

                <TouchableOpacity 
                    onPress={onPickImage}
                    style={styles.uploadLabelButton}
                >
                    <Text style={styles.uploadText}>Upload</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingBottom: 20,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    captureButton: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    secondaryButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadLabelButton: {
        width: 56,
        alignItems: 'center',
    },
    uploadText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 12,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    }
});
