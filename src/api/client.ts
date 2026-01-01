import axios from 'axios';
import { auth } from '../config/firebase';
import { Logger } from '../services/Logger';

// Google Cloud Run Endpoint
const API_URL = 'https://dog-translator-service-736369571076.us-east1.run.app';

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

        // Get fresh token from Firebase
        const token = await auth.currentUser?.getIdToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token} `;
        }


        // ===== DEBUG LOGGING =====
        console.log('📤 REQUEST DETAILS:');
        console.log('   URL:', (config.baseURL || '') + (config.url || ''));
        console.log('   Method:', config.method);
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
