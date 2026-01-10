
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';
import client from './client';
// import { getToken } from './tokenStorage'; // Legacy
import { auth } from '../config/firebase';
import { Logger } from '../services/Logger';

export interface InterpretationResult {
    status: 'ok' | 'error';
    explanation: string; // The dog's interpretation text
    confidence: number; // 0.0 to 1.0
    breed?: string; // NEW: Breed detection result
    source?: string; // e.g., "vertex_gemini"
    share_id?: string; // Only if save=true
    error?: string; // Only if status='error'
}

/**
 * PRIMARY METHOD: Using Axios (with interceptors)
 */
export const analyzeImage = async (uri: string, tone: string = 'playful'): Promise<InterpretationResult | null> => {
    try {
        // 1. Compress Image
        Logger.info('🔵 Step 1: Compressing image...');
        const manipulated = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        Logger.info('   ✓ Compressed URI:', manipulated.uri);

        // 2. Prepare FormData
        Logger.info('🔵 Step 2: Building FormData...');
        const formData = new FormData();

        // Log what we're appending
        // Ensure URI has proper format for React Native
        let fileUri = manipulated.uri;
        if (!fileUri.startsWith('file://')) {
            Logger.warn('   ⚠️  URI missing file:// prefix, adding it...');
            fileUri = 'file://' + fileUri;
        }

        const fileObject = {
            uri: fileUri,
            name: 'dog.jpg',
            type: 'image/jpeg',
        };
        Logger.info('   Field name: "image" (FIXED - was "file")');
        Logger.info('   File object:', JSON.stringify(fileObject, null, 2));
        Logger.info('   Tone:', tone);

        formData.append('image', fileObject as any);
        formData.append('tone', tone);
        formData.append('save', 'true'); // NEW: Request backend to save for sharing

        // 3. Upload
        Logger.info('🔵 Step 3: Sending to API via Axios (Attempt 1)...');
        try {
            const response = await client.post('/api/v1/interpret', formData);
            Logger.info('✅ API Response:', response.data);
            return response.data;
        } catch (firstError: any) {
            // Check if it's a 502 (Bad Gateway / Upstream Timeout)
            if (firstError.response?.status === 502) {
                Logger.warn('⚠️ 502 Error detected. Waiting 2 seconds and retrying...');
                // Wait 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                Logger.info('🔵 Step 3: Retrying API request (Attempt 2)...');
                const retryResponse = await client.post('/api/v1/interpret', formData);
                Logger.info('✅ API Retry Success:', retryResponse.data);
                return retryResponse.data;
            } else {
                // If it's not 502, throw immediately
                throw firstError;
            }
        }

    } catch (error: any) {
        Logger.error('❌ Analysis failed:', error);

        let message = 'Failed to analyze image. Please try again.';
        if (error.response) {
            if (error.response.status === 413) {
                message = 'The photo is too large. We tried to compress it but it failed.';
            } else if (error.response.status === 502) {
                message = 'Service is temporarily unavailable. Please try again in a moment.';
            } else if (error.response.status === 401) {
                message = 'Authentication Error: 401 Unauthorized.\nPlease check your login status or API token.';
            } else if (error.response.status === 422) {
                console.log('🔍 422 Validation Error - Full Details:');
                console.log(JSON.stringify(error.response.data, null, 2));
                message = `Validation Error (422): ${JSON.stringify(error.response.data)}\n\nTry the FETCH method instead.`;
            }
        }

        Alert.alert('Analysis Error', message);
        return null;
    }
};

/**
 * FALLBACK METHOD: Using native fetch (bypasses Axios)
 * Use this to test if the 422 error is Axios-specific
 */
export const analyzeImageWithFetch = async (uri: string, tone: string = 'playful'): Promise<InterpretationResult | null> => {
    try {
        console.log('🟢 Using FETCH fallback method...');

        // 1. Compress Image
        console.log('🟢 Step 1: Compressing image...');
        const manipulated = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        console.log('   ✓ Compressed URI:', manipulated.uri);

        // 2. Prepare FormData
        console.log('🟢 Step 2: Building FormData...');
        const formData = new FormData();

        // Ensure URI has proper format for React Native
        let fileUri = manipulated.uri;
        if (!fileUri.startsWith('file://')) {
            console.log('   ⚠️  URI missing file:// prefix, adding it...');
            fileUri = 'file://' + fileUri;
        }

        const fileObject = {
            uri: fileUri,
            name: 'dog.jpg',
            type: 'image/jpeg',
        };
        console.log('   Field name: "image" (FIXED - was "file")');
        console.log('   File object:', JSON.stringify(fileObject, null, 2));
        console.log('   Tone:', tone);

        formData.append('image', fileObject as any);
        formData.append('tone', tone);

        // 3. Get Token
        const token = await auth.currentUser?.getIdToken();
        console.log('🟢 Step 3: Token retrieved:', token ? 'YES' : 'NO');

        // 4. Send with fetch
        console.log('🟢 Step 4: Sending with fetch...');
        const API_URL = 'https://dog-translator-service-736369571076.us-east1.run.app';

        // Add App Check token to fetch
        const headers: Record<string, string> = {
            'Authorization': token ? `Bearer ${token}` : '',
        };

        try {
            const { getAppCheckToken } = await import('../services/appCheck');
            const appCheckToken = await getAppCheckToken();
            if (appCheckToken) {
                headers['X-Firebase-AppCheck'] = appCheckToken;
            }
        } catch (e) {
            console.warn('⚠️ Could not fetch App Check token for fetch:', e);
        }

        const response = await fetch(`${API_URL}/api/v1/interpret`, {
            method: 'POST',
            headers,
            body: formData,
        });

        console.log('   Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('🔴 FETCH Error Response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ FETCH Success:', data);
        return data;

    } catch (error: any) {
        console.error('❌ FETCH Analysis failed:', error);
        Alert.alert('Fetch Analysis Error', error.message || 'Unknown error');
        return null;
    }
};

export interface ExplanationResponse {
    explanation: string;
    links: { title: string; url: string }[];
}

/**
 * Fetch detailed explanation for a translation
 */
export const getExplanation = async (translation: string, breed?: string): Promise<ExplanationResponse | null> => {
    try {
        Logger.info('🔵 Requesting explanation...');
        const token = await auth.currentUser?.getIdToken();

        // Using Axios client if configured, or fallback to fetch if needed. 
        // analysisService uses `client` which has auth interceptor? 
        // The existing analyzeImage uses `client` but `analyzeImageWithFetch` manually gets token.
        // `client.ts` likely handles auth. Let's use `client`.

        const response = await client.post('/api/v1/explain', {
            translation,
            breed
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        Logger.info('✅ Explanation received:', response.data);
        return response.data;
    } catch (error: any) {
        Logger.error('❌ Explanation request failed:', error);
        return null;
    }
};
