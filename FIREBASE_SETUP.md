# Firebase Setup Guide — लेखन मंच

Follow these steps **once** to connect your app to Firebase. Takes about 10 minutes.

---

## Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter a project name, e.g. `lekhna-manch`
4. Disable Google Analytics (optional) → **Create project**

---

## Step 2 — Enable Google Sign-In

1. In the Firebase console, go to **Authentication** → **Sign-in method**
2. Click **Google** → toggle **Enable** → click **Save**
3. Set your **Project support email** (required by Google OAuth)

---

## Step 3 — Create a Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Production mode** (our security rules will lock it down)
3. Select a region (e.g. `asia-south1` for India)
4. Click **Enable**

---

## Step 4 — Register a Web App & Get Config

1. In the Firebase console, click **Project Settings** (gear icon) → **General**
2. Scroll to **Your apps** → click **"Add app"** → choose **Web** (`</>`)
3. Enter an app nickname (e.g. `lekhna-manch-web`) → **Register app**
4. Copy the `firebaseConfig` object shown — you'll need these values:

```js
apiKey: "..."
authDomain: "..."
projectId: "..."
storageBucket: "..."
messagingSenderId: "..."
appId: "..."
measurementId: "..."   // optional
```

---

## Step 5 — Set Up Environment Variables

1. In the project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in `.env.local` with your Firebase values:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=lekhna-manch.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=lekhna-manch
   VITE_FIREBASE_STORAGE_BUCKET=lekhna-manch.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

> ⚠️ **Never commit `.env.local` to git.** It is already in `.gitignore`.

---

## Step 6 — Deploy Firestore Security Rules

> You must do this to secure your Firestore database.

1. Install the Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Log in:
   ```bash
   firebase login
   ```

3. Initialize the project (choose **Firestore** only, use existing project):
   ```bash
   firebase init firestore
   ```
   When asked for the rules file, enter `firestore.rules`.

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## Step 7 — Add Authorized Domains

For Google Sign-In to work on your deployed domain:

1. In Firebase console → **Authentication** → **Settings** → **Authorized domains**
2. Add:
   - `localhost` (should already be there for development)
   - Your Vercel domain, e.g. `lekhna-manch.vercel.app`
   - Any custom domain you use

---

## Step 8 — Add Vercel Environment Variables

When deploying to Vercel, add all 7 env vars in:

**Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add each `VITE_FIREBASE_*` key with its value. Redeploy after adding them.

---

## Verification Checklist

- [ ] `.env.local` created and filled in
- [ ] `npm run dev` starts without Firebase config errors in console
- [ ] Sign in with Google works at `localhost:5173`
- [ ] Drafts appear in Firebase Console → Firestore → `users/{uid}/drafts`
- [ ] Firestore rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Vercel domain added to Firebase Authorized Domains
- [ ] Production deploy works end-to-end
