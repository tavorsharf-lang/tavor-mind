// Lightweight IndexedDB wrapper for storing audio blobs locally.
// Used by the Sleep flow to let the user optionally replace the bundled
// Yoga Nidra recording with their own without going through Firebase.

const DB_NAME = 'tavor_mind_audio';
const DB_VERSION = 1;
const STORE = 'audio';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAudioBlob(key) {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function setAudioBlob(key, blob) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteAudioBlob(key) {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}

// Returns a usable src for the Yoga Nidra audio: an object-URL pointing at
// the user-uploaded blob (if any), otherwise the bundled static file.
// Caller is responsible for revoking the object URL when done.
export async function resolveYogaNidraSrc() {
  const blob = await getAudioBlob('yoga_nidra');
  if (blob) {
    return { src: URL.createObjectURL(blob), isUserUpload: true };
  }
  const base = import.meta.env.BASE_URL || '/';
  return { src: `${base}audio/yoga-nidra-25min.mp3`, isUserUpload: false };
}
