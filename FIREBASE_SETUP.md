# Firebase Setup Guide

## Issue: "There is no configuration corresponding to the provided identifier"

This error means **Firestore database is not enabled** in your Firebase project.

### Steps to Fix:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select project: **backend-2-d6a2d**

2. **Enable Firestore Database**
   - Left sidebar → **Build** → **Firestore Database**
   - Click **Create Database**
   - Choose region (recommended: `us-central1`)
   - Select **Start in production mode**
   - Click **Create**

3. **Enable Firebase Authentication**
   - Left sidebar → **Build** → **Authentication**
   - Click **Get Started**
   - Enable **Email/Password** provider
   - Click **Save**

4. **Verify Service Account Permissions**
   - Left sidebar → **Project Settings** (gear icon) → **Service Accounts**
   - Click **Generate new private key** and save the downloaded JSON as `serviceaccountkey.json` in the project root
   - Verify `firebase-adminsdk-fbsvc@backend-2-d6a2d.iam.gserviceaccount.com` exists
   - Make sure it has **Editor** role in GCP Console

5. **Test Connection**
   - Restart backend: `npm run dev`
   - You should see: `✅ Firebase Firestore connected successfully`

---

## Authentication Flow

### Signup
- Firebase Auth creates user + hashes password
- User document stored in Firestore collection `users`
- JWT token returned to client

### Login
- Firebase Auth validates credentials
- Firestore fetches user data
- JWT token returned to client

### Protected Routes
- JWT verified and decoded
- User data fetched from Firestore
- Request continues if valid

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `permission-denied` | Enable Firestore or adjust security rules |
| `auth/invalid-api-key` | Verify Firebase credentials |
| `PERMISSION_DENIED` in console | Add required Firestore indexes |

## Security Rules (Optional)

If you get permission errors, update Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user doc
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

**After enabling Firestore, restart the backend and try signing up!**
