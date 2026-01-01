import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
    autoSpeak: boolean;
    toggleAutoSpeak: () => void;
    setIsAutoSpeak: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            autoSpeak: true,
            toggleAutoSpeak: () => set((state) => ({ autoSpeak: !state.autoSpeak })),
            setIsAutoSpeak: (value) => set({ autoSpeak: value }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
