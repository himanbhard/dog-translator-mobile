# 🚫 Google Login Temporarily Disabled

## Status
The Google Sign-In button has been updated to show an informational alert instead of opening a broken web page.

## Reason
The error `404. That's an error` confirmed that the Google Client ID (`736369571076...`) in the code is a placeholder and has not been registered with Google Cloud Console for OAuth redirects. This is expected during initial development before a dedicated production project is set up.

## Action
1.  **Reload the App** (`r`).
2.  **Use Email/Password**: Please sign up or log in using the email and password fields. This authentication method is fully functional.
3.  **Future Step**: To enable Google Sign-In, a valid OAuth 2.0 Client ID must be created in the Google Cloud Console and added to `src/screens/LoginScreen.tsx`.
