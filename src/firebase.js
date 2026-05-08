import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBlB-NsC76oLNAnp2hUuvl9AIJT56IdESo',
  authDomain: 'yaniv-game-aeb26.firebaseapp.com',
  databaseURL: 'https://yaniv-game-aeb26-default-rtdb.firebaseio.com',
  projectId: 'yaniv-game-aeb26',
  storageBucket: 'yaniv-game-aeb26.firebasestorage.app',
  messagingSenderId: '349677820799',
  appId: '1:349677820799:web:3da2df87461b3e289e184a',
};

export const ROOM = 'tavormind';
export const AUTH_UID_KEY = 'tavor_mind_auth_uid';

const app = initializeApp(FIREBASE_CONFIG);
export const db = getDatabase(app);
export const auth = getAuth(app);

export function ensureAuth() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        localStorage.setItem(AUTH_UID_KEY, user.uid);
        resolve(user.uid);
      }
    });
    signInAnonymously(auth).catch((err) => {
      unsub();
      reject(err);
    });
  });
}
