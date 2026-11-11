import { theme } from "@/constants/designTheme";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type TextInputProps,
} from "react-native";
import { Button } from "./Button";
import { Input } from "./Input";
import { Text } from "./Text";

type PromptModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  isBusy?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

// Replaces Alert.prompt, which only exists on iOS. Android and web got a
// crash instead of a text box, which took "Forgot password?" and "Edit
// name" down with it. This is a plain modal with one input and two
// buttons that renders the same everywhere.
export function PromptModal({ visible, onCancel, ...rest }: PromptModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Mounted only while open, so the input starts from initialValue on
          every open without needing an effect to reset it. */}
      {visible ? <PromptBody onCancel={onCancel} {...rest} /> : null}
    </Modal>
  );
}

function PromptBody({
  title,
  message,
  placeholder,
  initialValue = "",
  confirmLabel = "Confirm",
  isBusy = false,
  keyboardType,
  autoCapitalize,
  onConfirm,
  onCancel,
}: Omit<PromptModalProps, "visible">) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();

  return (
    <KeyboardAvoidingView
      style={styles.backdrop}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      <View style={styles.sheet}>
        <Text variant="heading" style={styles.title}>
          {title}
        </Text>
        {message ? (
          <Text variant="muted" style={styles.message}>
            {message}
          </Text>
        ) : null}
        <Input
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => {
            if (trimmed && !isBusy) onConfirm(trimmed);
          }}
        />
        <Button
          label={isBusy ? "One sec..." : confirmLabel}
          variant="primary"
          disabled={!trimmed || isBusy}
          onPress={() => onConfirm(trimmed)}
        />
        <Pressable onPress={onCancel} hitSlop={8} style={styles.cancel}>
          <Text variant="muted" style={{ textDecorationLine: "underline" }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(36,28,21,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  sheet: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: theme.colors.paper,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  title: { marginBottom: theme.spacing.xs },
  message: { marginBottom: theme.spacing.md },
  cancel: { alignSelf: "center", paddingVertical: theme.spacing.sm },
});
