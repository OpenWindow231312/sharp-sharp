import { Button } from "@/components/ui/Button";
import { PatternFill } from "@/components/ui/PatternFill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { theme } from "@/constants/designTheme";
import { useRouter } from "expo-router";
import { ArrowBendDownLeft, Flag as FlagIcon } from "phosphor-react-native";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
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
import { styles } from "@/styles/onboarding/story.styles";

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

      <Pressable onPress={goToLanguages} hitSlop={12} style={styles.skipButton}>
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
        <ArrowBendDownLeft
          size={26}
          weight="bold"
          color={theme.colors.marigold}
        />
      </Animated.View>
    </View>
  );
}
