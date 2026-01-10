import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const getNetworkState = async () => {
    return await NetInfo.fetch();
};

export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? true);
        });
        return unsubscribe;
    }, []);

    const checkConnection = async () => {
        const state = await getNetworkState();
        const connected = state.isConnected ?? true;
        setIsConnected(connected);
        return connected;
    };

    return { isConnected, checkConnection };
};
