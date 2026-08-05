export type SlangTerm = {
  id: string;
  term: string;
  meaning: string;
  example?: string;
  language: string;
  region?: string;
  submittedBy: string;      // Firebase user UID
  submittedByName: string;  // display name at time of submission
  createdAt: any;           // Firestore Timestamp (kept loose to avoid importing Firestore types here)
};

export type NewSlangTerm = Omit<SlangTerm, 'id' | 'createdAt'>;
