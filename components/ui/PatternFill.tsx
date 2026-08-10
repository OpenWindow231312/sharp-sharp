import { useId, type ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect, Circle } from 'react-native-svg';
import { theme } from '@/constants/designTheme';

export type PatternVariant = 'chevron' | 'diamond' | 'triangle' | 'beadscatter';

type PatternFillProps = {
  variant: PatternVariant;
  style?: StyleProp<ViewStyle>;
  /** 0–1. Use ≤0.25 only when the pattern sits directly under text (diamond rule). */
  opacity?: number;
  children?: ReactNode;
};

// Each motif has exactly one approved job per the design system:
// chevron = nav & card-header strips, diamond = new/unlocked content,
// triangle = onboarding/success backdrops, beadscatter = rewards only.
export function PatternFill({ variant, style, opacity, children }: PatternFillProps) {
  // Unique per mounted instance so multiple patterns of the same variant on
  // one screen don't collide over a single <Pattern id> in the DOM (web).
  const id = `pattern-${variant}-${useId()}`;

  return (
    <View style={[styles.wrap, style]}>
      <Svg width="100%" height="100%" style={[StyleSheet.absoluteFill, { opacity }]}>
        <Defs>{renderPatternDef(variant, id)}</Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}

function renderPatternDef(variant: PatternVariant, id: string) {
  switch (variant) {
    case 'chevron':
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={16} height={16}>
          <Rect width={16} height={16} fill={theme.patterns.chevron.bg} />
          <Path d="M0 4 L4 0 L8 4 L4 8 Z" fill={theme.patterns.chevron.fg} />
          <Path d="M8 4 L12 0 L16 4 L12 8 Z" fill={theme.patterns.chevron.fg} />
        </Pattern>
      );
    case 'diamond':
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={14} height={14}>
          <Rect width={14} height={14} fill={theme.patterns.diamond.bg} />
          <Path d="M7 0 L14 7 L7 14 L0 7 Z" fill={theme.patterns.diamond.fg} />
        </Pattern>
      );
    case 'triangle':
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={12} height={12}>
          <Rect width={12} height={12} fill={theme.patterns.triangle.bg} />
          <Path d="M0 12 L12 12 L12 0 Z" fill={theme.patterns.triangle.fg} />
        </Pattern>
      );
    case 'beadscatter':
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={90} height={90}>
          <Rect width={90} height={90} fill={theme.patterns.beadscatter.bg} />
          <Circle cx={14} cy={18} r={3} fill={theme.patterns.beadscatter.fg} />
          <Circle cx={40} cy={58} r={4} fill={theme.patterns.beadscatter.fg} />
          <Circle cx={70} cy={22} r={2.5} fill={theme.patterns.beadscatter.fg} />
          <Circle cx={79} cy={70} r={3.5} fill={theme.patterns.beadscatter.fg} />
          <Circle cx={22} cy={76} r={3} fill={theme.patterns.beadscatter.fg} />
          <Circle cx={54} cy={7} r={2} fill={theme.patterns.beadscatter.fg} />
          <Circle cx={5} cy={49} r={2.5} fill={theme.patterns.beadscatter.fg} />
        </Pattern>
      );
  }
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    position: 'relative',
  },
});
