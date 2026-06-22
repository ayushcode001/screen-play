import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

// ── Collection reference helper ──────────────────────────────────────────────
const draftsCol = (uid) => collection(db, 'users', uid, 'drafts');
const draftDoc  = (uid, draftId) => doc(db, 'users', uid, 'drafts', draftId);

// ── Subscribe to all drafts (real-time) ──────────────────────────────────────
// Returns an unsubscribe function. Callback receives array of draft objects.
export function subscribeToDrafts(uid, callback) {
  const q = query(draftsCol(uid), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const drafts = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      callback(drafts, null);
    },
    (error) => {
      console.error('[Firestore] subscribeToDrafts error:', error);
      callback([], error);
    }
  );
}

// ── Save (create or update) a draft ──────────────────────────────────────────
// Returns the draftId that was saved.
export async function saveDraft(uid, draftData) {
  const id = draftData.id || `draft_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  const ref = draftDoc(uid, id);
  await setDoc(ref, {
    ...draftData,
    id,
    updatedAt: serverTimestamp(),
    createdAt: draftData.createdAt || serverTimestamp(),
  }, { merge: true });
  return id;
}

// ── Load a single draft ───────────────────────────────────────────────────────
export async function loadDraft(uid, draftId) {
  const snap = await getDoc(draftDoc(uid, draftId));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id };
}

// ── Delete a draft ────────────────────────────────────────────────────────────
export async function deleteDraft(uid, draftId) {
  await deleteDoc(draftDoc(uid, draftId));
}
