import { createContext, useContext, useState, type ReactNode } from 'react';

type OnboardingContextType = {
  languages: string[];
  toggleLanguage: (lang: string) => void;
  motivation: string | null;
  setMotivation: (value: string) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [languages, setLanguages] = useState<string[]>([]);
  const [motivation, setMotivation] = useState<string | null>(null);

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  return (
    <OnboardingContext.Provider value={{ languages, toggleLanguage, motivation, setMotivation }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return ctx;
}
