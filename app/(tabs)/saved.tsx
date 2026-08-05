import { View, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { getSavedTerms, removeSavedTerm } from '@/services/savedTerms';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { theme } from '@/constants/designTheme';
import { USE_MOCK_DATA } from '@/constants/devConfig';
import { MOCK_TERMS } from '@/constants/mockTerms';
import type { SlangTerm } from '@/types/slangTerm';

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [terms, setTerms] = useState<SlangTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const source = USE_MOCK_DATA
      ? Promise.resolve(MOCK_TERMS)
      : (user ? getSavedTerms(user.uid) : Promise.resolve([]));
    source.then((loaded) => {
      setTerms(loaded);
      setIsLoading(false);
    });
  }, [user]);

  function handleRemove(termId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTerms((prev) => prev.filter((t) => t.id !== termId));
    if (!USE_MOCK_DATA && user) {
      removeSavedTerm(user.uid, termId).catch((error) => console.log('Remove term error:', error));
    }
  }

  function handleOpen(termId: string) {
    router.push({ pathname: '/learn', params: { startId: termId } });
  }

  return (
    <View style={styles.container}>
      <Text variant="display" style={{ marginBottom: 4 }}>My dictionary</Text>
      <Text variant="muted" style={{ marginBottom: 24 }}>
        {terms.length > 0 ? `${terms.length} word${terms.length === 1 ? '' : 's'} saved` : 'Everything you save from the Feed lands here.'}
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : terms.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text variant="heading" style={{ marginBottom: 8 }}>Nothing saved yet</Text>
          <Text variant="muted">Swipe right on a term in the Feed to add it here.</Text>
        </Card>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {terms.map((term) => (
            <Animated.View key={term.id} entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
              <Pressable onPress={() => handleOpen(term.id)}>
                <Card style={styles.termCard}>
                  <View style={styles.cardTop}>
                    <Chip label={term.language} selected={false} />
                    <Pressable onPress={() => handleRemove(term.id)} hitSlop={10}>
                      <Text style={{ color: '#C0392B', fontWeight: '700' }}>Remove</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.termText}>{term.term}</Text>
                  <Text variant="muted" numberOfLines={2}>{term.meaning}</Text>
                </Card>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 70, backgroundColor: theme.colors.background },
  emptyCard: { alignItems: 'center', padding: 32 },
  termCard: { marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  termText: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
});
