import RNFS from 'react-native-fs';

const IMAGES_DIR = RNFS.DocumentDirectoryPath + '/images/';

/**
 * Ensures the images directory exists.
 */
const ensureDirExists = async () => {
    const exists = await RNFS.exists(IMAGES_DIR);
    if (!exists) {
        console.log("Creating images directory...");
        await RNFS.mkdir(IMAGES_DIR);
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

        // Handle file:// prefix if missing
        let sourcePath = tempUri;
        if (!sourcePath.startsWith('file://') && !sourcePath.startsWith('/')) {
            // If it's a content uri or something else, RNFS might need help, 
            // but usually camera returns file:// or absolute path.
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = tempUri.split('.').pop() || 'jpg';
        const filename = `dog_${timestamp}.${ext}`;
        const destPath = IMAGES_DIR + filename;

        // Copy the file
        await RNFS.copyFile(sourcePath, destPath);

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
        if (await RNFS.exists(path)) {
            await RNFS.unlink(path);
        }
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
    return 'file://' + IMAGES_DIR + filename;
};
