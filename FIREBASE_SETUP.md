# 🔥 Firebase Setup Guide for BuildTrack

## Quick Start (3 Minutes)

Follow these steps to enable Firebase features in your BuildTrack project:

---

## Step 1: Create Firebase Project (If Needed)

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **"Add project"** or select existing project
3. Enter project name: `buildtrack-<yourname>` (e.g., `buildtrack-john`)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

---

## Step 2: Get Service Account Key

### 2.1 Navigate to Service Accounts
1. In Firebase Console, click **⚙️ Project settings** (top left)
2. Click **"Service accounts"** tab

### 2.2 Generate Private Key
1. Find **"Firebase Admin SDK"** section
2. Click **"Generate new private key"** button
3. **A file will download:** `firebase-adminsdk-xxxxx-xxxxx.json`
4. **IMPORTANT:** Keep this file SECURE - never commit to Git!

---

## Step 3: Configure Your Project

### 3.1 Create config directory
```bash
cd "/Users/aditya/Coding/NodeJS & MongoDB & Firebase/Major Project"
mkdir -p config
```

### 3.2 Move your key file
Move the downloaded JSON file to your project's `config/` folder:

```bash
# Move the downloaded file to:
config/firebase-service-account.json
```

### 3.3 Update your .env file
Edit your `.env` file and add:

```env
# Firebase Configuration
FIREBASE_KEY_FILE=config/firebase-service-account.json
FIREBASE_PROJECT_ID=your-project-id-from-firebase-console
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

Replace `your-project-id` with your actual Firebase project ID.

---

## Step 4: Test Firebase Connection

Restart your backend server:

```bash
cd "/Users/aditya/Coding/NodeJS & MongoDB & Firebase/Major Project"
npm start
```

You should see:
```
Firebase Admin SDK initialized successfully
MongoDB Connected: ...
```

If you see `Firebase not configured`, double-check:
- The JSON file path is correct
- The file contains valid JSON
- Environment variables are set

---

## Firebase Features Enabled

Once configured, you'll have:

| Feature | Description |
|---------|-------------|
| **Push Notifications** | Send FCM notifications to users |
| **Realtime Updates** | Notify users of updates via Firebase |
| **File Storage** | Upload/download files via Firebase Storage |
| **User Authentication** | Firebase Auth integration |

---

## Optional: Set Environment Variables (Alternative to File)

If you prefer environment variables instead of a file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-email@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

⚠️ **Warning:** This method is less secure - environment variables can be leaked in logs.

---

## Troubleshooting

### "Firebase not configured" warning
- Check that `FIREBASE_KEY_FILE` points to the correct path
- Verify the JSON file exists and is readable
- Restart your server after making changes

### "Invalid credentials" error
- Download a new private key from Firebase Console
- Replace the JSON file
- Ensure no extra characters in the key

### Push notifications not working
- Check that FCM tokens are being registered
- Verify your app has internet access
- Check Firebase Console → Cloud Messaging for stats

---

## Security Checklist

✅ Store service account JSON in `.gitignore`  
✅ Never commit `.env` file  
✅ Use production credentials only on secure servers  
✅ Rotate your private key periodically  
✅限制 Firebase permissions to what's needed  

---

## Need Help?

If you encounter issues:
1. Check Firebase Console → Project settings for your project ID
2. Verify the JSON file is valid (can be parsed as JSON)
3. Check server logs for specific error messages
4. Ensure you're using the correct project ID

---

## Next Steps

After Firebase is configured:
1. Test push notifications
2. Set up FCM token registration in frontend
3. Enable Firebase Storage for file uploads
4. Configure security rules for production
