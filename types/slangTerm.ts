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
};

export type NewSlangTerm = Omit<SlangTerm, "id" | "createdAt">;
