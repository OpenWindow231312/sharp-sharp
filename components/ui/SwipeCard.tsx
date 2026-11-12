import { theme } from "@/constants/designTheme";
import { showAlert } from "@/utils/alert";
import { useAuth } from "@/context/AuthContext";
import { flagTerm } from "@/services/adminTerms";
import type { FlagReason, SlangTerm } from "@/types/slangTerm";
import * as Haptics from "expo-haptics";
import { X } from "phosphor-react-native";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import {
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
import { Defs, Line, Path, Pattern, Rect } from "react-native-svg";
import { FillSvg } from "./FillSvg";
import { useSvgId } from "@/utils/svgId";
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
export const CARD_HEIGHT = 500;

// The enamel-plaque accent (front border, rivets, front language tag) is
// the same marigold across every colorway. The back face instead borders
// in that colorway's own base hue — see CARD_COLORWAYS.background below,
// reused directly as the back border/term-small color.
const ACCENT = theme.colors.marigold;

type TextureVariant = "hairline" | "ndebele" | "diamond" | "herringbone";

type CardColorway = {
  background: string;
  texture: TextureVariant;
  // Exact per-colorway values lifted from the approved HTML reference's
  // .term text-shadow (two offsets) and .rivet inset box-shadow (two
  // edges) — RN has no multi-shadow or inset-shadow primitive, so these
  // are reproduced via a duplicate offset text layer / per-edge border
  // color respectively (see CardTermText and the rivet style below).
  termShadowLight: string;
  termShadowDark: string;
  rivetLight: string;
  rivetDark: string;
  flipCueColor: string;
};

const CARD_COLORWAYS: CardColorway[] = [
  {
    background: theme.colors.indigo,
    texture: "hairline",
    termShadowLight: "rgba(255,255,255,0.2)",
    termShadowDark: "rgba(0,0,0,0.45)",
    rivetLight: "rgba(255,255,255,0.25)",
    rivetDark: "rgba(0,0,0,0.3)",
    flipCueColor: "rgba(255,248,236,0.55)",
  },
  {
    background: theme.colors.highveld,
    texture: "ndebele",
    termShadowLight: "rgba(255,255,255,0.15)",
    termShadowDark: "rgba(0,60,30,0.4)",
    rivetLight: "rgba(255,255,255,0.25)",
    rivetDark: "rgba(0,0,0,0.3)",
    flipCueColor: "rgba(255,248,236,0.6)",
  },
  {
    background: theme.colors.beadwork,
    texture: "diamond",
    termShadowLight: "rgba(255,255,255,0.18)",
    termShadowDark: "rgba(80,10,40,0.4)",
    rivetLight: "rgba(255,255,255,0.25)",
    rivetDark: "rgba(0,0,0,0.25)",
    flipCueColor: "rgba(255,248,236,0.6)",
  },
  {
    background: theme.colors.charcoal,
    texture: "herringbone",
    termShadowLight: "rgba(255,255,255,0.12)",
    termShadowDark: "rgba(0,0,0,0.55)",
    rivetLight: "rgba(255,255,255,0.2)",
    rivetDark: "rgba(0,0,0,0.4)",
    flipCueColor: "rgba(255,248,236,0.45)",
  },
];

// Stable per term id so a given card doesn't change color as the user
// swipes back and forth or the feed list re-renders.
// The plaque colour a term gets in the Feed, so other screens (the
// dictionary's colour spines) can match it.
export function termColor(id: string): string {
  return colorwayForTerm(id).background;
}

function colorwayForTerm(id: string): CardColorway {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return CARD_COLORWAYS[hash % CARD_COLORWAYS.length];
}

// Exact tile specs and opacities are copied from the approved HTML
// reference's per-colorway CSS pattern definitions.
function CardTexture({ variant }: { variant: TextureVariant }) {
  const id = useSvgId(`swipecard-texture-${variant}`);
  // Explicit 100% size: without it the SVG falls back to its intrinsic
  // 300x150 box and the texture only covers the top-left of the card.
  return (
    <FillSvg>
      <Defs>{renderTextureDef(variant, id)}</Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </FillSvg>
  );
}

function renderTextureDef(variant: TextureVariant, id: string) {
  switch (variant) {
    case "hairline":
      // repeating-linear-gradient(115deg, white 3.5% 0-1px, transparent
      // 1-4px) — one diagonal hairline per 4px tile, rotated via
      // patternTransform to reproduce the 115deg repeat angle.
      return (
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={4}
          height={4}
          patternTransform="rotate(115)"
        >
          <Line
            x1={0}
            y1={0}
            x2={0}
            y2={4}
            stroke="white"
            strokeOpacity={0.035}
            strokeWidth={1}
          />
        </Pattern>
      );
    case "ndebele":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={48} height={24}>
          <Path d="M0 24 L12 0 L24 24 Z" fill="white" fillOpacity={0.07} />
          <Path d="M24 24 L36 0 L48 24 Z" fill="white" fillOpacity={0.07} />
          <Path d="M0 0 L12 24 L24 0 Z" fill="white" fillOpacity={0.045} />
          <Path d="M24 0 L36 24 L48 0 Z" fill="white" fillOpacity={0.045} />
        </Pattern>
      );
    case "diamond":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={30} height={30}>
          <Path
            d="M15 1 L29 15 L15 29 L1 15 Z"
            fill="none"
            stroke="white"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        </Pattern>
      );
    case "herringbone":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={24} height={24}>
          <Path
            d="M0 12 L12 0 L24 12"
            fill="none"
            stroke="white"
            strokeOpacity={0.06}
            strokeWidth={1.5}
          />
          <Path
            d="M0 24 L12 12 L24 24"
            fill="none"
            stroke="white"
            strokeOpacity={0.06}
            strokeWidth={1.5}
          />
        </Pattern>
      );
  }
}

type SwipeCardProps = {
  term: SlangTerm;
  onSwipe?: (direction: "left" | "right") => void;
  // Defaults to true (existing Feed behavior). Set false to render a
  // static preview — e.g. the Add wizard's review step — with swiping
  // and flagging disabled. Tap-to-flip still works either way.
  interactive?: boolean;
};

export type SwipeCardHandle = {
  flip: () => void;
  openReportModal: () => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ term, onSwipe = () => {}, interactive = true }, ref) {
    const { user } = useAuth();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const flip = useSharedValue(0);

    // Some seeded terms carry an example with an empty sentence, which
    // rendered as a pair of bare quotation marks. Only show real ones.
    const examples = (term.examples ?? []).filter((ex) => ex.sentence?.trim());
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
        showAlert("Reported", "Thanks — our team will take a look.");
        // Flagging behaves like a skip for the rest of this session — the
        // term leaves the visible stack rather than sitting there looking
        // untouched.
        onSwipe("left");
      } catch (error) {
        console.log("Flag term error:", error);
        showAlert(
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

    const composedGesture = interactive ? Gesture.Race(pan, tap) : tap;

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
              <Animated.View
                style={[styles.stamp, styles.saveStamp, saveStampStyle]}
              >
                <Text style={styles.stampText}>SAVE</Text>
              </Animated.View>
              <Animated.View
                style={[styles.stamp, styles.skipStamp, skipStampStyle]}
              >
                <Text style={styles.stampText}>SKIP</Text>
              </Animated.View>

              {/* Front face */}
              <Animated.View style={[styles.face, frontFaceStyle]}>
                <View
                  style={[
                    styles.cardShell,
                    styles.frontCardShell,
                    { backgroundColor: colorway.background },
                  ]}
                >
                  <CardTexture variant={colorway.texture} />

                  <View
                    style={[
                      styles.rivet,
                      styles.rivetTL,
                      {
                        borderTopColor: colorway.rivetLight,
                        borderLeftColor: colorway.rivetLight,
                        borderBottomColor: colorway.rivetDark,
                        borderRightColor: colorway.rivetDark,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rivet,
                      styles.rivetTR,
                      {
                        borderTopColor: colorway.rivetLight,
                        borderLeftColor: colorway.rivetLight,
                        borderBottomColor: colorway.rivetDark,
                        borderRightColor: colorway.rivetDark,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rivet,
                      styles.rivetBL,
                      {
                        borderTopColor: colorway.rivetLight,
                        borderLeftColor: colorway.rivetLight,
                        borderBottomColor: colorway.rivetDark,
                        borderRightColor: colorway.rivetDark,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rivet,
                      styles.rivetBR,
                      {
                        borderTopColor: colorway.rivetLight,
                        borderLeftColor: colorway.rivetLight,
                        borderBottomColor: colorway.rivetDark,
                        borderRightColor: colorway.rivetDark,
                      },
                    ]}
                  />

                  <View style={styles.plaqueContent}>
                    <View style={styles.langPill}>
                      <Text style={styles.langPillText}>
                        {term.language.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.termWrap}>
                      <Text
                        style={styles.termText}
                        numberOfLines={3}
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                      >
                        {term.term}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.flipHint,
                        { color: colorway.flipCueColor },
                      ]}
                    >
                      Tap to flip
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Back face */}
              <Animated.View
                style={[styles.face, styles.backFacePosition, backFaceStyle]}
              >
                <View
                  style={[
                    styles.cardShell,
                    styles.backCardShell,
                    { borderColor: colorway.background },
                  ]}
                >
                  <ScrollView
                    contentContainerStyle={styles.backContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.backTermRow}>
                      <View
                        style={[
                          styles.backTermPill,
                          { backgroundColor: colorway.background },
                        ]}
                      >
                        <Text style={styles.backTermPillText}>
                          {term.term.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.backLangSmall}>
                        {term.language.toUpperCase()}
                      </Text>
                    </View>

                    <Text style={styles.backMeaning}>{term.meaning}</Text>

                    {examples.length > 0 ? (
                      <View style={styles.backExamples}>
                        {examples.map((example, index) => (
                          <View
                            key={index}
                            style={
                              index > 0 ? styles.backExampleSpacing : undefined
                            }
                          >
                            <Text style={styles.backExample}>
                              &quot;{example.sentence}&quot;
                            </Text>
                            {example.context ? (
                              <Text style={styles.backContext}>
                                {example.context}
                              </Text>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {term.region ? (
                      <Text style={styles.backContext}>{term.region}</Text>
                    ) : null}
                    <Text style={styles.backContext}>
                      Added by {term.authorDisplayName ?? term.submittedByName}
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
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 3,
    ...theme.shadow.card,
  },
  frontCardShell: {
    borderColor: ACCENT,
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
  },
  rivetTL: { top: 10, left: 10 },
  rivetTR: { top: 10, right: 10 },
  rivetBL: { bottom: 10, left: 10 },
  rivetBR: { bottom: 10, right: 10 },
  plaqueContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  langPill: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.ink,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  langPillText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: theme.colors.paper,
  },
  termWrap: {
    alignItems: "center",
    justifyContent: "center",
    // Long words and phrases wrap inside this width instead of running
    // to the card edge; anything longer still shrinks to fit.
    maxWidth: "86%",
    alignSelf: "center",
  },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 60,
    lineHeight: 64,
    textAlign: "center",
    color: theme.colors.paper,
  },
  flipHint: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    textAlign: "center",
  },
  backTermRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  backTermPill: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexShrink: 1,
  },
  backTermPillText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: theme.colors.paper,
  },
  backLangSmall: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: theme.colors.textMuted,
  },
  backContent: {
    paddingVertical: 26,
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  // The meaning is the headline of the back; the word becomes a tag.
  backMeaning: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 30,
    lineHeight: 36,
    color: theme.colors.text,
    marginBottom: 20,
  },
  backExamples: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 18,
    marginBottom: 18,
  },
  backExampleSpacing: {
    marginTop: theme.spacing.md,
  },
  backExample: {
    fontFamily: theme.fonts.body,
    fontStyle: "italic",
    fontSize: 18,
    lineHeight: 25,
    color: theme.colors.text,
    marginBottom: 4,
  },
  backContext: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
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
