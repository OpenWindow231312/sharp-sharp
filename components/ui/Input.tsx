import { theme } from "@/constants/designTheme";
import { Eye, EyeSlash } from "phosphor-react-native";
import { useState } from "react";
import {
  Keyboard,
  Pressable,
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
  secureTextEntry,
  ...rest
}: InputProps) {
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined,
  );
  // Password fields default to hidden text, with a toggle to reveal it —
  // handled entirely here so any Input rendered with secureTextEntry gets
  // this for free, with no changes needed at the call site.
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
      <View>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multiline,
            multiline && contentHeight
              ? { height: Math.max(theme.tapTarget, contentHeight) }
              : null,
            secureTextEntry && styles.inputWithToggle,
            style,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          multiline={multiline}
          returnKeyType={effectiveReturnKeyType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
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
        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            hitSlop={10}
            style={styles.toggleButton}
          >
            {isPasswordVisible ? (
              <EyeSlash size={20} weight="bold" color={theme.colors.textMuted} />
            ) : (
              <Eye size={20} weight="bold" color={theme.colors.textMuted} />
            )}
          </Pressable>
        ) : null}
      </View>
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
  // Reserves exactly the width the toggle button occupies (its tap target
  // plus its inset from the edge) so typed text never runs under the icon.
  inputWithToggle: {
    paddingRight: theme.spacing.sm + theme.tapTarget,
  },
  toggleButton: {
    position: "absolute",
    right: theme.spacing.sm,
    top: 0,
    bottom: 0,
    width: theme.tapTarget,
    alignItems: "center",
    justifyContent: "center",
  },
});
