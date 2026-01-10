import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_analysis_queue';

export interface QueueItem {
    id: string;
    uri: string;
    tone: string;
    timestamp: number;
}

export const addToQueue = async (uri: string, tone: string) => {
    try {
        const currentQueue = await getQueue();
        const newItem: QueueItem = {
            id: Date.now().toString(),
            uri,
            tone,
            timestamp: Date.now(),
        };
        const updatedQueue = [...currentQueue, newItem];
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
        return true;
    } catch (e) {
        console.error("Failed to add to queue", e);
        return false;
    }
};

export const getQueue = async (): Promise<QueueItem[]> => {
    try {
        const json = await AsyncStorage.getItem(QUEUE_KEY);
        return json ? JSON.parse(json) : [];
    } catch (e) {
        return [];
    }
};

export const clearQueue = async () => {
    await AsyncStorage.removeItem(QUEUE_KEY);
};

export const removeFromQueue = async (id: string) => {
    const currentQueue = await getQueue();
    const updated = currentQueue.filter(item => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
};
