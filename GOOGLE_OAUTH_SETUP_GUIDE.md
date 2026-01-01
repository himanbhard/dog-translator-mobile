# 🔐 How to Enable Google OAuth for Expo

To fix the Google Sign-In error, you need to generate valid Client IDs and add them to your project.

## Phase 1: Enable Google Sign-In in Firebase
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project: **dog-translaotr-nonprod**.
3.  Navigate to **Authentication** > **Sign-in method**.
4.  Click **Add new provider** > **Google**.
5.  Toggle **Enable**.
6.  Set the **Project support email**.
7.  Click **Save**.

## Phase 2: Create Client IDs in Google Cloud
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Make sure the project **dog-translaotr-nonprod** is selected (top left dropdown).
3.  Click **+ CREATE CREDENTIALS** > **OAuth client ID**.

### A. Create Web Client ID (Required for Expo Go)
1.  **Application type**: Web application.
2.  **Name**: "Expo Web Client".
3.  **Authorized JavaScript origins**: `https://auth.expo.io` (Important for Expo).
4.  **Authorized redirect URIs**: `https://auth.expo.io/@anonymous/dog-translator-android` (This might vary based on your Expo username, but usually follows this pattern).
5.  Click **CREATE**.
6.  **COPY the Client ID**. This is your `webClientId`.

### B. Create iOS Client ID (Optional for Production)
1.  **Application type**: iOS.
2.  **Bundle ID**: Your app's bundle ID (e.g., `com.yourname.dogtranslator`).
3.  Click **CREATE**.
4.  **COPY the Client ID**. This is your `iosClientId`.

### C. Create Android Client ID (Optional for Production)
1.  **Application type**: Android.
2.  **Package name**: Your app's package name (e.g., `com.yourname.dogtranslator`).
3.  **SHA-1 Certificate fingerprint**: You can get this by running `npx expo credentials:manager` later, but for now you can skip or generate a debug keystore.
4.  Click **CREATE**.
5.  **COPY the Client ID**. This is your `androidClientId`.

## Phase 3: Update the Code
Open `src/screens/LoginScreen.tsx` and replace the placeholders:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: 'PASTE_YOUR_NEW_WEB_CLIENT_ID_HERE.apps.googleusercontent.com',
    iosClientId: 'PASTE_YOUR_NEW_IOS_CLIENT_ID_HERE.apps.googleusercontent.com',
    androidClientId: 'PASTE_YOUR_NEW_ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com',
});
```

## Phase 4: Re-enable the Button
Once you have pasted the real IDs:
1.  Go to `src/screens/LoginScreen.tsx`.
2.  Find `handleGoogleSignIn`.
3.  **Uncomment** the `promptAsync()` logic and delete the Alert.

---
**Note:** For simple testing right now, just using **Email/Password** is much faster!
