# ✅ Google Login Configured

## Updates
1.  **Client ID Updated**: I have updated `src/screens/LoginScreen.tsx` with your provided Web Client ID (`736369571076-4oag...`).
2.  **iOS/Android Proxy**: I mapped this same ID to iOS and Android configurations to prevent the app from crashing in Expo Go.
3.  **Button Re-enabled**: The Google Sign-In button is now active again and will attempt to open the authentication page.

## 🧪 Testing
1.  **Reload the App**.
2.  Tap "Google Sign-In".
3.  **Expected Outcome**: It should open a browser window to Google.

## ⚠️ Potential "Redirect URI Mismatch" Error
If you see an error like `Error 400: redirect_uri_mismatch` in the browser, it means you need to add Expo's redirect URL to your Google Cloud Console.

**How to fix:**
1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Edit your "Web Client".
3.  Under **Authorized redirect URIs**, add this URL:
    `https://auth.expo.io/@anonymous/dog-translator-android`
    *(Note: The `@anonymous` part might differ if you are logged into Expo CLI. Check the terminal logs if the URL is different).*
4.  Save and try again (can take 5 mins to propagate).
