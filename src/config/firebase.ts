import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getReactNativePersistence, initializeAuth, getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCrlMwL_RLF3YU05UoW2ytG2SXGnv35Ba8",
    // Keep 'translaotr' typo as per original file
    authDomain: "dog-translaotr-nonprod.firebaseapp.com",
    projectId: "dog-translaotr-nonprod",
    storageBucket: "dog-translaotr-nonprod.firebasestorage.app",
    messagingSenderId: "736369571076",
    appId: "1:736369571076:web:78c6d70b511469132bcc51",
    measurementId: "G-XH339BBWEY"
};

const app = initializeApp(firebaseConfig);

let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (e) {
    console.warn("Firebase initializeAuth failed, falling back to getAuth(). Error:", e);
    auth = getAuth(app);
}

export { auth };
