import AsyncStorage from '@react-native-async-storage/async-storage';
import { PetJournalEntry } from '../types/Pet';
import * as Crypto from 'expo-crypto';

const JOURNAL_KEY = '@DogTranslator:journal';

export const PetJournalService = {
    /**
     * Add a new entry to a pet's journal.
     */
    addEntry: async (
        petId: string,
        imageUri: string, // Local URI (saved to filesystem preferred)
        translation: string,
        confidence: number,
        breed?: string
    ): Promise<PetJournalEntry> => {
        try {
            const entry: PetJournalEntry = {
                id: Crypto.randomUUID(),
                petId,
                date: Date.now(),
                imageUri,
                geminiTranslation: translation,
                confidence,
                breed,
            };

            const existingData = await AsyncStorage.getItem(JOURNAL_KEY);
            const journal = existingData ? JSON.parse(existingData) : {};

            if (!journal[petId]) {
                journal[petId] = [];
            }

            // Add to beginning
            journal[petId].unshift(entry);

            await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
            return entry;
        } catch (error) {
            console.error('Failed to save pet journal entry:', error);
            throw error;
        }
    },

    /**
     * Get all entries for a specific pet.
     */
    getEntries: async (petId: string): Promise<PetJournalEntry[]> => {
        try {
            const existingData = await AsyncStorage.getItem(JOURNAL_KEY);
            if (!existingData) return [];

            const journal = JSON.parse(existingData);
            return journal[petId] || [];
        } catch (error) {
            console.error('Failed to get pet journal:', error);
            return [];
        }
    },

    /**
     * Delete specific entry
     */
    deleteEntry: async (petId: string, entryId: string) => {
        try {
            const existingData = await AsyncStorage.getItem(JOURNAL_KEY);
            if (!existingData) return;

            const journal = JSON.parse(existingData);
            if (journal[petId]) {
                journal[petId] = journal[petId].filter((e: PetJournalEntry) => e.id !== entryId);
                await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
            }
        } catch (error) {
            console.error('Failed to delete journal entry:', error);
        }
    },

    /**
     * Update an existing journal entry (e.g., adding explanation)
     */
    updateEntry: async (petId: string, entryId: string, updates: Partial<PetJournalEntry>) => {
        try {
            const existingData = await AsyncStorage.getItem(JOURNAL_KEY);
            if (!existingData) return;

            const journal = JSON.parse(existingData);
            if (journal[petId]) {
                journal[petId] = journal[petId].map((e: PetJournalEntry) =>
                    e.id === entryId ? { ...e, ...updates } : e
                );
                await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
            }
        } catch (error) {
            console.error('Failed to update journal entry:', error);
        }
    }
};
