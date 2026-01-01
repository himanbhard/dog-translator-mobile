import { auth } from '../config/firebase';

export const getToken = async () => {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
};

export const saveToken = async (token: string) => {
    // No-op for Firebase, as it manages tokens internally
    console.warn("saveToken called but Firebase manages tokens automatically");
};

export const deleteToken = async () => {
    // No-op, use signOut instead
    console.warn("deleteToken called but should use signOut");
};

