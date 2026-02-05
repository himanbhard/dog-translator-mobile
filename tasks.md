# Build and Deploy to Expo

## Prerequisites
- [x] Install Bun Package Manager <!-- id: bun-install -->
- [x] Install dependencies (using Bun) <!-- id: deps-install -->
- [x] Verify Expo CLI installation <!-- id: expo-cli -->
- [x] Login to Expo Account <!-- id: expo-login -->

## Configuration
- [x] Configure `app.json` / `app.config.js` for Android <!-- id: app-config -->
- [x] Configure EAS for Android Build (`eas.json`) <!-- id: eas-config -->

## Build & Test (Android)
- [x] Build Android APK (Internal/Emulator) <!-- id: android-build -->
- [x] EAS Build Preview APK <!-- id: eas-build -->

## Troubleshooting Build Failure
- [x] Verify local bundle generation (Check for JS errors) <!-- id: local-bundle -->
- [x] Configure `eas.json` to use Bun <!-- id: eas-bun-config -->
- [x] Clean and Sync Android Native Project <!-- id: android-clean -->
- [x] Install Android SDK and Java 17 <!-- id: sdk-install -->
- [x] Debugging Build Failure: google-services.json package name mismatch <!-- id: debug-failure -->
- [/] Retry Android APK Build <!-- id: retry-build -->

## Verification
- [x] Debugging Runtime Crash: Identified missing environment variables in JS bundle <!-- id: debug-crash -->
- [x] Fix Runtime Crash: Created .env and updated eas.json with Firebase keys <!-- id: fix-crash -->
- [x] Fix Runtime Crash: Corrected MainApplication.kt entry point <!-- id: fix-entry-point -->
- [x] Fix Runtime Crash: Corrected component name in index.js and MainActivity.kt <!-- id: fix-component-name -->
- [x] Fix Runtime Crash: Add gesture handler import and remove conflicting splash screen <!-- id: fix-startup-crash-2 -->
- [x] Verify local bundle generation (Fixed missing env vars) <!-- id: verify-bundle -->
- [/] Verify APK on Emulator/Device (Awaiting download) <!-- id: android-verify -->

## Bug Fixes (Post-Build)
- [/] Fix Google Sign-In "Developer Error": Add EAS keystore SHA-1 to Firebase Console <!-- id: fix-google-signin -->
- [x] Fix Camera permission stuck: Handle permission callback and refresh state <!-- id: fix-camera-permission -->

## Resilient Permission Pattern
- [x] Create `usePermission` hook with AppState listener <!-- id: permission-hook -->
- [x] Add "Open Settings" + "Refresh" fallback UI to ScannerScreen <!-- id: permission-fallback-ui -->
- [x] Handle blocked/limited/restricted states with appropriate messaging <!-- id: permission-states -->
- [ ] Extend pattern to Gallery picker (photo library permission) <!-- id: permission-gallery -->

## Improvements & Cleanup
- [ ] Code Styling: Setup Prettier & integrate with ESLint <!-- id: prettier-setup -->
- [ ] Testing: Add unit tests for Store and API services <!-- id: unit-tests -->
- [ ] Cleanup: Remove unused imports and console logs in src/ <!-- id: code-cleanup -->
- [ ] CI/CD: Setup GitHub Actions for Lint & Test <!-- id: ci-cd-setup -->
- [ ] Documentation: Create README.md with setup & arch guide <!-- id: docs-readme -->

