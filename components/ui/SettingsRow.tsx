import { theme } from "@/constants/designTheme";
import { CaretRight, Check, type Icon } from "phosphor-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";

type SettingsRowProps = {
  label: string;
  value?: string;
  icon?: Icon;
  onPress?: () => void;
  // "chevron" opens something, "check" is a toggle, "none" is plain.
  trailing?: "chevron" | "check" | "none";
  checked?: boolean;
  destructive?: boolean;
  isLast?: boolean;
  right?: ReactNode;
};

// One row of a standard settings-style list: label on the left, optional
// value and an affordance on the right, hairline between rows. Rows are
// grouped inside a SettingsGroup.
export function SettingsRow({
  label,
  value,
  icon: IconComponent,
  onPress,
  trailing = onPress ? "chevron" : "none",
  checked = false,
  destructive = false,
  isLast = false,
  right,
}: SettingsRowProps) {
  const color = destructive ? theme.colors.protea : theme.colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowDivider,
        pressed && onPress && styles.rowPressed,
      ]}
    >
      {IconComponent ? (
        <IconComponent
          size={20}
          weight="bold"
          color={destructive ? theme.colors.protea : theme.colors.indigo}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
      {value ? (
        <Text variant="muted" style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {right}
      {trailing === "chevron" ? (
        <CaretRight size={16} weight="bold" color={theme.colors.textMuted} />
      ) : trailing === "check" ? (
        <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
          {checked ? (
            <Check size={14} weight="bold" color={theme.colors.primaryText} />
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.group}>
      {title ? (
        <Text variant="muted" style={styles.groupTitle}>
          {title}
        </Text>
      ) : null}
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: theme.spacing.lg },
  groupTitle: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  groupCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  row: {
    minHeight: theme.tapTarget + 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowPressed: { backgroundColor: theme.colors.paperAlt },
  icon: { marginRight: theme.spacing.xs },
  label: {
    flex: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.fontSize.body,
  },
  value: { fontSize: 14, maxWidth: "50%" },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBoxOn: {
    backgroundColor: theme.colors.indigo,
    borderColor: theme.colors.indigo,
  },
});
