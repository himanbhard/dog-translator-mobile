# Social Login Setup Guide (Expo Go Compatible)

This guide helps you configure Google and Apple Sign-In.
**Note:** We have switched to `expo-auth-session` for Google Sign-In to ensure compatibility with Expo Go.

## Google Sign-In Setup

### Step 1: Get your Web Client ID from Firebase/Google Cloud

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `dog-translaotr-nonprod`
3. Go to **APIs & Services** > **Credentials**
4. Find or Create an **OAuth 2.0 Client ID** of type **Web application**
5. **CRITICAL**: Add the following to **Authorized redirect URIs**:
   - `https://auth.expo.io/@anonymous/dog-translator-android` (if using Expo Go anonymous)
   - `https://auth.expo.io/@your-username/dog-translator-android` (if logged in to Expo)
   - `exp://localhost:8081` (sometimes needed for local testing)
6. Copy the **Client ID** (e.g., `736369571076-xxxx.apps.googleusercontent.com`)

### Step 2: Update the Login Screen

1. Open `src/screens/LoginScreen.tsx`
2. Find the `Google.useAuthRequest` hook (around line 20)
3. Update the `webClientId` with your new Client ID:

```typescript
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: 'YOUR_NEW_CLIENT_ID.apps.googleusercontent.com',
    });
```

### Step 3: Test

1. Reload the app in Expo Go
2. Tap "Google"
3. A web browser modal should open for authentication
4. After sign-in, it should redirect back to the app

## Apple Sign-In Setup

Apple Sign-In works natively in Expo Go on iOS devices. No code changes needed!

- **Requirement**: Must be on a physical iOS device (iOS 13+)
- **Simulator**: May not work on Simulator without specific setup

## Troubleshooting

- **Error: "redirect_uri_mismatch"**: You need to add the redirect URI shown in the error message to your Google Cloud Console "Authorized redirect URIs".
- **Error: "Google Login Failed"**: Check the console logs for specific Firebase errors.
- **Button not working**: Ensure you have internet connection.

## Development Builds (Optional)

If you prefer the native Google Sign-In experience (without the web modal), you must create a Development Build.
1. Revert changes to use `@react-native-google-signin/google-signin`
2. Run `npx eas build --profile development --platform android`
3. Install the resulting APK on your device
