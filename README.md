# AncestryFlow - Family Tree Application

A production-ready React application for visualizing and managing family trees. Built with React Flow, Tailwind CSS, and TypeScript.

## Features

- **Interactive Graph:** Drag, zoom, and explore relationships.
- **Shortest Path Calculation (BFS):** Find out exactly how two people are related.
- **Details Panel:** View photos, bio, and immediate family links.
- **Dynamic Updates:** Add new family members (persisted in memory for this demo).
- **Search:** Typeahead search to jump to specific family members.

## Setup & Run

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1.  Clone the repository (or unpackage files).
2.  Install dependencies:

```bash
npm install react react-dom reactflow dagre
npm install -D tailwindcss postcss autoprefixer vite @types/react @types/react-dom @types/dagre typescript
```
*(Note: If generating from a scaffold, `npm install` typically handles `package.json`)*

3.  Initialize Tailwind (if not using the CDN version provided in `index.html` for production builds):
```bash
npx tailwindcss init -p
```

### Running Locally

```bash
npm run dev
```
Open http://localhost:5173 in your browser.

### Building for Production

```bash
npm run build
```
The output will be in the `dist/` folder, ready for deployment to Vercel, Netlify, or Firebase Hosting.

## Environment Variables

Create a `.env` file for production configurations (e.g., Firebase).

```
# .env.example
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Algorithm Explanation: Shortest Path

To determine relationships between extended family members, we use a **Breadth-First Search (BFS)** algorithm.

1.  **Graph Representation:** The family tree is treated as an unweighted, undirected graph where People are Nodes and Relationships (Parent/Spouse) are Edges.
2.  **Traversal:** We traverse layer by layer from the `Source` person.
3.  **Path Reconstruction:** Once the `Target` person is found, we backtrack using a `parentMap` to reconstruct the path (e.g., A -> B -> C).
4.  **Interpretation:**
    *   Path Length 1: Direct (Parent/Child/Spouse).
    *   Path Length 2: Sibling, Grandparent/Grandchild.
    *   Complex paths can be analyzed to determine "Cousin", "Uncle", etc.

## Deployment

### Firebase Hosting
1.  `npm install -g firebase-tools`
2.  `firebase login`
3.  `firebase init` (Select Hosting, point to `dist`)
4.  `npm run build`
5.  `firebase deploy`

### Vercel
1.  Push code to GitHub.
2.  Import project in Vercel dashboard.
3.  Framework preset: Vite.
4.  Deploy.

## Seed Data
The seed data in `constants.ts` mocks the structure of the provided PDF. To update:
1.  Edit `constants.ts`.
2.  Replace `SEED_PEOPLE` and `SEED_RELATIONSHIPS` with your real JSON data.
