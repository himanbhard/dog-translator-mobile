# 🐞 Google Login Debugging Plan

The error "Something went wrong trying to finish signing in" on `auth.expo.io` indicates a communication breakdown between the Expo Auth Proxy and your specific device's connection.

## 🏆 Primary Solution: Switch to LAN Mode (Fixes 95% of cases)
The dynamic Tunnel URL (`ngrok`) often causes timeouts or security blocks during the OAuth redirect.

1.  **Stop Server**: `Ctrl + C` in your terminal.
2.  **Verify WiFi**: Ensure your Phone and Computer are on the **exact same WiFi network**.
3.  **Start LAN Server**:
    ```bash
    npx expo start --clear
    ```
    *(Do NOT use `--tunnel`)*.
4.  **Scan Logic**: Use the "LAN" tab in the Expo overlay (press `s` in terminal to switch if needed).
5.  **Test Login**: Tap the Google button again.

## 🕵️ Secondary Troubleshooting (If LAN fails)

### 1. Verification of Redirect URI
-   **Terminal Check**: When you tap the Google button, I added a log:
    `🔵 DEBUG: Starting Google Sign-In`.
    Verify the logged "App Deep Link Scheme" looks like `exp://...` (or `dogtranslatorandroid://...`).
-   **Google Cloud Check**: ensure `https://auth.expo.io/@anonymous/dog-translator-android` is EXACTLY what is saved. (No trailing slash, case sensitive).

### 2. Verify Scheme in app.json
-   We checked this: `"scheme": "dogtranslatorandroid"`. This is correct.

## 🚀 Workaround: Unblock Development
If Google Sign-In remains stubborn due to network/proxy issues:

**Please use Email/Password Login.**
-   It is fully functional.
-   It uses the same Firebase backend.
-   It allows you to proceed to testing the **Scanner, Translation, and History** features immediately without getting stuck on OAuth configuration.
