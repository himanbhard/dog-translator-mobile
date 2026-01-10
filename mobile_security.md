# Mobile Security: Firebase App Check Guide

To secure our API expenses and data, we are enforcing **Firebase App Check** on all backend endpoints. This ensures that requests only come from your genuine app, not from scripts or unauthorized clients.

## 1. Google Console Setup (Action Required)

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to **Build > App Check**.
3.  Click **"Get Started"** or **"Register"** your apps.
4.  **For Android:**
    *   Select your Android App.
    *   Choose **Play Integrity** as the provider (recommended).
    *   You may need to link your Google Play Console account inside Firebase if publishing.
5.  **For iOS:**
    *   Select your iOS App.
    *   Choose **DeviceCheck** or **App Attest**.
    *   Follow the instructions to register your Team ID.
6.  **Token Server (Cloud Run) Permissions:**
    *   In the Google Cloud Console, ensure our backend Service Account (`736369571076-compute@developer.gserviceaccount.com`) has the role:
    *   `Firebase App Check Token Verifier` (or Editor/Owner).

## 2. React Native Implementation

Install the library:
```bash
npm install @react-native-firebase/app-check
```

Initialize it in your `App.js` or `index.js` **before** any API calls:

```javascript
import { firebase } from '@react-native-firebase/app-check';

// 1. Initialize
async function initializeAppCheck() {
  const appCheckProvider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
  appCheckProvider.configure({
    android: {
      provider: 'playIntegrity',
      debug: __DEV__, // Use debug provider in dev, real provider in prod
    },
    apple: {
      provider: 'appAttestWithDeviceCheckFallback',
      debug: __DEV__,
    },
  });
  
  await firebase.appCheck().initializeAppCheck({
    provider: appCheckProvider,
    isTokenAutoRefreshEnabled: true,
  });
}

initializeAppCheck();
```

## 3. Sending the Token

The library automatically intercepts `fetch` requests to Firebase services, but for **our custom Cloud Run backend**, you need to manually attach the token:

```javascript
import { firebase } from '@react-native-firebase/app-check';

async function callProtectedApi(endpoint, body) {
  // 1. Get the App Check Verification Token
  let appCheckTokenResponse;
  try {
      appCheckTokenResponse = await firebase.appCheck().getToken(true); // forceRefresh
  } catch (e) {
      console.error("App Check Token Error:", e);
      return;
  }
  
  const token = appCheckTokenResponse.token;

  // 2. Attach to Header
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userAccessToken}`, // Your User Auth
      'X-Firebase-AppCheck': token,                 // NEW: Device Auth
    },
    body: JSON.stringify(body),
  });
  
  // ... handle response
}
```

## 4. Debugging

In development (`__DEV__`), you will need a **Debug Token** so you don't fail verification on emulators:
1.  Run the app on your emulator/device.
2.  Check the logs for: `Firebase App Check Debug Token: <UUID>`
3.  Copy this UUID.
4.  Go to **Firebase Console > App Check > Apps > (Your App) > Manage Debug Tokens**.
5.  Add the token and name it (e.g., "Himanshu's Emulator").

Without this, local requests will fail with `401 Unauthorized`.
