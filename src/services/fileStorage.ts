import RNFS from 'react-native-fs';

/**
 * Saves an image file from a temporary URI (like a camera capture) 
 * to the app's private internal storage directory.
 * 
 * @param tempUri The temporary URI or path of the image.
 * @returns The new permanent local file path.
 */
export const saveImageToInternalStorage = async (tempUri: string): Promise<string> => {
    try {
        // Ensure destination directory exists (internal app storage)
        const destDir = `${RNFS.DocumentDirectoryPath}/translations`;
        const exists = await RNFS.exists(destDir);
        if (!exists) {
            await RNFS.mkdir(destDir);
        }

        // Generate a unique filename using a timestamp
        const fileName = `translation_${Date.now()}.jpg`;
        const destPath = `${destDir}/${fileName}`;

        // Clean the URI for RNFS (remove 'file://' if present)
        const sourcePath = tempUri.startsWith('file://') 
            ? tempUri.replace('file://', '') 
            : tempUri;

        // Move the file from temporary to internal persistent storage
        await RNFS.copyFile(sourcePath, destPath);

        console.log(`✅ Image saved to internal storage: ${destPath}`);
        return destPath;
    } catch (error) {
        console.error("❌ Error saving image to internal storage:", error);
        throw error;
    }
};

/**
 * Deletes a file from internal storage.
 * @param filePath The full local path to the file.
 */
export const deleteFileFromStorage = async (filePath: string): Promise<void> => {
    try {
        if (await RNFS.exists(filePath)) {
            await RNFS.unlink(filePath);
        }
    } catch (error) {
        console.error(`❌ Error deleting file ${filePath}:`, error);
    }
};
