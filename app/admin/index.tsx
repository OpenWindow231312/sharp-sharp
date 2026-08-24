import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { LANGUAGES } from "@/constants/languages";
import { useAuth } from "@/context/AuthContext";
import {
  adminDeleteTerm,
  approveFlagAndDeleteTerm,
  dismissFlag,
  getAllTermsPaginated,
  getPendingFlags,
} from "@/services/adminTerms";
import { db } from "@/services/firebase";
import type { Flag, SlangTerm } from "@/types/slangTerm";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { doc, onSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import {
  BookOpen,
  CaretLeft,
  CaretRight,
  PencilSimple,
  Quotes,
  Trash,
  X,
} from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

type Tab = "queue" | "allTerms";

const FLAG_REASON_LABEL: Record<Flag["reason"], string> = {
  offensive: "Offensive",
  inaccurate: "Inaccurate",
  spam: "Spam",
  other: "Other",
};

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("queue");

  const [flags, setFlags] = useState<Flag[]>([]);
  const [isLoadingFlags, setIsLoadingFlags] = useState(true);

  const [terms, setTerms] = useState<SlangTerm[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);
  const [detailTerm, setDetailTerm] = useState<SlangTerm | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setIsAdmin(data.isAdmin === true);
      },
      (error) => {
        console.log("Admin guard listener error:", error);
        setIsAdmin(false);
      },
    );
    return unsubscribe;
  }, [user]);

  const loadFlags = useCallback(() => {
    setIsLoadingFlags(true);
    getPendingFlags()
      .then(setFlags)
      .catch((error) => console.log("Load flags error:", error))
      .finally(() => setIsLoadingFlags(false));
  }, []);

  const loadFirstPage = useCallback(() => {
    setIsLoadingTerms(true);
    getAllTermsPaginated()
      .then(({ terms: loaded, lastDoc: last }) => {
        setTerms(loaded);
        setLastDoc(last);
        setHasMore(loaded.length > 0);
      })
      .catch((error) => console.log("Load terms error:", error))
      .finally(() => setIsLoadingTerms(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin !== true) return;
      loadFlags();
      loadFirstPage();
    }, [isAdmin, loadFlags, loadFirstPage]),
  );

  async function loadMoreTerms() {
    if (!lastDoc || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const { terms: loaded, lastDoc: last } = await getAllTermsPaginated(lastDoc);
      setTerms((prev) => [...prev, ...loaded]);
      setLastDoc(last);
      setHasMore(loaded.length > 0);
    } catch (error) {
      console.log("Load more terms error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }

  function confirmDismiss(flagId: string) {
    setFlags((prev) => prev.filter((f) => f.id !== flagId));
    dismissFlag(flagId).catch((error) => {
      console.log("Dismiss flag error:", error);
      loadFlags();
    });
  }

  function confirmDeleteFlaggedTerm(flag: Flag) {
    Alert.alert(
      "Delete this term?",
      `"${flag.termSnapshot}" will be permanently removed. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setFlags((prev) => prev.filter((f) => f.id !== flag.id));
            approveFlagAndDeleteTerm(flag.id, flag.termId).catch((error) => {
              console.log("Approve flag error:", error);
              loadFlags();
            });
          },
        },
      ],
    );
  }

  function openEditTerm(termId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetailTerm(null);
    router.push({ pathname: "/edit-term", params: { termId } });
  }

  function confirmDeleteTerm(term: SlangTerm) {
    Alert.alert(
      "Delete this term?",
      `"${term.term}" will be permanently removed. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setTerms((prev) => prev.filter((t) => t.id !== term.id));
            adminDeleteTerm(term.id).catch((error) => {
              console.log("Admin delete term error:", error);
              loadFirstPage();
            });
          },
        },
      ],
    );
  }

  const visibleTerms = terms.filter((term) => {
    if (searchText.trim() && !term.term.toLowerCase().includes(searchText.trim().toLowerCase())) {
      return false;
    }
    if (languageFilter && term.language !== languageFilter) return false;
    return true;
  });

  if (isAdmin === null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isAdmin !== true) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Card style={{ alignItems: "center", padding: 32 }}>
          <Text variant="heading" style={{ marginBottom: 8, textAlign: "center" }}>
            You don&apos;t have access to this page
          </Text>
          <Text variant="muted" style={{ textAlign: "center", marginBottom: 20 }}>
            This screen is only for Sharp Sharp admins.
          </Text>
          <Button
            label="Back to Profile"
            variant="secondary"
            onPress={() => router.replace("/(tabs)/profile")}
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <CaretLeft size={22} color={theme.colors.ink} />
        </Pressable>
        <Text variant="heading" style={{ marginLeft: 4 }}>
          Control Center
        </Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab("queue")}
          style={[styles.tabButton, activeTab === "queue" && styles.tabButtonActive]}
        >
          <Text
            style={{
              fontFamily: theme.fonts.bodySemibold,
              color:
                activeTab === "queue" ? theme.colors.primaryText : theme.colors.secondaryText,
            }}
          >
            Flagged Queue{flags.length > 0 ? ` (${flags.length})` : ""}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("allTerms")}
          style={[styles.tabButton, activeTab === "allTerms" && styles.tabButtonActive]}
        >
          <Text
            style={{
              fontFamily: theme.fonts.bodySemibold,
              color:
                activeTab === "allTerms" ? theme.colors.primaryText : theme.colors.secondaryText,
            }}
          >
            All Terms
          </Text>
        </Pressable>
      </View>

      {activeTab === "queue" ? (
        isLoadingFlags ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : flags.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text variant="heading" style={{ marginBottom: 8 }}>
              Nothing flagged
            </Text>
            <Text variant="muted">Flagged terms from the Feed will show up here.</Text>
          </Card>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {flags.map((flag) => (
              <Card key={flag.id} style={[styles.flagCard, theme.shadow.card]}>
                <Text style={styles.termText}>{flag.termSnapshot}</Text>
                <Text variant="muted" style={{ marginBottom: 2 }}>
                  Reason: {FLAG_REASON_LABEL[flag.reason]}
                </Text>
                <Text variant="muted" style={{ marginBottom: 12 }}>
                  Reported by {flag.reportedBy}
                </Text>
                <View style={styles.flagActionsRow}>
                  <Button
                    label="Delete term"
                    variant="primary"
                    size="compact"
                    onPress={() => confirmDeleteFlaggedTerm(flag)}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    label="Dismiss"
                    variant="secondary"
                    size="compact"
                    onPress={() => confirmDismiss(flag.id)}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            ))}
          </ScrollView>
        )
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Input
            placeholder="Search terms"
            value={searchText}
            onChangeText={setSearchText}
            containerStyle={{ marginBottom: 12 }}
          />

          <Dropdown
            label="Language"
            value={languageFilter}
            options={LANGUAGES}
            onChange={setLanguageFilter}
            placeholder="All languages"
          />

          {isLoadingTerms ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
          ) : visibleTerms.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text variant="heading" style={{ marginBottom: 8 }}>
                No terms match
              </Text>
              <Text variant="muted">Try a different search or filter.</Text>
            </Card>
          ) : (
            visibleTerms.map((term) => (
              <Pressable key={term.id} onPress={() => setDetailTerm(term)}>
                <Card style={styles.termRow}>
                  <View style={styles.termRowMain}>
                    <Text style={styles.termRowText} numberOfLines={1}>
                      {term.term}
                    </Text>
                    <Chip label={term.language} selected={false} small />
                    {term.flagCount && term.flagCount > 0 ? (
                      <View style={styles.flagBadge}>
                        <Text style={styles.flagBadgeText}>{term.flagCount}</Text>
                      </View>
                    ) : null}
                  </View>
                  <CaretRight size={18} weight="bold" color={theme.colors.textMuted} />
                </Card>
              </Pressable>
            ))
          )}

          {hasMore && !isLoadingTerms && visibleTerms.length > 0 ? (
            <Button
              label={isLoadingMore ? "Loading..." : "Load more"}
              variant="secondary"
              disabled={isLoadingMore}
              onPress={loadMoreTerms}
              style={{ marginTop: 8, marginBottom: 24 }}
            />
          ) : null}
        </ScrollView>
      )}

      <Modal
        visible={detailTerm !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailTerm(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDetailTerm(null)}>
          {detailTerm ? (
            <View style={styles.detailCard}>
              <Pressable
                onPress={() => setDetailTerm(null)}
                hitSlop={12}
                style={styles.closeButton}
              >
                <X size={20} weight="bold" color={theme.colors.textMuted} />
              </Pressable>

              <Text style={styles.detailTermText}>{detailTerm.term}</Text>
              <Chip
                label={detailTerm.language}
                selected={false}
                small
                style={styles.detailChip}
              />

              <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.subheadingRow}>
                  <BookOpen size={13} weight="bold" color={theme.colors.inkSoft} />
                  <Text variant="muted" style={styles.subheadingText}>
                    Definition
                  </Text>
                </View>
                <Text style={styles.detailMeaning}>{detailTerm.meaning}</Text>

                {detailTerm.examples && detailTerm.examples.length > 0 ? (
                  <>
                    <View style={styles.subheadingRow}>
                      <Quotes size={13} weight="bold" color={theme.colors.inkSoft} />
                      <Text variant="muted" style={styles.subheadingText}>
                        In a sentence
                      </Text>
                    </View>
                    {detailTerm.examples.map((example, index) => (
                      <View key={index} style={index > 0 ? styles.exampleBlockSpacing : undefined}>
                        <Text style={styles.exampleText}>
                          &quot;{example.sentence}&quot;
                        </Text>
                        {example.context ? (
                          <Text variant="muted" style={styles.exampleContextText}>
                            {example.context}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </>
                ) : null}

                {detailTerm.region ? (
                  <Text variant="muted" style={styles.regionText}>
                    {detailTerm.region}
                  </Text>
                ) : null}
              </ScrollView>

              <View style={styles.detailActionsRow}>
                <Pressable
                  onPress={() => openEditTerm(detailTerm.id)}
                  hitSlop={10}
                  style={styles.detailActionButton}
                >
                  <PencilSimple size={20} weight="bold" color={theme.colors.indigo} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setDetailTerm(null);
                    confirmDeleteTerm(detailTerm);
                  }}
                  hitSlop={10}
                  style={styles.detailActionButton}
                >
                  <Trash size={20} weight="bold" color={theme.colors.protea} />
                </Pressable>
              </View>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 70,
    backgroundColor: theme.colors.background,
  },
  centered: { justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: {
    width: theme.tapTarget,
    height: theme.tapTarget,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    alignItems: "center",
  },
  tabButtonActive: { backgroundColor: theme.colors.primary },
  emptyCard: { alignItems: "center", padding: 32 },
  flagCard: { marginBottom: 12 },
  flagActionsRow: { flexDirection: "row" },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 4,
  },
  termRow: {
    marginBottom: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  termRowMain: {
    flex: 1,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  termRowText: {
    flexShrink: 1,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 17,
    color: theme.colors.text,
  },
  flagBadge: {
    backgroundColor: theme.colors.protea,
    borderRadius: theme.radius.pill,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  flagBadgeText: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
    color: "#FFFFFF",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(36,28,21,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  detailCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.card,
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: theme.tapTarget,
    height: theme.tapTarget,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  detailTermText: {
    fontFamily: theme.fonts.displaySemibold,
    fontSize: theme.fontSize.display,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: 4,
    paddingRight: theme.tapTarget,
  },
  detailChip: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  detailScroll: {
    maxHeight: 280,
  },
  detailMeaning: {
    fontFamily: theme.fonts.body,
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: 12,
  },
  subheadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  subheadingText: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  exampleText: {
    fontFamily: theme.fonts.body,
    fontStyle: "italic",
    fontSize: 15,
    color: theme.colors.text,
  },
  exampleBlockSpacing: {
    marginTop: theme.spacing.sm,
  },
  exampleContextText: {
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 2,
  },
  regionText: {
    marginTop: theme.spacing.sm,
  },
  detailActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detailActionButton: {
    width: theme.tapTarget,
    height: theme.tapTarget,
    alignItems: "center",
    justifyContent: "center",
  },
});
