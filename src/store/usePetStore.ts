import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet } from '../types/Pet';
import * as Crypto from 'expo-crypto';

interface PetState {
    pets: Pet[];
    activePetId: string | null;

    // Actions
    addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => void;
    updatePet: (id: string, updates: Partial<Omit<Pet, 'id' | 'createdAt'>>) => void;
    deletePet: (id: string) => void;
    setActivePet: (id: string) => void;
    getActivePet: () => Pet | undefined;
}

export const usePetStore = create<PetState>()(
    persist(
        (set, get) => ({
            pets: [],
            activePetId: null,

            addPet: (petData) => {
                const newPet: Pet = {
                    id: Crypto.randomUUID(),
                    createdAt: Date.now(),
                    ...petData,
                };

                set((state) => {
                    const newPets = [...state.pets, newPet];
                    // If this is the first pet, make it active automatically
                    const newActiveId = state.activePetId || newPet.id;
                    return { pets: newPets, activePetId: newActiveId };
                });
            },

            updatePet: (id, updates) => {
                set((state) => ({
                    pets: state.pets.map((p) => (p.id === id ? { ...p, ...updates } : p)),
                }));
            },

            deletePet: (id) => {
                set((state) => {
                    const newPets = state.pets.filter((p) => p.id !== id);
                    // If we deleted the active pet, reset activePetId to the first available or null
                    let newActiveId = state.activePetId;
                    if (state.activePetId === id) {
                        newActiveId = newPets.length > 0 ? newPets[0].id : null;
                    }
                    return { pets: newPets, activePetId: newActiveId };
                });
            },

            setActivePet: (id) => {
                set({ activePetId: id });
            },

            getActivePet: () => {
                const { pets, activePetId } = get();
                return pets.find((p) => p.id === activePetId);
            },
        }),
        {
            name: '@DogTranslator:pets-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ pets: state.pets, activePetId: state.activePetId }),
        }
    )
);
