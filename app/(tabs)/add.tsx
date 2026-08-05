import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { theme } from '@/constants/designTheme';
import { LANGUAGES } from '@/constants/languages';
import { useAuth } from '@/context/AuthContext';
import { addSlangTerm } from '@/services/slangTerms';

export default function AddTermScreen() {
  const { user } = useAuth();
  const [term, setTerm] = useState('');
  const [meaning, setMeaning] = useState('');
  const [exampleInput, setExampleInput] = useState('');
  const [examples, setExamples] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [language, setLanguage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function addExample() {
    const trimmed = exampleInput.trim();
    if (!trimmed) return;
    setExamples((prev) => [...prev, trimmed]);
    setExampleInput('');
  }

  function removeExample(index: number) {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setErrorMsg('');
    setSuccessMsg('');

    if (!term.trim() || !meaning.trim() || !language) {
      setErrorMsg('Please fill in the term, meaning, and pick a language.');
      return;
    }
    if (!user) {
      setErrorMsg('You need to be logged in to add a term.');
      return;
    }

    setIsLoading(true);
    try {
      await addSlangTerm({
        term: term.trim(),
        meaning: meaning.trim(),
        examples,
        language,
        region: region.trim() || undefined,
        submittedBy: user.uid,
        submittedByName: user.displayName || 'Anonymous',
      });

      setSuccessMsg(`"${term.trim()}" added!`);
      setTerm('');
      setMeaning('');
      setExampleInput('');
      setExamples([]);
      setRegion('');
      setLanguage(null);
    } catch (error) {
      console.log('Add term error:', error);
      setErrorMsg("Couldn't add the term. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="display" style={{ marginBottom: 4 }}>Add a term</Text>
        <Text variant="muted" style={{ marginBottom: 24 }}>
          Teach the community a word or phrase you know.
        </Text>

        <Input label="Term" placeholder="e.g. Eish" value={term} onChangeText={setTerm} />
        <Input label="Meaning" placeholder="What does it mean?" value={meaning} onChangeText={setMeaning} multiline />

        <Text variant="muted" style={{ marginBottom: 8 }}>Examples (optional)</Text>
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

        <Input label="Region (optional)" placeholder="e.g. Cape Flats, Joburg" value={region} onChangeText={setRegion} />

        <Text variant="muted" style={{ marginBottom: 8, marginTop: 8 }}>Language</Text>
        <View style={styles.chipWrap}>
          {LANGUAGES.map((lang, index) => (
            <Chip
              key={lang}
              label={lang}
              selected={language === lang}
              onPress={() => setLanguage(lang)}
              delay={index * 30}
            />
          ))}
        </View>

        {errorMsg ? <Text style={{ color: '#C0392B', marginTop: 16 }}>{errorMsg}</Text> : null}
        {successMsg ? <Text style={{ color: '#2E7D32', marginTop: 16 }}>{successMsg}</Text> : null}

        <Button
          label={isLoading ? 'Adding...' : 'Add term'}
          variant="primary"
          disabled={isLoading}
          onPress={handleSubmit}
          style={{ marginTop: 16, marginBottom: 40 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 80,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
});
