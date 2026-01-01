# 🚧 Fixing "Something went wrong" on auth.expo.io

## The Issue
The error "Something went wrong trying to finish signing in" usually occurs because the **Expo Auth Proxy** struggles to communicate back to your app when using a **Tunnel** (`--tunnel`) connection. The tunnel URL changes frequently and is sometimes blocked or timed out by the proxy.

## The Solution: Switch to LAN
To reliably test Google Sign-In with Expo Go:

1.  **Stop the Terminal** (`Ctrl + C`).
2.  **Make sure** your Phone and Computer are on the **same WiFi**.
3.  **Run without tunnel**:
    ```bash
    npx expo start --clear
    ```
    (Do NOT add `--tunnel`).

4.  **Scan the QR Code**: It will use a `exp://192.168...` address.
5.  **Try Google Sign-In**.

## Why this helps
The LAN address (`192.168.x.x`) is stable and works much better with the OAuth redirect flow than the dynamic Tunnel URL.
