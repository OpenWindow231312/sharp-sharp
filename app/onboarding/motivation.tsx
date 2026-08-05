import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOnboarding } from '@/context/OnboardingContext';
import { theme } from '@/constants/designTheme';

const REASONS = [
  { id: 'moving', label: 'Moving to South Africa' },
  { id: 'family', label: 'Family & friends' },
  { id: 'curious', label: 'Just curious' },
  { id: 'content', label: 'Making content' },
];

export default function OnboardingMotivationScreen() {
  const router = useRouter();
  const { languages, motivation, setMotivation } = useOnboarding();

  function handleFinish() {
    // Not saved to Firestore yet — no user profile schema exists for this
    // field yet. This just proves the data is flowing correctly through
    // onboarding. Once user profiles are built, this is where we'll write
    // { languages, motivation } to the user's document instead of logging it.
    console.log('Onboarding complete:', { languages, motivation });
    router.replace('/(tabs)/feed');
  }

  return (
    <View style={styles.container}>
      <ProgressBar progress={1} />
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={{ fontSize: 20 }}>←</Text>
      </Pressable>
      <Text variant="display" style={{ marginBottom: 8 }}>
        Why are you learning?
      </Text>
      <Text variant="muted" style={{ marginBottom: 24 }}>
        Just for us — helps us understand who's using Sharp Sharp.
      </Text>

      <View style={{ gap: 12, marginBottom: 24 }}>
        {REASONS.map((reason) => (
          <Button
            key={reason.id}
            label={reason.label}
            variant={motivation === reason.id ? 'primary' : 'secondary'}
            onPress={() => setMotivation(reason.id)}
          />
        ))}
      </View>

      <Button
        label="Finish"
        variant="primary"
        disabled={!motivation}
        onPress={handleFinish}
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
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
});
