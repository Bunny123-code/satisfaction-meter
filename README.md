# 🏪 Mall Mood Meter

A lightweight, static web app that lets customers scan a QR code and submit a mood rating (😊 / 😐 / 😠) with an optional comment. Store owners view a live dashboard. Everything runs on **GitHub Pages** (free static hosting) + **Firebase** (free Firestore + Auth).

---

## 📁 File Structure

```
your-repo/
├── index.html          ← Customer mood submission page
├── dashboard.html      ← Store owner dashboard (login required)
├── admin.html          ← Admin panel (manage stores, view all data)
├── generate-qr.html    ← QR code generator tool
├── firestore.rules     ← Firebase security rules
├── firebase.indexes.json ← Firestore composite indexes
└── README.md
```

---

## 🚀 Step-by-Step Setup

### Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `mall-mood-meter`) → Continue
3. Disable Google Analytics if not needed → **Create project**

---

### Step 2 — Enable Firebase Authentication

1. In the Firebase Console, go to **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, enable **Email/Password**
4. Click **Save**

---

### Step 3 — Enable Firestore Database

1. Go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we will set rules ourselves)
4. Select a server location close to your users (e.g. `asia-south1` for Pakistan/India)
5. Click **Enable**

---

### Step 4 — Get Your Firebase Config

1. Go to **Project Settings** (gear icon, top-left)
2. Scroll to **Your apps** → click **</>** (Web app)
3. Register the app (any nickname) → click **Register app**
4. Copy the `firebaseConfig` object shown — it looks like this:

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc123"
};
```

5. **Replace the placeholder config** in **all three** HTML files:
   - `index.html`
   - `dashboard.html`
   - `admin.html`

   Search for `YOUR_API_KEY` in each file and replace the entire `firebaseConfig` block.

---

### Step 5 — Create Store Owner Accounts

For each store owner:

1. Go to **Authentication → Users → Add user**
2. Enter their email and a password
3. Copy their **UID** (shown in the users table) — you will need it in Step 8

---

### Step 6 — Create Your Admin Account

1. Add yourself as a user in Authentication (same as Step 5)
2. Copy your UID
3. In **Firestore**, go to **Data** tab
4. Create a collection called `admins`
5. Add a document with **Document ID = your UID**, with any field (e.g. `role: "admin"`)
6. In `admin.html`, find this line and replace the placeholder with your UID:

```js
const ADMIN_UIDS = ["YOUR_ADMIN_FIREBASE_UID"];
```

---

### Step 7 — Deploy Firestore Security Rules

**Option A — Firebase Console (easiest)**

1. Go to **Firestore → Rules**
2. Replace all content with the contents of `firestore.rules`
3. Click **Publish**

**Option B — Firebase CLI**

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

### Step 8 — Add Stores via Admin Panel

1. Open `admin.html` in your browser (or after hosting, visit `https://yourname.github.io/yourrepo/admin.html`)
2. Sign in with your admin account
3. Go to the **Stores** tab
4. Fill in:
   - **Store ID** — a unique slug, e.g. `store_001` (no spaces; letters, numbers, `_`, `-` only)
   - **Store Name** — e.g. `Al Madina Bakery`
   - **Mall Name** — e.g. `City Centre Mall`
   - **Owner Email** — the store owner's email
   - **Owner UID** — copy from Firebase Auth Users table
5. Click **Add Store**
6. The success message shows the full QR URL (save it!)

---

### Step 9 — Host on GitHub Pages

1. Create a new **public** GitHub repository
2. Push all files to the `main` (or `master`) branch:

```bash
git init
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git add .
git commit -m "Initial Mall Mood Meter setup"
git push -u origin main
```

3. Go to your repo → **Settings → Pages**
4. Under **Source**, select **Deploy from a branch** → branch: `main`, folder: `/ (root)`
5. Click **Save**
6. Your site will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO/`

> ⏱️ It may take 1–2 minutes for Pages to go live the first time.

---

### Step 10 — Update Base URL in generate-qr.html

1. Open `generate-qr.html`
2. Change the default value of the **Base URL** field to match your GitHub Pages URL:

```
https://YOUR-USERNAME.github.io/YOUR-REPO/index.html
```

Or simply type it in the input when generating QR codes.

---

### Step 11 — Generate QR Codes

1. Visit `https://YOUR-USERNAME.github.io/YOUR-REPO/generate-qr.html`
2. Enter a **Store ID** (must match exactly what you added in Step 8)
3. Enter the store name (for the label)
4. Confirm the base URL
5. Click **Generate QR Code**
6. Choose a size and click **Download QR as PNG**
7. Print and place at:
   - Checkout counters
   - Store entrances
   - Fitting rooms
   - Service desks

---

## 🔗 URL Reference

| Page            | URL |
|-----------------|-----|
| Customer scan   | `https://yourname.github.io/yourrepo/index.html?store=STORE_ID` |
| Owner dashboard | `https://yourname.github.io/yourrepo/dashboard.html` |
| Admin panel     | `https://yourname.github.io/yourrepo/admin.html` |
| QR generator    | `https://yourname.github.io/yourrepo/generate-qr.html` |

---

## 🗂️ Firestore Data Model

### `moods` collection
Each document is one customer submission:

```
{
  storeId:   "store_001",        // string — which store
  mood:      "happy",            // "happy" | "neutral" | "unhappy"
  comment:   "Great service!",   // string | null — optional comment (max 300 chars)
  timestamp: Timestamp,          // server timestamp
  sessionId: "abc123xyz"         // anonymous session identifier
}
```

### `stores` collection
Document ID = storeId:

```
{
  storeName:  "Al Madina Bakery",
  mallName:   "City Centre Mall",
  ownerEmail: "owner@example.com",
  ownerId:    "firebase-auth-uid",   // links to Firebase Auth user
  createdAt:  Timestamp
}
```

### `admins` collection
Document ID = admin Firebase Auth UID:

```
{
  role: "admin"
}
```

---

## 🔒 Security Summary

| Action                          | Who can do it |
|---------------------------------|---------------|
| Submit a mood rating            | Anyone (no login) |
| Read moods for their store      | Logged-in store owner |
| Read all moods                  | Admin only |
| Add / delete stores             | Admin only |
| Manage admin list               | Admin only |

---

## ⚠️ Common Issues

**"Missing or insufficient permissions" error in browser console**
→ Your Firestore rules haven't been deployed yet. Repeat Step 7.

**Dashboard shows "No store assigned"**
→ Make sure the `ownerId` in the `stores` document exactly matches the user's Firebase Auth UID.

**QR code URL goes to a blank/error page**
→ Check that `storeId` in the URL matches a document ID in the `stores` collection.

**GitHub Pages shows 404**
→ Wait 2–5 minutes after enabling Pages. Also confirm files are in the root folder (not a subfolder).

---

## 📋 Firestore Indexes

The `firebase.indexes.json` file defines the composite indexes needed for efficient dashboard queries. Deploy them via:

```bash
firebase deploy --only firestore:indexes
```

Or add them manually in **Firestore → Indexes → Composite** if you see a "requires an index" error in the browser console — Firebase will provide a direct link to create the index automatically.

---

## 🛠️ Tech Stack

- **Frontend**: Plain HTML, CSS, JavaScript (no build step)
- **Database**: Firebase Firestore (NoSQL, real-time)
- **Auth**: Firebase Authentication (Email/Password)
- **Charts**: Chart.js 4 (CDN)
- **QR Codes**: node-qrcode (CDN)
- **Hosting**: GitHub Pages (free)

---

*Built for halal businesses. No third-party ads, no tracking, no unnecessary data collection.*
