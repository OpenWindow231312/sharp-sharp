import { Button } from "@/components/ui/Button";
import { PatternFill } from "@/components/ui/PatternFill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { theme } from "@/constants/designTheme";
import { useRouter } from "expo-router";
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
} from "react-native-reanimated";

type DialogueBeat = { kind: "dialogue"; lines: [string, string] };
type HeroBeat = { kind: "hero"; headline: string; body: string };
type MechanicsBeat = { kind: "mechanics"; text: string };
type ClosingBeat = { kind: "closing"; text: string };
type Beat = DialogueBeat | HeroBeat | MechanicsBeat | ClosingBeat;

const BEATS: Beat[] = [
  {
    kind: "dialogue",
    lines: [
      "Howzit! You coming to the braai on Saturday?",
      "...I'm sorry, the what now?",
    ],
  },
  {
    kind: "dialogue",
    lines: [
      "Eish, don't stress. Ag shame, you'll catch on.",
      "Okay, that made it worse.",
    ],
  },
  {
    kind: "hero",
    headline: "Sharp sharp. We've got you.",
    body: "It's your turn to actually understand what being a real South African actually sounds like.",
  },
  {
    kind: "mechanics",
    text: "Swipe right to save a word. Swipe left to skip it. Tap to flip and see what it means.",
  },
  {
    kind: "closing",
    text: "This dictionary is built by real people, for real people. Keep it real, not rude and if something's off, flag it. We'll take a look.",
  },
];

const PAUSE_MS = 550;

export default function OnboardingStoryScreen() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const isLast = stepIndex === BEATS.length - 1;

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

  const beat = BEATS[stepIndex];

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
          <HeroBeatView key={stepIndex} headline={beat.headline} body={beat.body} />
        ) : beat.kind === "mechanics" ? (
          <MechanicsBeatView key={stepIndex} text={beat.text} />
        ) : (
          <ClosingBeatView key={stepIndex} text={beat.text} onFinish={goToLanguages} />
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

function HeroBeatView({ headline, body }: { headline: string; body: string }) {
  const [showBody, setShowBody] = useState(false);

  return (
    <View style={styles.heroWrap}>
      <TypewriterText
        text={headline}
        style={styles.heroHeadline}
        charDelayMs={38}
        onDone={() => setShowBody(true)}
      />
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
      <DemoCard />
    </View>
  );
}

function ClosingBeatView({
  text,
  onFinish,
}: {
  text: string;
  onFinish: () => void;
}) {
  const [showButton, setShowButton] = useState(false);

  return (
    <View style={styles.closingWrap}>
      <TypewriterText
        text={text}
        style={styles.closingText}
        onDone={() => setShowButton(true)}
      />
      {showButton ? (
        <Animated.View entering={FadeIn.duration(250)} style={styles.closingButtonWrap}>
          <Button label="Let's go" variant="primary" onPress={onFinish} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const DEMO_SWIPE_DISTANCE = 30;

function DemoCard() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withDelay(1000, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })),
        withDelay(500, withTiming(0, { duration: 400, easing: Easing.inOut(Easing.quad) })),
      ),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, DEMO_SWIPE_DISTANCE]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 6])}deg` },
    ],
    opacity: interpolate(progress.value, [0, 1], [1, 0.6]),
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
  heroHeadline: {
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
    gap: theme.spacing.xl,
  },
  mechanicsText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.text,
  },
  closingWrap: {
    gap: theme.spacing.lg,
  },
  closingText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 19,
    lineHeight: 27,
    color: theme.colors.text,
  },
  closingButtonWrap: {
    alignSelf: "stretch",
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
});
