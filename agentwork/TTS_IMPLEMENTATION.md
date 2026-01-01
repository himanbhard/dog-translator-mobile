# React Native TTS Implementation Plan
## Step-by-Step Guide

---

## ⚠️ IMPORTANT: Compatibility Note

**React Native TTS** requires native modules and **will NOT work with Expo Go**.

### You have 2 paths:

#### Path A: Use Expo Speech Instead (RECOMMENDED) ⭐
- ✅ Works with Expo Go (no rebuild needed)
- ✅ 95% of react-native-tts features
- ✅ Can implement in 30 minutes
- ✅ Same API as react-native-tts
- ⚠️ Slightly fewer voice options

#### Path B: Create Custom Development Build
- ⚠️ Requires building custom native app
- ⏱️ 30-60 minute build time
- 💪 Full react-native-tts features
- 📱 Can't use Expo Go anymore (use custom build)

---

## 🎯 RECOMMENDED: Path A - Expo Speech

Since you're using Expo Go with tunnel, I **strongly recommend expo-speech** because it:
- Has the same functionality you want
- Works immediately (no rebuild)
- Easier to maintain
- Good enough voice quality

Let me know if you want to:
1. **Go with expo-speech** (can implement NOW)
2. **Create custom build** for react-native-tts (takes longer)

---

## Path A: Expo Speech Implementation (RECOMMENDED)

### Step 1: Install Package
```bash
npx expo install expo-speech
```

### Step 2: Create TTS Utility
**File**: `src/utils/textToSpeech.ts`

```typescript
import * as Speech from 'expo-speech';

export interface TTSOptions {
  tone?: 'playful' | 'calm' | 'trainer';
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

export const speak = async (text: string, options: TTSOptions = {}) => {
  const { tone = 'playful', onStart, onDone, onError } = options;
  
  // Stop any ongoing speech
  await Speech.stop();
  
  // Tone-specific settings
  const voiceSettings = {
    playful: { pitch: 1.3, rate: 1.05 },
    calm: { pitch: 0.85, rate: 0.8 },
    trainer: { pitch: 1.0, rate: 0.95 },
  };
  
  const settings = voiceSettings[tone];
  
  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: settings.pitch,
      rate: settings.rate,
      onStart: () => {
        console.log('🔊 Starting speech...');
        onStart?.();
      },
      onDone: () => {
        console.log('✅ Speech finished');
        onDone?.();
        resolve(true);
      },
      onStopped: () => {
        console.log('⏹️ Speech stopped');
        resolve(false);
      },
      onError: (error) => {
        console.error('❌ TTS Error:', error);
        onError?.(error.toString());
        reject(error);
      },
    });
  });
};

export const stop = async () => {
  await Speech.stop();
};

export const isSpeaking = async () => {
  return await Speech.isSpeakingAsync();
};

export const getAvailableVoices = async () => {
  return await Speech.getAvailableVoicesAsync();
};
```

### Step 3: Update ScannerScreen with Speak Button
**File**: `src/screens/ScannerScreen.tsx`

Add import:
```typescript
import { speak, stop } from '../utils/textToSpeech';
```

Add state for speaking status:
```typescript
const [isSpeaking, setIsSpeaking] = useState(false);
```

Update the result alert:
```typescript
if (result.status === 'ok') {
    Alert.alert(
        '🐕 Dog Says:',
        result.explanation + `\n\n✅ Confidence: ${(result.confidence * 100).toFixed(0)}%`,
        [
            {
                text: '🔊 Speak',
                onPress: async () => {
                    setIsSpeaking(true);
                    await speak(result.explanation, {
                        tone: tone.toLowerCase() as any,
                        onDone: () => setIsSpeaking(false),
                        onError: () => setIsSpeaking(false),
                    });
                },
            },
            { text: 'OK', style: 'cancel' },
        ]
    );
}
```

### Step 4: Add Auto-Speak Feature (Optional)
Add to state:
```typescript
const [autoSpeak, setAutoSpeak] = useState(true); // Enable by default
```

Update handleAnalysis:
```typescript
if (result.status === 'ok') {
    // Auto-speak if enabled
    if (autoSpeak) {
        speak(result.explanation, {
            tone: tone.toLowerCase() as any,
        });
    }
    
    // Then show alert...
}
```

### Step 5: Add Stop Button (Optional)
Add a floating stop button while speaking:
```typescript
{isSpeaking && (
    <TouchableOpacity 
        style={styles.stopSpeechButton}
        onPress={async () => {
            await stop();
            setIsSpeaking(false);
        }}
    >
        <Text style={styles.stopSpeechText}>⏹️ Stop</Text>
    </TouchableOpacity>
)}
```

Styles:
```typescript
stopSpeechButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: theme.colors.error || '#ff4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
},
stopSpeechText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
},
```

---

## Path B: React Native TTS with Custom Build (Advanced)

### Prerequisites
- Xcode installed (for iOS)
- Android Studio installed (for Android)
- 30-60 minutes for build time

### Step 1: Create Custom Development Build Config

Create `app.json` modifications:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "minSdkVersion": 23
          },
          "ios": {
            "deploymentTarget": "13.4"
          }
        }
      ]
    ]
  }
}
```

### Step 2: Install EAS CLI and Initialize
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Step 3: Install react-native-tts
```bash
npm install react-native-tts
```

### Step 4: Prebuild (Generate Native Code)
```bash
npx expo prebuild
```

### Step 5: Create Custom Development Build
```bash
# For iOS
eas build --profile development --platform ios

# For Android
eas build --profile development --platform android
```

**Wait Time**: 20-40 minutes for build to complete on EAS servers.

### Step 6: Install Development Build on Device
- Download the build from EAS dashboard
- Install on your device
- Use with `npx expo start --dev-client`

### Step 7: Implement TTS
Same as Path A, but replace `expo-speech` with `react-native-tts`:

```typescript
import Tts from 'react-native-tts';

export const speak = async (text: string, options: TTSOptions = {}) => {
  const { tone = 'playful' } = options;
  
  const voiceSettings = {
    playful: { pitch: 1.3, rate: 0.6 },
    calm: { pitch: 0.85, rate: 0.4 },
    trainer: { pitch: 1.0, rate: 0.5 },
  };
  
  const settings = voiceSettings[tone];
  
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultPitch(settings.pitch);
  Tts.setDefaultRate(settings.rate);
  
  await Tts.speak(text);
};

export const stop = async () => {
  await Tts.stop();
};

export const getVoices = async () => {
  const voices = await Tts.voices();
  return voices;
};
```

---

## 📊 Comparison: expo-speech vs react-native-tts

| Feature | expo-speech | react-native-tts |
|---------|-------------|------------------|
| Works with Expo Go | ✅ Yes | ❌ No |
| Setup time | 5 min | 1-2 hours |
| Voice selection | Limited | Full |
| Pitch control | ✅ Yes | ✅ Yes |
| Rate control | ✅ Yes | ✅ Yes |
| Volume control | ❌ No | ✅ Yes |
| Voice listing | ✅ Yes | ✅ Yes |
| Event callbacks | ✅ Yes | ✅ Yes |
| Quality | Good | Good |
| Offline | ✅ Yes | ✅ Yes |

**Bottom line**: expo-speech has 90% of features, works immediately.

---

## 🎯 My Strong Recommendation

**Use expo-speech (Path A)** because:
1. ✅ You're already using Expo Go with tunnel
2. ✅ Can implement in next 30 minutes
3. ✅ No breaking changes to workflow
4. ✅ Same quality as react-native-tts
5. ✅ Easier to maintain and update

**Only use react-native-tts (Path B) if:**
- You need specific voice selection features
- You're planning to eject from Expo anyway
- You have 2+ hours for build setup
- Volume control is critical

---

## ⏱️ Timeline

### Path A (expo-speech):
- Install: 2 minutes
- Create utility: 10 minutes  
- Update ScannerScreen: 15 minutes
- Test: 10 minutes
- **Total: 37 minutes**

### Path B (react-native-tts):
- EAS setup: 20 minutes
- Install package: 5 minutes
- Prebuild: 10 minutes
- Build on EAS: 30-40 minutes
- Install on device: 5 minutes
- Implement TTS: 20 minutes
- Test: 15 minutes
- **Total: 2-2.5 hours**

---

## 🚀 Ready to Implement

**Which path do you choose?**

1. **Path A (expo-speech)** - I can implement this RIGHT NOW in 30 minutes
2. **Path B (react-native-tts)** - We'll need to set up custom builds first

Let me know and I'll proceed! 🎯
