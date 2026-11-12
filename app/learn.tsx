import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StudyCard } from "@/components/ui/StudyCard";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { MOCK_TERMS } from "@/constants/mockTerms";
import { useAuth } from "@/context/AuthContext";
import { getSavedTerms, markTermLearned } from "@/services/savedTerms";
import type { SlangTerm } from "@/types/slangTerm";
import { safeBack } from "@/utils/navigation";
import { lockLandscape, lockPortrait } from "@/utils/orientation";
import { useLocalSearchParams } from "expo-router";
import { CaretLeft, CaretRight, X } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
} from "react-native-reanimated";

export default function LearnScreen() {
  const { user } = useAuth();
  const { startId } = useLocalSearchParams<{ startId?: string }>();
  const [terms, setTerms] = useState<SlangTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  useEffect(() => {
    lockLandscape();
    return () => {
      lockPortrait();
    };
  }, []);

  useEffect(() => {
    const source = USE_MOCK_DATA
      ? Promise.resolve(MOCK_TERMS)
      : user
        ? getSavedTerms(user.uid)
        : Promise.resolve([]);
    source.then((loaded) => {
      setTerms(loaded);
      if (startId) {
        const index = loaded.findIndex((t) => t.id === startId);
        if (index !== -1) setCurrentIndex(index);
      }
      setIsLoading(false);
    });
  }, [user, startId]);

  function handleSwipe() {
    if (!USE_MOCK_DATA && user && currentTerm) {
      markTermLearned(user.uid, currentTerm.id).catch((error) =>
        console.log("Mark learned error:", error),
      );
    }
    setDirection("forward");
    setCurrentIndex((i) => i + 1);
  }

  // Awaiting the unlock before navigating (rather than relying solely on
  // the effect cleanup below) avoids the visible stutter of the exit
  // transition starting before the device has finished rotating back.
  async function handleExit() {
    await lockPortrait();
    safeBack("/(tabs)/saved");
  }

  const currentTerm = terms[currentIndex];
  const isDone = !isLoading && currentIndex >= terms.length;
  const isEmpty = !isLoading && terms.length === 0;

  return (
    <View style={styles.container}>
      <Pressable onPress={handleExit} style={styles.closeButton} hitSlop={12}>
        <X size={22} weight="bold" color={theme.colors.ink} />
      </Pressable>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : isEmpty ? (
        <Card style={styles.messageCard}>
          <Text variant="heading" style={{ marginBottom: 8 }}>
            Your dictionary is empty
          </Text>
          <Text variant="muted" style={{ marginBottom: 16 }}>
            Swipe right on terms in the Feed to save them here first.
          </Text>
          <Button label="Back to Feed" variant="primary" onPress={handleExit} />
        </Card>
      ) : isDone ? (
        <Card style={styles.messageCard}>
          <Text variant="heading" style={{ marginBottom: 8 }}>
            Nice work!
          </Text>
          <Text variant="muted" style={{ marginBottom: 16 }}>
            You've been through all {terms.length} saved terms.
          </Text>
          <Button label="Done" variant="primary" onPress={handleExit} />
        </Card>
      ) : (
        <>
          <View style={styles.progress}>
            {terms.map((t, i) => (
              <View
                key={t.id}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
            <Text style={styles.progressText}>
              {currentIndex + 1} OF {terms.length}
            </Text>
          </View>
          <Animated.View
            key={currentTerm.id}
            entering={
              direction === "forward"
                ? FadeInRight.duration(250)
                : FadeInLeft.duration(250)
            }
            exiting={
              direction === "forward"
                ? FadeOutLeft.duration(250)
                : FadeOutRight.duration(250)
            }
            style={styles.cardWrap}
          >
            <StudyCard term={currentTerm} onSwipe={handleSwipe} />
          </Animated.View>
          <View style={styles.arrowRow}>
            <Pressable
              onPress={() => {
                setDirection("backward");
                setCurrentIndex((i) => Math.max(0, i - 1));
              }}
              disabled={currentIndex === 0}
              style={[
                styles.arrowButton,
                currentIndex === 0 && styles.arrowDisabled,
              ]}
            >
              <CaretLeft size={26} weight="bold" color={theme.colors.ink} />
            </Pressable>
            <Pressable
              onPress={() => {
                setDirection("forward");
                setCurrentIndex((i) => i + 1);
              }}
              style={styles.arrowButton}
            >
              <CaretRight size={26} weight="bold" color={theme.colors.ink} />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.card,
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(36,28,21,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  progress: {
    position: "absolute",
    top: 24,
    left: 24,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,248,236,0.45)",
  },
  dotActive: {
    width: 20,
    backgroundColor: theme.colors.paper,
  },
  progressText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: theme.colors.paper,
    marginLeft: 6,
  },
  cardWrap: { flex: 1 },
  // Arrows float over the card at mid height.
  arrowRow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    pointerEvents: "box-none",
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(36,28,21,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDisabled: { opacity: 0.35 },
  messageCard: { alignItems: "center", padding: 32, marginHorizontal: 40 },
});
