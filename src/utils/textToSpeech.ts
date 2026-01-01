import * as Speech from 'expo-speech';

export interface TTSOptions {
    tone?: 'playful' | 'calm' | 'trainer';
    onStart?: () => void;
    onDone?: () => void;
    onError?: (error: string) => void;
}

/**
 * Speak text aloud with tone-specific voice settings
 */
export const speak = async (text: string, options: TTSOptions = {}) => {
    const { tone = 'playful', onStart, onDone, onError } = options;

    // Stop any ongoing speech first
    await Speech.stop();

    // Tone-specific voice settings
    const voiceSettings = {
        playful: {
            pitch: 1.3,    // Higher pitch for excitement
            rate: 1.05     // Slightly faster
        },
        calm: {
            pitch: 0.85,   // Lower, soothing pitch
            rate: 0.8      // Slower, relaxed pace
        },
        trainer: {
            pitch: 1.0,    // Neutral pitch
            rate: 0.95     // Clear, steady pace
        },
    };

    const settings = voiceSettings[tone];

    console.log(`🔊 Speaking with "${tone}" voice (pitch: ${settings.pitch}, rate: ${settings.rate})`);

    return new Promise<boolean>((resolve, reject) => {
        Speech.speak(text, {
            language: 'en-US',
            pitch: settings.pitch,
            rate: settings.rate,
            onStart: () => {
                console.log('🎤 TTS: Speech started');
                onStart?.();
            },
            onDone: () => {
                console.log('✅ TTS: Speech completed');
                onDone?.();
                resolve(true);
            },
            onStopped: () => {
                console.log('⏹️ TTS: Speech stopped');
                resolve(false);
            },
            onError: (error) => {
                console.error('❌ TTS Error:', error);
                onError?.(error.toString());
                reject(error);
            },
        });
    });
};

/**
 * Stop any ongoing speech
 */
export const stop = async () => {
    console.log('⏸️ Stopping speech...');
    await Speech.stop();
};

/**
 * Check if currently speaking
 */
export const isSpeaking = async (): Promise<boolean> => {
    return await Speech.isSpeakingAsync();
};

/**
 * Get list of available voices on the device
 */
export const getAvailableVoices = async () => {
    const voices = await Speech.getAvailableVoicesAsync();
    console.log(`📋 Available voices: ${voices.length}`);
    return voices;
};
