# 🔗 Fixing the "Access Blocked" (400) Error

## The Problem
Google is blocking the request because the **Redirect URI** (where the app goes after login) is not trusted.

## The Solution
1.  **Reload the App** (`r`).
2.  Tap **Google Sign-In**.
3.  **Check your Terminal**: I have added a log that will print:
    `🔗 REDIRECT URI NEEDED: https://auth.expo.io/...`
4.  **Copy that URL**.
5.  Go to the [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
6.  Click on your **Web Client ID**.
7.  Scroll down to **Authorized redirect URIs**.
8.  **Add URI**: Paste the URL you copied.
    - It usually looks like: `https://auth.expo.io/@anonymous/dog-translator-android`
9.  **Save**.

## Wait 5 Minutes
Google takes a few minutes to update. After that, the "Access Blocked" error will disappear.
