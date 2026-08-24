import { BadgeMedallion } from "@/components/ui/BadgeMedallion";
import { Button } from "@/components/ui/Button";
import { PatternFill } from "@/components/ui/PatternFill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { theme } from "@/constants/designTheme";
import { useRouter } from "expo-router";
import {
  ArrowBendDownLeft,
  Check,
  Flag as FlagIcon,
  X as XIcon,
} from "phosphor-react-native";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";

type BeatBase = { autoAdvanceMs?: number };
type DialogueBeat = BeatBase & { kind: "dialogue"; lines: [string, string] };
type HeroBeat = BeatBase & {
  kind: "hero";
  accentLine: string;
  headlineLine: string;
  body: string;
};
type MechanicsBeat = BeatBase & { kind: "mechanics"; text: string };
type ClosingBeat = BeatBase & {
  kind: "closing";
  headline: string;
  caption: string;
};
type Beat = DialogueBeat | HeroBeat | MechanicsBeat | ClosingBeat;

const BEATS: Beat[] = [
  {
    kind: "dialogue",
    autoAdvanceMs: 4200,
    lines: [
      "Howzit! You coming to the braai on Saturday?",
      "...I'm sorry, the what now?",
    ],
  },
  {
    kind: "dialogue",
    autoAdvanceMs: 4200,
    lines: [
      "Eish, don't stress. Ag shame, you'll catch on.",
      "Okay, that made it worse.",
    ],
  },
  {
    kind: "hero",
    autoAdvanceMs: 5500,
    accentLine: "Sharp sharp.",
    headlineLine: "We've got you.",
    body: "It's your turn to actually understand what being a real South African actually sounds like.",
  },
  {
    kind: "mechanics",
    autoAdvanceMs: 6200,
    text: "Swipe right to save a word. Swipe left to skip it. Tap to flip and see what it means.",
  },
  {
    // No autoAdvanceMs — this beat is manual only, it ends on "Let's go".
    kind: "closing",
    headline: "Keep it real, not rude.",
    caption: "See something off? Tap the flag. We'll take a look.",
  },
];

const PAUSE_MS = 550;

export default function OnboardingStoryScreen() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const isLast = stepIndex === BEATS.length - 1;
  const beat = BEATS[stepIndex];

  function goToLanguages() {
    router.replace("/onboarding");
  }

  function advance() {
    if (isLast) {
      goToLanguages();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  // Beats 1-4 auto-advance once their content has had time to play out, so
  // nobody has to realize on their own that they should tap. The screen
  // stays tappable throughout as a manual "skip ahead" option — tapping
  // early just re-triggers this effect for the new beat and clears the old
  // timer via the cleanup below. Beat 5 never sets autoAdvanceMs, so it
  // only ever advances via the "Let's go" button or a manual tap/Skip.
  useEffect(() => {
    const ms = beat.autoAdvanceMs;
    if (ms == null) return;
    const timeout = setTimeout(advance, ms);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  return (
    <Pressable style={styles.container} onPress={advance}>
      <ProgressBar progress={(stepIndex + 1) / BEATS.length} />

      <Pressable
        onPress={goToLanguages}
        hitSlop={12}
        style={styles.skipButton}
      >
        <Text variant="muted" style={styles.skipText}>
          Skip
        </Text>
      </Pressable>

      <View style={styles.content}>
        {beat.kind === "dialogue" ? (
          <DialogueBeatView key={stepIndex} lines={beat.lines} />
        ) : beat.kind === "hero" ? (
          <HeroBeatView
            key={stepIndex}
            accentLine={beat.accentLine}
            headlineLine={beat.headlineLine}
            body={beat.body}
          />
        ) : beat.kind === "mechanics" ? (
          <MechanicsBeatView key={stepIndex} text={beat.text} />
        ) : (
          <ClosingBeatView
            key={stepIndex}
            headline={beat.headline}
            caption={beat.caption}
            onFinish={goToLanguages}
          />
        )}
      </View>
    </Pressable>
  );
}

function DialogueBeatView({ lines }: { lines: [string, string] }) {
  const [showReply, setShowReply] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <View style={styles.dialogueWrap}>
      <Bubble align="left">
        <TypewriterText
          text={lines[0]}
          style={styles.bubbleTextReceived}
          onDone={() => {
            timeoutRef.current = setTimeout(() => setShowReply(true), PAUSE_MS);
          }}
        />
      </Bubble>
      {showReply ? (
        <Animated.View entering={FadeIn.duration(200)}>
          <Bubble align="right" tone="reply">
            <TypewriterText text={lines[1]} style={styles.bubbleTextReply} />
          </Bubble>
        </Animated.View>
      ) : null}
    </View>
  );
}

function Bubble({
  align,
  tone = "received",
  children,
}: {
  align: "left" | "right";
  tone?: "received" | "reply";
  children: ReactNode;
}) {
  return (
    <View
      style={[
        styles.bubbleRow,
        align === "right" ? { justifyContent: "flex-end" } : null,
      ]}
    >
      <View
        style={[
          styles.bubble,
          tone === "reply" ? styles.bubbleReply : styles.bubbleReceived,
          align === "left" ? styles.bubbleTailLeft : styles.bubbleTailRight,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function HeroBeatView({
  accentLine,
  headlineLine,
  body,
}: {
  accentLine: string;
  headlineLine: string;
  body: string;
}) {
  const [showHeadlineLine, setShowHeadlineLine] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <View style={styles.heroWrap}>
      <BadgeMedallion
        variant="chevron"
        shape="circle"
        unlocked
        size={200}
        style={styles.heroMedallion}
      />
      <View>
        <TypewriterText
          text={accentLine}
          style={styles.heroAccentLine}
          charDelayMs={38}
          onDone={() => {
            timeoutRef.current = setTimeout(
              () => setShowHeadlineLine(true),
              PAUSE_MS,
            );
          }}
        />
        {showHeadlineLine ? (
          <TypewriterText
            text={headlineLine}
            style={styles.heroHeadlineLine}
            charDelayMs={38}
            onDone={() => setShowBody(true)}
          />
        ) : null}
      </View>
      {showBody ? (
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={styles.heroBody}>{body}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

function MechanicsBeatView({ text }: { text: string }) {
  return (
    <View style={styles.mechanicsWrap}>
      <TypewriterText text={text} style={styles.mechanicsText} />
      <View style={styles.mechanicsDemoWrap}>
        <DemoGestureCard />
      </View>
    </View>
  );
}

function ClosingBeatView({
  headline,
  caption,
  onFinish,
}: {
  headline: string;
  caption: string;
  onFinish: () => void;
}) {
  return (
    <View style={styles.closingWrap}>
      <Animated.Text
        entering={ZoomIn.duration(350)}
        style={styles.closingHeadline}
      >
        {headline}
      </Animated.Text>

      <Animated.View entering={ZoomIn.delay(180).duration(350)}>
        <MiniFlagCard />
      </Animated.View>

      <Animated.Text
        entering={FadeIn.delay(380).duration(300)}
        style={styles.closingCaption}
      >
        {caption}
      </Animated.Text>

      <Animated.View
        entering={FadeIn.delay(520).duration(300)}
        style={styles.closingButtonWrap}
      >
        <Button label="Let's go" variant="primary" onPress={onFinish} />
      </Animated.View>
    </View>
  );
}

const MINI_PATTERN_HEIGHT = 28;

function MiniFlagCard() {
  const nudge = useSharedValue(0);

  useEffect(() => {
    nudge.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 450, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(nudge.value, [0, 1], [0, -5]) },
      { translateY: interpolate(nudge.value, [0, 1], [0, 5]) },
    ],
  }));

  return (
    <View style={styles.miniCardWrap}>
      <View style={styles.miniCard}>
        <PatternFill
          variant="triangle"
          style={styles.miniCardPattern}
          opacity={0.5}
        />
        <View style={styles.miniCardTermZone}>
          <Text style={styles.miniCardTerm}>Eish</Text>
        </View>
        <View style={styles.miniFlagIconWrap}>
          <FlagIcon size={13} weight="bold" color="#FFFFFF" />
        </View>
      </View>
      <Animated.View style={[styles.miniArrowWrap, arrowStyle]}>
        <ArrowBendDownLeft size={26} weight="bold" color={theme.colors.marigold} />
      </Animated.View>
    </View>
  );
}

const DEMO_SWIPE_DISTANCE = 34;
const GESTURE_SLIDE_MS = 450;
const GESTURE_HOLD_MS = 400;
const GESTURE_RESET_MS = 350;
const GESTURE_GAP_MS = 150;
const GESTURE_CYCLE_MS =
  GESTURE_SLIDE_MS +
  GESTURE_HOLD_MS +
  GESTURE_RESET_MS +
  GESTURE_GAP_MS +
  GESTURE_SLIDE_MS +
  GESTURE_HOLD_MS +
  GESTURE_RESET_MS +
  GESTURE_GAP_MS;

type GestureIcon = "none" | "check" | "x";

// Demonstrates both swipe gestures in sequence rather than a single vague
// slide-and-reset: right with a save checkmark, then left with a skip X,
// looping a couple of times before the beat auto-advances.
function DemoGestureCard() {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const [icon, setIcon] = useState<GestureIcon>("none");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    function after(delay: number, fn: () => void) {
      timeoutsRef.current.push(setTimeout(fn, delay));
    }

    function runCycle(start: number) {
      // Slide right, checkmark stamps in.
      after(start, () => {
        setIcon("check");
        translateX.value = withTiming(DEMO_SWIPE_DISTANCE, {
          duration: GESTURE_SLIDE_MS,
          easing: Easing.out(Easing.quad),
        });
        rotate.value = withTiming(6, { duration: GESTURE_SLIDE_MS });
        iconScale.value = withTiming(1, {
          duration: 260,
          easing: Easing.out(Easing.back(1.6)),
        });
        iconOpacity.value = withTiming(1, { duration: 220 });
      });

      // Hold, then reset to center.
      after(start + GESTURE_SLIDE_MS + GESTURE_HOLD_MS, () => {
        iconOpacity.value = withTiming(0, { duration: 180 });
        iconScale.value = withTiming(0.6, { duration: 180 });
        translateX.value = withTiming(0, {
          duration: GESTURE_RESET_MS,
          easing: Easing.inOut(Easing.quad),
        });
        rotate.value = withTiming(0, { duration: GESTURE_RESET_MS });
      });

      const leftStart =
        start + GESTURE_SLIDE_MS + GESTURE_HOLD_MS + GESTURE_RESET_MS + GESTURE_GAP_MS;

      // Slide left, skip X stamps in.
      after(leftStart, () => {
        setIcon("x");
        translateX.value = withTiming(-DEMO_SWIPE_DISTANCE, {
          duration: GESTURE_SLIDE_MS,
          easing: Easing.out(Easing.quad),
        });
        rotate.value = withTiming(-6, { duration: GESTURE_SLIDE_MS });
        iconScale.value = withTiming(1, {
          duration: 260,
          easing: Easing.out(Easing.back(1.6)),
        });
        iconOpacity.value = withTiming(1, { duration: 220 });
      });

      // Hold, then reset to center.
      after(leftStart + GESTURE_SLIDE_MS + GESTURE_HOLD_MS, () => {
        iconOpacity.value = withTiming(0, { duration: 180 });
        iconScale.value = withTiming(0.6, { duration: 180 });
        translateX.value = withTiming(0, {
          duration: GESTURE_RESET_MS,
          easing: Easing.inOut(Easing.quad),
        });
        rotate.value = withTiming(0, { duration: GESTURE_RESET_MS });
      });

      after(
        leftStart + GESTURE_SLIDE_MS + GESTURE_HOLD_MS + GESTURE_RESET_MS,
        () => setIcon("none"),
      );
    }

    runCycle(500);
    runCycle(500 + GESTURE_CYCLE_MS);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <View style={styles.demoCardWrap} pointerEvents="none">
      <Animated.View style={[styles.demoCard, cardStyle]}>
        <PatternFill
          variant="triangle"
          style={styles.demoCardPattern}
          opacity={0.5}
        />
        <View style={styles.demoCardTermZone}>
          <Text style={styles.demoCardTerm}>Howzit</Text>
        </View>
        {icon !== "none" ? (
          <Animated.View style={[styles.demoCardIconWrap, iconStyle]}>
            {icon === "check" ? (
              <Check size={44} weight="fill" color={theme.colors.highveld} />
            ) : (
              <XIcon size={44} weight="fill" color={theme.colors.protea} />
            )}
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingTop: 60,
    backgroundColor: theme.colors.background,
  },
  skipButton: {
    position: "absolute",
    top: 56,
    right: theme.spacing.md,
    minWidth: theme.tapTarget,
    minHeight: theme.tapTarget,
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 10,
  },
  skipText: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  dialogueWrap: {
    gap: theme.spacing.sm,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubble: {
    maxWidth: "84%",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  bubbleReceived: {
    backgroundColor: theme.colors.surface,
  },
  bubbleReply: {
    backgroundColor: theme.colors.indigo,
  },
  bubbleTailLeft: {
    borderBottomLeftRadius: theme.radius.sm / 2,
  },
  bubbleTailRight: {
    borderBottomRightRadius: theme.radius.sm / 2,
  },
  bubbleTextReceived: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.text,
  },
  bubbleTextReply: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 17,
    lineHeight: 24,
    color: "#FFFFFF",
  },
  heroWrap: {
    gap: theme.spacing.md,
  },
  heroMedallion: {
    position: "absolute",
    top: -34,
    right: -16,
    opacity: 0.14,
  },
  heroAccentLine: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 40,
    lineHeight: 46,
    color: theme.colors.marigold,
  },
  heroHeadlineLine: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 40,
    lineHeight: 46,
    color: theme.colors.indigo,
  },
  heroBody: {
    fontFamily: theme.fonts.body,
    fontSize: 17,
    lineHeight: 25,
    color: theme.colors.text,
  },
  mechanicsWrap: {
    flex: 1,
    paddingTop: theme.spacing.sm,
  },
  mechanicsText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.text,
  },
  mechanicsDemoWrap: {
    flex: 1,
    justifyContent: "center",
  },
  closingWrap: {
    alignItems: "center",
    gap: theme.spacing.md,
  },
  closingHeadline: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 32,
    lineHeight: 38,
    color: theme.colors.text,
    textAlign: "center",
  },
  closingCaption: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.textMuted,
    textAlign: "center",
    paddingHorizontal: theme.spacing.md,
  },
  closingButtonWrap: {
    alignSelf: "stretch",
    marginTop: theme.spacing.sm,
  },
  miniCardWrap: {
    alignSelf: "center",
    marginVertical: theme.spacing.xs,
  },
  miniCard: {
    width: 170,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    ...theme.shadow.soft,
  },
  miniCardPattern: {
    height: MINI_PATTERN_HEIGHT,
  },
  miniCardTermZone: {
    height: 78,
    backgroundColor: theme.colors.indigo,
    alignItems: "center",
    justifyContent: "center",
  },
  miniCardTerm: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 20,
    color: "#FFFFFF",
  },
  miniFlagIconWrap: {
    position: "absolute",
    top: MINI_PATTERN_HEIGHT + theme.spacing.xs,
    right: theme.spacing.xs,
  },
  miniArrowWrap: {
    position: "absolute",
    top: -8,
    right: -28,
  },
  demoCardWrap: {
    alignItems: "center",
  },
  demoCard: {
    width: 200,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    ...theme.shadow.card,
  },
  demoCardPattern: {
    height: 34,
  },
  demoCardTermZone: {
    height: 108,
    backgroundColor: theme.colors.indigo,
    alignItems: "center",
    justifyContent: "center",
  },
  demoCardTerm: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 26,
    color: "#FFFFFF",
  },
  demoCardIconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(36,28,21,0.15)",
  },
});
