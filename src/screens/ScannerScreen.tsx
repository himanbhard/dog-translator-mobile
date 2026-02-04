import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { analyzeImage } from '../api/analysisService';
import { saveImageToInternalStorage } from '../services/fileStorage';
import { addHistoryEntry } from '../services/historyDatabase';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../styles/theme';
import { speak, stop as stopSpeech } from '../utils/textToSpeech';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { addToQueue } from '../services/offlineQueue';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { usePetStore } from '../store/usePetStore';
import { Button } from '../components/ui/Button';

// Refactored Components
import { ToneSelector, Tone } from '../components/scanner/ToneSelector';
import { LoadingOverlay } from '../components/scanner/LoadingOverlay';
import { CameraControls } from '../components/scanner/CameraControls';
import { CameraView } from '../components/scanner/CameraView';

export default function ScannerScreen() {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const [tone, setTone] = useState<Tone>('Playful');
    const cameraRef = useRef<Camera>(null);
    const [isanalyzing, setIsAnalyzing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const { autoSpeak, isPremium, dailyScans, incrementScanCount, checkResetDailyScans } = useSettingsStore();
    const { activePetId } = usePetStore();

    useEffect(() => {
        checkResetDailyScans();
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    if (!hasPermission) {
        return (
            <ScreenWrapper>
                <View style={styles.centerContent}>
                    <Ionicons name="camera-outline" size={80} color={theme.colors.textSecondary} />
                    <Text style={styles.permissionText}>Camera permission is required to analyze your dog's behavior.</Text>
                    <Button title="Grant Permission" onPress={requestPermission} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!device) {
        return (
            <ScreenWrapper>
                <View style={styles.centerContent}>
                    <Text style={styles.permissionText}>No camera device found!</Text>
                </View>
            </ScreenWrapper>
        );
    }

    const handleAnalysis = async (uri: string) => {
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            Alert.alert(
                "Offline 📴",
                "You are currently offline. Save this to your queue?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Save to Queue", onPress: () => addToQueue(uri, tone) }
                ]
            );
            return;
        }

        if (!isPremium && dailyScans >= 5) {
            Alert.alert("Daily Limit Reached", "Upgrade to Premium for unlimited scans!");
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await analyzeImage(uri, tone.toLowerCase());
            setIsAnalyzing(false);

            if (result && result.status === 'ok') {
                incrementScanCount();
                
                if (autoSpeak) {
                    setIsSpeaking(true);
                    speak(result.explanation, {
                        tone: tone.toLowerCase() as 'playful' | 'calm' | 'trainer',
                        onDone: () => setIsSpeaking(false),
                        onError: () => setIsSpeaking(false),
                    }).catch(() => setIsSpeaking(false));
                }

                Alert.alert(
                    '🐕 Interpretation Ready',
                    result.explanation,
                    [
                        {
                            text: 'Save to History',
                            onPress: async () => {
                                try {
                                    const permanentPath = await saveImageToInternalStorage(uri);
                                    await addHistoryEntry(permanentPath, {
                                        explanation: result.explanation,
                                        confidence: result.confidence,
                                        tone: tone,
                                        breed: result.breed || 'Unknown',
                                    }, activePetId);
                                    Alert.alert("Success", "Saved to history!");
                                } catch (e) {
                                    Alert.alert("Error", "Failed to save locally.");
                                }
                            }
                        },
                        { text: 'Done', style: 'cancel' }
                    ]
                );
            }
        } catch (error: any) {
            setIsAnalyzing(false);
            Alert.alert('Analysis Error', error.message);
        }
    };

    const pickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
        if (!result.didCancel && result.assets?.[0]?.uri) {
            handleAnalysis(result.assets[0].uri);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto({ qualityPrioritization: 'quality' });
                if (photo?.path) handleAnalysis('file://' + photo.path);
            } catch (error) {
                console.error("Capture Error:", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <CameraView 
                ref={cameraRef}
                device={device}
            />

            <View style={styles.topOverlay}>
                <ToneSelector 
                    activeTone={tone}
                    onToneChange={setTone}
                />
            </View>

            <View style={styles.bottomOverlay}>
                <CameraControls 
                    onCapture={takePicture}
                    onPickImage={pickImage}
                />
            </View>

            {isanalyzing && <LoadingOverlay />}

            {isSpeaking && (
                <TouchableOpacity style={styles.stopFab} onPress={() => { stopSpeech(); setIsSpeaking(false); }}>
                    <Ionicons name="stop" size={24} color={theme.colors.white} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.black,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    permissionText: {
        ...theme.typography.body,
        textAlign: 'center',
        marginVertical: theme.spacing.l,
        color: theme.colors.textSecondary,
    },
    topOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
    },
    stopFab: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: theme.colors.error,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
