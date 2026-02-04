import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export type Tone = 'Playful' | 'Calm' | 'Trainer';

interface ToneSelectorProps {
    activeTone: Tone;
    onToneChange: (tone: Tone) => void;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({ activeTone, onToneChange }) => {
    const tones: Tone[] = ['Playful', 'Calm', 'Trainer'];

    return (
        <View style={styles.container}>
            <View style={styles.selector}>
                {tones.map((t) => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.option, activeTone === t && styles.optionSelected]}
                        onPress={() => onToneChange(t)}
                        accessibilityLabel={`Select ${t} tone`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activeTone === t }}
                    >
                        <Text style={[styles.text, activeTone === t && styles.textSelected]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    selector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 25,
        padding: 4,
    },
    option: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    optionSelected: {
        backgroundColor: theme.colors.primary,
    },
    text: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    textSelected: {
        color: '#FFF',
    },
});
