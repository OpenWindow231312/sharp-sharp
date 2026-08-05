import { doc, setDoc, increment, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// increment() is atomic and safe even if `xp` doesn't exist yet — Firestore
// treats a missing field as 0. setDoc with merge:true also means this
// creates the user's profile doc if it's their very first XP-earning action.
export async function addXp(uid: string, amount: number) {
  await setDoc(doc(db, 'users', uid), { xp: increment(amount) }, { merge: true });
}

export async function getXp(uid: string): Promise<number> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data().xp ?? 0) : 0;
}
