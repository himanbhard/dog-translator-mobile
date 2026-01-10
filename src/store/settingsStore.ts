import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
    autoSpeak: boolean;
    isPremium: boolean;
    dailyScans: number;
    lastScanDate: string | null;

    toggleAutoSpeak: () => void;
    setIsAutoSpeak: (value: boolean) => void;

    // Premium Actions
    setPremiumStatus: (isPremium: boolean) => void;
    incrementScanCount: () => void;
    checkResetDailyScans: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            autoSpeak: true,
            isPremium: false,
            dailyScans: 0,
            lastScanDate: null,

            toggleAutoSpeak: () => set((state) => ({ autoSpeak: !state.autoSpeak })),
            setIsAutoSpeak: (value) => set({ autoSpeak: value }),

            setPremiumStatus: (isPremium) => set({ isPremium }),

            checkResetDailyScans: () => {
                const today = new Date().toDateString();
                const lastDate = get().lastScanDate;

                if (lastDate !== today) {
                    set({ dailyScans: 0, lastScanDate: today });
                    console.log("🔄 Daily scans reset for:", today);
                }
            },

            incrementScanCount: () => {
                get().checkResetDailyScans();
                set((state) => ({ dailyScans: state.dailyScans + 1 }));
            },
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
