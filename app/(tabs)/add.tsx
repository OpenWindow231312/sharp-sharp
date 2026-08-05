import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { theme } from '@/constants/designTheme';
import { LANGUAGES } from '@/constants/languages';
import { useAuth } from '@/context/AuthContext';
import { addSlangTerm } from '@/services/slangTerms';
import { addXp } from '@/services/xp';

const TOTAL_STEPS = 5;

export default function AddTermScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [term, setTerm] = useState('');
  const [language, setLanguage] = useState<string | null>(null);
  const [meaning, setMeaning] = useState('');
  const [exampleInput, setExampleInput] = useState('');
  const [examples, setExamples] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDone, setIsDone] = useState(false);

  function goNext() {
    setErrorMsg('');
    if (step === 0 && !term.trim()) return setErrorMsg('Type a word or phrase first.');
    if (step === 1 && !language) return setErrorMsg('Pick a language.');
    if (step === 2 && !meaning.trim()) return setErrorMsg('Add a meaning.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  }

  function goBack() {
    setErrorMsg('');
    setStep((s) => Math.max(0, s - 1));
  }

  function addExample() {
    const trimmed = exampleInput.trim();
    if (!trimmed) return;
    setExamples((prev) => [...prev, trimmed]);
    setExampleInput('');
  }

  function removeExample(index: number) {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setStep(0);
    setTerm('');
    setLanguage(null);
    setMeaning('');
    setExampleInput('');
    setExamples([]);
    setRegion('');
    setIsDone(false);
  }

  async function handleSubmit() {
    if (!user) {
      setErrorMsg('You need to be logged in to add a term.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await addSlangTerm({
        term: term.trim(),
        meaning: meaning.trim(),
        examples,
        language: language!,
        region: region.trim() || undefined,
        submittedBy: user.uid,
        submittedByName: user.displayName || 'Anonymous',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addXp(user.uid, 20).catch((error) => console.log('Add XP error:', error));
      setIsDone(true);
    } catch (error) {
      console.log('Add term error:', error);
      setErrorMsg("Couldn't add the term. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return <CelebrationScreen term={term} language={language!} onAddAnother={resetForm} onGoToFeed={() => { resetForm(); router.push('/(tabs)/feed'); }} />;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ProgressBar progress={(step + 1) / TOTAL_STEPS} />

        {step > 0 ? (
          <Pressable onPress={goBack} style={{ marginBottom: 16, alignSelf: 'flex-start' }} hitSlop={12}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>
        ) : null}

        {step === 0 && (
          <StepBlock title="What's the word?" subtitle="A slang term or phrase you know.">
            <Input placeholder="e.g. Eish" value={term} onChangeText={setTerm} autoFocus />
          </StepBlock>
        )}

        {step === 1 && (
          <StepBlock title="Which language?" subtitle={`"${term}" belongs to...`}>
            <View style={styles.chipWrap}>
              {LANGUAGES.map((lang, i) => (
                <Chip key={lang} label={lang} selected={language === lang} onPress={() => setLanguage(lang)} delay={i * 25} />
              ))}
            </View>
          </StepBlock>
        )}

        {step === 2 && (
          <StepBlock title="What does it mean?" subtitle="Explain it simply.">
            <Input placeholder="What does it mean?" value={meaning} onChangeText={setMeaning} multiline autoFocus />
          </StepBlock>
        )}

        {step === 3 && (
          <StepBlock title="Add some flavour" subtitle="Optional — an example sentence and where it's used.">
            <Input
              placeholder="Use it in a sentence, then tap Add"
              value={exampleInput}
              onChangeText={setExampleInput}
              onSubmitEditing={addExample}
              returnKeyType="done"
            />
            <Button label="+ Add example" variant="secondary" onPress={addExample} style={{ marginBottom: 12 }} />
            {examples.length > 0 ? (
              <View style={styles.chipWrap}>
                {examples.map((ex, i) => (
                  <Chip key={`${ex}-${i}`} label={ex} selected onRemove={() => removeExample(i)} />
                ))}
              </View>
            ) : null}
            <Input placeholder="Region, e.g. Cape Flats, Joburg" value={region} onChangeText={setRegion} />
          </StepBlock>
        )}

        {step === 4 && (
          <StepBlock title="Ready to teach Sharp Sharp?" subtitle="Here's what people will see.">
            <Card style={styles.previewCard}>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <Chip label={language!} selected />
              </View>
              <Text style={styles.previewTerm}>{term}</Text>
              <Text style={{ marginTop: 8 }}>{meaning}</Text>
              {examples.length > 0 ? (
                <Text variant="muted" style={{ marginTop: 8, fontStyle: 'italic' }}>"{examples[0]}"</Text>
              ) : null}
            </Card>
          </StepBlock>
        )}

        {errorMsg ? <Text style={{ color: '#C0392B', marginTop: 8 }}>{errorMsg}</Text> : null}

        <Button
          label={step === 4 ? (isSubmitting ? 'Adding...' : 'Add term (+20 XP)') : 'Next'}
          variant="primary"
          disabled={isSubmitting}
          onPress={step === 4 ? handleSubmit : goNext}
          style={{ marginTop: 24 }}
        />
        {step === 3 ? (
          <Button label="Skip" variant="secondary" onPress={goNext} style={{ marginTop: 12 }} />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepBlock({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <View>
      <Text variant="display" style={{ marginBottom: 4 }}>{title}</Text>
      <Text variant="muted" style={{ marginBottom: 24 }}>{subtitle}</Text>
      {children}
    </View>
  );
}

function CelebrationScreen({ term, language, onAddAnother, onGoToFeed }: { term: string; language: string; onAddAnother: () => void; onGoToFeed: () => void }) {
  const scale = useSharedValue(0);
  const xpOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8 });
    xpOpacity.value = withTiming(1, { duration: 400 });
  }, []);

  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const xpStyle = useAnimatedStyle(() => ({ opacity: xpOpacity.value, transform: [{ translateY: withTiming(xpOpacity.value * 0, { duration: 1 }) }] }));

  return (
    <View style={styles.celebrationContainer}>
      <Animated.Text style={[styles.checkmark, checkStyle]}>✓</Animated.Text>
      <Animated.View style={xpStyle}>
        <Text style={styles.xpEarned}>+20 XP</Text>
      </Animated.View>
      <Text variant="heading" style={{ marginTop: 8, marginBottom: 4, textAlign: 'center' }}>
        "{term}" is live!
      </Text>
      <Text variant="muted" style={{ marginBottom: 32, textAlign: 'center' }}>
        Someone's about to learn their first {language} word from you.
      </Text>
      <Button label="Add another word" variant="primary" onPress={onAddAnother} style={{ marginBottom: 12, width: '100%' }} />
      <Button label="Back to Feed" variant="secondary" onPress={onGoToFeed} style={{ width: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 70, backgroundColor: theme.colors.background, flexGrow: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  previewCard: { minHeight: 160, justifyContent: 'center' },
  previewTerm: { fontSize: 32, fontWeight: '800' },
  celebrationContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: theme.colors.background },
  checkmark: { fontSize: 64, color: '#2E7D32', fontWeight: '800' },
  xpEarned: { fontSize: 28, fontWeight: '800', color: '#2E7D32', marginBottom: 8 },
});
