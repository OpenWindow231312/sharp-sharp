import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { saveTermForUser } from '@/services/savedTerms';
import { SwipeCard } from '@/components/ui/SwipeCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { theme } from '@/constants/designTheme';
import type { SlangTerm } from '@/types/slangTerm';

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [allTerms, setAllTerms] = useState<SlangTerm[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string> | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function loadExcluded() {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};
      const saved: string[] = data.savedTerms ?? [];
      const learned: string[] = data.learnedTerms ?? [];
      setExcludedIds(new Set([...saved, ...learned]));
      setSavedCount(saved.length);
    }
    loadExcluded();
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'slang_terms'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const terms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SlangTerm));
      setAllTerms(terms);
    });
    return unsubscribe;
  }, []);

  const feedTerms = useMemo(() => {
    if (!user || !excludedIds) return [];
    return allTerms.filter((t) => t.submittedBy !== user.uid && !excludedIds.has(t.id));
  }, [allTerms, excludedIds, user]);

  function handleSwipe(direction: 'left' | 'right') {
    const term = feedTerms[currentIndex];
    if (direction === 'right' && user && term) {
      saveTermForUser(user.uid, term.id).catch((error) => {
        console.log('Save term error:', error);
      });
      setSavedCount((c) => c + 1);
    }
    setCurrentIndex((i) => i + 1);
  }

  const isLoading = excludedIds === null;
  const topTerm = feedTerms[currentIndex];
  const nextTerm = feedTerms[currentIndex + 1];
  const noMoreCards = !isLoading && currentIndex >= feedTerms.length;

  return (
    <View style={styles.container}>
      <Text variant="display" style={{ marginBottom: 4 }}>Feed</Text>
      <Text variant="muted" style={{ marginBottom: 16 }}>
        Swipe right to save, left to skip.
      </Text>

      <Button
        label={savedCount > 0 ? `Learn (${savedCount} in your dictionary)` : 'Learn (nothing saved yet)'}
        variant={savedCount > 0 ? 'primary' : 'secondary'}
        disabled={savedCount === 0}
        onPress={() => router.push('/learn')}
        style={{ alignSelf: 'flex-start', marginBottom: 24 }}
      />

      <View style={styles.stack}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : noMoreCards ? (
          <Card style={styles.emptyCard}>
            <Text variant="heading" style={{ marginBottom: 8 }}>You're all caught up!</Text>
            <Text variant="muted">No new terms right now — check back later, or add one yourself.</Text>
          </Card>
        ) : (
          <>
            {nextTerm ? (
              <View style={styles.peekWrapper}>
                <Card style={styles.peekCard} />
              </View>
            ) : null}
            {topTerm ? <SwipeCard key={topTerm.id} term={topTerm} onSwipe={handleSwipe} /> : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: theme.colors.background },
  stack: { flex: 1, justifyContent: 'center' },
  peekWrapper: { position: 'absolute', width: '100%', top: 8, transform: [{ scale: 0.96 }], opacity: 0.6 },
  peekCard: { minHeight: 340 },
  emptyCard: { alignItems: 'center', padding: 32 },
});
