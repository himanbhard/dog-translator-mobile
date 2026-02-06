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
        if (!fileUri.startsWith('file://')) fileUri = 'file://' + fileUri;

        const fileObject = {
            uri: fileUri,
            name: 'dog.jpg',
            type: 'image/jpeg',
        };

        formData.append('image', fileObject as any);
        formData.append('tone', tone);
        formData.append('save', 'true');

        Logger.info('🔵 Step 4: FormData created, sending to API...');
        Logger.info('🔵 Target endpoint: /api/v1/interpret');

        const response = await client.post('/api/v1/interpret', formData);

        Logger.info('🔵 Step 5: Response received:', response.status);
        return response.data;

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
        const response = await client.post('/api/v1/explain', { translation, breed });
        return response.data;
    } catch (error: any) {
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
