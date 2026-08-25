import type { Flag, FlagReason, SlangTerm } from "@/types/slangTerm";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
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
  comment?: string,
) {
  const payload: Record<string, any> = {
    termId,
    termSnapshot,
    reportedBy,
    reason,
    status: "pending",
    createdAt: serverTimestamp(),
  };
  // Firestore throws if any field is `undefined` — so the comment is only
  // added to the payload when it actually has a value, rather than always
  // being present (possibly as an empty string).
  if (comment && comment.trim()) {
    payload.comment = comment.trim();
  }

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

// Enriched Flag used by the Control Center: adds the reporter's resolved
// display name (instead of showing their raw uid) and the full term
// document, so the Flagged Queue card and its detail modal don't need a
// second round-trip to look either up.
export type FlagWithDetails = Flag & {
  reporterName: string;
  term: SlangTerm | null;
};

async function getUserDisplayName(uid: string): Promise<string> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return "Unknown user";
    const data = snap.data();
    const fullName = [data.firstName, data.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (fullName) return fullName;
    if (data.email) return data.email as string;
    return "Unknown user";
  } catch (error) {
    console.log("Get user display name error:", error);
    return "Unknown user";
  }
}

async function getFlagTerm(termId: string): Promise<SlangTerm | null> {
  try {
    const snap = await getDoc(doc(db, "slang_terms", termId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as SlangTerm) : null;
  } catch (error) {
    console.log("Get flagged term error:", error);
    return null;
  }
}

export async function getPendingFlags(): Promise<FlagWithDetails[]> {
  // Deliberately no orderBy() here: combining it with the where() below
  // would need a composite index that doesn't exist in this project (see
  // firebase.json — no firestore.indexes.json is configured), which made
  // this query throw on every call and silently left the Flagged Queue
  // empty. A single equality filter only needs Firestore's automatic
  // single-field index, so we sort client-side instead.
  const q = query(collection(db, "flags"), where("status", "==", "pending"));
  const snap = await getDocs(q);
  const flags = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Flag);
  const sorted = flags.sort((a, b) => {
    const aMillis = a.createdAt?.toMillis?.() ?? 0;
    const bMillis = b.createdAt?.toMillis?.() ?? 0;
    return bMillis - aMillis;
  });

  return Promise.all(
    sorted.map(async (flag) => {
      const [reporterName, term] = await Promise.all([
        getUserDisplayName(flag.reportedBy),
        getFlagTerm(flag.termId),
      ]);
      return { ...flag, reporterName, term };
    }),
  );
}

export async function dismissFlag(flagId: string) {
  await updateDoc(doc(db, "flags", flagId), { status: "dismissed" });
}

export async function approveFlagAndDeleteTerm(flagId: string, termId: string) {
  await updateDoc(doc(db, "flags", flagId), { status: "actioned" });
  await deleteDoc(doc(db, "slang_terms", termId));
}
