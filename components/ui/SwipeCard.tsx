import { theme } from "@/constants/designTheme";
import { useAuth } from "@/context/AuthContext";
import { flagTerm } from "@/services/adminTerms";
import type { FlagReason, SlangTerm } from "@/types/slangTerm";
import * as Haptics from "expo-haptics";
import { BookOpen, Flag as FlagIcon, Quotes } from "phosphor-react-native";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { PatternFill, type PatternVariant } from "./PatternFill";
import { Text } from "./Text";

const FLAG_REASONS: { reason: FlagReason; label: string }[] = [
  { reason: "offensive", label: "Offensive" },
  { reason: "inaccurate", label: "Inaccurate" },
  { reason: "spam", label: "Spam" },
  { reason: "other", label: "Other" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const CARD_HEIGHT = 400;

const PATTERN_VARIANTS: PatternVariant[] = [
  "chevron",
  "diamond",
  "triangle",
  "beadscatter",
];

function patternForTerm(term: string): PatternVariant {
  let hash = 0;
  for (let i = 0; i < term.length; i++) {
    hash = (hash * 31 + term.charCodeAt(i)) >>> 0;
  }
  return PATTERN_VARIANTS[hash % PATTERN_VARIANTS.length];
}

type SwipeCardProps = {
  term: SlangTerm;
  onSwipe: (direction: "left" | "right") => void;
};

export type SwipeCardHandle = {
  flip: () => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ term, onSwipe }, ref) {
    const { user } = useAuth();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const flip = useSharedValue(0);

    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [isFlagging, setIsFlagging] = useState(false);
    const [justFlagged, setJustFlagged] = useState(false);

    async function submitFlag(reason: FlagReason) {
      if (!user || isFlagging) return;
      setIsFlagging(true);
      try {
        await flagTerm(term.id, term.term, user.uid, reason);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setReportModalVisible(false);
        setJustFlagged(true);
        setTimeout(() => setJustFlagged(false), 1500);
      } catch (error) {
        console.log("Flag term error:", error);
      } finally {
        setIsFlagging(false);
      }
    }

    function toggleFlip() {
      flip.value = withTiming(flip.value === 0 ? 180 : 0, { duration: 450 });
    }

    useImperativeHandle(ref, () => ({
      flip: toggleFlip,
    }));

    const pan = Gesture.Pan()
      .onUpdate((e) => {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      })
      .onEnd((e) => {
        const passedThreshold = Math.abs(e.translationX) > SWIPE_THRESHOLD;
        if (passedThreshold) {
          const direction = e.translationX > 0 ? "right" : "left";
          translateX.value = withTiming(
            direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
            { duration: 220 },
            () => runOnJS(onSwipe)(direction),
          );
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      });

    const tap = Gesture.Tap()
      .maxDuration(250)
      .onEnd(() => {
        runOnJS(toggleFlip)();
      });

    const composedGesture = Gesture.Race(pan, tap);

    const dragStyle = useAnimatedStyle(() => {
      const rotate = interpolate(
        translateX.value,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-12, 0, 12],
        Extrapolation.CLAMP,
      );
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${rotate}deg` },
        ],
      };
    });

    const frontFaceStyle = useAnimatedStyle(() => ({
      transform: [{ perspective: 1200 }, { rotateY: `${flip.value}deg` }],
    }));

    const backFaceStyle = useAnimatedStyle(() => ({
      transform: [{ perspective: 1200 }, { rotateY: `${flip.value - 180}deg` }],
    }));

    const saveStampStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateX.value,
        [10, SWIPE_THRESHOLD],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    }));

    const skipStampStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateX.value,
        [-SWIPE_THRESHOLD, -10],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    }));

    const patternVariant = patternForTerm(term.term);

    return (
      <>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.wrapper, dragStyle]}>
          <Animated.View style={[styles.stamp, styles.saveStamp, saveStampStyle]}>
            <Text style={styles.stampText}>SAVE</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.skipStamp, skipStampStyle]}>
            <Text style={styles.stampText}>SKIP</Text>
          </Animated.View>

          {/* Front face */}
          <Animated.View style={[styles.face, frontFaceStyle]}>
            <View style={styles.cardShell}>
              <PatternFill variant={patternVariant} style={styles.patternZone} />
              <View style={styles.termZone}>
                <View style={styles.langPillWrap}>
                  <Chip label={term.language} selected />
                </View>
                <Pressable
                  onPress={() => setReportModalVisible(true)}
                  hitSlop={10}
                  style={styles.flagButton}
                >
                  <FlagIcon size={18} weight="bold" color="#FFFFFF" />
                </Pressable>
                {justFlagged ? (
                  <View style={styles.flaggedBadge}>
                    <Text style={styles.flaggedBadgeText}>Reported</Text>
                  </View>
                ) : null}
                <Text style={styles.termText}>{term.term}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Back face */}
          <Animated.View
            style={[styles.face, styles.backFacePosition, backFaceStyle]}
          >
            <View style={styles.cardShell}>
              <ScrollView
                contentContainerStyle={styles.backContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.subheadingRow}>
                  <BookOpen size={13} weight="bold" color={theme.colors.inkSoft} />
                  <Text variant="muted" style={styles.subheadingText}>
                    Definition
                  </Text>
                </View>
                <Text style={styles.meaningText}>{term.meaning}</Text>

                {term.examples && term.examples.length > 0 ? (
                  <>
                    <View style={styles.subheadingRow}>
                      <Quotes size={13} weight="bold" color={theme.colors.inkSoft} />
                      <Text variant="muted" style={styles.subheadingText}>
                        In a sentence
                      </Text>
                    </View>
                    {term.examples.map((example, index) => (
                      <View
                        key={index}
                        style={[
                          styles.exampleBlock,
                          index > 0 && styles.exampleBlockSpacing,
                        ]}
                      >
                        <Text style={styles.exampleText}>
                          "{example.sentence}"
                        </Text>
                        {example.context ? (
                          <Text variant="muted" style={styles.exampleContextText}>
                            {example.context}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </>
                ) : null}

                {term.region ? (
                  <Text variant="muted" style={styles.regionText}>
                    {term.region}
                  </Text>
                ) : null}
                <Text variant="muted" style={styles.addedBy}>
                  Added by {term.submittedByName}
                </Text>
              </ScrollView>
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.reportCard}>
            <Text variant="heading" style={styles.reportTitle}>
              Report this term
            </Text>
            <Text variant="muted" style={styles.reportSubtitle}>
              Why are you flagging &quot;{term.term}&quot;?
            </Text>
            {FLAG_REASONS.map(({ reason, label }) => (
              <Button
                key={reason}
                label={label}
                variant="secondary"
                disabled={isFlagging}
                onPress={() => submitFlag(reason)}
                style={{ marginTop: theme.spacing.sm }}
              />
            ))}
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => setReportModalVisible(false)}
              style={{ marginTop: theme.spacing.md, opacity: 0.7 }}
            />
          </View>
        </View>
      </Modal>
      </>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    minHeight: CARD_HEIGHT,
  },
  face: {
    backfaceVisibility: "hidden",
    width: "100%",
  },
  backFacePosition: {
    position: "absolute",
    top: 0,
  },
  cardShell: {
    height: CARD_HEIGHT,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    ...theme.shadow.card,
  },
  patternZone: {
    height: 130,
  },
  termZone: {
    flex: 1,
    backgroundColor: theme.colors.indigo,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  langPillWrap: {
    position: "absolute",
    top: theme.spacing.md,
    left: theme.spacing.md,
    zIndex: 2,
  },
  flagButton: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 2,
    padding: 6,
  },
  flaggedBadge: {
    position: "absolute",
    top: theme.spacing.md + 32,
    right: theme.spacing.md,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: theme.radius.sm,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  flaggedBadgeText: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 11,
    color: "#FFFFFF",
  },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 34,
    color: "#FFFFFF",
    textAlign: "center",
  },
  backContent: {
    padding: theme.spacing.lg,
    flexGrow: 1,
  },
  subheadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    marginTop: theme.spacing.sm,
  },
  subheadingText: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  meaningText: {
    fontFamily: theme.fonts.body,
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.text,
  },
  exampleBlock: {},
  exampleBlockSpacing: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  exampleText: {
    fontFamily: theme.fonts.body,
    fontStyle: "italic",
    fontSize: 15,
    color: theme.colors.text,
  },
  exampleContextText: {
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 2,
  },
  regionText: {
    marginTop: theme.spacing.md,
  },
  addedBy: {
    marginTop: theme.spacing.md,
  },
  stamp: {
    position: "absolute",
    top: 20,
    borderWidth: 3,
    borderRadius: theme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  saveStamp: {
    right: 20,
    borderColor: theme.colors.highveld,
    transform: [{ rotate: "12deg" }],
  },
  skipStamp: {
    left: 20,
    borderColor: theme.colors.protea,
    transform: [{ rotate: "-12deg" }],
  },
  stampText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 18,
    letterSpacing: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(36,28,21,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  reportCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  reportTitle: {
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  reportSubtitle: {
    textAlign: "center",
  },
});
