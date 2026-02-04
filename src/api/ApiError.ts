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
        else if (error.message) message = error.message;

        return new ApiError(message, status, data);
    }
}
