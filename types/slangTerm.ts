export type SlangExample = {
  sentence: string;
  context?: string;
};

export type SlangTerm = {
  id: string;
  term: string;
  meaning: string;
  examples?: SlangExample[];
  language: string;
  region?: string;
  submittedBy: string;
  submittedByName: string;
  // Display-only override for the "Added by" credit, used exclusively by
  // seeded demo content so each seeded term can show a distinct fake
  // contributor name instead of one uniform submittedByName. Real user
  // submissions through the Add wizard never set this.
  authorDisplayName?: string;
  createdAt: any;
  flagCount?: number;
};

export type NewSlangTerm = Omit<SlangTerm, "id" | "createdAt">;

export type FlagReason = "offensive" | "inaccurate" | "spam" | "other";

export type FlagStatus = "pending" | "dismissed" | "actioned";

export type Flag = {
  id: string;
  termId: string;
  termSnapshot: string; // the term's word/phrase at time of flagging, for display without a join
  reportedBy: string;
  reason: FlagReason;
  comment?: string;
  status: FlagStatus;
  createdAt: any;
};
