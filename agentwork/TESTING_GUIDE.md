# Quick Testing Guide

## Testing Email/Password Authentication

### Sign Up (New Account)
1. Open the app
2. Tap "Don't have an account? Sign Up"
3. Enter email: `test@example.com`
4. Enter password: `password123` (min 6 characters)
5. Tap "Sign Up"
6. ✅ Should automatically log in and redirect to main app

### Login (Existing Account)
1. Open the app
2. Enter your email and password
3. Tap "Log In"
4. ✅ Should redirect to main app

### Logout
1. Navigate to Settings tab (bottom navigation)
2. Scroll down and tap "Log Out"
3. Confirm logout
4. ✅ Should return to login screen

### Auto-Login Test
1. Log in to the app
2. Close the app completely (swipe away from recent apps)
3. Reopen the app
4. ✅ Should automatically log you in (no login screen)

## Testing Social Login

### Google Sign-In (Android)
**Prerequisites**: Web Client ID must be configured in `src/api/socialAuth.ts`

1. Open the app
2. Tap the "Google" button
3. Select your Google account
4. ✅ Should log in and redirect to main app

**Common Issues**:
- "DEVELOPER_ERROR" → Check Web Client ID configuration
- "PLAY_SERVICES_NOT_AVAILABLE" → Update Google Play Services
- Button does nothing → Check console logs for errors

### Apple Sign-In (iOS only)
**Prerequisites**: iOS 13+ device

1. Open the app on an iOS device
2. Tap the "Apple" button (only visible on iOS)
3. Authenticate with Face ID/Touch ID
4. ✅ Should log in and redirect to main app

**Common Issues**:
- Button not visible → Check iOS version (needs 13+)
- "ERR_REQUEST_CANCELED" → User canceled the flow

## Expected Error Messages

### Email/Password Errors
| Scenario | Error Message |
|----------|--------------|
| Invalid email format | "Please enter a valid email address." |
| Password too short | "Password should be at least 6 characters." |
| Email already exists | "This email is already registered. Please log in instead." |
| Wrong password | "Incorrect password. Please try again." |
| Account doesn't exist | "No account found with this email." |
| Too many attempts | "Too many failed attempts. Please try again later." |
| No internet | "Network error. Please check your connection." |

### Social Login Errors
| Scenario | Error Message |
|----------|--------------|
| User cancels Google Sign-In | "Sign-in was cancelled" |
| Google Play Services missing | "Google Play Services not available" |
| User cancels Apple Sign-In | "Apple Sign-In was canceled" |
| Apple Sign-In on Android | Button is hidden |

## Debugging Tips

### Check Firebase Console
1. Go to Firebase Console → Authentication
2. Check if users are being created
3. View sign-in methods enabled

### Check App Logs
```bash
# For Android
npx react-native log-android

# For iOS
npx react-native log-ios

# Or use Expo
npx expo start --tunnel
# Then check the terminal output
```

### Common Log Messages
- ✅ `Database initialized.` - App started successfully
- ✅ `📤 REQUEST DETAILS:` - API request being made
- ❌ `Google Sign-In Error:` - Google Sign-In failed
- ❌ `Login failed:` - Email/password login failed

## Configuration Checklist

Before testing, ensure:

- [ ] Firebase project is set up (`dog-translaotr-nonprod`)
- [ ] Firebase config is in `src/config/firebase.ts`
- [ ] Email/Password provider is enabled in Firebase Console
- [ ] Google Sign-In provider is enabled in Firebase Console (for Google login)
- [ ] Web Client ID is configured in `src/api/socialAuth.ts` (for Google login)
- [ ] App is running on a physical device (for social logins)

## Test Accounts

You can create test accounts with any email format:
- `test1@example.com` / `password123`
- `test2@example.com` / `password123`
- `yourname@test.com` / `password123`

**Note**: These are real Firebase accounts, so use test emails only!

## Success Criteria

✅ **Email/Password**: Can sign up, log in, log out, and auto-login
✅ **Google Sign-In**: Can log in with Google account (after Web Client ID config)
✅ **Apple Sign-In**: Can log in with Apple ID on iOS 13+
✅ **Error Handling**: See user-friendly error messages
✅ **Persistence**: Stay logged in after app restart
✅ **Navigation**: Automatically redirect based on auth state

## Need Help?

1. Check `FIREBASE_AUTH_IMPLEMENTATION.md` for implementation details
2. Check `SOCIAL_LOGIN_SETUP.md` for Google/Apple setup
3. Check Firebase Console for authentication logs
4. Check app logs for detailed error messages
