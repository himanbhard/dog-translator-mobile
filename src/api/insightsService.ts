import client from './client';
import { Logger } from '../services/Logger';

/**
 * Represents a single insight article from Google Search.
 */
export interface InsightArticle {
    title: string;
    snippet: string;
    url: string;
    source: string; // e.g., "akc.org"
}

/**
 * Fetches behavior insights from the backend API.
 * @param behavior - The behavior query string (e.g., the dog's translation/explanation)
 * @returns An array of InsightArticle objects, or an empty array on error.
 */
export const getBehaviorInsights = async (behavior: string): Promise<InsightArticle[]> => {
    try {
        Logger.info('🔵 Fetching behavior insights...');

        const response = await client.get('/api/v1/explain', {
            params: { behavior: behavior }
        });

        Logger.info('✅ Behavior insights received: ' + (response.data?.length || 0) + ' articles');

        // Handle backend response format: { status: "ok", results: [...] }
        if (response.data?.results && Array.isArray(response.data.results)) {
            return response.data.results.map((item: any) => ({
                title: item.title || 'Untitled',
                snippet: item.snippet || '',
                url: item.url || '',
                source: item.source || extractDomain(item.url),
            }));
        }

        // Legacy/Fallback check
        if (Array.isArray(response.data)) {
            return response.data.map((item: any) => ({
                title: item.title || 'Untitled',
                snippet: item.snippet || '',
                url: item.url || '',
                source: item.source || extractDomain(item.url),
            }));
        }

        Logger.warn('⚠️ Unexpected response format for insights');
        return [];
    } catch (error: any) {
        Logger.error('❌ Failed to fetch behavior insights:', error?.message || error);
        return [];
    }
};

/**
 * Extracts domain from a URL for display purposes.
 */
function extractDomain(url: string): string {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '');
    } catch {
        return 'Unknown';
    }
}
