import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { saveTermForUser } from '@/services/savedTerms';
import { addXp, getXp } from '@/services/xp';
import { getLevelInfo } from '@/constants/levels';
import { SwipeCard } from '@/components/ui/SwipeCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { XpToast } from '@/components/ui/XpToast';
import { theme } from '@/constants/designTheme';
import { USE_MOCK_DATA } from '@/constants/devConfig';
import { MOCK_TERMS } from '@/constants/mockTerms';
import type { SlangTerm } from '@/types/slangTerm';

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [allTerms, setAllTerms] = useState<SlangTerm[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string> | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState<{ id: number; amount: number } | null>(null);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setExcludedIds(new Set());
      setXp(35); // demo value so the level bar has something to show in preview mode
      return;
    }
    if (!user) return;
    async function loadInitial() {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};
      const saved: string[] = data.savedTerms ?? [];
      const learned: string[] = data.learnedTerms ?? [];
      setExcludedIds(new Set([...saved, ...learned]));
      setSavedCount(saved.length);
      setXp(data.xp ?? 0);
    }
    loadInitial();
  }, [user]);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setAllTerms(MOCK_TERMS);
      return;
    }
    const q = query(collection(db, 'slang_terms'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const terms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SlangTerm));
      setAllTerms(terms);
    });
    return unsubscribe;
  }, []);

  const feedTerms = useMemo(() => {
    if (!excludedIds) return [];
    return allTerms.filter((t) => t.submittedBy !== user?.uid && !excludedIds.has(t.id));
  }, [allTerms, excludedIds, user]);

  function handleSwipe(direction: 'left' | 'right') {
    const term = feedTerms[currentIndex];

    if (direction === 'right' && term) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setXp((x) => x + 5);
      setToast({ id: Date.now(), amount: 5 });
      setSavedCount((c) => c + 1);

      if (!USE_MOCK_DATA && user) {
        saveTermForUser(user.uid, term.id).catch((error) => console.log('Save term error:', error));
        addXp(user.uid, 5).catch((error) => console.log('Add XP error:', error));
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setCurrentIndex((i) => i + 1);
  }

  const isLoading = excludedIds === null;
  const topTerm = feedTerms[currentIndex];
  const nextTerm = feedTerms[currentIndex + 1];
  const noMoreCards = !isLoading && currentIndex >= feedTerms.length;
  const levelInfo = getLevelInfo(xp);

  return (
    <View style={styles.container}>
      <Text variant="display" style={{ marginBottom: 4 }}>Feed</Text>
      <Text variant="muted" style={{ marginBottom: 12 }}>
        Swipe right to collect words — earn XP as you go.
      </Text>

      <View style={styles.levelRow}>
        <Text style={{ fontFamily: theme.fonts.bodyBold }}>{levelInfo.title}</Text>
        <Text variant="muted">{xp} XP</Text>
      </View>
      <ProgressBar progress={levelInfo.progress} />

      <Button
        label={savedCount > 0 ? `Learn (${savedCount} in your dictionary)` : 'Learn (nothing saved yet)'}
        variant={savedCount > 0 ? 'primary' : 'secondary'}
        disabled={savedCount === 0}
        onPress={() => router.push('/learn')}
        style={{ alignSelf: 'flex-start', marginBottom: 16 }}
      />

      <View style={styles.stack}>
        {toast ? (
          <XpToast key={toast.id} amount={toast.amount} onDone={() => setToast(null)} />
        ) : null}

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
  container: { flex: 1, padding: 24, paddingTop: 70, backgroundColor: theme.colors.background },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  stack: { flex: 1, justifyContent: 'center' },
  peekWrapper: { position: 'absolute', width: '100%', top: 8, transform: [{ scale: 0.96 }], opacity: 0.6 },
  peekCard: { minHeight: 340 },
  emptyCard: { alignItems: 'center', padding: 32 },
});
