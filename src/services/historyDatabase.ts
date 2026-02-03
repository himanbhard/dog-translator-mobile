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
                local_file_path TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
            );
        `);
        console.log("✅ History database initialized with schema: id, local_file_path, timestamp, metadata.");
    } catch (error) {
        console.error("❌ Failed to initialize history database:", error);
    }
};

/**
 * Adds a new entry to the history table.
 * @param filePath The local path to the saved image.
 * @param metadata Object containing AI analysis results, tone, etc. (stored as JSON)
 */
export const addHistoryEntry = async (filePath: string, metadata: object): Promise<number> => {
    try {
        const db = await getDB();
        const metadataString = JSON.stringify(metadata);
        
        const [result] = await db.executeSql(
            'INSERT INTO history (local_file_path, metadata) VALUES (?, ?)',
            [filePath, metadataString]
        );
        
        return result.insertId;
    } catch (error) {
        console.error("❌ Failed to add history entry:", error);
        throw error;
    }
};

/**
 * Retrieves all history items, sorted by newest first.
 */
export const getAllHistory = async () => {
    try {
        const db = await getDB();
        const [results] = await db.executeSql('SELECT * FROM history ORDER BY timestamp DESC');
        
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
