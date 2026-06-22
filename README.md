# लेखन मंच — Screenplay, Natak & Story Writer

A unified writing workspace for Hindi Screenplays, Nataks (plays), and Stories — with cloud sync via Firebase.

---

## Features

- ✍️ **Three writing modes** — Screenplay, Drama (Natak), Story
- 📄 **Paginated paper surface** — realistic A4/Letter page simulation
- 🎭 **Block-based editing** — Scene, Action, Character, Dialogue, Natak blocks, Story blocks
- 🔖 **Bookmarks** — bookmark any block, navigate from sidebar
- 💾 **Cloud drafts** — Firestore-backed draft manager, real-time sync across tabs
- 📴 **Offline support** — writes locally when offline, syncs to cloud on reconnect
- ↩️ **Undo / Redo** — full history per mode
- 📤 **Export** — .docx, .txt, PDF (print)
- 📥 **Import** — .docx files
- 🎨 **Color picker** — text color formatting
- 🔒 **Private by default** — Google sign-in, all drafts are per-user

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A Firebase project (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/your-username/lekhna-manch.git
cd lekhna-manch
npm install
```

### 2. Configure Firebase

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Firebase config values.  
See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for how to get these values.

### 3. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
2. Framework preset: **Vite**
3. Add all `VITE_FIREBASE_*` environment variables (from your `.env.local`)
4. Click **Deploy**

### 3. Post-Deployment

- Add your Vercel domain to Firebase Authorized Domains  
  (Firebase Console → Authentication → Settings → Authorized domains)
- Deploy Firestore security rules:  
  ```bash
  firebase deploy --only firestore:rules
  ```

---

## Project Structure

```
src/
├── firebase/
│   ├── config.js          # Firebase initialization
│   └── draftsService.js   # Firestore CRUD functions
├── context/
│   ├── AuthContext.jsx    # Google Auth state provider
│   └── DocumentContext.jsx # Document state, autosave, offline fallback
├── components/
│   ├── Auth/
│   │   ├── SignInScreen.jsx
│   │   └── LoadingSpinner.jsx
│   ├── Editor/
│   │   ├── Editor.jsx     # Main editor with pagination
│   │   └── Block.jsx      # Individual content block
│   ├── Modals/
│   │   ├── DraftManager.jsx    # Firestore-backed draft list
│   │   ├── DocumentActions.jsx # Export/import/PDF
│   │   └── CustomBlockModal.jsx
│   ├── Header.jsx         # Nav, mode switcher, avatar, save indicator
│   ├── Toolbar.jsx        # Block type insert buttons
│   ├── Sidebar.jsx        # Bookmarks, quick tips
│   └── ColorPicker.jsx
├── App.jsx                # Protected route shell
└── main.jsx               # AuthProvider + DocumentProvider wiring
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID (optional) |

---

## License

MIT
