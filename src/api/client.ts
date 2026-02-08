import { auth } from '../config/firebase';
import { getAppCheckToken } from '../services/appCheck';
import { Logger } from '../services/Logger';

// Google Cloud Run Endpoint
const FALLBACK_API_URL = 'https://dog-translator-service-qmvz4dws7a-ue.a.run.app';
const API_URL = (process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL).trim();

console.log('🔧 API Client Configuration (Fetch Adapter):');
console.log('   API_URL:', API_URL);

// Custom Error Class to mimic Axios Error for compatibility
class AxiosError extends Error {
    response: any;
    config: any;
    code?: string;
    constructor(message: string, response?: any, config?: any, code?: string) {
        super(message);
        this.name = 'AxiosError';
        this.response = response;
        this.config = config;
        this.code = code;
    }
}

// Fetch Implementation
const request = async (method: string, url: string, data?: any, config: any = {}) => {
    // Construct Full URL
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

    // Headers
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json', // Default to JSON
        ...config.headers
    };

    // 1. Request Interceptor Logic
    Logger.info(`➡️ REQUEST (Fetch): ${method} ${fullUrl}`);

    // Auth Token
    try {
        const currentUser = auth.currentUser;
        if (currentUser) {
            // Force token refresh if needed? No, just getIdToken()
            const token = await currentUser.getIdToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                // console.log('✅ Authorization header set');
            }
        } else {
            console.warn('⚠️ No authenticated user');
        }
    } catch (e) {
        console.warn('Failed to get Auth Token', e);
    }

    // App Check
    try {
        const appCheck = await getAppCheckToken();
        if (appCheck) headers['X-Firebase-AppCheck'] = appCheck;
    } catch (e) {
        console.warn('Failed to get AppCheck Token', e);
    }

    // 2. Execute Fetch
    try {
        const response = await fetch(fullUrl, {
            method,
            headers,
            body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
        });

        Logger.info(`⬅️ RESPONSE: ${response.status} ${fullUrl}`);

        // 3. Parse Response
        const text = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(text);
        } catch {
            responseData = text;
        }

        // 4. Handle HTTP Errors
        if (!response.ok) {
            // Log details
            Logger.error(`❌ API ERROR: ${response.status} on ${fullUrl}`);

            throw new AxiosError(
                `Request failed with status ${response.status}`,
                { status: response.status, data: responseData, headers: response.headers },
                { url: fullUrl, method, headers },
                response.status.toString()
            );
        }

        // 5. Success
        return {
            data: responseData,
            status: response.status,
            headers: response.headers,
            config: { url: fullUrl, method, headers },
            request: {} // dummy
        };

    } catch (error: any) {
        if (error.name === 'AxiosError') throw error;
        // Network Error
        Logger.error('❌ NETWORK ERROR:', error.message);
        throw new AxiosError(error.message, undefined, { url: fullUrl, method }, 'ERR_NETWORK');
    }
};

// Axios-compatible Interface
const client = {
    defaults: { baseURL: API_URL },
    get: (url: string, config?: any) => request('GET', url, null, config),
    post: (url: string, data?: any, config?: any) => request('POST', url, data, config),
    put: (url: string, data?: any, config?: any) => request('PUT', url, data, config),
    delete: (url: string, config?: any) => request('DELETE', url, null, config),

    // Mock interceptors to prevent crashes if imported and used
    interceptors: {
        request: { use: () => { } },
        response: { use: () => { } }
    },
    create: () => client
};

export default client;
