import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DB_NAME = 'dog_translator.db';

export interface HistoryItem {
    id: number;
    filename: string;
    explanation: string;
    confidence: number;
    tone: string;
    breed?: string;
    share_id?: string;
    detailed_explanation?: string;
    educational_links?: string;
    pet_id?: string;
    timestamp: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDB = async () => {
    if (!dbPromise) {
        dbPromise = SQLite.openDatabase({ name: DB_NAME, location: 'default' });
    }
    return dbPromise;
};

export const initHistoryDB = async () => {
    try {
        const db = await getDB();
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                explanation TEXT NOT NULL,
                confidence REAL,
                tone TEXT,
                breed TEXT,
                share_id TEXT,
                detailed_explanation TEXT,
                educational_links TEXT,
                pet_id TEXT,
                timestamp TEXT NOT NULL
            );
        `);

        // MIGRATION 1: Breed
        try {
            await db.executeSql('ALTER TABLE history ADD COLUMN breed TEXT;');
        } catch (e) { /* ignore */ }

        // MIGRATION 2: share_id
        try {
            await db.executeSql('ALTER TABLE history ADD COLUMN share_id TEXT;');
        } catch (e) { /* ignore */ }

        // MIGRATION 3: Explanation Features
        try {
            await db.executeSql('ALTER TABLE history ADD COLUMN detailed_explanation TEXT;');
        } catch (e) { /* ignore */ }
        try {
            await db.executeSql('ALTER TABLE history ADD COLUMN educational_links TEXT;');
        } catch (e) { /* ignore */ }

        // MIGRATION 4: Pet ID
        try {
            await db.executeSql('ALTER TABLE history ADD COLUMN pet_id TEXT;');
        } catch (e) { /* ignore */ }

        console.log("Database initialized.");
    } catch (error) {
        console.error("Failed to init DB:", error);
    }
};

export const addHistoryItem = async (
    filename: string,
    explanation: string,
    confidence: number,
    tone: string,
    breed: string = "Unknown",
    share_id: string = "",
    pet_id: string | null = null
): Promise<number> => {
    const db = await getDB();
    const timestamp = new Date().toISOString();

    const [result] = await db.executeSql(
        'INSERT INTO history (filename, explanation, confidence, tone, breed, share_id, pet_id, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [filename, explanation, confidence, tone, breed, share_id, pet_id, timestamp]
    );

    return result.insertId;
};

export const getHistoryItems = async (petId?: string | null): Promise<HistoryItem[]> => {
    const db = await getDB();
    let results;

    if (petId) {
        [results] = await db.executeSql(
            'SELECT * FROM history WHERE pet_id = ? ORDER BY timestamp DESC',
            [petId]
        );
    } else {
        [results] = await db.executeSql(
            'SELECT * FROM history ORDER BY timestamp DESC'
        );
    }

    const items: HistoryItem[] = [];
    for (let i = 0; i < results.rows.length; i++) {
        items.push(results.rows.item(i));
    }
    return items;
};

export const deleteHistoryItem = async (id: number): Promise<void> => {
    const db = await getDB();
    await db.executeSql('DELETE FROM history WHERE id = ?', [id]);
};

export const updateHistoryItem = async (id: number, updates: Partial<HistoryItem>) => {
    const db = await getDB();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    if (fields.length === 0) return;

    await db.executeSql(
        `UPDATE history SET ${fields} WHERE id = ?`,
        [...values, id]
    );
};
