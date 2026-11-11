import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOnboarding } from '@/context/OnboardingContext';
import { theme } from '@/constants/designTheme';
import { LANGUAGES } from '@/constants/languages';
import { useAuth } from '@/context/AuthContext';
import { setUserLanguages } from '@/services/userPrefs';
import { useState } from 'react';

export default function OnboardingLanguagesScreen() {
  const router = useRouter();
  const { languages, toggleLanguage } = useOnboarding();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  async function finishOnboarding() {
    setIsSaving(true);
    try {
      // Persist the picks so the Feed can filter by them and Profile can
      // edit them later. Before this they lived only in memory.
      if (user) await setUserLanguages(user.uid, languages);
    } catch (error) {
      console.log('Save languages error:', error);
    }
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    setIsSaving(false);
    router.replace('/(tabs)/feed');
  }

  return (
    <View style={styles.container}>
      {/* Last step of one continuous bar that the story screen fills first. */}
      <ProgressBar progress={1} />
      <Text variant="display" style={{ marginBottom: 8 }}>
        Pick your languages
      </Text>
      <Text variant="muted" style={{ marginBottom: 24 }}>
        Choose what you want to learn. You can change this any time on your profile.
      </Text>
      <ScrollView contentContainerStyle={styles.chipWrap} style={{ flex: 1 }}>
        {LANGUAGES.map((lang) => {
          const isSelected = languages.includes(lang);
          return (
            <Pressable
              key={lang}
              onPress={() => toggleLanguage(lang)}
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
      </ScrollView>
      <Text variant="muted" style={{ marginBottom: 12 }}>
        {languages.length} selected
      </Text>
      <Button
        label={isSaving ? 'Saving...' : "Let's go"}
        variant="primary"
        disabled={languages.length === 0 || isSaving}
        onPress={finishOnboarding}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: theme.colors.background,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 24,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: theme.colors.indigo,
    borderRadius: theme.radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
