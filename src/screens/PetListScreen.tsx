import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { usePetStore } from '../store/usePetStore';
import { theme } from '../styles/theme';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Card } from '../components/ui/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/ui/Button';

export default function PetListScreen() {
    const { pets, activePetId, setActivePet, deletePet } = usePetStore();
    const navigation = useNavigation<any>();

    const renderPet = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.petCard, activePetId === item.id && styles.activeCard]}
            onPress={() => setActivePet(item.id)}
            onLongPress={() => {
                Alert.alert(
                    "Delete Pet",
                    `Are you sure you want to delete ${item.name}?`,
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deletePet(item.id) }
                    ]
                );
            }}
        >
            <Card style={styles.cardContent}>
                <View style={styles.imageContainer}>
                    {item.photoUri ? (
                        <Image source={{ uri: item.photoUri }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.placeholderAvatar]}>
                            <Ionicons name="paw" size={30} color={theme.colors.textSecondary} />
                        </View>
                    )}
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.details}>{item.age} years • {item.gender}</Text>
                </View>
                <View style={styles.actions}>
                    {activePetId === item.id && (
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    )}
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Scan')}
                        style={styles.translateIcon}
                    >
                        <Ionicons name="scan-circle" size={32} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper statusBarStyle="dark-content">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Pets</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AddPet')}>
                        <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={pets}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPet}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="paw-outline" size={80} color={theme.colors.separator} />
                            <Text style={styles.emptyText}>No pets added yet.</Text>
                            <Button 
                                title="Add Your First Pet" 
                                onPress={() => navigation.navigate('AddPet')}
                                style={{ marginTop: 20 }}
                            />
                        </View>
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    title: {
        ...theme.typography.h1,
    },
    list: {
        paddingBottom: 20,
    },
    petCard: {
        marginBottom: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
    },
    activeCard: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
    },
    imageContainer: {
        marginRight: theme.spacing.m,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    placeholderAvatar: {
        backgroundColor: theme.colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    translateIcon: {
        padding: 4,
    },
    name: {
        ...theme.typography.headline,
    },
    details: {
        ...theme.typography.subheadline,
    },
    empty: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.m,
    }
});
