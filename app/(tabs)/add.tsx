import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/designTheme';
import { LANGUAGES } from '@/constants/languages';
import { useAuth } from '@/context/AuthContext';
import { addSlangTerm } from '@/services/slangTerms';

export default function AddTermScreen() {
  const { user } = useAuth();
  const [term, setTerm] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [region, setRegion] = useState('');
  const [language, setLanguage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        example: example.trim() || undefined,
        language,
        region: region.trim() || undefined,
        submittedBy: user.uid,
        submittedByName: user.displayName || 'Anonymous',
      });

      setSuccessMsg(`"${term.trim()}" added!`);
      setTerm('');
      setMeaning('');
      setExample('');
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="display" style={{ marginBottom: 4 }}>Add a term</Text>
        <Text variant="muted" style={{ marginBottom: 24 }}>
          Teach the community a word or phrase you know.
        </Text>

        <Input label="Term" placeholder="e.g. Eish" value={term} onChangeText={setTerm} />
        <Input label="Meaning" placeholder="What does it mean?" value={meaning} onChangeText={setMeaning} multiline />
        <Input label="Example (optional)" placeholder="Use it in a sentence" value={example} onChangeText={setExample} multiline />
        <Input label="Region (optional)" placeholder="e.g. Cape Flats, Joburg" value={region} onChangeText={setRegion} />

        <Text variant="muted" style={{ marginBottom: 8 }}>Language</Text>
        <View style={styles.chipWrap}>
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang;
            return (
              <Pressable
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[
                  styles.chip,
                  { backgroundColor: isSelected ? theme.colors.primary : theme.colors.secondary },
                ]}
              >
                <Text style={{ color: isSelected ? theme.colors.primaryText : theme.colors.secondaryText }}>
                  {lang}
                </Text>
              </Pressable>
            );
          })}
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
