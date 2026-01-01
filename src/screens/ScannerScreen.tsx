import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeImage } from '../api/analysisService';
import { saveImageToStorage } from '../services/fileStorage';
import { addHistoryItem } from '../services/historyDatabase';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../styles/theme';
import { speak, stop as stopSpeech } from '../utils/textToSpeech';

const { width } = Dimensions.get('window');

type Tone = 'Playful' | 'Calm' | 'Trainer';

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [tone, setTone] = useState<Tone>('Playful');
    const cameraRef = useRef<CameraView>(null);
    const [isanalyzing, setIsAnalyzing] = useState(false);

    // Debug toggle removed - default to standard behavior
    // Debug toggle removed - default to standard behavior
    const [isSpeaking, setIsSpeaking] = useState(false);
    const { autoSpeak } = useSettingsStore(); // Use global setting
    // Router no longer needed for direct history navigation? 
    // Actually, we might keep it if we want to programmatically nav, 
    // but the Tabs handle it. Removing unused valid ref if unused.
    const router = useRouter();

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        // Camera permissions are still loading
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', color: theme.colors.text }}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleAnalysis = async (uri: string) => {
        setIsAnalyzing(true);
        console.log(`🎵 Tone: ${tone.toLowerCase()}`);

        // Always use standard analyzeImage (Axios/modern) - Debug removed from UI
        const result = await analyzeImage(uri, tone.toLowerCase());

        setIsAnalyzing(false);

        if (result) {
            // Check for "No Dog" case (Zero confidence means detection failed)
            if (result.confidence === 0) {
                Alert.alert(
                    'No Dog Found 🧐',
                    result.explanation || "We couldn't detect a dog in the picture. Please try again with a clear photo of a dog!",
                    [{ text: 'Okay' }]
                );
                return;
            }

            if (result.status === 'ok') {
                // Auto-speak if enabled
                if (autoSpeak) {
                    setIsSpeaking(true);
                    speak(result.explanation, {
                        tone: tone.toLowerCase() as any,
                        onDone: () => setIsSpeaking(false),
                        onError: () => setIsSpeaking(false),
                    }).catch(() => setIsSpeaking(false));
                }

                // Show alert with manual speak and save options
                Alert.alert(
                    '🐕 Dog Says:',
                    `${result.explanation}\n\n✅ Confidence: ${(result.confidence * 100).toFixed(0)}%`,
                    [
                        {
                            text: '💾 Save',
                            onPress: async () => {
                                try {
                                    const filename = await saveImageToStorage(uri);
                                    await addHistoryItem(
                                        filename,
                                        result.explanation,
                                        result.confidence,
                                        tone
                                    );
                                    Alert.alert("Saved", "Added to your journal!");
                                } catch (e) {
                                    Alert.alert("Error", "Failed to save to journal.");
                                }
                            }
                        },
                        {
                            text: '🔊 Speak',
                            onPress: async () => {
                                setIsSpeaking(true);
                                try {
                                    await speak(result.explanation, {
                                        tone: tone.toLowerCase() as any,
                                        onDone: () => setIsSpeaking(false),
                                        onError: () => setIsSpeaking(false),
                                    });
                                } catch (error) {
                                    setIsSpeaking(false);
                                }
                            },
                        },
                        { text: 'Close', style: 'cancel' },
                    ]
                );
            } else {
                Alert.alert(
                    '❌ Error',
                    result.error || 'Unable to interpret the image'
                );
            }
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            console.log(result.assets[0].uri);
            handleAnalysis(result.assets[0].uri);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                // setIsAnalyzing(true); // Moved to handleAnalysis
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
                if (photo?.uri) {
                    handleAnalysis(photo.uri);
                }
            } catch (error) {
                console.error(error);
                setIsAnalyzing(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <CameraView style={styles.camera} ref={cameraRef} />
            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                {/* Header */}
                <BlurView intensity={20} tint="dark" style={styles.headerGlass}>
                    <Text style={styles.headerTitle}>Dog Translator</Text>
                </BlurView>

                {/* Tone Selector */}
                <View style={styles.toneContainer}>
                    <BlurView intensity={30} tint="dark" style={styles.toneSelector}>
                        {(['Playful', 'Calm', 'Trainer'] as Tone[]).map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.toneOption, tone === t && styles.toneOptionSelected]}
                                onPress={() => setTone(t)}
                            >
                                <Text style={[styles.toneText, tone === t && styles.toneTextSelected]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </BlurView>
                </View>

                {/* Bottom Controls */}
                <BlurView intensity={40} tint="dark" style={styles.bottomControls}>
                    <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
                        {/* Placeholder for Gallery Icon */}
                        <Text style={styles.iconText}>🖼️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={takePicture} style={styles.captureButtonOuter}>
                        <LinearGradient
                            colors={[theme.colors.primary, '#ff9f43']}
                            style={styles.captureButtonInner}
                        />
                    </TouchableOpacity>

                    {/* Spacer to balance layout if needed or just remove debug button */}
                    <View style={styles.spacer} />
                </BlurView>

                {isanalyzing && (
                    <View style={styles.analyzingOverlay}>
                        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                        <LottieView
                            autoPlay
                            loop
                            style={{
                                width: 200,
                                height: 200,
                            }}
                            source={{ uri: 'https://lottie.host/5a704f46-6014-4632-8419-744319525c34/L1.json' }} // Placeholder generic loader
                        />
                        <Text style={styles.analyzingText}>Analyzing...</Text>
                    </View>
                )}

                {/* Stop Speech Button */}
                {isSpeaking && (
                    <View style={styles.stopSpeechContainer}>
                        <TouchableOpacity
                            style={styles.stopSpeechButton}
                            onPress={async () => {
                                await stopSpeech();
                                setIsSpeaking(false);
                            }}
                        >
                            <Text style={styles.stopSpeechIcon}>⏹️</Text>
                            <Text style={styles.stopSpeechText}>Stop Speaking</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Auto-Speak Toggle - Moved to Settings */}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        zIndex: 1,
    },
    headerGlass: {
        margin: theme.spacing.m,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
        flexDirection: 'row', // Changed to row for history button
        justifyContent: 'center', // Center title
        alignItems: 'center',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        position: 'relative', // For absolute positioning if needed
    },
    headerTitle: {
        ...(theme.typography.header as any),
        fontSize: 20,
    },
    historyButton: {
        position: 'absolute',
        right: 15,
        padding: 5,
    },
    historyIcon: {
        fontSize: 22,
    },
    toneContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.s,
    },
    toneSelector: {
        flexDirection: 'row',
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xs,
        overflow: 'hidden',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
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
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    toneTextSelected: {
        color: '#fff',
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: theme.spacing.xl,
        paddingTop: theme.spacing.l,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        backgroundColor: 'rgba(10, 25, 47, 0.6)', // Semi-transparent Navy
    },
    galleryButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    spacer: {
        width: 50,
    },
    button: {
        marginTop: 20,
        backgroundColor: theme.colors.primary,
        padding: 15,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    iconText: {
        fontSize: 24,
    },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    analyzingText: {
        marginTop: 20,
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    debugButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    debugButtonText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    stopSpeechContainer: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center',
        zIndex: 20,
    },
    stopSpeechButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff4444',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    stopSpeechIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    stopSpeechText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    autoSpeakToggle: {
        position: 'absolute',
        top: theme.spacing.m + 70,
        right: theme.spacing.m,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    autoSpeakToggleActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    autoSpeakIcon: {
        fontSize: 24,
    }
});
