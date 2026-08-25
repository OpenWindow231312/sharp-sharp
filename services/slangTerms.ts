import type { NewSlangTerm, SlangExample, SlangTerm } from "@/types/slangTerm";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export async function addSlangTerm(data: NewSlangTerm) {
  // Firestore throws if any field is `undefined` — so optional fields are
  // only added to the payload when they actually have a value, rather than
  // always being present (possibly as undefined).
  const payload: Record<string, any> = {
    term: data.term,
    meaning: data.meaning,
    language: data.language,
    submittedBy: data.submittedBy,
    submittedByName: data.submittedByName,
    createdAt: serverTimestamp(),
  };
  if (data.examples && data.examples.length > 0) {
    payload.examples = data.examples.map((ex) => {
      const clean: { sentence: string; context?: string } = {
        sentence: ex.sentence,
      };
      if (ex.context) clean.context = ex.context;
      return clean;
    });
  }
  if (data.region) {
    payload.region = data.region;
  }

  const docRef = await addDoc(collection(db, "slang_terms"), payload);

  // addDoc() can resolve from Firestore's local mutation cache before the
  // write has actually round-tripped to the backend. Forcing a
  // server-only re-read here turns a silent "queued but never synced"
  // failure into a real thrown error the caller can surface, instead of
  // the app reporting success for a term that never left the device.
  const serverSnap = await getDocFromServer(docRef);
  if (!serverSnap.exists()) {
    throw new Error("Term did not sync to the server. Please try again.");
  }

  return docRef.id;
}

// Powers the "My Terms" tab on Profile — only the terms this user submitted.
export async function getUserSubmittedTerms(uid: string): Promise<SlangTerm[]> {
  const q = query(
    collection(db, "slang_terms"),
    where("submittedBy", "==", uid),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SlangTerm);
}

// Powers the Edit Term screen loading a single term by its Firestore doc ID.
export async function getSlangTermById(
  termId: string,
): Promise<SlangTerm | null> {
  const snap = await getDoc(doc(db, "slang_terms", termId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as SlangTerm) : null;
}

export type UpdateSlangTermData = {
  term: string;
  meaning: string;
  language: string;
  examples?: SlangExample[];
};

export async function updateSlangTerm(
  termId: string,
  data: UpdateSlangTermData,
) {
  // Unlike addSlangTerm, we deliberately always write examples —
  // including as an empty array — so a user can clear a field they'd
  // previously filled in. The SwipeCard/StudyCard components already treat
  // an empty examples list as "nothing to show", so this is safe.
  const examples = data.examples?.map((ex) => {
    const clean: SlangExample = { sentence: ex.sentence };
    if (ex.context) clean.context = ex.context;
    return clean;
  });

  await updateDoc(doc(db, "slang_terms", termId), {
    term: data.term,
    meaning: data.meaning,
    language: data.language,
    examples: examples && examples.length > 0 ? examples : [],
  });
}

export async function deleteSlangTerm(termId: string) {
  await deleteDoc(doc(db, "slang_terms", termId));
}
