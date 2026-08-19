import { theme } from "@/constants/designTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, ArrowRight, Hand } from "phosphor-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { Button } from "./Button";
import { Text } from "./Text";

const STORAGE_KEY = "sharpSharp:hasSeenFeedTutorial";

export function FirstTimeTutorial() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((seen) => {
      if (!seen) setVisible(true);
    });
  }, []);

  function dismiss() {
    setVisible(false);
    AsyncStorage.setItem(STORAGE_KEY, "true");
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text variant="heading" style={styles.title}>
            Swipe to learn
          </Text>
          <Row
            icon={<ArrowRight size={18} weight="bold" color={theme.colors.highveld} />}
            tint="rgba(31,164,92,0.12)"
            title="Swipe right"
            desc="Saves the term to your dictionary"
          />
          <Row
            icon={<ArrowLeft size={18} weight="bold" color={theme.colors.protea} />}
            tint="rgba(255,95,69,0.12)"
            title="Swipe left"
            desc="Skips to the next term"
          />
          <Row
            icon={<Hand size={18} weight="bold" color={theme.colors.indigo} />}
            tint="rgba(38,59,140,0.1)"
            title="Tap"
            desc="Flips the card to reveal the meaning"
          />
          <Button label="Got it" onPress={dismiss} style={{ marginTop: theme.spacing.md }} />
        </View>
      </View>
    </Modal>
  );
}

function Row({
  icon,
  tint,
  title,
  desc,
}: {
  icon: ReactNode;
  tint: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text variant="muted" style={styles.rowDesc}>
          {desc}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: theme.spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
  },
  rowDesc: {
    fontSize: 12,
  },
});
