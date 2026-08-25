import { theme } from '@/constants/designTheme';
import type { SlangTerm } from '@/types/slangTerm';
import { useId, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Line, Path, Pattern, Rect } from 'react-native-svg';
import { Text } from './Text';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

// --- Colorway system copied verbatim from components/ui/SwipeCard.tsx ---
// SwipeCard.tsx is read-only from this task, so this can't be a real
// import — it's an exact copy (same hash, same colorway list, in the
// same order) so a given term.id resolves to the identical colorway on
// both the Feed swipe view and this Learn landscape view.
const ACCENT = theme.colors.marigold;

type TextureVariant = "hairline" | "ndebele" | "diamond" | "herringbone";

type CardColorway = {
  background: string;
  texture: TextureVariant;
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
// pages back and forth. Identical implementation to SwipeCard.tsx.
function colorwayForTerm(id: string): CardColorway {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return CARD_COLORWAYS[hash % CARD_COLORWAYS.length];
}

function CardTexture({ variant }: { variant: TextureVariant }) {
  const id = `studycard-texture-${variant}-${useId()}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>{renderTextureDef(variant, id)}</Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

function renderTextureDef(variant: TextureVariant, id: string) {
  switch (variant) {
    case "hairline":
      return (
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={4}
          height={4}
          patternTransform="rotate(115)"
        >
          <Line x1={0} y1={0} x2={0} y2={4} stroke="white" strokeOpacity={0.035} strokeWidth={1} />
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
// --- end colorway system copy ---

type StudyCardProps = {
  term: SlangTerm;
  onSwipe: (direction: 'left' | 'right') => void;
};

export function StudyCard({ term, onSwipe }: StudyCardProps) {
  const translateX = useSharedValue(0);
  const colorway = useMemo(() => colorwayForTerm(term.id), [term.id]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const direction = e.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(
          direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { duration: 200 },
          () => runOnJS(onSwipe)(direction)
        );
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.row, cardStyle]}>
        <View style={[styles.plaqueSide, { backgroundColor: colorway.background }]}>
          <CardTexture variant={colorway.texture} />
          <View style={styles.plaqueContent}>
            <Text style={styles.langTag}>{term.language.toUpperCase()}</Text>
            <View style={styles.termWrap}>
              <Text
                style={[
                  styles.termText,
                  styles.termTextHighlight,
                  { color: colorway.termShadowLight },
                ]}
              >
                {term.term}
              </Text>
              <Text
                style={[
                  styles.termText,
                  styles.termTextMain,
                  { textShadowColor: colorway.termShadowDark },
                ]}
              >
                {term.term}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSide}>
          <Text variant="muted" style={{ marginBottom: 4 }}>Meaning</Text>
          <Text style={{ marginBottom: 16 }}>{term.meaning}</Text>
          {term.examples && term.examples.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              <Text variant="muted" style={{ marginBottom: 4 }}>
                {term.examples.length > 1 ? 'Examples' : 'Example'}
              </Text>
              {term.examples.map((example, index) => (
                <View key={index} style={index > 0 ? { marginTop: 8 } : undefined}>
                  <Text style={{ fontStyle: 'italic' }}>&quot;{example.sentence}&quot;</Text>
                  {example.context ? (
                    <Text variant="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {example.context}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
          {term.region ? <Text variant="muted">{term.region}</Text> : null}
          <Text variant="muted" style={{ marginTop: 12 }}>Added by {term.submittedByName}</Text>
        </View>

        {/* Corner rivets frame the whole plaque, matching SwipeCard's hardware */}
        <View
          style={[
            styles.rivet,
            styles.rivetTL,
            { borderTopColor: colorway.rivetLight, borderLeftColor: colorway.rivetLight, borderBottomColor: colorway.rivetDark, borderRightColor: colorway.rivetDark },
          ]}
        />
        <View
          style={[
            styles.rivet,
            styles.rivetTR,
            { borderTopColor: colorway.rivetLight, borderLeftColor: colorway.rivetLight, borderBottomColor: colorway.rivetDark, borderRightColor: colorway.rivetDark },
          ]}
        />
        <View
          style={[
            styles.rivet,
            styles.rivetBL,
            { borderTopColor: colorway.rivetLight, borderLeftColor: colorway.rivetLight, borderBottomColor: colorway.rivetDark, borderRightColor: colorway.rivetDark },
          ]}
        />
        <View
          style={[
            styles.rivet,
            styles.rivetBR,
            { borderTopColor: colorway.rivetLight, borderLeftColor: colorway.rivetLight, borderBottomColor: colorway.rivetDark, borderRightColor: colorway.rivetDark },
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: ACCENT,
    backgroundColor: theme.colors.card,
    ...theme.shadow.card,
  },
  plaqueSide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  plaqueContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTag: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: ACCENT,
    marginBottom: 12,
  },
  termWrap: { alignItems: 'center', justifyContent: 'center' },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 40,
    textAlign: 'center',
  },
  termTextHighlight: {
    position: 'absolute',
    transform: [{ translateX: -1 }, { translateY: -1 }],
  },
  termTextMain: {
    color: theme.colors.paper,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
  },
  detailsSide: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: theme.colors.card,
  },
  rivet: {
    position: 'absolute',
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
});
