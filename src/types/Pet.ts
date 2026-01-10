export type Gender = 'male' | 'female' | 'other';

export interface Pet {
    id: string;
    name: string;
    age: string; // Keeping as string to allow "2 years" or just "2" easily
    gender: Gender;
    photoUri?: string;
    createdAt: number;
}

export interface PetJournalEntry {
    id: string;
    petId: string;
    date: number;
    imageUri: string;
    geminiTranslation: string; // JSON string or text result
    confidence: number;
    breed?: string; // NEW: Store breed for explanation context
    explanation?: string; // Detailed body language explanation
    educationalLinks?: { title: string; url: string }[];
}
