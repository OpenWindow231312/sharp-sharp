import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SwipeCard } from "@/components/ui/SwipeCard";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { LANGUAGES, OTHER_LANGUAGE_OPTION } from "@/constants/languages";
import { useAuth } from "@/context/AuthContext";
import { addSlangTerm } from "@/services/slangTerms";
import { addXp } from "@/services/xp";
import type { SlangExample, SlangTerm } from "@/types/slangTerm";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { CaretLeft, X } from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { styles } from "@/styles/tabs/add.styles";

const TOTAL_STEPS = 5;

export default function AddTermScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [term, setTerm] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [customLanguage, setCustomLanguage] = useState("");
  const [meaning, setMeaning] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [exampleContext, setExampleContext] = useState("");
  const [examples, setExamples] = useState<SlangExample[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDone, setIsDone] = useState(false);

  function goNext() {
    setErrorMsg("");
    if (step === 0 && !term.trim())
      return setErrorMsg("Type a word or phrase first.");
    if (step === 1 && !language) return setErrorMsg("Pick a language.");
    if (
      step === 1 &&
      language === OTHER_LANGUAGE_OPTION &&
      !customLanguage.trim()
    )
      return setErrorMsg("Type the language name.");
    if (step === 2 && !meaning.trim()) return setErrorMsg("Add a meaning.");
    if (step === 3 && examples.length === 0)
      return setErrorMsg("Add at least one example, or tap Skip.");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  }

  // Separate from goNext() on purpose: Skip must bypass the "at least one
  // example" check above, since skipping means the user is choosing NOT to
  // add one. If Skip called goNext(), it would trip its own validation.
  function skipStep() {
    setErrorMsg("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  }

  function goBack() {
    setErrorMsg("");
    setStep((s) => Math.max(0, s - 1));
  }

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

  const finalLanguage =
    language === OTHER_LANGUAGE_OPTION ? customLanguage.trim() : language;

  // No Firestore doc exists yet at this step, so this is a local stand-in
  // just to feed SwipeCard the shape of data it expects — colorwayForTerm
  // just needs *a* stable string to hash, not the eventual real doc id.
  const previewTerm: SlangTerm = {
    id: term.trim() || "preview",
    term: term.trim(),
    meaning: meaning.trim(),
    examples,
    language: finalLanguage!,
    submittedBy: user?.uid ?? "preview",
    submittedByName: user?.displayName || "You",
    createdAt: null,
  };

  function resetForm() {
    setStep(0);
    setTerm("");
    setLanguage(null);
    setCustomLanguage("");
    setMeaning("");
    setExampleSentence("");
    setExampleContext("");
    setExamples([]);
    setIsDone(false);
  }

  async function handleSubmit() {
    if (!user) {
      setErrorMsg("You need to be logged in to add a term.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await addSlangTerm({
        term: term.trim(),
        meaning: meaning.trim(),
        examples,
        language: finalLanguage!,
        submittedBy: user.uid,
        submittedByName: user.displayName || "Anonymous",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addXp(user.uid, 20).catch((error) => console.log("Add XP error:", error));
      setIsDone(true);
    } catch (error) {
      console.log("Add term error:", error);
      const detail = error instanceof Error ? error.message : String(error);
      setErrorMsg(
        "Couldn't add the term. Check your connection and try again.",
      );
      Alert.alert("Couldn't add the term", detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <CelebrationScreen
        term={term}
        language={finalLanguage!}
        onAddAnother={resetForm}
        onGoToFeed={() => {
          resetForm();
          router.push("/(tabs)/feed");
        }}
      />
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
        <ProgressBar progress={(step + 1) / TOTAL_STEPS} />

        {step > 0 ? (
          <View style={styles.headerRow}>
            <Pressable onPress={goBack} style={styles.backButton} hitSlop={12}>
              <CaretLeft size={22} color={theme.colors.ink} />
            </Pressable>
            {step === 3 ? (
              <Pressable onPress={skipStep} hitSlop={12}>
                <Text variant="muted" style={styles.skipText}>
                  Skip
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {step === 0 && (
          <StepBlock
            title="What's the word?"
            subtitle="A slang term or phrase you know."
          >
            <Input
              placeholder="e.g. Eish"
              value={term}
              onChangeText={setTerm}
              autoFocus
            />
          </StepBlock>
        )}

        {step === 1 && (
          <StepBlock
            title="Which language?"
            subtitle={`"${term}" belongs to...`}
          >
            <View style={styles.chipWrap}>
              {LANGUAGES.map((lang, i) => (
                <Chip
                  key={lang}
                  label={lang}
                  selected={language === lang}
                  onPress={() => setLanguage(lang)}
                  delay={i * 25}
                />
              ))}
              <Chip
                label={OTHER_LANGUAGE_OPTION}
                selected={language === OTHER_LANGUAGE_OPTION}
                onPress={() => setLanguage(OTHER_LANGUAGE_OPTION)}
                delay={LANGUAGES.length * 25}
              />
            </View>
            {language === OTHER_LANGUAGE_OPTION ? (
              <Input
                placeholder="e.g. Hebrew"
                value={customLanguage}
                onChangeText={setCustomLanguage}
                autoFocus
                containerStyle={{ marginTop: 16 }}
              />
            ) : null}
          </StepBlock>
        )}

        {step === 2 && (
          <StepBlock title="What does it mean?" subtitle="Explain it simply.">
            <Input
              placeholder="What does it mean?"
              value={meaning}
              onChangeText={setMeaning}
              multiline
              autoFocus
            />
          </StepBlock>
        )}

        {step === 3 && (
          <StepBlock
            title="Add some flavour"
            subtitle="Show people how it's really used — you can add more than one."
          >
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
                marginBottom: examples.length > 0 ? 16 : 4,
              }}
            />
            {examples.length > 0 ? (
              <View style={styles.examplesList}>
                {examples.map((ex, i) => (
                  <Card key={`${ex.sentence}-${i}`} style={styles.exampleCard}>
                    <View style={styles.exampleRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.exampleSentence}>
                          "{ex.sentence}"
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
          </StepBlock>
        )}

        {step === 4 && (
          <StepBlock
            title="Ready to teach Sharp Sharp?"
            subtitle="Here's what people will see."
          >
            <View style={{ position: "relative", minHeight: 400 }}>
              <SwipeCard term={previewTerm} interactive={false} />
            </View>
          </StepBlock>
        )}

        {errorMsg ? (
          <Text style={{ color: theme.colors.protea, marginTop: 8 }}>
            {errorMsg}
          </Text>
        ) : null}

        <Button
          label={
            step === 4
              ? isSubmitting
                ? "Adding..."
                : "Add term (+20 XP)"
              : "Next"
          }
          variant="primary"
          disabled={isSubmitting || (step === 3 && examples.length === 0)}
          onPress={step === 4 ? handleSubmit : goNext}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text variant="display" style={{ marginBottom: 4 }}>
        {title}
      </Text>
      <Text variant="muted" style={{ marginBottom: 24 }}>
        {subtitle}
      </Text>
      {children}
    </View>
  );
}

function CelebrationScreen({
  term,
  language,
  onAddAnother,
  onGoToFeed,
}: {
  term: string;
  language: string;
  onAddAnother: () => void;
  onGoToFeed: () => void;
}) {
  const scale = useSharedValue(0);
  const xpOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8 });
    xpOpacity.value = withTiming(1, { duration: 400 });
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const xpStyle = useAnimatedStyle(() => ({
    opacity: xpOpacity.value,
    transform: [
      { translateY: withTiming(xpOpacity.value * 0, { duration: 1 }) },
    ],
  }));

  return (
    <View style={styles.celebrationContainer}>
      <Animated.Text style={[styles.checkmark, checkStyle]}>✓</Animated.Text>
      <Animated.View style={xpStyle}>
        <Text style={styles.xpEarned}>+20 XP</Text>
      </Animated.View>
      <Text
        variant="heading"
        style={{ marginTop: 8, marginBottom: 4, textAlign: "center" }}
      >
        "{term}" is live!
      </Text>
      <Text variant="muted" style={{ marginBottom: 32, textAlign: "center" }}>
        Someone's about to learn their first {language} word from you.
      </Text>
      <Button
        label="Add another word"
        variant="primary"
        onPress={onAddAnother}
        style={{ marginBottom: 12, width: "100%" }}
      />
      <Button
        label="Back to Feed"
        variant="secondary"
        onPress={onGoToFeed}
        style={{ width: "100%" }}
      />
    </View>
  );
}
