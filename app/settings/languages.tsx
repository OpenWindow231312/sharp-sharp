import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SettingsGroup, SettingsRow } from "@/components/ui/SettingsRow";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { LANGUAGES } from "@/constants/languages";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { setUserLanguages } from "@/services/userPrefs";
import * as Haptics from "expo-haptics";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function LanguagesScreen() {
  const { user } = useAuth();
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setLanguages(Array.isArray(data.languages) ? data.languages : []);
      },
      (error) => console.log("Languages listener error:", error),
    );
    return unsubscribe;
  }, [user]);

  function toggle(lang: string) {
    if (!user) return;
    Haptics.selectionAsync();
    const next = languages.includes(lang)
      ? languages.filter((l) => l !== lang)
      : [...languages, lang];
    // Optimistic; the listener above confirms it a moment later.
    setLanguages(next);
    setUserLanguages(user.uid, next).catch((error) =>
      console.log("Update languages error:", error),
    );
  }

  const isAll = languages.length === 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Languages" backTo="/settings" />
      <Text variant="muted" style={styles.intro}>
        The Feed only shows terms in the languages you tick. Untick them all to
        see everything.
      </Text>

      <SettingsGroup>
        <SettingsRow
          label="All languages"
          trailing="check"
          checked={isAll}
          onPress={() => {
            if (!user || isAll) return;
            Haptics.selectionAsync();
            setLanguages([]);
            setUserLanguages(user.uid, []).catch((error) =>
              console.log("Update languages error:", error),
            );
          }}
          isLast
        />
      </SettingsGroup>

      <SettingsGroup title="Pick what you want to learn">
        {LANGUAGES.map((lang, i) => (
          <SettingsRow
            key={lang}
            label={lang}
            trailing="check"
            checked={languages.includes(lang)}
            onPress={() => toggle(lang)}
            isLast={i === LANGUAGES.length - 1}
          />
        ))}
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.xxl,
  },
  intro: { marginBottom: theme.spacing.lg, fontSize: 14 },
});
