import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOnboarding } from '@/context/OnboardingContext';
import { theme } from '@/constants/designTheme';
import { LANGUAGES } from '@/constants/languages';

export default function OnboardingLanguagesScreen() {
  const router = useRouter();
  const { languages, toggleLanguage } = useOnboarding();

  return (
    <View style={styles.container}>
      <ProgressBar progress={0.5} />
      <Text variant="display" style={{ marginBottom: 8 }}>
        Pick your languages
      </Text>
      <Text variant="muted" style={{ marginBottom: 24 }}>
        Choose what you want to learn. You can always change this later.
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
        label="Next"
        variant="primary"
        disabled={languages.length === 0}
        onPress={() => router.push('/onboarding/motivation')}
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
