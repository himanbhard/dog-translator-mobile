# Social Login Setup Guide

This guide will help you configure Google and Apple Sign-In for your Dog Translator mobile app.

## Google Sign-In Setup

### Step 1: Get your Web Client ID from Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dog-translaotr-nonprod`
3. Click on **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Find the **Web app** configuration
6. Copy the **Web client ID** (it looks like: `736369571076-XXXXXXXXX.apps.googleusercontent.com`)

### Step 2: Update the Mobile App Configuration

1. Open `src/api/socialAuth.ts`
2. Find line 11 where it says:
   ```typescript
   webClientId: '736369571076-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
   ```
3. Replace `YOUR_WEB_CLIENT_ID` with the actual Web Client ID you copied from Firebase

### Step 3: Configure Android (if needed)

For Android, you may also need to:

1. Get the SHA-1 fingerprint of your debug keystore:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

2. Add the SHA-1 to Firebase:
   - Go to Firebase Console > Project Settings
   - Under "Your apps", find your Android app
   - Click "Add fingerprint"
   - Paste the SHA-1 fingerprint

3. Download the updated `google-services.json` and place it in your Android app directory

### Step 4: Test Google Sign-In

1. Run your app on a physical Android device (Google Sign-In doesn't work well on emulators)
2. Tap the "Google" button on the login screen
3. Follow the Google Sign-In flow

## Apple Sign-In Setup

Apple Sign-In is automatically available on iOS 13+ devices. No additional configuration is needed for development.

### For Production (App Store):

1. You'll need an Apple Developer account
2. Enable "Sign in with Apple" capability in Xcode
3. Configure your Apple Service ID in the Apple Developer portal
4. Add the Service ID to your Firebase project

## Current Status

✅ **Email/Password Authentication** - Fully functional with Firebase
✅ **Google Sign-In** - Implemented, needs Web Client ID configuration
✅ **Apple Sign-In** - Implemented, works on iOS 13+ (development ready)

## Troubleshooting

### Google Sign-In Issues

**Error: "DEVELOPER_ERROR"**
- Make sure you've added the correct SHA-1 fingerprint to Firebase
- Verify the Web Client ID is correct

**Error: "SIGN_IN_REQUIRED"**
- The user needs to have a Google account set up on their device

**Error: "PLAY_SERVICES_NOT_AVAILABLE"**
- Google Play Services is not available or outdated on the device
- Update Google Play Services or test on a different device

### Apple Sign-In Issues

**Error: "Apple Sign-In is not available on this device"**
- Apple Sign-In requires iOS 13 or later
- Only works on physical iOS devices (not Android)

**Error: "ERR_REQUEST_CANCELED"**
- User canceled the sign-in flow

## Next Steps

1. **Get the Web Client ID** from Firebase Console
2. **Update** `src/api/socialAuth.ts` with the correct Web Client ID
3. **Test** on a physical device
4. **Configure production** settings when ready to deploy

## Support

If you encounter any issues, check:
- Firebase Console for proper app configuration
- Device logs for detailed error messages
- Ensure all required packages are installed (`npm install`)
