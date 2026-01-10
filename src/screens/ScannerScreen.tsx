import { BlurView } from '@react-native-community/blur';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import { Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeImage } from '../api/analysisService';
import { saveImageToStorage } from '../services/fileStorage';
import { addHistoryItem } from '../services/historyDatabase';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../styles/theme';
import { speak, stop as stopSpeech } from '../utils/textToSpeech';
import { Button } from '../components/ui/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PaywallScreen from './PaywallScreen';
import NetInfo from '@react-native-community/netinfo';
import { addToQueue } from '../services/offlineQueue';
import { usePetStore } from '../store/usePetStore';
import { PetJournalService } from '../services/petJournal';
import { useNavigation } from '@react-navigation/native';
import ExplanationModal from '../components/ExplanationModal';

type Tone = 'Playful' | 'Calm' | 'Trainer';

export default function ScannerScreen() {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const [tone, setTone] = useState<Tone>('Playful');
    const cameraRef = useRef<Camera>(null);
    const [isanalyzing, setIsAnalyzing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const { autoSpeak, isPremium, dailyScans, incrementScanCount, checkResetDailyScans } = useSettingsStore();
    const [showPaywall, setShowPaywall] = useState(false);

    // Explanation Feature
    const [explanationVisible, setExplanationVisible] = useState(false);
    const [lastAnalysisResult, setLastAnalysisResult] = useState<{ translation: string, breed?: string, petId?: string, journalId?: string } | null>(null);

    // Pet Integration
    const { getActivePet, activePetId } = usePetStore();
    const activePet = getActivePet();
    const navigation = useNavigation();

    // Initial check for daily reset
    useEffect(() => {
        checkResetDailyScans();
    }, []);

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    if (!hasPermission) return <View style={styles.container} />;

    if (!device) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.permissionText}>No camera device found!</Text>
            </View>
        )
    }

    const handleAnalysis = async (uri: string) => {
        // 0. Network Check
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            Alert.alert(
                "Offline 📴",
                "You are currently offline. We can save this scan to the queue and process it later.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Save to Queue",
                        onPress: async () => {
                            const success = await addToQueue(uri, tone);
                            if (success) Alert.alert("Saved", "Will process when back online!");
                        }
                    }
                ]
            );
            return;
        }

        // 1. Freemium Check
        if (!isPremium && dailyScans >= 5) {
            setShowPaywall(true);
            return;
        }

        setIsAnalyzing(true);
        const result = await analyzeImage(uri, tone.toLowerCase());
        setIsAnalyzing(false);

        if (result) {
            // 2. Increment Usage if successful
            incrementScanCount();

            if (result.confidence === 0) {
                Alert.alert('No Dog Found 🧐', result.explanation || "Try again with a clear photo!", [{ text: 'Okay' }]);
                return;
            }

            if (result.status === 'ok') {
                if (autoSpeak) {
                    setIsSpeaking(true);
                    speak(result.explanation, {
                        tone: tone.toLowerCase() as any,
                        onDone: () => setIsSpeaking(false),
                        onError: () => setIsSpeaking(false),
                    }).catch(() => setIsSpeaking(false));
                }

                const breedText = result.breed ? `\n🐶 Breed: ${result.breed}` : '';

                Alert.alert(
                    '🐕 Dog Says:',
                    `${result.explanation}${breedText}\n\n✅ Confidence: ${(result.confidence * 100).toFixed(0)}%`,
                    [
                        {
                            text: '💾 Save',
                            onPress: async () => {
                                try {
                                    const filename = await saveImageToStorage(uri);


                                    // 1. Legacy Global History (Now Pet Aware)
                                    await addHistoryItem(
                                        filename,
                                        result.explanation,
                                        result.confidence,
                                        tone,
                                        result.breed || 'Unknown Mix', // Pass breed
                                        result.share_id || '', // Pass share_id
                                        activePetId // Pass pet_id
                                    );

                                    // 2. Pet Journal (if pet selected)
                                    if (activePetId) {
                                        const entry = await PetJournalService.addEntry(
                                            activePetId,
                                            filename,
                                            result.explanation,
                                            result.confidence,
                                            result.breed // Pass breed
                                        );
                                        // Update state with journal details for explanation context
                                        setLastAnalysisResult({
                                            translation: result.explanation,
                                            breed: result.breed,
                                            petId: activePetId,
                                            journalId: entry.id
                                        });
                                    }

                                    Alert.alert("Saved", activePet ? `Added to ${activePet.name}'s journal!` : "Added to your journal!");
                                } catch (e) {
                                    Alert.alert("Error", "Failed to save.");
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
                Alert.alert('❌ Error', result.error || 'Unable to interpret the image');
            }
        }
    };

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
            includeBase64: false,
        });

        if (!result.didCancel && result.assets && result.assets[0].uri) {
            handleAnalysis(result.assets[0].uri);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto({ qualityPrioritization: 'quality' });
                // Photo path is usually file://...
                if (photo?.path) {
                    const uri = 'file://' + photo.path;
                    handleAnalysis(uri);
                }
            } catch (error) {
                console.error(error);
            }
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

            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                {/* Header */}
                <BlurView blurType="dark" blurAmount={30} style={styles.header}>
                    <Text style={styles.headerTitle}>Dog Translator</Text>
                    {activePet && (
                        <TouchableOpacity style={styles.petBadge} onPress={() => navigation.navigate('Pets' as any)}>
                            <Image
                                source={activePet.photoUri ? { uri: activePet.photoUri } : { uri: "https://img.freepik.com/free-vector/cute-dog-sitting-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4103.jpg?w=740" }}
                                style={styles.petHeaderImage}
                            />
                            <Text style={styles.petName}>{activePet.name}</Text>
                        </TouchableOpacity>
                    )}
                    {!activePet && (
                        <TouchableOpacity style={styles.petBadge} onPress={() => navigation.navigate('Pets' as any)}>
                            <Ionicons name="paw" size={16} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={styles.petName}>Add Pet</Text>
                        </TouchableOpacity>
                    )}
                </BlurView>

                {/* Tone Selector */}
                <View style={styles.toneWrapper}>
                    <BlurView blurType="dark" blurAmount={40} style={styles.toneSelector}>
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
                <View style={styles.bottomContainer}>
                    <BlurView blurType="dark" blurAmount={50} style={styles.controls}>
                        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                            <Ionicons name="images-outline" size={28} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={takePicture} activeOpacity={0.8}>
                            <LinearGradient
                                colors={theme.gradients.primary}
                                style={styles.captureButton}
                            >
                                <View style={styles.captureInner} />
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.spacer} />
                    </BlurView>
                </View>

                {/* Analysis Overlay */}
                {isanalyzing && (
                    <View style={styles.loadingOverlay}>
                        <BlurView blurType="dark" blurAmount={80} style={StyleSheet.absoluteFill} />
                        <LottieView
                            autoPlay
                            loop
                            style={styles.lottie}
                            source={{ uri: 'https://lottie.host/5a704f46-6014-4632-8419-744319525c34/L1.json' }}
                        />
                        <Text style={styles.loadingText}>Analyzing Body Language...</Text>
                    </View>
                )}

                {/* Stop Speech FAB */}
                {isSpeaking && (
                    <TouchableOpacity style={styles.fab} onPress={async () => {
                        await stopSpeech();
                        setIsSpeaking(false);
                    }}>
                        <Ionicons name="stop-circle" size={32} color="#FFF" />
                        <Text style={styles.fabText}>Stop</Text>
                    </TouchableOpacity>
                )}
                {/* Paywall */}
                <PaywallScreen visible={showPaywall} onClose={() => setShowPaywall(false)} />

                {/* Explanation Modal */}
                <ExplanationModal
                    visible={explanationVisible}
                    onClose={() => setExplanationVisible(false)}
                    translation={lastAnalysisResult?.translation || ''}
                    breed={lastAnalysisResult?.breed}
                    petId={lastAnalysisResult?.petId}
                    journalEntryId={lastAnalysisResult?.journalId}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: 10,
        marginHorizontal: 20,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    petBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginLeft: 10,
    },
    petHeaderImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 6,
    },
    petName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    permissionText: {
        ...theme.typography.h3,
        textAlign: 'center',
        marginBottom: 20,
        color: theme.colors.text,
    },
    toneWrapper: {
        alignItems: 'center',
        marginTop: 20,
    },
    toneSelector: {
        flexDirection: 'row',
        borderRadius: 30,
        padding: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    toneOption: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    toneOptionSelected: {
        backgroundColor: theme.colors.primary,
    },
    toneText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    toneTextSelected: {
        color: '#FFF',
    },
    bottomContainer: {
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Changed to space-between for better alignment
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    captureInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: '#FFF',
        backgroundColor: 'transparent',
    },
    spacer: {
        width: 50,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    lottie: {
        width: 250,
        height: 250,
    },
    loadingText: {
        ...theme.typography.h3,
        marginTop: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 140,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.error,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        zIndex: 30,
        ...theme.shadows.medium,
    },
    fabText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 8,
    }
});
