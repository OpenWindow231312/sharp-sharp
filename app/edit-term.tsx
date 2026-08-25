import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { LANGUAGES, OTHER_LANGUAGE_OPTION } from "@/constants/languages";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import {
    deleteSlangTerm,
    getSlangTermById,
    updateSlangTerm,
} from "@/services/slangTerms";
import type { SlangExample, SlangTerm } from "@/types/slangTerm";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { CaretLeft, Trash, X } from "phosphor-react-native";
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
  const [customLanguage, setCustomLanguage] = useState("");
  const [meaning, setMeaning] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [exampleContext, setExampleContext] = useState("");
  const [examples, setExamples] = useState<SlangExample[]>([]);

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
        if (LANGUAGES.includes(loaded.language)) {
          setLanguage(loaded.language);
        } else {
          setLanguage(OTHER_LANGUAGE_OPTION);
          setCustomLanguage(loaded.language);
        }
        setMeaning(loaded.meaning);
        setExamples(loaded.examples ?? []);
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
    const trimmedSentence = exampleSentence.trim();
    if (!trimmedSentence) return;
    const trimmedContext = exampleContext.trim();
    const newExample: SlangExample = trimmedContext
      ? { sentence: trimmedSentence, context: trimmedContext }
      : { sentence: trimmedSentence };
    setExamples((prev) => [...prev, newExample]);
    setExampleSentence("");
    setExampleContext("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function removeExample(index: number) {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!original) return;
    setErrorMsg("");
    if (!term.trim()) return setErrorMsg("The term can't be empty.");
    if (!language) return setErrorMsg("Pick a language.");
    if (language === OTHER_LANGUAGE_OPTION && !customLanguage.trim())
      return setErrorMsg("Type the language name.");
    if (!meaning.trim()) return setErrorMsg("Add a meaning.");

    const finalLanguage =
      language === OTHER_LANGUAGE_OPTION ? customLanguage.trim() : language;

    setIsSaving(true);
    try {
      await updateSlangTerm(original.id, {
        term: term.trim(),
        meaning: meaning.trim(),
        language: finalLanguage,
        examples,
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

        <Dropdown
          label="Language"
          value={language}
          options={[...LANGUAGES, OTHER_LANGUAGE_OPTION]}
          onChange={setLanguage}
          placeholder="Choose a language"
        />
        {language === OTHER_LANGUAGE_OPTION ? (
          <Input
            placeholder="e.g. Hebrew"
            value={customLanguage}
            onChangeText={setCustomLanguage}
          />
        ) : null}

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
          label="Example sentence"
          placeholder="e.g. That's your problem, sorry neh"
          value={exampleSentence}
          onChangeText={setExampleSentence}
          returnKeyType="next"
        />
        <Input
          label="Context"
          placeholder="When would someone say this? e.g. sarcastically, when they're annoyed"
          value={exampleContext}
          onChangeText={setExampleContext}
          onSubmitEditing={addExample}
          returnKeyType="done"
        />
        <Button
          label="+ Add example"
          variant="secondary"
          size="compact"
          disabled={!exampleSentence.trim()}
          onPress={addExample}
          style={{
            alignSelf: "flex-start",
            marginBottom: examples.length > 0 ? 16 : 20,
          }}
        />
        {examples.length > 0 ? (
          <View style={styles.examplesList}>
            {examples.map((ex, i) => (
              <Card key={`${ex.sentence}-${i}`} style={styles.exampleCard}>
                <View style={styles.exampleRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.exampleSentence}>
                      &quot;{ex.sentence}&quot;
                    </Text>
                    {ex.context ? (
                      <Text variant="muted" style={styles.exampleContext}>
                        {ex.context}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => removeExample(i)}
                    hitSlop={10}
                    style={styles.removeExampleButton}
                  >
                    <X size={18} color={theme.colors.protea} />
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        {errorMsg ? (
          <Text style={{ color: theme.colors.protea, marginTop: 20, marginBottom: 12 }}>
            {errorMsg}
          </Text>
        ) : null}

        <Button
          label={isSaving ? "Saving..." : "Save changes"}
          variant="primary"
          disabled={isSaving || isDeleting}
          onPress={handleSave}
          style={{ marginTop: errorMsg ? 0 : 24, marginBottom: 16 }}
        />
        <Pressable
          onPress={confirmDelete}
          disabled={isSaving || isDeleting}
          hitSlop={8}
          style={styles.deleteRow}
        >
          <Trash size={16} weight="bold" color={theme.colors.protea} />
          <Text style={styles.deleteLabel}>
            {isDeleting ? "Deleting..." : "Delete term"}
          </Text>
        </Pressable>
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
  examplesList: { gap: 10, marginBottom: 4 },
  exampleRow: { flexDirection: "row", alignItems: "flex-start" },
  exampleCard: {},
  exampleSentence: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 4,
  },
  exampleContext: { fontSize: 13, fontStyle: "italic" },
  removeExampleButton: { padding: 4 },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: theme.spacing.sm,
  },
  deleteLabel: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 14,
    color: theme.colors.protea,
  },
});
