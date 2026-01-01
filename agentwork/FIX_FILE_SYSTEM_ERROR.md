# 🐛 File System Error Fix

## Problem
The app crashed when saving images because `expo-file-system` (v54+) has deprecated the legacy methods (`getInfoAsync`, `makeDirectoryAsync`, etc.) on the main export.

## Solution
We updated `src/services/fileStorage.ts` to import these methods from `expo-file-system/legacy` instead.

## Changes
-   Changed import in `src/services/fileStorage.ts`.
-   Ensured proper named imports for `documentDirectory`, `getInfoAsync`, `makeDirectoryAsync`, `copyAsync`, and `deleteAsync`.
-   This allows the existing logic to work without rewriting for the new File/Directory API immediately.

## Testing
-   Reload the app.
-   Try taking a picture and saving again.
-   It should work now.
