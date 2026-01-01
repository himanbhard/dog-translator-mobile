# ⚙️ Settings & State Management Update

## Summary
Moved the "Auto-Speak" toggle from the Scanner screen to the Settings screen as requested. Implemented a persistent global store to manage app preferences.

## 🛠 Changes

### 1. Global State Management (`src/store/settingsStore.ts`)
-   **Tech**: `zustand` + `@react-native-async-storage/async-storage`.
-   **Feature**: Persists user settings (like `autoSpeak`) so they are remembered even after closing the app.

### 2. Settings Screen (`src/screens/SettingsScreen.tsx`)
-   Added **Auto-Speak Results** toggle under Preferences.
-   Connected to the global store.

### 3. Scanner Screen (`src/screens/ScannerScreen.tsx`)
-   **Removed**: Floating "Speaker" toggle button from the camera view.
-   **Updated**: Logic now reads `autoSpeak` preference directly from the global store.

## 📦 Dependencies
-   Installed `@react-native-async-storage/async-storage` for persistence.

## 🚀 How to Test
1.  **Reload App** (`r`).
2.  **Go to Settings**: Toggle "Auto-Speak Results" off.
3.  **Go to Camera**: Analyze an image.
4.  **Verify**: The app should NOT speak automatically.
5.  **Go to Settings**: Toggle it back on.
6.  **Verify**: Analyzing an image now speaks automatically.
