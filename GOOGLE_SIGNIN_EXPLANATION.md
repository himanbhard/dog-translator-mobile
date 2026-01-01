# 📧 Issue Explanation: Google Sign-In Configuration

## Is this a Firebase or Application issue?

**It is an Application Configuration issue.**

It is **not** a bug in Firebase's service, nor is it a code bug in the application logic.

## The Details
In `src/screens/LoginScreen.tsx`, the code requires a **Client ID** to talk to Google's servers. Currently, the code uses a **placeholder value**:

```typescript
webClientId: '736369571076-k51k83h2d2946c8s974e644342413123.apps.googleusercontent.com'
```

Because this ID is not registered to your specific project in the Google Cloud Console, Google rejects the login attempt (which caused the 404 error you saw earlier).

## Why Email/Password Works
Email/Password login is handled entirely by Firebase and uses the `apiKey` in `src/config/firebase.ts`, which **is configured correctly**. That's why you can log in with email/password right now.

## How to Fix Google Sign-In (Optional)
If you want to enable Google Sign-In, you must:
1.  Go to the **Google Cloud Console*
2.  Create new OAuth 2.0 Credentials (Client IDs) for **Web**, **iOS**, and **Android**.
3.  Copy those new strings.
4.  Paste them into `src/screens/LoginScreen.tsx` replacing the placeholder.

**Recommendation:** For testing the app functionalities (Scanner, Translation, History), please continue using **Email/Password** login.
