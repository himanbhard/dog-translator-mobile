# 🛠️ Fix Application Crash & Auth Errors

## Summary
Resolved two critical issues preventing the app from working correctly in Expo Go.

## 1. Fixed Crash on Startup 📱
**Issue:** The app was crashing with `'RNGoogleSignin' could not be found`.
**Cause:** The `GoogleSignin` native module is not supported in the standard Expo Go app. It requires a custom development build.
**Fix:**
-   Stubbed out `signInWithGoogle` in `src/api/socialAuth.ts`.
-   It now throws a clear error ("Google Sign-In not supported in Expo Go") instead of crashing the app on launch.
-   **Action:** Please use **Email/Password** login for now while testing in Expo Go.

## 2. Fixed API 403 Forbidden Error 🔒
**Issue:** The "Analyze" feature returned `403 Not Authenticated`.
**Cause:** The new Firebase authentication system was working, but the API client was still looking for the old token in local storage, which was empty.
**Fix:**
-   Updated `src/api/client.ts` (Axios) and `src/api/analysisService.ts` (Fetch) to retrieve the authentication token directly from **Firebase** (`auth.currentUser.getIdToken()`).
-   The API requests will now correctly include your logged-in user's credentials.

## 🚀 How to Test
1.  **Reload the App** (`r` in terminal).
2.  **Verify Launch**: The app should open without the "TurboModuleRegistry" red screen crash.
3.  **Login**: Use Email/Password to log in.
4.  **Scan**: Take a picture of a dog.
5.  **Listen**: The app should successfully analyze (returning 200 OK) and speak the result.
