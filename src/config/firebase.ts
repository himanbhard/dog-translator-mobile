import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCrlMwL_RLF3YU05UoW2ytG2SXGnv35Ba8",
    authDomain: "dog-translaotr-nonprod.firebaseapp.com",
    projectId: "dog-translaotr-nonprod",
    storageBucket: "dog-translaotr-nonprod.firebasestorage.app",
    messagingSenderId: "736369571076",
    appId: "1:736369571076:web:78c6d70b511469132bcc51",
    measurementId: "G-XH339BBWEY"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };
