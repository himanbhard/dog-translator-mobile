import * as SQLite from 'expo-sqlite';

const DB_NAME = 'dog_translator.db';

export interface HistoryItem {
    id: number;
    filename: string; // We store just the filename, not full path
    explanation: string;
    confidence: number;
    tone: string;
    timestamp: string; // ISO string
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDB = async () => {
    if (!dbPromise) {
        dbPromise = SQLite.openDatabaseAsync(DB_NAME);
    }
    return dbPromise;
};

/**
 * Initialize the database table.
 */
export const initHistoryDB = async () => {
    try {
        const db = await getDB();
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                explanation TEXT NOT NULL,
                confidence REAL,
                tone TEXT,
                timestamp TEXT NOT NULL
            );
        `);
        console.log("Database initialized.");
    } catch (error) {
        console.error("Failed to init DB:", error);
    }
};

/**
 * Add a new translation record.
 */
export const addHistoryItem = async (
    filename: string,
    explanation: string,
    confidence: number,
    tone: string
): Promise<number> => {
    const db = await getDB();
    const timestamp = new Date().toISOString();

    // Use runAsync for insert
    const result = await db.runAsync(
        'INSERT INTO history (filename, explanation, confidence, tone, timestamp) VALUES (?, ?, ?, ?, ?)',
        [filename, explanation, confidence, tone, timestamp]
    );

    return result.lastInsertRowId;
};

/**
 * Fetch all history items, sorted by newest first.
 */
export const getHistoryItems = async (): Promise<HistoryItem[]> => {
    const db = await getDB();
    const allRows = await db.getAllAsync<HistoryItem>(
        'SELECT * FROM history ORDER BY timestamp DESC'
    );
    return allRows;
};

/**
 * Delete a single record.
 */
export const deleteHistoryItem = async (id: number): Promise<void> => {
    const db = await getDB();
    await db.runAsync('DELETE FROM history WHERE id = ?', [id]);
};
