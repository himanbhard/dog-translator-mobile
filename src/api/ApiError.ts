/**
 * Standard API Error class for consistent error handling.
 */
export class ApiError extends Error {
    status: number | string;
    data: any;

    constructor(message: string, status: number | string, data: any = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }

    static fromError(error: any): ApiError {
        const status = error.response ? error.response.status : 'NETWORK_ERROR';
        const data = error.response ? error.response.data : null;
        let message = 'An unexpected error occurred.';

        if (status === 401) message = 'Session expired. Please log in again.';
        else if (status === 413) message = 'The file is too large.';
        else if (status === 422) message = 'Validation failed. Please check your input.';
        else if (status === 502) message = 'The translation service is currently unavailable.';
        else if (status === 'NETWORK_ERROR') {
            // Provide more context for network errors
            if (error.code === 'ECONNABORTED') {
                message = 'Request timed out. Please check your connection.';
            } else if (error.message?.includes('Network Error')) {
                message = 'Unable to connect to server. Check your internet connection.';
            } else {
                message = error.message || 'Network error occurred.';
            }
            console.error('🔴 Network Error Details:', {
                code: error.code,
                message: error.message,
                config: error.config ? {
                    url: error.config.url,
                    baseURL: error.config.baseURL,
                    method: error.config.method,
                } : 'No config'
            });
        }
        else if (error.message) message = error.message;

        return new ApiError(message, status, data);
    }
}
