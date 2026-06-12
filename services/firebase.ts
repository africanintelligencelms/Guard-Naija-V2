import { initializeApp } from "firebase/app";
import {
  Firestore,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase project configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Offline-first: persist Firestore cache in IndexedDB so reads serve
// instantly and writes queue while offline (2G/3G users, dead zones).
let firestore: Firestore;
try {
  firestore = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager({}),
    }),
  });
} catch {
  // Private browsing / unsupported storage — fall back to in-memory cache
  firestore = getFirestore(app);
}

export const db = firestore;
export const auth = getAuth(app);
// NOTE: firebase/storage is intentionally NOT loaded here — it joins the
// lazy report-upload flow in Phase 2 so it never weighs down the entry chunk.
