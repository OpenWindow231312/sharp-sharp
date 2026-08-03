import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/designTheme';

const LANGUAGES = [
  'Zulu', 'Xhosa', 'Afrikaans', 'Sotho',
  'Tsotsitaal', 'isiNdebele', 'Sepedi', 'Setswana',
  'Tsonga', 'Venda',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  function toggleLanguage(lang: string) {
    setSelected((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="muted" style={{ marginBottom: 4 }}>
        Sharp Sharp — step 1 of 2
      </Text>
      <Text variant="display" style={{ marginBottom: 8 }}>
        Pick your languages
      </Text>
      <Text variant="muted" style={{ marginBottom: 24 }}>
        Choose what you want to learn. You can always change this later.
      </Text>

      <ScrollView contentContainerStyle={styles.chipWrap} style={{ flex: 1 }}>
        {LANGUAGES.map((lang) => {
          const isSelected = selected.includes(lang);
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
        {selected.length} selected
      </Text>

      <Button
        label="Next"
        variant="primary"
        disabled={selected.length === 0}
        onPress={() => router.push('/(tabs)/feed')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: theme.colors.background,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 24,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
