import { copyAsync, deleteAsync, documentDirectory, getInfoAsync, makeDirectoryAsync } from 'expo-file-system/legacy';

const IMAGES_DIR = (documentDirectory || '') + 'images/';

/**
 * Ensures the images directory exists.
 */
const ensureDirExists = async () => {
    const dirInfo = await getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
        console.log("Creating images directory...");
        await makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    }
};

/**
 * Saves a temporary image file to persistent app storage.
 * @param tempUri The temporary URI of the image (e.g. from camera cache)
 * @returns The unique filename of the saved image.
 */
export const saveImageToStorage = async (tempUri: string): Promise<string> => {
    try {
        await ensureDirExists();

        // Generate unique filename
        const timestamp = Date.now();
        const ext = tempUri.split('.').pop() || 'jpg';
        const filename = `dog_${timestamp}.${ext}`;
        const destPath = IMAGES_DIR + filename;

        // Copy the file
        await copyAsync({
            from: tempUri,
            to: destPath
        });

        return filename;
    } catch (error) {
        console.error("Error saving image to storage:", error);
        throw error;
    }
};

/**
 * Deletes an image file from persistent storage.
 * @param filename The filename to delete.
 */
export const deleteImageFromStorage = async (filename: string): Promise<void> => {
    try {
        const path = IMAGES_DIR + filename;
        await deleteAsync(path, { idempotent: true });
    } catch (error) {
        console.error(`Error deleting image ${filename}:`, error);
        // We generally don't throw here to avoid blocking UI if cleanup fails
    }
};

/**
 * Returns the full operational path for a filename.
 * Use this when displaying the image in <Image source={{ uri: ... }} />
 */
export const getImageUri = (filename: string): string => {
    return IMAGES_DIR + filename;
};
