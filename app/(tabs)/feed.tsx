import { Card } from "@/components/ui/Card";
import { FeedControls } from "@/components/ui/FeedControls";
import { FeedHeader } from "@/components/ui/FeedHeader";
import { FirstTimeTutorial } from "@/components/ui/FirstTimeTutorial";
import { SwipeCard, type SwipeCardHandle } from "@/components/ui/SwipeCard";
import { Text } from "@/components/ui/Text";
import { XpToast } from "@/components/ui/XpToast";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { getLevelInfo } from "@/constants/levels";
import { MOCK_TERMS } from "@/constants/mockTerms";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { saveTermForUser } from "@/services/savedTerms";
import { addXp } from "@/services/xp";
import type { SlangTerm } from "@/types/slangTerm";
import * as Haptics from "expo-haptics";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function FeedScreen() {
  const { user } = useAuth();
  const [allTerms, setAllTerms] = useState<SlangTerm[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string> | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState<{ id: number; amount: number } | null>(
    null,
  );
  const cardRef = useRef<SwipeCardHandle>(null);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setExcludedIds(new Set());
      setXp(35);
      return;
    }
    if (!user) return;
    async function loadInitial() {
      const snap = await getDoc(doc(db, "users", user.uid));
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
    if (!user) {
      setAllTerms([]);
      return;
    }
    const q = query(collection(db, "slang_terms"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const terms = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as SlangTerm,
        );
        setAllTerms(terms);
      },
      (error) => {
        console.log("Feed listener error:", error.message);
      },
    );
    return unsubscribe;
  }, [user]);

  const feedTerms = useMemo(() => {
    if (!excludedIds) return [];
    return allTerms.filter(
      (t) => t.submittedBy !== user?.uid && !excludedIds.has(t.id),
    );
  }, [allTerms, excludedIds, user]);

  function handleSwipe(direction: "left" | "right") {
    const term = feedTerms[currentIndex];

    if (direction === "right" && term) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setXp((x) => x + 5);
      setToast({ id: Date.now(), amount: 5 });
      setSavedCount((c) => c + 1);

      if (!USE_MOCK_DATA && user) {
        saveTermForUser(user.uid, term.id).catch((error) =>
          console.log("Save term error:", error),
        );
        addXp(user.uid, 5).catch((error) =>
          console.log("Add XP error:", error),
        );
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setCurrentIndex((i) => i + 1);
  }

  const isLoading = excludedIds === null;
  const topTerm = feedTerms[currentIndex];
  const noMoreCards = !isLoading && currentIndex >= feedTerms.length;
  const levelInfo = getLevelInfo(xp);
  const showControls = !isLoading && !noMoreCards && !!topTerm;
  // How many faint cards to hint at behind the top one — purely decorative,
  // doesn't need real term data, just enough to read as "a deck" rather
  // than "one card floating alone."
  const peekCount = Math.min(2, Math.max(0, feedTerms.length - currentIndex - 1));

  return (
    <View style={styles.container}>
      <FirstTimeTutorial />

      <FeedHeader
        levelTitle={levelInfo.title}
        progress={levelInfo.progress}
        xp={xp}
        savedCount={savedCount}
        avatarInitial={user?.email?.[0]?.toUpperCase() ?? "?"}
      />

      <View style={styles.stack}>
        {toast ? (
          <XpToast
            key={toast.id}
            amount={toast.amount}
            onDone={() => setToast(null)}
          />
        ) : null}

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : noMoreCards ? (
          <Card style={styles.emptyCard}>
            <Text variant="heading" style={{ marginBottom: 8 }}>
              You're all caught up!
            </Text>
            <Text variant="muted">
              No new terms right now — check back later, or add one yourself.
            </Text>
          </Card>
        ) : (
          <>
            {peekCount > 1 ? (
              <View style={[styles.peekWrapper, styles.peekWrapperFar]}>
                <Card style={styles.peekCard} />
              </View>
            ) : null}
            {peekCount > 0 ? (
              <View style={[styles.peekWrapper, styles.peekWrapperNear]}>
                <Card style={styles.peekCard} />
              </View>
            ) : null}
            {topTerm ? (
              <SwipeCard
                ref={cardRef}
                key={topTerm.id}
                term={topTerm}
                onSwipe={handleSwipe}
              />
            ) : null}
          </>
        )}
      </View>

      {showControls ? (
        <FeedControls
          onSkip={() => handleSwipe("left")}
          onFlip={() => cardRef.current?.flip()}
          onSave={() => handleSwipe("right")}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    backgroundColor: theme.colors.background,
  },
  stack: {
    flex: 1,
    justifyContent: "center",
  },
  peekWrapper: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  peekWrapperNear: {
    top: 8,
    transform: [{ scale: 0.96 }],
    opacity: 0.6,
  },
  peekWrapperFar: {
    top: 16,
    transform: [{ scale: 0.92 }],
    opacity: 0.32,
  },
  peekCard: { minHeight: 340 },
  emptyCard: { alignItems: "center", padding: 32 },
});
