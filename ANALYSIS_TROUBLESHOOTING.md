# 📉 Analysis Error (502 Bad Gateway) Troubleshooting

You are seeing `Error: upstream_failure` with status `502`.
This means: **App -> Cloud Run (OK) -> AI Model (FAILED)**.

The Google Vertex AI service behind your backend refused or timed out the request.

## 🛠️ Fix Applied
I have updated `src/api/analysisService.ts` to **automatically wait 2 seconds and retry** if it hits a 502 error. This often solves "transient" glitches.

## 🔍 Why is this happening?
Since it happens on the **second** picture, it is likely one of these causes:

### 1. Rate Limiting (Most Likely)
Google Vertex AI (Gemini) has quotas (e.g., "5 requests per minute").
-   **Symptom**: 1st request works, 2nd request fails if sent too quickly.
-   **Solution**: Wait ~10 seconds between taking photos.

### 2. Backend Cold Start
Cloud Run scales down to zero.
-   **Symptom**: If the previous container instance was shutting down or a new one was starting, it might fail.
-   **Solution**: The auto-retry mechanism I added should fix this.

### 3. Image Size
-   We are already compressing images on the phone (`width: 800`). It's unlikely to be the issue unless the compression failed (which would show a 413 error, not 502).

## 📝 What to do now?
1.  **Reload the App** (to load the new retry logic).
2.  **Try Scanning again**.
3.  **If it fails**: Wait 15 seconds and try one more time.

If it persists consistently, check your **Google Cloud Console > Error Reporting** to see the exact message from Vertex AI.
