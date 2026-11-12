import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FeedControls } from "@/components/ui/FeedControls";
import { BAND_OVERLAP, MonoTag, ScreenBand } from "@/components/ui/ScreenBand";
import { FirstTimeTutorial } from "@/components/ui/FirstTimeTutorial";
import {
  CARD_HEIGHT,
  SwipeCard,
  type SwipeCardHandle,
} from "@/components/ui/SwipeCard";
import { Text } from "@/components/ui/Text";
import { XpToast } from "@/components/ui/XpToast";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { getLevelInfo, LEVELS } from "@/constants/levels";
import { MOCK_TERMS } from "@/constants/mockTerms";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { saveTermForUser } from "@/services/savedTerms";
import { matchesLanguages } from "@/services/userPrefs";
import { addXp } from "@/services/xp";
import { getInitial } from "@/utils/initials";
import type { SlangTerm } from "@/types/slangTerm";
import * as Haptics from "expo-haptics";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { styles } from "@/styles/tabs/feed.styles";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Gives every term a position the first time it is seen this session and
// keeps it. The first snapshot is shuffled so the deck reads as random;
// anything that arrives later (someone else adding a term) is appended
// after everything already dealt, so the card under the user's thumb never
// changes just because the collection changed.
function dealIntoOrder(
  terms: SlangTerm[],
  positions: Map<string, number>,
): SlangTerm[] {
  const fresh = terms.filter((t) => !positions.has(t.id));
  const incoming = positions.size === 0 ? shuffle(fresh) : fresh;
  for (const term of incoming) positions.set(term.id, positions.size);
  return [...terms].sort(
    (a, b) => (positions.get(a.id) ?? 0) - (positions.get(b.id) ?? 0),
  );
}

export default function FeedScreen() {
  const { user } = useAuth();
  const [allTerms, setAllTerms] = useState<SlangTerm[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string> | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);
  const [languages, setLanguages] = useState<string[]>([]);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [toast, setToast] = useState<{
    id: number;
    amount: number;
    label?: string;
  } | null>(null);
  const cardRef = useRef<SwipeCardHandle>(null);
  const positionsRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setExcludedIds(new Set());
      setXp(35);
      return;
    }
    if (!user) return;
    // Live listener rather than a one-off read: XP earned on the Add tab
    // (or anywhere else) shows up here straight away instead of waiting
    // for the next login. The exclusion set is only taken from the first
    // snapshot on purpose: if it tracked every save, the deck would shrink
    // under the current index and skip a card each time.
    let hasLoadedExclusions = false;
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        const saved: string[] = data.savedTerms ?? [];
        if (!hasLoadedExclusions) {
          hasLoadedExclusions = true;
          const learned: string[] = data.learnedTerms ?? [];
          setExcludedIds(new Set([...saved, ...learned]));
        }
        setSavedCount(saved.length);
        setXp(data.xp ?? 0);
        setPhotoBase64(data.photoBase64 ?? undefined);
        setName(data.name ?? undefined);
        setLanguages(Array.isArray(data.languages) ? data.languages : []);
      },
      (error) => console.log("Feed profile listener error:", error),
    );
    return unsubscribe;
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
        setAllTerms(dealIntoOrder(terms, positionsRef.current));
      },
      (error) => {
        console.log("Feed listener error:", error.message);
      },
    );
    return unsubscribe;
  }, [user]);

  const activeLanguages = showAllLanguages ? [] : languages;

  const feedTerms = useMemo(() => {
    if (!excludedIds) return [];
    return allTerms.filter(
      (t) =>
        t.submittedBy !== user?.uid &&
        !excludedIds.has(t.id) &&
        matchesLanguages(t.language, activeLanguages),
    );
  }, [allTerms, excludedIds, user, activeLanguages]);

  const hiddenByLanguage = useMemo(() => {
    if (!excludedIds || activeLanguages.length === 0) return 0;
    return allTerms.filter(
      (t) =>
        t.submittedBy !== user?.uid &&
        !excludedIds.has(t.id) &&
        !matchesLanguages(t.language, activeLanguages),
    ).length;
  }, [allTerms, excludedIds, user, activeLanguages]);

  function handleSwipe(direction: "left" | "right") {
    const term = feedTerms[currentIndex];

    if (direction === "right" && term) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToast({
        id: Date.now(),
        amount: 5,
        label: "Lekker",
      });

      if (USE_MOCK_DATA) {
        setXp((x) => x + 5);
        setSavedCount((c) => c + 1);
      } else if (user) {
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
  const firstName = (name || user?.displayName || "there").split(" ")[0];
  const nextLevel = LEVELS[levelInfo.level];

  return (
    <View style={styles.container}>
      <FirstTimeTutorial />

      <ScreenBand
        title={`Howzit, ${firstName}`}
        subtitle={
          feedTerms.length - currentIndex > 0
            ? `${feedTerms.length - currentIndex} ${feedTerms.length - currentIndex === 1 ? "word" : "words"} waiting for you.`
            : "Time to learn Sharp Sharp."
        }
        right={
          <View style={styles.avatar}>
            {photoBase64 ? (
              <Image source={{ uri: photoBase64 }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {getInitial(name, user?.displayName, user?.email)}
              </Text>
            )}
          </View>
        }
      >
        <View style={styles.xpRow}>
          <MonoTag onDark>
            {levelInfo.title} · {xp} XP
          </MonoTag>
          <View style={styles.xpTrack}>
            <View
              style={[
                styles.xpFill,
                { width: `${Math.round(levelInfo.progress * 100)}%` },
              ]}
            />
          </View>
          <MonoTag onDark>
            {nextLevel
              ? `${nextLevel.threshold - xp} to ${nextLevel.title}`
              : "Top tier"}
          </MonoTag>
        </View>
      </ScreenBand>

      <View
        style={[
          styles.stack,
          { marginTop: -BAND_OVERLAP },
          (isLoading || noMoreCards) && styles.stackCentered,
        ]}
      >
        {toast ? (
          <XpToast
            key={toast.id}
            amount={toast.amount}
            label={toast.label}
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
            <Text variant="muted" style={{ marginBottom: 16 }}>
              {hiddenByLanguage > 0
                ? `No new terms in your languages right now. There ${hiddenByLanguage === 1 ? "is" : "are"} ${hiddenByLanguage} in other languages.`
                : "No new terms right now. Check back later, or add one yourself."}
            </Text>
            {hiddenByLanguage > 0 ? (
              <Button
                label="Show all languages"
                variant="secondary"
                size="compact"
                onPress={() => {
                  // Widening the filter changes the list, so start the
                  // deck over rather than pointing past the end.
                  setCurrentIndex(0);
                  setShowAllLanguages(true);
                }}
              />
            ) : null}
          </Card>
        ) : (
          <>
            {topTerm ? (
              <View style={[styles.cardSlot, { height: CARD_HEIGHT }]}>
                <SwipeCard
                  ref={cardRef}
                  key={topTerm.id}
                  term={topTerm}
                  onSwipe={handleSwipe}
                />
              </View>
            ) : null}
          </>
        )}
      </View>

      {showControls ? (
        <FeedControls
          onSkip={() => handleSwipe("left")}
          onSave={() => handleSwipe("right")}
          onFlag={() => cardRef.current?.openReportModal()}
        />
      ) : null}
    </View>
  );
}
