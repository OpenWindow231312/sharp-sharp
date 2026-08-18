import type { NewSlangTerm, SlangTerm } from "@/types/slangTerm";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
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

  await setDoc(
    doc(db, "users", data.submittedBy),
    {
      learnedTerms: arrayUnion(docRef.id),
    },
    { merge: true },
  );

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
  examples?: string[];
  region?: string;
};

export async function updateSlangTerm(
  termId: string,
  data: UpdateSlangTermData,
) {
  // Unlike addSlangTerm, we deliberately always write examples/region —
  // including as an empty array/string — so a user can clear a field they'd
  // previously filled in. The SwipeCard/StudyCard components already treat
  // an empty region/examples as "nothing to show", so this is safe.
  await updateDoc(doc(db, "slang_terms", termId), {
    term: data.term,
    meaning: data.meaning,
    language: data.language,
    examples: data.examples && data.examples.length > 0 ? data.examples : [],
    region: data.region || "",
  });
}

export async function deleteSlangTerm(termId: string) {
  await deleteDoc(doc(db, "slang_terms", termId));
}
