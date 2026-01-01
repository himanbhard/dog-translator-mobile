# Dog Body Language Interpreter - Android App Roadmap

This document serves as the central tracking registry for planned features, known bugs, technical debt, and enhancement requests.

## 🐛 Known Bugs & Issues

- **[Critical] API 401 Unauthorized Error**: The backend returns a `401 Unauthorized` status code when attempting to upload an image from the `ScannerScreen`.
    - **Context**: User reports "The backend server does not api token enabled yet". This implies a mismatch between the expected open access and the actual server configuration, or a missing client-side auth implementation.
    - **Status**: Pending Investigation.

## 🚀 Upcoming Features (Product Roadmap)

- **User Authentication Flow**:
    - Login Screen implementation.
    - Sign Up Screen implementation.
    - JWT Token storage (SecureStore) and attachment to API requests.
- **History & Results**:
    - Screen to view past interpretations.
    - Detail view for specific interpretation results.
- **Settings**:
    - User profile management.
    - App preferences.

## 🛠 Enhancements & Technical Debt

- **UI/UX Polish**:
    - Improve Lottie animation transitions.
    - Refine "Glassmorphism" effect for better visibility on light backgrounds.
- **Performance**:
    - Optimize image compression logic (currently rudimentary resizing).
- **Error Handling**:
    - Better UI for 413/502 errors beyond simple Alerts.
