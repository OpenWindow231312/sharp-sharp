import { Button } from "@/components/ui/Button";
import { PatternFill } from "@/components/ui/PatternFill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { theme } from "@/constants/designTheme";
import { useRouter } from "expo-router";
import { ArrowBendDownLeft, Flag as FlagIcon } from "phosphor-react-native";
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
  bigLines: [string, string];
  smallLine: string;
  body: string;
};
type MechanicsBeat = BeatBase & {
  kind: "mechanics";
  heading: string;
  text: string;
};
type ClosingBeat = BeatBase & {
  kind: "closing";
  headlineBefore: string;
  headlineAccent: string;
  headlineAfter: string;
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
    autoAdvanceMs: 6000,
    bigLines: ["Sharp", "Sharp."],
    smallLine: "We've got you",
    body: "It's your turn to actually understand what being a real South African actually sounds like.",
  },
  {
    kind: "mechanics",
    autoAdvanceMs: 4000,
    heading: "Learn South African slang in real time",
    text: "Swipe right to save a word, swipe left to skip it.",
  },
  {
    // No autoAdvanceMs — this beat is manual only, it ends on "Let's go".
    kind: "closing",
    headlineBefore: "Keep it ",
    headlineAccent: "real",
    headlineAfter: ", not rude.",
    caption: "See something off? Tap the flag.\nWe'll take a look.",
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
            bigLines={beat.bigLines}
            smallLine={beat.smallLine}
            body={beat.body}
          />
        ) : beat.kind === "mechanics" ? (
          <MechanicsBeatView
            key={stepIndex}
            heading={beat.heading}
            text={beat.text}
          />
        ) : (
          <ClosingBeatView
            key={stepIndex}
            headlineBefore={beat.headlineBefore}
            headlineAccent={beat.headlineAccent}
            headlineAfter={beat.headlineAfter}
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
  bigLines,
  smallLine,
  body,
}: {
  bigLines: [string, string];
  smallLine: string;
  body: string;
}) {
  const [showSecondBig, setShowSecondBig] = useState(false);
  const [showSmallLine, setShowSmallLine] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  function afterPause(fn: () => void) {
    timeoutsRef.current.push(setTimeout(fn, PAUSE_MS));
  }

  return (
    <View style={styles.heroWrap}>
      <TypewriterText
        text={bigLines[0]}
        style={styles.heroBigLine}
        charDelayMs={44}
        onDone={() => afterPause(() => setShowSecondBig(true))}
      />
      {showSecondBig ? (
        <TypewriterText
          text={bigLines[1]}
          style={styles.heroBigLine}
          charDelayMs={44}
          onDone={() => afterPause(() => setShowSmallLine(true))}
        />
      ) : null}
      {showSmallLine ? (
        <TypewriterText
          text={smallLine}
          style={styles.heroSmallLine}
          onDone={() => setShowBody(true)}
        />
      ) : null}
      {showBody ? (
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={styles.heroBody}>{body}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

function MechanicsBeatView({
  heading,
  text,
}: {
  heading: string;
  text: string;
}) {
  return (
    <View style={styles.mechanicsWrap}>
      <Animated.Text
        entering={FadeIn.duration(350)}
        style={styles.mechanicsHeading}
      >
        {heading}
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(150).duration(350)}
        style={styles.mechanicsText}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

function ClosingBeatView({
  headlineBefore,
  headlineAccent,
  headlineAfter,
  caption,
  onFinish,
}: {
  headlineBefore: string;
  headlineAccent: string;
  headlineAfter: string;
  caption: string;
  onFinish: () => void;
}) {
  return (
    <View style={styles.closingWrap}>
      <View style={styles.closingContentGroup}>
        <Animated.Text
          entering={ZoomIn.duration(350)}
          style={styles.closingHeadline}
        >
          {headlineBefore}
          <Animated.Text style={styles.closingHeadlineAccent}>
            {headlineAccent}
          </Animated.Text>
          {headlineAfter}
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
      </View>

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
  heroWrap: {},
  heroBigLine: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 92,
    // lineHeight must comfortably exceed fontSize for a display weight this
    // large — anything close to or under fontSize gets the top of the
    // glyphs clipped by the Text node's own line box on native.
    lineHeight: 106,
    color: theme.colors.marigold,
  },
  heroSmallLine: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 32,
    lineHeight: 38,
    color: theme.colors.indigo,
    marginTop: theme.spacing.sm,
  },
  heroBody: {
    fontFamily: theme.fonts.body,
    fontSize: 17,
    lineHeight: 25,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  mechanicsWrap: {
    flex: 1,
    justifyContent: "center",
  },
  mechanicsHeading: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 30,
    lineHeight: 36,
    color: theme.colors.text,
  },
  mechanicsText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 18,
    lineHeight: 26,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xl,
  },
  closingWrap: {
    flex: 1,
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
  },
  closingContentGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xl,
  },
  closingHeadline: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 32,
    lineHeight: 38,
    color: theme.colors.indigo,
    textAlign: "center",
  },
  closingHeadlineAccent: {
    color: theme.colors.marigold,
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
});
