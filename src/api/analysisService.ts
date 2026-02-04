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
        Logger.info('🔵 Step 1: Compressing image...');
        const manipulated = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

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

        Logger.info('🔵 Step 2: Sending to API...');
        const response = await client.post('/api/v1/interpret', formData);
        
        return response.data;

    } catch (error: any) {
        const apiError = ApiError.fromError(error);
        Logger.error('❌ Analysis failed:', apiError.message, apiError.status);
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
