export const theme = {
    colors: {
        // Modern iOS-inspired palette
        background: '#F2F2F7', // System Background (Light)
        surface: '#FFFFFF',    // System Background (Secondary)
        surfaceSecondary: '#E5E5EA',
        primary: '#007AFF',    // iOS System Blue
        secondary: '#5856D6',  // iOS System Indigo
        accent: '#FF2D55',     // iOS System Pink
        text: '#000000',       // System Label
        textSecondary: '#8E8E93', // System Gray
        success: '#34C759',    // iOS System Green
        error: '#FF3B30',      // iOS System Red
        warning: '#FF9500',    // iOS System Orange
        separator: '#C6C6C8',  // System Separator
        cardShadow: 'rgba(0, 0, 0, 0.1)',
        cardBorder: 'rgba(0, 0, 0, 0.05)',
        black: '#000000',
        white: '#FFFFFF',
        overlayDark: 'rgba(0, 0, 0, 0.5)',
        overlayDeep: 'rgba(0, 0, 0, 0.7)',
    },
    spacing: {
        unit: 8,
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
        round: 9999,
    },
    typography: {
        h1: { 
            fontSize: 34, 
            fontWeight: '700' as const, 
            color: '#000000', 
            letterSpacing: 0.37,
            lineHeight: 41
        },
        h2: { 
            fontSize: 28, 
            fontWeight: '600' as const, 
            color: '#000000', 
            letterSpacing: 0.34,
            lineHeight: 34
        },
        h3: { 
            fontSize: 22, 
            fontWeight: '600' as const, 
            color: '#000000', 
            letterSpacing: 0.35,
            lineHeight: 28
        },
        headline: {
            fontSize: 17,
            fontWeight: '600' as const,
            color: '#000000',
            lineHeight: 22
        },
        body: { 
            fontSize: 17, 
            lineHeight: 22, 
            color: '#000000',
            fontWeight: '400' as const
        },
        subheadline: {
            fontSize: 15,
            lineHeight: 20,
            color: '#8E8E93',
            fontWeight: '400' as const
        },
        caption: { 
            fontSize: 12, 
            color: '#8E8E93',
            lineHeight: 16
        },
        button: { 
            fontSize: 17, 
            fontWeight: '600' as const, 
            color: '#FFFFFF' 
        },
    },
    shadows: {
        card: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
        },
        button: {
            shadowColor: "#007AFF",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        }
    }
};
