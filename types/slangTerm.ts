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
  status: FlagStatus;
  createdAt: any;
};
