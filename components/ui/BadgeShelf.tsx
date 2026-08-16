import { theme } from "@/constants/designTheme";
import { getBadgeProgress, type UserStats } from "@/constants/badges";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { BadgeMedallion } from "./BadgeMedallion";
import { Card } from "./Card";
import { ProgressBar } from "./ProgressBar";
import { Text } from "./Text";

type BadgeShelfProps = {
  stats: UserStats;
};

export function BadgeShelf({ stats }: BadgeShelfProps) {
  const badges = getBadgeProgress(stats);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = badges.find((b) => b.id === selectedId) ?? null;

  return (
    <View>
      <View style={styles.grid}>
        {badges.map((badge) => (
          <Pressable
            key={badge.id}
            onPress={() => setSelectedId(badge.id)}
            style={styles.tile}
          >
            <BadgeMedallion
              variant={badge.pattern}
              shape={badge.shape}
              unlocked={badge.unlocked}
              size={64}
              style={{ marginBottom: 8 }}
            />
            <Text
              style={[
                styles.tileTitle,
                !badge.unlocked && { color: theme.colors.inkSoft },
              ]}
              numberOfLines={1}
            >
              {badge.title}
            </Text>
          </Pressable>
        ))}
      </View>

      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedId(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedId(null)}
        >
          {selected ? (
            <Card style={styles.detailCard}>
              <BadgeMedallion
                variant={selected.pattern}
                shape={selected.shape}
                unlocked={selected.unlocked}
                size={96}
                style={{ marginBottom: 16 }}
              />
              <Text variant="heading" style={{ textAlign: "center" }}>
                {selected.title}
              </Text>
              <Text
                variant="muted"
                style={{
                  textAlign: "center",
                  fontStyle: "italic",
                  marginTop: 4,
                  marginBottom: 12,
                }}
              >
                {selected.gloss}
              </Text>
              <Text style={{ textAlign: "center", marginBottom: 12 }}>
                {selected.description}
              </Text>
              {!selected.unlocked ? (
                <ProgressBar progress={selected.progressValue} />
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    color: theme.colors.highveld,
                    fontFamily: theme.fonts.bodyBold,
                  }}
                >
                  Unlocked ✓
                </Text>
              )}
            </Card>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const TILE_WIDTH = "31%";

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: TILE_WIDTH,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  tileTitle: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 12,
    textAlign: "center",
    color: theme.colors.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(36,28,21,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  detailCard: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    padding: theme.spacing.lg,
  },
});
