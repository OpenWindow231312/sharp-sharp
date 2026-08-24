import type { Flag, FlagReason, SlangTerm } from "@/types/slangTerm";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export async function getAllTermsPaginated(
  afterDoc?: QueryDocumentSnapshot,
  pageSize = 25,
): Promise<{ terms: SlangTerm[]; lastDoc: QueryDocumentSnapshot | null }> {
  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];
  const q = afterDoc
    ? query(collection(db, "slang_terms"), ...constraints, startAfter(afterDoc))
    : query(collection(db, "slang_terms"), ...constraints);

  const snap = await getDocs(q);
  const terms = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SlangTerm);
  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  return { terms, lastDoc };
}

// Admin delete — same underlying deleteDoc as the existing
// deleteSlangTerm, but kept as a separate named export here since it's
// conceptually an admin action, not a self-service one.
export async function adminDeleteTerm(termId: string) {
  await deleteDoc(doc(db, "slang_terms", termId));
}

export async function flagTerm(
  termId: string,
  termSnapshot: string,
  reportedBy: string,
  reason: FlagReason,
) {
  const payload = {
    termId,
    termSnapshot,
    reportedBy,
    reason,
    status: "pending",
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "flags"), payload);

  // Bumping flagCount requires update permission on slang_terms, which
  // firestore.rules only grants to the term's own submitter or an admin.
  // Most people flagging a term didn't submit it, so this write is
  // expected to be denied for them — that's fine, flagCount is just a
  // display counter for Control Center and shouldn't block the flag
  // report above (the part that actually matters) from succeeding.
  try {
    await updateDoc(doc(db, "slang_terms", termId), {
      flagCount: increment(1),
    });
  } catch (error) {
    console.log("Flag count increment error:", error);
  }
}

export async function getPendingFlags(): Promise<Flag[]> {
  const q = query(
    collection(db, "flags"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Flag);
}

export async function dismissFlag(flagId: string) {
  await updateDoc(doc(db, "flags", flagId), { status: "dismissed" });
}

export async function approveFlagAndDeleteTerm(flagId: string, termId: string) {
  await updateDoc(doc(db, "flags", flagId), { status: "actioned" });
  await deleteDoc(doc(db, "slang_terms", termId));
}
