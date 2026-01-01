# 🐙 GitHub Repository Setup

Since you don't have the GitHub CLI (`gh`) installed, follow these manual steps to puh your code.

## 1. Create Repository on GitHub
1.  Go to **[repo.new](https://repo.new)** (or GitHub.com -> New Repository).
2.  **Repository Name**: `dog-translator-android` (or whatever you prefer).
3.  **Visibility**: Private (Recommended) or Public.
4.  **Do NOT check** "Initialize with README" (we already have code).
5.  Click **Create repository**.

## 2. Push Your Code
Copy the commands shown on GitHub under **"…or push an existing repository from the command line"**. They will look like this:

```bash
git remote add origin https://github.com/<YOUR-USERNAME>/dog-translator-android.git
git branch -M main
git push -u origin main
```

Run those commands in your terminal here.

## 3. Future Updates
When you make changes:
```bash
git add .
git commit -m "Description of changes"
git push
```
