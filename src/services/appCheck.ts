import { firebase } from '@react-native-firebase/app-check';

let isInitialized = false;

export async function initializeAppCheck(): Promise<void> {
    if (isInitialized) return;

    try {
        const appCheckProvider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
        appCheckProvider.configure({
            android: {
                provider: __DEV__ ? 'debug' : 'playIntegrity',
            },
            apple: {
                provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
            },
        });

        await firebase.appCheck().initializeAppCheck({
            provider: appCheckProvider,
            isTokenAutoRefreshEnabled: true,
        });

        isInitialized = true;
        console.log('🛡️ [AppCheck] Initialized successfully');
    } catch (error) {
        console.error('❌ [AppCheck] Initialization failed:', error);
    }
}

export async function getAppCheckToken(): Promise<string | null> {
    try {
        if (!isInitialized) {
            await initializeAppCheck();
        }

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<null>((_, reject) => {
            setTimeout(() => reject(new Error('App Check token timeout')), 5000);
        });

        const tokenPromise = firebase.appCheck().getToken(true).then(r => r.token);

        return await Promise.race([tokenPromise, timeoutPromise]);
    } catch (error) {
        console.error('❌ [AppCheck] Failed to get token:', error);
        return null;
    }
}
