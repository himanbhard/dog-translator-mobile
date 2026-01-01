import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '../config/firebase';

/**
 * Signs in to Firebase with a Google ID Token.
 * @param idToken The ID token received from Google Sign-In
 */
export const signInWithGoogleToken = async (idToken: string) => {
    try {
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        return result.user;
    } catch (error: any) {
        console.error('Firebase Google Sign-In Error:', error);
        throw new Error(error.message || 'Google Authentication failed');
    }
};

/**
 * Signs in to Firebase with an Apple ID Token and Nonce.
 * @param idToken The Identity Token from Apple
 * @param nonce The nonce used for the request
 */
export const signInWithAppleToken = async (idToken: string, nonce: string) => {
    try {
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({
            idToken: idToken,
            rawNonce: nonce,
        });
        const result = await signInWithCredential(auth, credential);
        return result.user;
    } catch (error: any) {
        console.error('Firebase Apple Sign-In Error:', error);
        throw new Error(error.message || 'Apple Authentication failed');
    }
};

export const isAppleAuthAvailable = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
        return false;
    }
    return await AppleAuthentication.isAvailableAsync();
};
