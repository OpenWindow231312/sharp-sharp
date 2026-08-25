import { theme } from "@/constants/designTheme";
import { useAuth } from "@/context/AuthContext";
import { flagTerm } from "@/services/adminTerms";
import type { FlagReason, SlangTerm } from "@/types/slangTerm";
import * as Haptics from "expo-haptics";
import { BookOpen, Quotes, X } from "phosphor-react-native";
import { forwardRef, useId, useImperativeHandle, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
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
import Svg, { Defs, Line, Path, Pattern, Rect } from "react-native-svg";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { Input } from "./Input";
import { Text } from "./Text";

const FLAG_REASONS: { reason: FlagReason; label: string }[] = [
  { reason: "offensive", label: "Offensive" },
  { reason: "inaccurate", label: "Inaccurate" },
  { reason: "spam", label: "Spam" },
  { reason: "other", label: "Other" },
];

const FLAG_REASON_LABELS = FLAG_REASONS.map((r) => r.label);

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const CARD_HEIGHT = 400;

// The enamel-plaque accent (border, rivets, front language tag, back
// border) is the same marigold across every colorway — only the plaque
// background and its texture rotate.
const ACCENT = theme.colors.marigold;
const TEXTURE_COLOR = theme.colors.paper;
const TEXTURE_OPACITY = 0.07;

type TextureVariant = "hairline" | "triangleBand" | "diamondGrid" | "herringbone";

type CardColorway = {
  background: string;
  texture: TextureVariant;
};

const CARD_COLORWAYS: CardColorway[] = [
  { background: theme.colors.indigo, texture: "hairline" },
  { background: theme.colors.highveld, texture: "triangleBand" },
  { background: theme.colors.beadwork, texture: "diamondGrid" },
  { background: theme.colors.charcoal, texture: "herringbone" },
];

// Stable per term id so a given card doesn't change color as the user
// swipes back and forth or the feed list re-renders.
function colorwayForTerm(id: string): CardColorway {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return CARD_COLORWAYS[hash % CARD_COLORWAYS.length];
}

function CardTexture({ variant }: { variant: TextureVariant }) {
  const id = `swipecard-texture-${variant}-${useId()}`;
  return (
    <Svg
      width="100%"
      height="100%"
      style={[StyleSheet.absoluteFill, { opacity: TEXTURE_OPACITY }]}
    >
      <Defs>{renderTextureDef(variant, id)}</Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

function renderTextureDef(variant: TextureVariant, id: string) {
  switch (variant) {
    case "hairline":
      // Fine diagonal repeating lines, brushed-metal style.
      return (
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={6}
          height={6}
          patternTransform="rotate(45)"
        >
          <Line x1={3} y1={0} x2={3} y2={6} stroke={TEXTURE_COLOR} strokeWidth={0.6} />
        </Pattern>
      );
    case "triangleBand":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={18} height={18}>
          <Path
            d="M0 18 L9 2 L18 18 Z"
            stroke={TEXTURE_COLOR}
            strokeWidth={0.75}
            fill="none"
          />
        </Pattern>
      );
    case "diamondGrid":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={14} height={14}>
          <Path
            d="M7 0 L14 7 L7 14 L0 7 Z"
            stroke={TEXTURE_COLOR}
            strokeWidth={0.75}
            fill="none"
          />
        </Pattern>
      );
    case "herringbone":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={16} height={8}>
          <Path
            d="M0 8 L4 0 L8 8"
            stroke={TEXTURE_COLOR}
            strokeWidth={0.6}
            fill="none"
          />
          <Path
            d="M8 8 L12 0 L16 8"
            stroke={TEXTURE_COLOR}
            strokeWidth={0.6}
            fill="none"
          />
        </Pattern>
      );
  }
}

type SwipeCardProps = {
  term: SlangTerm;
  onSwipe: (direction: "left" | "right") => void;
};

export type SwipeCardHandle = {
  flip: () => void;
  openReportModal: () => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ term, onSwipe }, ref) {
    const { user } = useAuth();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const flip = useSharedValue(0);

    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportReasonLabel, setReportReasonLabel] = useState<string | null>(
      null,
    );
    const [reportComment, setReportComment] = useState("");
    const [isFlagging, setIsFlagging] = useState(false);

    function closeReportModal() {
      setReportModalVisible(false);
      setReportReasonLabel(null);
      setReportComment("");
    }

    async function submitFlag() {
      const reasonEntry = FLAG_REASONS.find(
        (r) => r.label === reportReasonLabel,
      );
      if (!user || !reasonEntry || isFlagging) return;
      setIsFlagging(true);
      try {
        await flagTerm(
          term.id,
          term.term,
          user.uid,
          reasonEntry.reason,
          reportComment,
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        closeReportModal();
        Alert.alert("Reported", "Thanks — our team will take a look.");
        // Flagging behaves like a skip for the rest of this session — the
        // term leaves the visible stack rather than sitting there looking
        // untouched.
        onSwipe("left");
      } catch (error) {
        console.log("Flag term error:", error);
        Alert.alert(
          "Couldn't report this term",
          "Check your connection and try again.",
        );
      } finally {
        setIsFlagging(false);
      }
    }

    function toggleFlip() {
      flip.value = withTiming(flip.value === 0 ? 180 : 0, { duration: 450 });
    }

    useImperativeHandle(ref, () => ({
      flip: toggleFlip,
      openReportModal: () => setReportModalVisible(true),
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

    const colorway = useMemo(() => colorwayForTerm(term.id), [term.id]);

    return (
      <>
      <View style={styles.cardPositioner}>
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
            <View style={[styles.cardShell, { backgroundColor: colorway.background }]}>
              <CardTexture variant={colorway.texture} />

              <View style={[styles.rivet, styles.rivetTL]} />
              <View style={[styles.rivet, styles.rivetTR]} />
              <View style={[styles.rivet, styles.rivetBL]} />
              <View style={[styles.rivet, styles.rivetBR]} />

              <View style={styles.plaqueContent}>
                <Text style={styles.langTag}>{term.language.toUpperCase()}</Text>

                <View style={styles.termCenterZone}>
                  <Text style={[styles.termText, styles.termTextHighlight]}>
                    {term.term}
                  </Text>
                  <Text style={[styles.termText, styles.termTextMain]}>
                    {term.term}
                  </Text>
                </View>

                <Text style={styles.flipHint}>Tap to flip</Text>
              </View>
            </View>
          </Animated.View>

          {/* Back face */}
          <Animated.View
            style={[styles.face, styles.backFacePosition, backFaceStyle]}
          >
            <View style={[styles.cardShell, styles.backCardShell]}>
              <ScrollView
                contentContainerStyle={styles.backContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.backHeaderRow}>
                  <Text style={styles.backTermName}>{term.term}</Text>
                  <Text style={styles.backLangTag}>
                    {term.language.toUpperCase()}
                  </Text>
                </View>

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
      </View>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReportModal}
      >
        <View style={styles.backdrop}>
          <View style={styles.reportCard}>
            <Pressable
              onPress={closeReportModal}
              hitSlop={12}
              style={styles.reportCloseButton}
            >
              <X size={20} weight="bold" color={theme.colors.textMuted} />
            </Pressable>

            <Text variant="heading" style={styles.reportTitle}>
              Report this term
            </Text>
            <Text variant="muted" style={styles.reportSubtitle}>
              Why are you flagging &quot;{term.term}&quot;?
            </Text>

            <Dropdown
              label="Reason"
              value={reportReasonLabel}
              options={FLAG_REASON_LABELS}
              onChange={setReportReasonLabel}
              placeholder="Select a reason"
            />

            <Input
              label="Anything else? (optional)"
              value={reportComment}
              onChangeText={setReportComment}
              multiline
              numberOfLines={3}
              style={styles.reportCommentInput}
            />

            <Button
              label="Submit"
              variant="primary"
              disabled={!reportReasonLabel || isFlagging}
              onPress={submitFlag}
              style={{ marginTop: theme.spacing.xs }}
            />
          </View>
        </View>
      </Modal>
      </>
    );
  },
);

const styles = StyleSheet.create({
  // Establishes the card's actual position on screen.
  cardPositioner: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    minHeight: CARD_HEIGHT,
  },
  wrapper: {
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
    borderWidth: 3,
    borderColor: ACCENT,
    ...theme.shadow.card,
  },
  backCardShell: {
    backgroundColor: theme.colors.card,
  },
  rivet: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: ACCENT,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.55)",
    borderLeftColor: "rgba(255,255,255,0.55)",
    borderBottomColor: "rgba(0,0,0,0.3)",
    borderRightColor: "rgba(0,0,0,0.3)",
  },
  rivetTL: { top: 10, left: 10 },
  rivetTR: { top: 10, right: 10 },
  rivetBL: { bottom: 10, left: 10 },
  rivetBR: { bottom: 10, right: 10 },
  plaqueContent: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  langTag: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: ACCENT,
  },
  termCenterZone: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 34,
    textAlign: "center",
  },
  termTextHighlight: {
    position: "absolute",
    color: "rgba(255,255,255,0.35)",
    transform: [{ translateX: -1 }, { translateY: -1 }],
  },
  termTextMain: {
    color: theme.colors.paper,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  flipHint: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: theme.colors.paper,
    opacity: 0.45,
  },
  backHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  backTermName: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 20,
    color: theme.colors.text,
    flexShrink: 1,
  },
  backLangTag: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: ACCENT,
    marginLeft: theme.spacing.sm,
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
  reportCloseButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: theme.tapTarget,
    height: theme.tapTarget,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  reportTitle: {
    textAlign: "center",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  reportSubtitle: {
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  reportCommentInput: {
    minHeight: 72,
  },
});
