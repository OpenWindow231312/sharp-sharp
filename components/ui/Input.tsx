import { theme } from "@/constants/designTheme";
import { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  type ViewStyle,
} from "react-native";
import { Text } from "./Text";

type InputProps = TextInputProps & {
  label?: string;
  containerStyle?: ViewStyle;
};

export function Input({
  label,
  style,
  containerStyle,
  multiline,
  onContentSizeChange,
  onSubmitEditing,
  returnKeyType,
  ...rest
}: InputProps) {
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined,
  );

  // Single-line inputs dismiss the keyboard on submit by default, so
  // pressing "done" always closes it without every screen having to wire
  // this up itself. Multiline fields (e.g. Meaning) are left alone —
  // return should insert a newline there, not dismiss.
  const effectiveReturnKeyType = multiline
    ? returnKeyType
    : (returnKeyType ?? "done");

  return (
    <View style={[{ marginBottom: theme.spacing.md }, containerStyle]}>
      {label ? (
        <Text variant="muted" style={{ marginBottom: theme.spacing.xs }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          multiline && contentHeight
            ? { height: Math.max(theme.tapTarget, contentHeight) }
            : null,
          style,
        ]}
        placeholderTextColor={theme.colors.textMuted}
        multiline={multiline}
        returnKeyType={effectiveReturnKeyType}
        onSubmitEditing={(e) => {
          if (!multiline && effectiveReturnKeyType === "done") {
            Keyboard.dismiss();
          }
          onSubmitEditing?.(e);
        }}
        onContentSizeChange={(e) => {
          if (multiline) {
            setContentHeight(
              e.nativeEvent.contentSize.height + theme.spacing.sm * 2,
            );
          }
          onContentSizeChange?.(e);
        }}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: theme.tapTarget,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
  multiline: {
    textAlignVertical: "top",
  },
});
