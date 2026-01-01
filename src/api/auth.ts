import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please log in instead.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        default:
            return 'Authentication failed. Please try again.';
    }
};

export const login = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return true;
    } catch (error: any) {
        console.error('Login failed:', error);
        const message = getAuthErrorMessage(error.code);
        throw new Error(message);
    }
};

export const register = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        console.error('Registration failed:', error);
        const message = getAuthErrorMessage(error.code);
        throw new Error(message);
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
};
