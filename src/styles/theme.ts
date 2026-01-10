export const theme = {
    colors: {
        background: '#0B1021', // Deep cosmic blue (fallback)
        surface: '#1B2336', // Lighter navy for cards
        surfaceLight: '#252F46', // Even lighter for interactions
        primary: '#6C5CE7', // Electric Purple
        secondary: '#00CEC9', // Teal
        accent: '#FD79A8', // Pink
        text: '#FFFFFF',
        textSecondary: '#A4B0C5',
        success: '#00B894',
        error: '#FF7675',
        warning: '#FDCB6E',
        glass: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        overlay: 'rgba(11, 16, 33, 0.8)',
        cardBorder: 'rgba(255,255,255,0.08)',
    },
    gradients: {
        // Deep space background
        background: ['#0B1021', '#151E32', '#0B1021'] as const,
        // Vivid primary action
        primary: ['#6C5CE7', '#a29bfe'] as const,
        // Secondary/Accent
        accent: ['#FD79A8', '#FAB1A0'] as const,
        // Glass sheen
        glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] as const,
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        round: 9999,
    },
    typography: {
        h1: { fontSize: 28, fontWeight: '700' as const, color: '#FFFFFF', letterSpacing: 0.5 },
        h2: { fontSize: 22, fontWeight: '600' as const, color: '#FFFFFF', letterSpacing: 0.3 },
        h3: { fontSize: 18, fontWeight: '600' as const, color: '#FFFFFF' },
        body: { fontSize: 16, lineHeight: 24, color: '#A4B0C5' },
        caption: { fontSize: 12, color: '#636E72' },
        button: { fontSize: 16, fontWeight: '600' as const, color: '#FFFFFF' },
    },
    shadows: {
        small: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 2,
        },
        medium: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.30,
            shadowRadius: 8,
            elevation: 6,
        },
        glow: {
            shadowColor: "#6C5CE7",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
        }
    },
    layout: {
        screenPadding: 20,
    }
};
