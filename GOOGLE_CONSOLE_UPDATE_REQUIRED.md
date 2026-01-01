# 🚨 Google Console Update Required

## The Issue
Your screenshot showed `https://auth.expo.io/@anonymous/` (ending in a slash).
However, the **SLUG** of your app is `dog-translator-android`.

Google requires the FULL path to match.

## The Fix
1.  Go back to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Edit your **Web Client**.
3.  Under **Authorized redirect URIs**, remove the old entry if incorrect.
4.  Add this **EXACT** URL:

    ```text
    https://auth.expo.io/@anonymous/dog-translator-android
    ```

5.  **Save**.
6.  Wait ~2 minutes.
7.  **Try Login Again**.

Everything should work now!
