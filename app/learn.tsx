import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useAuth } from '@/context/AuthContext';
import { getSavedTerms } from '@/services/savedTerms';
import { StudyCard } from '@/components/ui/StudyCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { theme } from '@/constants/designTheme';
import { USE_MOCK_DATA } from '@/constants/devConfig';
import { MOCK_TERMS } from '@/constants/mockTerms';
import type { SlangTerm } from '@/types/slangTerm';

export default function LearnScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [terms, setTerms] = useState<SlangTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setTerms(MOCK_TERMS);
      setIsLoading(false);
      return;
    }
    if (!user) return;
    getSavedTerms(user.uid)
      .then(setTerms)
      .finally(() => setIsLoading(false));
  }, [user]);

  function handleSwipe() {
    setCurrentIndex((i) => i + 1);
  }

  const currentTerm = terms[currentIndex];
  const isDone = !isLoading && currentIndex >= terms.length;
  const isEmpty = !isLoading && terms.length === 0;

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.closeButton} hitSlop={12}>
        <Text style={{ fontSize: 20 }}>✕</Text>
      </Pressable>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : isEmpty ? (
        <Card style={styles.messageCard}>
          <Text variant="heading" style={{ marginBottom: 8 }}>Your dictionary is empty</Text>
          <Text variant="muted" style={{ marginBottom: 16 }}>
            Swipe right on terms in the Feed to save them here first.
          </Text>
          <Button label="Back to Feed" variant="primary" onPress={() => router.back()} />
        </Card>
      ) : isDone ? (
        <Card style={styles.messageCard}>
          <Text variant="heading" style={{ marginBottom: 8 }}>Nice work!</Text>
          <Text variant="muted" style={{ marginBottom: 16 }}>
            You've been through all {terms.length} saved terms.
          </Text>
          <Button label="Done" variant="primary" onPress={() => router.back()} />
        </Card>
      ) : (
        <>
          <Text variant="muted" style={styles.progress}>
            {currentIndex + 1} of {terms.length}
          </Text>
          <StudyCard key={currentTerm.id} term={currentTerm} onSwipe={handleSwipe} />
          <View style={styles.arrowRow}>
            <Pressable
              onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              style={[styles.arrowButton, currentIndex === 0 && styles.arrowDisabled]}
            >
              <Text style={{ fontSize: 22 }}>←</Text>
            </Pressable>
            <Pressable onPress={() => setCurrentIndex((i) => i + 1)} style={styles.arrowButton}>
              <Text style={{ fontSize: 22 }}>→</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 16, justifyContent: 'center' },
  closeButton: { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  progress: { position: 'absolute', top: 16, alignSelf: 'center' },
  arrowRow: { position: 'absolute', bottom: 16, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  arrowButton: { padding: 8 },
  arrowDisabled: { opacity: 0.3 },
  messageCard: { alignItems: 'center', padding: 32, marginHorizontal: 40 },
});
