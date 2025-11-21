
# AncestryFlow - Family Tree Application

A production-ready React application for visualizing and managing family trees. Built with React Flow, Tailwind CSS, and TypeScript.

## Features

- **Interactive Graph:** Drag, zoom, and explore relationships.
- **Shortest Path Calculation (BFS):** Find out exactly how two people are related.
- **Collaborative Mode (Firebase):** Real-time syncing across devices.
- **Offline/Local Mode:** Works entirely in the browser if no backend is configured.
- **Details Panel:** View photos, bio, and immediate family links.

## Setup & Run

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1.  Clone the repository.
2.  Install dependencies:

```bash
npm install
```

### Setting up Firebase (Required for Collaborative Mode)

To enable the "Collaborative" mode where data is stored in the cloud:

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  **Enable Firestore Database:**
    *   Go to "Build" -> "Firestore Database".
    *   Click "Create Database".
    *   Select "Start in production mode".
    *   Choose a location.
    *   **IMPORTANT:** Update the "Rules" tab to allow read/write for authenticated users:
        ```javascript
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if request.auth != null;
            }
          }
        }
        ```
4.  **Enable Authentication:**
    *   Go to "Build" -> "Authentication".
    *   Click "Get Started".
    *   Enable **Email/Password** and **Google** providers.
5.  **Get API Keys:**
    *   Go to Project Settings (Gear icon) -> General.
    *   Scroll to "Your apps". Click the `</>` (Web) icon.
    *   Register app (name it "AncestryFlow").
    *   Copy the `firebaseConfig` values.
6.  **Create `.env` file:**
    *   Create a file named `.env` in the root of your project.
    *   Paste the values like this:

```env
VITE_FIREBASE_API_KEY=your_api_key_from_console
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running Locally

```bash
npm run dev
```
If the `.env` file is correct, you will see a green **CLOUD** badge in the app header.

---

## Deployment Options

You can deploy this app for free using Netlify or Vercel. 

**IMPORTANT:** For the app to connect to your Firebase database when deployed, you **must** add your Environment Variables (the `VITE_FIREBASE_...` keys) to the hosting platform's settings.

### Option 1: Deploy to Netlify (Recommended)

1.  **Push to GitHub:** Commit your code and push it to a GitHub repository.
2.  **Log in to Netlify:** Go to [Netlify](https://www.netlify.com/) and log in.
3.  **Add New Site:** Click "Add new site" > "Import an existing project" > "GitHub".
4.  **Select Repo:** Choose your `AncestryFlow` repository.
5.  **Configure Build:**
    *   Build command: `npm run build`
    *   Publish directory: `dist`
6.  **Add Environment Variables (Crucial Step):**
    *   Click **"Show advanced"** or go to **Site Settings > Environment variables** after creating the site.
    *   Add all the keys from your `.env` file (`VITE_FIREBASE_API_KEY`, etc.) individually.
7.  **Deploy:** Click "Deploy site".

*Note: This project includes a `netlify.toml` file which handles the routing configuration automatically.*

### Option 2: Deploy to Vercel

1.  **Push to GitHub:** Commit your code and push it to a GitHub repository.
2.  **Log in to Vercel:** Go to [Vercel](https://vercel.com/) and log in.
3.  **Add New Project:** Click "Add New..." > "Project".
4.  **Import Repo:** Select your GitHub repository.
5.  **Environment Variables:**
    *   Expand the **Environment Variables** section.
    *   Copy-paste all variables from your `.env` file here.
6.  **Deploy:** Click "Deploy". Vercel will automatically detect the Vite configuration.

### Option 3: Firebase Hosting

If you prefer to keep everything in Firebase:

1.  Install Firebase tools: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize: `firebase init`
    *   Select **Hosting**.
    *   Select "Use an existing project".
    *   Public directory: `dist`
    *   Configure as single-page app: **Yes**
4.  Deploy:
    ```bash
    npm run build
    firebase deploy
    ```
