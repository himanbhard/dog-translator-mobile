import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import { Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { analyzeImage } from '../api/analysisService';
import { saveImageToInternalStorage } from '../services/fileStorage';
import { addHistoryEntry } from '../services/historyDatabase';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../styles/theme';
import { speak, stop as stopSpeech } from '../utils/textToSpeech';
import { Button } from '../components/ui/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { addToQueue } from '../services/offlineQueue';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';

type Tone = 'Playful' | 'Calm' | 'Trainer';

export default function ScannerScreen() {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const [tone, setTone] = useState<Tone>('Playful');
    const cameraRef = useRef<Camera>(null);
    const [isanalyzing, setIsAnalyzing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const { autoSpeak, isPremium, dailyScans, incrementScanCount, checkResetDailyScans } = useSettingsStore();
    const { activePetId, getActivePet } = usePetStore();
    const activePet = getActivePet();

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
        const result = await analyzeImage(uri, tone.toLowerCase());
        setIsAnalyzing(false);

        if (result && result.status === 'ok') {
            incrementScanCount();
            
            if (autoSpeak) {
                setIsSpeaking(true);
                speak(result.explanation, {
                    tone: tone.toLowerCase() as any,
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
                            const permanentPath = await saveImageToInternalStorage(uri);
                            await addHistoryEntry(permanentPath, {
                                explanation: result.explanation,
                                confidence: result.confidence,
                                tone: tone,
                                breed: result.breed || 'Unknown',
                            }, activePetId);
                        }
                    },
                    { text: 'Done', style: 'cancel' }
                ]
            );
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
            const photo = await cameraRef.current.takePhoto({ qualityPrioritization: 'quality' });
            if (photo?.path) handleAnalysis('file://' + photo.path);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Camera
                style={styles.camera}
                device={device}
                isActive={true}
                photo={true}
                ref={cameraRef}
            />

            <View style={styles.topOverlay}>
                <View style={styles.toneSelector}>
                    {(['Playful', 'Calm', 'Trainer'] as Tone[]).map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.toneOption, tone === t && styles.toneOptionSelected]}
                            onPress={() => setTone(t)}
                        >
                            <Text style={[styles.toneText, tone === t && styles.toneTextSelected]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.bottomOverlay}>
                <View style={styles.controls}>
                    <TouchableOpacity onPress={pickImage} style={styles.secondaryButton}>
                        <Ionicons name="images-outline" size={28} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>

                    <View style={styles.secondaryButton} />
                </View>
            </View>

            {isanalyzing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={styles.loadingText}>Analyzing Body Language...</Text>
                </View>
            )}

            {isSpeaking && (
                <TouchableOpacity style={styles.stopFab} onPress={() => { stopSpeech(); setIsSpeaking(false); }}>
                    <Ionicons name="stop" size={24} color="#FFF" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
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
    toneSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 25,
        padding: 4,
    },
    toneOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    toneOptionSelected: {
        backgroundColor: theme.colors.primary,
    },
    toneText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    toneTextSelected: {
        color: '#FFF',
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...theme.typography.headline,
        color: '#FFF',
        marginTop: 20,
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
