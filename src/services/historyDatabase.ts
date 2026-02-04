import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DB_NAME = 'dog_history.db';

/**
 * Opens a connection to the SQLite database.
 */
export const getDB = async () => {
    return SQLite.openDatabase({ name: DB_NAME, location: 'default' });
};

/**
 * Initializes the database and creates the history table with the requested columns.
 */
export const initHistoryDB = async () => {
    try {
        const db = await getDB();
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pet_id TEXT NULL,
                local_file_path TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
            );
        `);
        
        // Add pet_id column if it doesn't exist (Migration)
        try {
            await db.executeSql('ALTER TABLE history ADD COLUMN pet_id TEXT;');
        } catch (e) { /* already exists */ }

        console.log("✅ History database initialized with schema: id, pet_id, local_file_path, timestamp, metadata.");
    } catch (error) {
        console.error("❌ Failed to initialize history database:", error);
    }
};

/**
 * Adds a new entry to the history table.
 * @param filePath The local path to the saved image.
 * @param metadata Object containing AI analysis results, tone, etc. (stored as JSON)
 * @param petId Optional ID of the pet associated with this entry.
 */
export const addHistoryEntry = async (filePath: string, metadata: object, petId: string | null = null): Promise<number> => {
    try {
        const db = await getDB();
        const metadataString = JSON.stringify(metadata);
        
        const [result] = await db.executeSql(
            'INSERT INTO history (local_file_path, metadata, pet_id) VALUES (?, ?, ?)',
            [filePath, metadataString, petId]
        );
        
        return result.insertId;
    } catch (error) {
        console.error("❌ Failed to add history entry:", error);
        throw error;
    }
};

/**
 * Retrieves history items, optionally filtered by petId.
 */
export const getAllHistory = async (petId: string | null = null) => {
    try {
        const db = await getDB();
        let query = 'SELECT * FROM history ORDER BY timestamp DESC';
        let params: any[] = [];

        if (petId) {
            query = 'SELECT * FROM history WHERE pet_id = ? ORDER BY timestamp DESC';
            params = [petId];
        }

        const [results] = await db.executeSql(query, params);
        
        const items = [];
        for (let i = 0; i < results.rows.length; i++) {
            const item = results.rows.item(i);
            items.push({
                ...item,
                metadata: JSON.parse(item.metadata)
            });
        }
        return items;
    } catch (error) {
        console.error("❌ Failed to fetch history items:", error);
        return [];
    }
};
