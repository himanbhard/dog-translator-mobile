import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { usePetStore } from '../store/usePetStore';
import { theme } from '../styles/theme';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Button } from '../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AddPetScreen() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female'>('Male');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    
    const { addPet } = usePetStore();
    const navigation = useNavigation();

    const handlePickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
        if (!result.didCancel && result.assets?.[0]?.uri) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (!name || !age) {
            Alert.alert("Missing Info", "Please provide a name and age for your dog.");
            return;
        }

        addPet({
            name,
            age: parseInt(age),
            gender,
            photoUri: photoUri || undefined
        });

        navigation.goBack();
    };

    return (
        <ScreenWrapper withScrollView statusBarStyle="dark-content">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Add New Dog</Text>
                </View>

                <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera" size={40} color={theme.colors.textSecondary} />
                            <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    <Text style={styles.label}>NAME</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="What's your dog's name?"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>AGE (YEARS)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="How old is your dog?"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>GENDER</Text>
                    <View style={styles.genderContainer}>
                        {(['Male', 'Female'] as const).map((g) => (
                            <TouchableOpacity 
                                key={g}
                                style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                                onPress={() => setGender(g)}
                            >
                                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Button title="Save Pet Profile" onPress={handleSave} style={styles.saveButton} />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.m,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        marginRight: theme.spacing.m,
    },
    title: {
        ...theme.typography.h2,
    },
    imagePicker: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: theme.colors.surfaceSecondary,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 30,
        ...theme.shadows.card,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        ...theme.typography.caption,
        marginTop: 4,
    },
    form: {
        width: '100%',
    },
    label: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        marginBottom: theme.spacing.s,
        color: theme.colors.textSecondary,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 16,
        marginBottom: 20,
        fontSize: 16,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        marginBottom: 30,
    },
    genderButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
    },
    genderButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    genderText: {
        fontWeight: '600',
        color: theme.colors.text,
    },
    genderTextActive: {
        color: '#FFF',
    },
    saveButton: {
        marginTop: 10,
    }
});
