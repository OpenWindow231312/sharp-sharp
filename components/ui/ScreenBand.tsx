import { theme } from "@/constants/designTheme";
import { useSvgId } from "@/utils/svgId";
import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { Text } from "./Text";

type ScreenBandProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
  style?: ViewStyle;
};

// The deep indigo header every tab shares. Starts right under the status
// bar (safe-area inset, not a fixed 70px), carries the chevron motif at
// low strength across its whole height, and leaves room at the bottom for
// the screen's first card to overlap it by BAND_OVERLAP.
export const BAND_OVERLAP = 36;

export function ScreenBand({
  title,
  subtitle,
  right,
  children,
  style,
}: ScreenBandProps) {
  const insets = useSafeAreaInsets();
  const id = useSvgId("band-chevron");
  return (
    <View
      style={[styles.band, { paddingTop: Math.max(insets.top, 20) + 8 }, style]}
    >
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width={32} height={32}>
            <Path
              d="M0 8 L8 0 L16 8 L8 16 Z M16 8 L24 0 L32 8 L24 16 Z M0 24 L8 16 L16 24 L8 32 Z M16 24 L24 16 L32 24 L24 32 Z"
              fill={theme.colors.paper}
              fillOpacity={0.07}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: theme.colors.indigoDeep,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: BAND_OVERLAP + theme.spacing.md,
    overflow: "hidden",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 32,
    lineHeight: 36,
    color: theme.colors.paper,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.paper,
    opacity: 0.85,
    marginTop: 2,
  },
});

// Small mono label used on the band and in lists (language, XP).
export function MonoTag({
  children,
  onDark = false,
  style,
}: {
  children: ReactNode;
  onDark?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Text
      style={[
        styles2.tag,
        { color: onDark ? theme.colors.paper : theme.colors.inkSoft },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles2 = StyleSheet.create({
  tag: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
