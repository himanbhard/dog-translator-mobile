
import { create } from 'zustand';

interface UserState {
    user: any | null;
    isAuthenticated: boolean;
    setUser: (user: any) => void;
    logout: () => void;
}

const useStore = create<UserState>((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));

export default useStore;
