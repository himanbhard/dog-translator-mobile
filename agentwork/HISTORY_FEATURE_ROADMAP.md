# 📜 History/Journal Feature Roadmap

## 1. Overview
The goal is to implement a local "History" feature that acts as a journal for users to save their dog's translations. This allows users to revisit past interpretations and see the original image and the AI's analysis.

## 2. Technical Architecture

### Database (SQLite)
We will use `expo-sqlite` to store metadata about the saved translations.
- **Database Name**: `dog_translator.db`
- **Table Name**: `history`

#### Schema
| Column Name       | Type    | Description                                      |
| ----------------- | ------- | ------------------------------------------------ |
| `id`              | INTEGER | Primary Key (Auto-increment)                     |
| `local_file_path` | TEXT    | Absolute path to the image in app's storage      |
| `timestamp`       | TEXT    | ISO 8601 String of when the record was created   |
| `explanation`     | TEXT    | The AI's interpretation text                     |
| `confidence`      | REAL    | Confidence score (0.0 - 1.0)                     |
| `tone`            | TEXT    | The tone used for translation (Playful, etc.)    |
| `metadata`        | TEXT    | JSON string for any extra data (future proofing) |

### Storage (File System)
We will use `expo-file-system` to save images permanently.
- **Directory**: `FileSystem.documentDirectory + 'images/'`
- **Filename strategy**: `UUID.jpg` or `timestamp_random.jpg` to ensure uniqueness.
- **Constraint**: React Native's Image component needs a URI. We will store the relative filename if possible, or manage absolute paths carefully as they can change on app updates (especially on iOS). *Best practice: Store filename `xyz.jpg` in DB, and prepend `FileSystem.documentDirectory` at runtime.*

## 3. Implementation Steps

### Phase 1: Foundation (Services)
1.  **Install Dependencies**: `npx expo install expo-sqlite expo-file-system`
2.  **Database Service (`src/services/historyDatabase.ts`)**:
    *   `initDatabase()`: Create table if not exists.
    *   `addRecord(item)`: Insert new translation.
    *   `getHistory()`: Fetch all records ordered by `timestamp DESC`.
    *   `deleteRecord(id)`: Remove from DB.
3.  **Storage Service (`src/services/fileStorage.ts`)**:
    *   `saveImage(tempUri)`: Move/Copy image from cache/camera to persistent storage. Returns the new URI/filename.
    *   `deleteImage(filename)`: Delete file from storage.

### Phase 2: User Interface
1.  **History Screen (`src/screens/HistoryScreen.tsx`)**:
    *   List view (FlatList) of history items.
    *   Each item shows: Thumbnail, Date, Tone, Short snippet of text.
    *   Tap item -> Expand or show full details? (Start with expandable card or modal).
    *   Delete button (trash icon).
2.  **Navigation**:
    *   Add a "History" button to the main `ScannerScreen` (top right or separate tab).
    *   Or add a generic Tab Navigator if not present. *Current app seems to use single screen or stack.* We can add a button on ScannerScreen to navigate to History.

### Phase 3: Integration
1.  **Save Logic**:
    *   In `ScannerScreen`, after getting a result, show a "Save to Journal" button (or auto-save if configured, but manual is better for "Save if they choose").
    *   On tap:
        *   Call `fileStorage.saveImage(currentImageUri)` -> gets `newPath`.
        *   Call `historyDatabase.addRecord(...)` with `newPath` and analysis data.
        *   Show "Saved!" toast/alert.

## 4. Risks & Mitigations
-   **Storage Space**: Images can take space. We should probably compress them or just accept it (user deleting items handles it).
-   **Path Changes**: On iOS, `FileSystem.documentDirectory` changes UUID part on every app launch/update. **Crucial**: Store ONLY the filename in SQLite (e.g., `dog_123.jpg`) and prepend the *current* `documentDirectory` at runtime.

## 5. Timeline
- [ ] Dependencies & Service Layer (30 mins)
- [ ] UI - History Screen (30 mins)
- [ ] Integration with Scanner (20 mins)
- [ ] Testing (10 mins)
