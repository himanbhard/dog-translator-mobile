import * as ImageManipulator from 'expo-image-manipulator';
import client from './client';
import { Logger } from '../services/Logger';
import { ApiError } from './ApiError';

export interface InterpretationResult {
    status: 'ok' | 'error';
    explanation: string;
    confidence: number;
    breed?: string;
    source?: string;
    share_id?: string;
    error?: string;
}

/**
 * Standard image analysis function.
 */
export const analyzeImage = async (uri: string, tone: string = 'playful'): Promise<InterpretationResult> => {
    try {
        Logger.info('🔵 Step 1: Starting analysis for URI:', uri);

        // Verify image URI exists
        if (!uri) {
            throw new Error('Image URI is undefined or empty');
        }

        Logger.info('🔵 Step 2: Compressing image...');
        const manipulated = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        Logger.info('🔵 Step 3: Image compressed to:', manipulated.uri);

        const formData = new FormData();
        let fileUri = manipulated.uri;

        // Robust URI sanitization for Android/iOS
        // 1. Remove any unexpected double prefixes
        fileUri = fileUri.replace(/^file:\/\/file:\/\//, 'file://');

        // 2. Ensure exactly one 'file://' prefix if it's a local path
        if (!fileUri.startsWith('file://') && (fileUri.startsWith('/') || fileUri.startsWith('data/'))) {
            fileUri = 'file://' + fileUri;
        }

        Logger.info('🔵 Step 4: Finalized URI for upload:', fileUri);

        const fileObject = {
            uri: fileUri,
            name: 'dog.jpg',
            type: 'image/jpeg',
        };

        formData.append('image', fileObject as any);
        formData.append('tone', tone);
        formData.append('save', 'true');

        Logger.info('🔵 Step 5: FormData prepared. Sending POST to:', `${client.defaults.baseURL}/api/v1/interpret`);

        Logger.info('🔵 Step 5: FormData prepared. Sending POST to:', `${client.defaults.baseURL}/api/v1/interpret`);

        // Use native fetch to bypass Axios interceptors/App Check that might be hanging
        const token = await import('../config/firebase').then(m => m.auth.currentUser?.getIdToken());

        const response = await fetch(`${client.defaults.baseURL}/api/v1/interpret`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                // content-type is set automatically by fetch for FormData
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Helper to clean raw LLM output
        if (data && data.explanation) {
            let text = data.explanation.trim();
            // Remove markdown
            text = text.replace(/```(?:json)?/g, '').replace(/```/g, '');
            text = text.replace(/'''(?:json)?/g, '').replace(/'''/g, '');
            text = text.trim();

            // Try detecting 'explanation' field if it looks like a JSON object
            // Match "explanation": "..." or 'explanation': "..."
            const match = text.match(/(?:['"]?explanation['"]?)\s*:\s*(['"])([\s\S]*?)\1/);
            if (match && match[2]) {
                text = match[2];
            } else {
                // Try JSON parse last resort
                try {
                    const parsed = JSON.parse(text);
                    if (parsed.explanation) text = parsed.explanation;
                } catch (e) { }
            }
            data.explanation = text;
        }

        Logger.info('🔵 Step 6: Response received:', response.status);
        return data as InterpretationResult;

    } catch (error: any) {
        Logger.error('❌ Analysis failed at step:', error.message);
        Logger.error('❌ Error details:', JSON.stringify({
            name: error.name,
            code: error.code,
            message: error.message,
            response: error.response?.status,
            responseData: error.response?.data,
        }, null, 2));

        const apiError = ApiError.fromError(error);
        throw apiError;
    }
};

/**
 * Fetch detailed explanation for a translation
 */
export const getExplanation = async (translation: string, breed?: string): Promise<any> => {
    try {
        // Construct query - backend expects 'behavior' query param
        const query = (translation || 'dog behavior').substring(0, 100);
        const params = new URLSearchParams({ behavior: query });

        // Use fetch with GET (Backend expectation) and bypass interceptors
        const token = await import('../config/firebase').then(m => m.auth.currentUser?.getIdToken());

        const url = `${client.defaults.baseURL}/api/v1/explain?${params.toString()}`;
        console.log("Fetching explanation from:", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`HTTP ${response.status}: ${err}`);
        }

        const data = await response.json();

        // Transform the search results into a readable explanation string
        // The backend returns { results: [{title, snippet, url}, ...] }
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
            const summary = data.results.map((r: any) => `• ${r.title}\n${r.snippet}`).join('\n\n');
            return { explanation: summary };
        } else if (data.results && data.results.length === 0) {
            return { explanation: "No detailed search results found for this behavior." };
        }

        return data; // Fallback
    } catch (error: any) {
        console.error("Explain Error:", error);
        throw ApiError.fromError(error);
    }
};

/**
 * Fetch user's history from the backend
 */
export const getRemoteHistory = async (): Promise<InterpretationResult[]> => {
    try {
        const response = await client.get('/api/v1/history');
        return response.data;
    } catch (error: any) {
        throw ApiError.fromError(error);
    }
};
