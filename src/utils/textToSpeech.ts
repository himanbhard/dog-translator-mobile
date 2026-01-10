import Tts from 'react-native-tts';

export interface TTSOptions {
    tone?: 'playful' | 'calm' | 'trainer';
    onStart?: () => void;
    onDone?: () => void;
    onError?: (error: string) => void;
}

// Initialize TTS
Tts.setDefaultLanguage('en-US');

// Tone-specific voice settings (Simulated by pitch/rate since Tts APIs differ)
const voiceSettings = {
    playful: {
        pitch: 1.3,
        rate: 0.55 // Tts rate is different scale usually 0.0-1.0
    },
    calm: {
        pitch: 0.85,
        rate: 0.4
    },
    trainer: {
        pitch: 1.0,
        rate: 0.5
    },
};

export const speak = async (text: string, options: TTSOptions = {}) => {
    const { tone = 'playful', onStart, onDone, onError } = options;

    await stop();

    const settings = voiceSettings[tone];

    Tts.setDefaultPitch(settings.pitch);
    Tts.setDefaultRate(settings.rate);

    // Add listeners (clear previous to avoid dupes)
    Tts.removeAllListeners('tts-start');
    Tts.removeAllListeners('tts-finish');
    Tts.removeAllListeners('tts-error');

    return new Promise<boolean>((resolve, reject) => {
        Tts.addEventListener('tts-start', () => {
            console.log('🎤 TTS: Speech started');
            onStart?.();
        });

        Tts.addEventListener('tts-finish', () => {
            console.log('✅ TTS: Speech completed');
            onDone?.();
            resolve(true);
        });

        Tts.addEventListener('tts-error', (event: any) => {
            console.error('❌ TTS Error:', event);
            onError?.(event.toString());
            // Don't reject, just resolve false
            resolve(false);
        });

        Tts.speak(text);
    });
};

export const stop = async () => {
    Tts.stop();
};

export const isSpeaking = async (): Promise<boolean> => {
    // Tts doesn't have isSpeakingAsync equivalent easily, 
    // we assume false or track state manually if needed.
    return false;
};

export const getAvailableVoices = async () => {
    return await Tts.voices();
};
