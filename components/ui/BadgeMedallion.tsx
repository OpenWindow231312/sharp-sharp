import { theme } from "@/constants/designTheme";
import type { PatternVariant } from "./PatternFill";
import { Lock } from "phosphor-react-native";
import { useId } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, Path, Pattern, Rect } from "react-native-svg";

export type BadgeShape = "circle" | "hexagon" | "shield" | "burst";

type BadgeMedallionProps = {
  variant: PatternVariant;
  shape: BadgeShape;
  unlocked: boolean;
  size?: number;
  style?: ViewStyle;
};

// Hand-plotted paths in a 0–100 local coordinate space (paired with the
// SVG's viewBox below) so they scale cleanly to any `size`.
const SHAPE_PATHS: Record<Exclude<BadgeShape, "circle">, string> = {
  hexagon: "M50 2 L93 26 L93 74 L50 98 L7 74 L7 26 Z",
  shield: "M50 2 L90 16 L90 52 Q90 84 50 98 Q10 84 10 52 L10 16 Z",
  burst:
    "M50 0 L59 28 L88 18 L70 44 L98 50 L70 56 L88 82 L59 72 L50 100 L41 72 L12 82 L30 56 L2 50 L30 44 L12 18 L41 28 Z",
};

export function BadgeMedallion({
  variant,
  shape,
  unlocked,
  size = 64,
  style,
}: BadgeMedallionProps) {
  const id = `medallion-${variant}-${shape}-${useId()}`;

  return (
    <View
      style={[
        { width: size, height: size },
        unlocked && theme.shadow.soft,
        style,
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>{renderPatternDef(variant, id)}</Defs>
        {shape === "circle" ? (
          <Circle
            cx={50}
            cy={50}
            r={48}
            fill={unlocked ? `url(#${id})` : theme.colors.surface}
          />
        ) : (
          <Path
            d={SHAPE_PATHS[shape]}
            fill={unlocked ? `url(#${id})` : theme.colors.surface}
          />
        )}
      </Svg>
      {!unlocked ? (
        <View style={styles.lockWrap}>
          <Lock
            size={size * 0.32}
            color={theme.colors.inkSoft}
            weight="fill"
          />
        </View>
      ) : null}
    </View>
  );
}

// Scaled-down copies of the theme's four motifs, tuned for badge-sized
// medallions (PatternFill's own tile sizes are built for larger strips).
function renderPatternDef(variant: PatternVariant, id: string) {
  switch (variant) {
    case "chevron":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={12} height={12}>
          <Rect width={12} height={12} fill={theme.patterns.chevron.bg} />
          <Path d="M0 3 L3 0 L6 3 L3 6 Z" fill={theme.patterns.chevron.fg} />
          <Path d="M6 3 L9 0 L12 3 L9 6 Z" fill={theme.patterns.chevron.fg} />
        </Pattern>
      );
    case "diamond":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={11} height={11}>
          <Rect width={11} height={11} fill={theme.patterns.diamond.bg} />
          <Path
            d="M5.5 0 L11 5.5 L5.5 11 L0 5.5 Z"
            fill={theme.patterns.diamond.fg}
          />
        </Pattern>
      );
    case "triangle":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={9} height={9}>
          <Rect width={9} height={9} fill={theme.patterns.triangle.bg} />
          <Path d="M0 9 L9 9 L9 0 Z" fill={theme.patterns.triangle.fg} />
        </Pattern>
      );
    case "beadscatter":
      return (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={26} height={26}>
          <Rect width={26} height={26} fill={theme.patterns.beadscatter.bg} />
          <Circle cx={5} cy={6} r={1.6} fill={theme.patterns.beadscatter.fg} />
          <Circle
            cx={16}
            cy={18}
            r={2}
            fill={theme.patterns.beadscatter.fg}
          />
          <Circle
            cx={22}
            cy={7}
            r={1.3}
            fill={theme.patterns.beadscatter.fg}
          />
        </Pattern>
      );
  }
}

const styles = StyleSheet.create({
  lockWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
