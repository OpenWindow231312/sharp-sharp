import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { MOCK_TERMS } from "@/constants/mockTerms";
import { useAuth } from "@/context/AuthContext";
import { deleteSlangTerm, getUserSubmittedTerms } from "@/services/slangTerms";
import type { SlangTerm } from "@/types/slangTerm";
import { showAlert } from "@/utils/alert";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { CaretRight, Trash } from "phosphor-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

export default function MyTermsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [terms, setTerms] = useState<SlangTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    if (USE_MOCK_DATA) {
      setTerms(MOCK_TERMS);
      setIsLoading(false);
      return;
    }
    if (!user) return;
    getUserSubmittedTerms(user.uid)
      .then((loaded) =>
        setTerms(
          [...loaded].sort(
            (a, b) =>
              (b.createdAt?.toMillis?.() ?? 0) -
              (a.createdAt?.toMillis?.() ?? 0),
          ),
        ),
      )
      .catch((error) => console.log("Load my terms error:", error))
      .finally(() => setIsLoading(false));
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openTerm(termId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/edit-term", params: { termId } });
  }

  function confirmDelete(term: SlangTerm) {
    showAlert(
      "Delete this term?",
      `"${term.term}" will be removed for everyone. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(term.id),
        },
      ],
    );
  }

  async function handleDelete(termId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTerms((prev) => prev.filter((t) => t.id !== termId));
    if (USE_MOCK_DATA) return;
    try {
      await deleteSlangTerm(termId);
    } catch (error) {
      console.log("Delete term error:", error);
      load();
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="My terms" />
        <Text variant="muted" style={styles.intro}>
          {terms.length === 0
            ? "Words you teach the community show up here."
            : `${terms.length} ${terms.length === 1 ? "word" : "words"} you've taught the community. Tap one to edit it.`}
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : terms.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text variant="heading" style={{ marginBottom: 8 }}>
              Nothing added yet
            </Text>
            <Text
              variant="muted"
              style={{ marginBottom: 16, textAlign: "center" }}
            >
              {"Know a word that isn't in the app? Add it and earn 20 XP."}
            </Text>
            <Button
              label="Add a word"
              variant="primary"
              size="compact"
              onPress={() => router.push("/(tabs)/add")}
            />
          </Card>
        ) : (
          terms.map((term) => (
            <Animated.View
              key={term.id}
              entering={FadeIn}
              exiting={FadeOut}
              layout={Layout.springify()}
            >
              <Pressable onPress={() => openTerm(term.id)}>
                <Card style={styles.termCard}>
                  <View style={styles.termRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text variant="muted" style={styles.language}>
                        {term.language}
                      </Text>
                      <Text style={styles.term}>{term.term}</Text>
                      <Text variant="muted" numberOfLines={2}>
                        {term.meaning}
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() => confirmDelete(term)}
                        hitSlop={10}
                        style={styles.deleteButton}
                      >
                        <Trash size={20} color={theme.colors.protea} />
                      </Pressable>
                      <CaretRight
                        size={16}
                        weight="bold"
                        color={theme.colors.textMuted}
                      />
                    </View>
                  </View>
                </Card>
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
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
  emptyCard: { alignItems: "center", padding: 32 },
  termCard: { marginBottom: 12 },
  termRow: { flexDirection: "row", alignItems: "center" },
  language: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  term: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 2,
  },
  actions: { alignItems: "center", gap: theme.spacing.sm },
  deleteButton: { padding: 4 },
});
