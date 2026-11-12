import { useState, type ReactNode } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Svg from "react-native-svg";

// An SVG that fills whatever it is placed in. On native, react-native-svg
// does not reliably honour width="100%"/height="100%" on the root <Svg>,
// which left patterns covering only part of a card or header on the
// phone. This measures the parent box and hands the SVG real pixel sizes.
export function FillSvg({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    if (!size || size.w !== width || size.h !== height) {
      setSize({ w: width, h: height });
    }
  }

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
      pointerEvents="none"
    >
      {size ? (
        <Svg width={size.w} height={size.h}>
          {children}
        </Svg>
      ) : null}
    </View>
  );
}
