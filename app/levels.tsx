import { BadgeMedallion } from "@/components/ui/BadgeMedallion";
import { Card } from "@/components/ui/Card";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { getLevelInfo, LEVELS } from "@/constants/levels";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const LEVEL_BLURB: Record<string, string> = {
  "Eish!": "Everyone starts here.",
  Ubuntu: "You're learning the community's words.",
  Lekker: "Solid progress. You're getting the hang of this.",
  Ayoba: "You know your stuff.",
  "Local Legend": "You've earned real street cred.",
  "Sharp Sharp": "Top tier. Fluent in the culture.",
};

const WAYS_TO_EARN = [
  { action: "Save a word from the Feed", xp: 5 },
  { action: "Add a word of your own", xp: 20 },
];

export default function LevelsScreen() {
  const { user } = useAuth();
  const [xp, setXp] = useState(USE_MOCK_DATA ? 35 : 0);

  useEffect(() => {
    if (USE_MOCK_DATA || !user) return;
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setXp(snap.exists() ? (snap.data().xp ?? 0) : 0),
      (error) => console.log("Levels listener error:", error),
    );
    return unsubscribe;
  }, [user]);

  const info = getLevelInfo(xp);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="How levels work" />
      <Text variant="muted" style={styles.intro}>
        Every word you save or add earns XP. XP adds up and moves you through
        six tiers, each named after a bit of real South African slang.
      </Text>

      <Text variant="muted" style={styles.sectionLabel}>
        Earning XP
      </Text>
      <Card style={styles.earnCard}>
        {WAYS_TO_EARN.map((way, i) => (
          <View
            key={way.action}
            style={[styles.earnRow, i > 0 && styles.earnRowDivider]}
          >
            <Text style={{ flex: 1 }}>{way.action}</Text>
            <Text style={styles.earnXp}>+{way.xp} XP</Text>
          </View>
        ))}
      </Card>

      <Text variant="muted" style={styles.sectionLabel}>
        The tiers
      </Text>
      {LEVELS.map((level, i) => {
        const unlocked = xp >= level.threshold;
        const isCurrent = info.level - 1 === i;
        const status = isCurrent
          ? `You're here with ${xp} XP`
          : unlocked
            ? "Unlocked"
            : `${level.threshold - xp} XP to go`;
        return (
          <Card
            key={level.title}
            style={[styles.levelCard, isCurrent && styles.levelCardCurrent]}
          >
            <BadgeMedallion
              variant={level.pattern}
              shape={level.shape}
              unlocked={unlocked}
              size={48}
            />
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <View style={styles.levelTitleRow}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text variant="muted" style={styles.threshold}>
                  {level.threshold} XP
                </Text>
              </View>
              <Text variant="muted" style={styles.blurb}>
                {LEVEL_BLURB[level.title]}
              </Text>
              <Text
                style={[
                  styles.status,
                  {
                    color: isCurrent
                      ? theme.colors.indigo
                      : theme.colors.textMuted,
                  },
                ]}
              >
                {status}
              </Text>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.xxl,
  },
  intro: { marginBottom: theme.spacing.lg, fontSize: 14 },
  sectionLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  earnCard: { paddingVertical: 0, marginBottom: theme.spacing.lg },
  earnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  earnRowDivider: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  earnXp: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 16,
    color: theme.colors.highveld,
  },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  levelCardCurrent: {
    borderWidth: 2,
    borderColor: theme.colors.indigo,
  },
  levelTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  levelTitle: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 18,
    color: theme.colors.text,
  },
  threshold: { fontFamily: theme.fonts.mono, fontSize: 11 },
  blurb: { fontSize: 13, marginTop: 2 },
  status: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 12,
    marginTop: 4,
  },
});
