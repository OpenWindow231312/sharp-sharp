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
import { useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
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
  const [direction, setDirection] = useState<"forward" | "backward">(
    "forward",
  );

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
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
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
    safeBack("/(tabs)");
  }

  const currentTerm = terms[currentIndex];
  const isDone = !isLoading && currentIndex >= terms.length;
  const isEmpty = !isLoading && terms.length === 0;

  return (
    <View style={styles.container}>
      <Pressable onPress={handleExit} style={styles.closeButton} hitSlop={12}>
        <X size={28} color={theme.colors.ink} />
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
          <Button
            label="Back to Feed"
            variant="primary"
            onPress={handleExit}
          />
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
          <Text variant="muted" style={styles.progress}>
            {currentIndex + 1} of {terms.length}
          </Text>
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
              <CaretLeft size={32} color={theme.colors.ink} />
            </Pressable>
            <Pressable
              onPress={() => {
                setDirection("forward");
                setCurrentIndex((i) => i + 1);
              }}
              style={styles.arrowButton}
            >
              <CaretRight size={32} color={theme.colors.ink} />
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
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: theme.tapTarget,
    height: theme.tapTarget,
    borderRadius: theme.tapTarget / 2,
    backgroundColor: "rgba(36,28,21,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  progress: { position: "absolute", top: 16, alignSelf: "center" },
  cardWrap: { flex: 1 },
  arrowRow: {
    position: "absolute",
    bottom: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  arrowButton: {
    width: theme.tapTarget + 8,
    height: theme.tapTarget + 8,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDisabled: { opacity: 0.3 },
  messageCard: { alignItems: "center", padding: 32, marginHorizontal: 40 },
});
