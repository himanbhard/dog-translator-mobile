import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';
import { Camera } from 'react-native-vision-camera';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'limited' | 'undetermined';
export type PermissionType = 'camera' | 'microphone';

interface UsePermissionResult {
    status: PermissionStatus;
    isGranted: boolean;
    isBlocked: boolean;
    isLimited: boolean;
    request: () => Promise<PermissionStatus>;
    openSettings: () => Promise<void>;
    refresh: () => Promise<void>;
}

/**
 * Normalize the permission status from react-native-vision-camera to our unified type
 */
function normalizeStatus(status: string): PermissionStatus {
    switch (status) {
        case 'granted':
            return 'granted';
        case 'denied':
            return 'denied';
        case 'restricted':
        case 'blocked':
            return 'blocked';
        case 'limited':
            return 'limited';
        default:
            return 'undetermined';
    }
}

/**
 * Resilient permission hook with AppState awareness.
 * Re-checks permission status when app returns to foreground (e.g., from Settings).
 * 
 * @param type - The type of permission to manage ('camera' or 'microphone')
 * @returns Permission state and control functions
 */
export function usePermission(type: PermissionType): UsePermissionResult {
    const [status, setStatus] = useState<PermissionStatus>('undetermined');

    const checkStatus = useCallback(async () => {
        let rawStatus: string;

        if (type === 'camera') {
            rawStatus = await Camera.getCameraPermissionStatus();
        } else if (type === 'microphone') {
            rawStatus = await Camera.getMicrophonePermissionStatus();
        } else {
            rawStatus = 'undetermined';
        }

        const normalized = normalizeStatus(rawStatus);
        setStatus(normalized);
        return normalized;
    }, [type]);

    const request = useCallback(async (): Promise<PermissionStatus> => {
        let rawStatus: string;

        if (type === 'camera') {
            rawStatus = await Camera.requestCameraPermission();
        } else if (type === 'microphone') {
            rawStatus = await Camera.requestMicrophonePermission();
        } else {
            rawStatus = 'undetermined';
        }

        const normalized = normalizeStatus(rawStatus);
        setStatus(normalized);
        return normalized;
    }, [type]);

    const openSettings = useCallback(async () => {
        if (Platform.OS === 'ios') {
            await Linking.openURL('app-settings:');
        } else {
            await Linking.openSettings();
        }
    }, []);

    const refresh = useCallback(async () => {
        await checkStatus();
    }, [checkStatus]);

    // Initial check on mount
    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    // Re-check when app returns to foreground
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                checkStatus();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [checkStatus]);

    return {
        status,
        isGranted: status === 'granted',
        isBlocked: status === 'blocked',
        isLimited: status === 'limited',
        request,
        openSettings,
        refresh,
    };
}
