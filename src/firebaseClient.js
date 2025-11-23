// src/firebaseClient.js
// Minimal Firebase v9 modular init - exports db and auth.
// IMPORTANT: Replace the placeholder below with your actual Firebase config,
// or create src/firebaseConfig.local.js exporting the config object:
//   export const firebaseConfig = { ... }

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

let firebaseConfig = {
   apiKey: "AIzaSyCHC8l0qOXJcBDcw3YdJWjJzSpMwmHK82w",
  authDomain: "rangefinder-eac84.firebaseapp.com",
  databaseURL: "https://rangefinder-eac84-default-rtdb.firebaseio.com",
  projectId: "rangefinder-eac84",
  storageBucket: "rangefinder-eac84.firebasestorage.app",
  messagingSenderId: "623226713136",
  appId: "1:623226713136:web:aabe44871a5cc19ac469f5",
  measurementId: "G-D12TG8WG9N"
};

try {
  // optional local override file (ignored by git)
  // This dynamic import is safe for dev environment. Create src/firebaseConfig.local.js:
  // export const firebaseConfig = { apiKey: '...', authDomain: '...', ... }
  // The file is in .gitignore by default.
  // eslint-disable-next-line no-eval
  const cfg = await import('./firebaseConfig.local.js').then(m => m.firebaseConfig).catch(() => null);
  if (cfg) firebaseConfig = cfg;
} catch (e) {}

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
