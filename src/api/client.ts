import axios from 'axios';
import { auth } from '../config/firebase';
import { Logger } from '../services/Logger';
import { getAppCheckToken } from '../services/appCheck';

// Google Cloud Run Endpoint (Using the short-tagged URL which proved more reliable in diagnostics)
const FALLBACK_API_URL = 'https://dog-translator-service-qmvz4dws7a-ue.a.run.app';
const API_URL = (process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL).trim();

// Debug: Log API URL on module load
console.log('🔧 API Client Configuration:');
console.log('   EXPO_PUBLIC_API_URL from env:', (process.env.EXPO_PUBLIC_API_URL || '').trim() || '❌ UNDEFINED');
console.log('   Using API_URL:', API_URL);

if (!process.env.EXPO_PUBLIC_API_URL) {
    console.warn('⚠️ EXPO_PUBLIC_API_URL not found in environment, using fallback URL');
}

const client = axios.create({
    baseURL: API_URL,
    timeout: 60000,
    headers: {
        'Accept': 'application/json',
    },
    transformRequest: [(data, headers) => {
        if (data instanceof FormData) {
            delete headers['Content-Type'];
            return data;
        }
        if (headers['Content-Type'] === 'application/json') {
            return JSON.stringify(data);
        }
        return data;
    }],
});

client.interceptors.request.use(
    async (config) => {
        // Log Request
        Logger.info(`➡️ REQUEST: ${config.method?.toUpperCase()} ${config.url} `);

        // Get fresh token from Firebase (wrapped in try-catch to prevent failures)
        try {
            const currentUser = auth.currentUser;
            console.log('🔐 Auth State:', currentUser ? `User: ${currentUser.email}` : '❌ NOT LOGGED IN');

            if (currentUser) {
                const token = await currentUser.getIdToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('✅ Authorization header set');
                }
            } else {
                console.warn('⚠️ No authenticated user - request will be sent without Authorization header');
            }
        } catch (authError) {
            console.error('❌ Failed to get Firebase auth token:', authError);
            // Continue without auth token - the backend will return 401 if auth is required
        }

        // Get App Check token (optional, don't fail if it doesn't work)
        try {
            const appCheckToken = await getAppCheckToken();
            if (appCheckToken) {
                config.headers['X-Firebase-AppCheck'] = appCheckToken;
                console.log('✅ App Check Header SET');
            } else {
                console.warn('⚠️ App Check token is NULL - continuing without it');
            }
        } catch (e) {
            console.error('❌ App Check token fetch FAILED:', e);
            // Continue without App Check - backend should still work
        }


        // ===== DEBUG LOGGING =====
        console.log('📤 REQUEST DETAILS:');
        console.log('   URL:', (config.baseURL || '') + (config.url || ''));
        console.log('   Method:', config.method);
        console.log('   Has X-Firebase-AppCheck?', !!config.headers['X-Firebase-AppCheck']);
        console.log('   Headers:', JSON.stringify(config.headers, null, 2));

        if (config.data instanceof FormData) {
            console.log('   Content-Type: multipart/form-data (FormData)');
            console.log('   ⚠️  FormData contents cannot be logged directly in RN');
        } else {
            console.log('   Data:', config.data);
        }
        console.log('========================');

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

client.interceptors.response.use(
    (response) => {
        Logger.info(`⬅️ RESPONSE: ${response.status} ${response.config.url} `);
        return response;
    },
    (error) => {
        const status = error.response ? error.response.status : 'UNKNOWN';
        const url = error.config ? error.config.url : 'UNKNOWN';

        Logger.error(`❌ API ERROR: ${status} on ${url} `);

        if (error.response) {
            // Log full details for debugging 502/500/400
            Logger.error('Error Details:', {
                status: status,
                data: error.response.data,
                headers: error.response.headers, // Trace IDs often here
            });

            if (status === 413) {
                console.error('Error 413: Payload Too Large. The image size exceeds the limit.');
            } else if (status === 502) {
                console.error('Error 502: Bad Gateway. Cloud Run or upstream service timed out.');
            } else if (status === 422) {
                console.error('🔍 Error 422: VALIDATION FAILED');
                console.error('The server rejected the request. Common causes:');
                console.error('1. "image" field missing?');
                console.error('2. "tone" field missing?');
                console.error('3. "image" is not a valid JPEG/PNG?');
                console.error('Server response data:', JSON.stringify(error.response.data, null, 2));
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
        } else {
            Logger.error('Network Error (No Response):', error.message);
        }
        return Promise.reject(error);
    }
);

export default client;
