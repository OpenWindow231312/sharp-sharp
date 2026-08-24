import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { LANGUAGES } from "@/constants/languages";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import {
    deleteSlangTerm,
    getSlangTermById,
    updateSlangTerm,
} from "@/services/slangTerms";
import type { SlangTerm } from "@/types/slangTerm";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { CaretLeft } from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

export default function EditTermScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { termId } = useLocalSearchParams<{ termId: string }>();

  const [original, setOriginal] = useState<SlangTerm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [term, setTerm] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [meaning, setMeaning] = useState("");
  const [exampleInput, setExampleInput] = useState("");
  const [examples, setExamples] = useState<string[]>([]);
  const [region, setRegion] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setIsAdmin(snap.exists() && snap.data().isAdmin === true),
      (error) => {
        console.log("Admin check listener error:", error);
        setIsAdmin(false);
      },
    );
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!termId) {
      setLoadError("No term specified.");
      setIsLoading(false);
      return;
    }
    if (USE_MOCK_DATA) {
      setLoadError("Editing is disabled while running on mock data.");
      setIsLoading(false);
      return;
    }
    // Wait until we know the current user's admin status before deciding
    // access, so an admin isn't briefly blocked while that check is
    // still in flight.
    if (isAdmin === null) return;

    getSlangTermById(termId)
      .then((loaded) => {
        if (!loaded) {
          setLoadError(
            "This term couldn't be found — it may have already been deleted.",
          );
          return;
        }
        if (loaded.submittedBy !== user?.uid && !isAdmin) {
          setLoadError(
            "You can only edit terms you've submitted yourself, or any term if you're an admin.",
          );
          return;
        }
        setOriginal(loaded);
        setTerm(loaded.term);
        setLanguage(loaded.language);
        setMeaning(loaded.meaning);
        setExamples(loaded.examples ?? []);
        setRegion(loaded.region ?? "");
      })
      .catch((error) => {
        console.log("Load term error:", error);
        setLoadError(
          "Couldn't load this term. Check your connection and try again.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [termId, user, isAdmin]);

  function addExample() {
    const trimmed = exampleInput.trim();
    if (!trimmed) return;
    setExamples((prev) => [...prev, trimmed]);
    setExampleInput("");
  }

  function removeExample(index: number) {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!original) return;
    setErrorMsg("");
    if (!term.trim()) return setErrorMsg("The term can't be empty.");
    if (!language) return setErrorMsg("Pick a language.");
    if (!meaning.trim()) return setErrorMsg("Add a meaning.");

    setIsSaving(true);
    try {
      await updateSlangTerm(original.id, {
        term: term.trim(),
        meaning: meaning.trim(),
        language,
        examples,
        region: region.trim() || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.log("Update term error:", error);
      setErrorMsg(
        "Couldn't save your changes. Check your connection and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete this term?",
      `"${original?.term}" will be permanently removed. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDelete },
      ],
    );
  }

  async function handleDelete() {
    if (!original) return;
    setIsDeleting(true);
    try {
      await deleteSlangTerm(original.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.log("Delete term error:", error);
      setErrorMsg(
        "Couldn't delete this term. Check your connection and try again.",
      );
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
        >
          <CaretLeft size={22} color={theme.colors.ink} />
        </Pressable>
        <View style={styles.centered}>
          <Card style={{ padding: 24, alignItems: "center" }}>
            <Text
              variant="heading"
              style={{ marginBottom: 8, textAlign: "center" }}
            >
              Can't edit this term
            </Text>
            <Text variant="muted" style={{ textAlign: "center" }}>
              {loadError}
            </Text>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
          >
            <CaretLeft size={22} color={theme.colors.ink} />
          </Pressable>
          <Text variant="heading" style={{ marginLeft: 4 }}>
            Edit term
          </Text>
        </View>
        <Text variant="muted" style={{ marginBottom: 24 }}>
          Update the details, or delete this term entirely.
        </Text>

        <Input label="Term" value={term} onChangeText={setTerm} />

        <Text variant="muted" style={{ marginBottom: 8 }}>
          Language
        </Text>
        <View style={styles.chipWrap}>
          {LANGUAGES.map((lang) => (
            <Chip
              key={lang}
              label={lang}
              selected={language === lang}
              onPress={() => setLanguage(lang)}
            />
          ))}
        </View>

        <Input
          label="Meaning"
          value={meaning}
          onChangeText={setMeaning}
          multiline
        />

        <Text variant="muted" style={{ marginBottom: 8 }}>
          Examples
        </Text>
        <Input
          placeholder="Use it in a sentence, then tap Add"
          value={exampleInput}
          onChangeText={setExampleInput}
          onSubmitEditing={addExample}
          returnKeyType="done"
        />
        <Button
          label="+ Add example"
          variant="secondary"
          onPress={addExample}
          style={{ marginBottom: 12 }}
        />
        {examples.length > 0 ? (
          <View style={[styles.chipWrap, { marginBottom: 12 }]}>
            {examples.map((ex, i) => (
              <Chip
                key={`${ex}-${i}`}
                label={ex}
                selected
                onRemove={() => removeExample(i)}
              />
            ))}
          </View>
        ) : null}

        <Input
          label="Region (optional)"
          placeholder="e.g. Cape Flats, Joburg"
          value={region}
          onChangeText={setRegion}
        />

        {errorMsg ? (
          <Text style={{ color: theme.colors.protea, marginBottom: 12 }}>
            {errorMsg}
          </Text>
        ) : null}

        <Button
          label={isSaving ? "Saving..." : "Save changes"}
          variant="primary"
          disabled={isSaving || isDeleting}
          onPress={handleSave}
          style={{ marginBottom: 12 }}
        />
        <Button
          label={isDeleting ? "Deleting..." : "Delete term"}
          variant="secondary"
          disabled={isSaving || isDeleting}
          onPress={confirmDelete}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 70,
    backgroundColor: theme.colors.background,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  backButton: {
    width: theme.tapTarget,
    height: theme.tapTarget,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12, // pulls the touch target back so the chevron itself still lines up visually with the edge
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
});
