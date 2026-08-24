import { theme } from "@/constants/designTheme";
import { CaretDown, Check } from "phosphor-react-native";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { Text } from "./Text";

type DropdownProps = {
  label?: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
};

export function Dropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
  containerStyle,
}: DropdownProps) {
  const [visible, setVisible] = useState(false);

  function select(option: string | null) {
    onChange(option);
    setVisible(false);
  }

  return (
    <View style={[{ marginBottom: theme.spacing.md }, containerStyle]}>
      {label ? (
        <Text variant="muted" style={{ marginBottom: theme.spacing.xs }}>
          {label}
        </Text>
      ) : null}
      <Pressable style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={styles.triggerText}>{value ?? placeholder}</Text>
        <CaretDown size={16} weight="bold" color={theme.colors.textMuted} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.card}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.optionList}
            >
              <Option
                label={placeholder}
                selected={value === null}
                onPress={() => select(null)}
              />
              {options.map((option) => (
                <Option
                  key={option}
                  label={option}
                  selected={value === option}
                  onPress={() => select(option)}
                />
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.option}>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
      {selected ? (
        <Check size={16} weight="bold" color={theme.colors.primary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: theme.tapTarget,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerText: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(36,28,21,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.sm,
  },
  optionList: {
    maxHeight: 360,
  },
  option: {
    minHeight: theme.tapTarget,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
  optionTextSelected: {
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
  },
});
