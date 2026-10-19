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
  type FlagWithDetails,
} from "@/services/adminTerms";
import { db } from "@/services/firebase";
import type { Flag, SlangTerm } from "@/types/slangTerm";
import { useFocusEffect } from "expo-router/react-navigation";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { doc, onSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import {
  BookOpen,
  CaretLeft,
  CaretRight,
  Flag as FlagIcon,
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
  View,
} from "react-native";
import { styles } from "@/styles/admin/index.styles";

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

  const [flags, setFlags] = useState<FlagWithDetails[]>([]);
  const [isLoadingFlags, setIsLoadingFlags] = useState(true);
  const [flagDetail, setFlagDetail] = useState<FlagWithDetails | null>(null);

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
      .catch((error) => {
        console.log("Load flags error:", error);
        Alert.alert(
          "Couldn't load flagged terms",
          "Check your connection and try again.",
        );
      })
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
      const { terms: loaded, lastDoc: last } =
        await getAllTermsPaginated(lastDoc);
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
    if (
      searchText.trim() &&
      !term.term.toLowerCase().includes(searchText.trim().toLowerCase())
    ) {
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
          <Text
            variant="heading"
            style={{ marginBottom: 8, textAlign: "center" }}
          >
            You don&apos;t have access to this page
          </Text>
          <Text
            variant="muted"
            style={{ textAlign: "center", marginBottom: 20 }}
          >
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
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
        >
          <CaretLeft size={22} color={theme.colors.ink} />
        </Pressable>
        <Text variant="heading" style={{ marginLeft: 4 }}>
          Control Center
        </Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab("queue")}
          style={[
            styles.tabButton,
            activeTab === "queue" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={{
              fontFamily: theme.fonts.bodySemibold,
              color:
                activeTab === "queue"
                  ? theme.colors.primaryText
                  : theme.colors.secondaryText,
            }}
          >
            Flagged Queue{flags.length > 0 ? ` (${flags.length})` : ""}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("allTerms")}
          style={[
            styles.tabButton,
            activeTab === "allTerms" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={{
              fontFamily: theme.fonts.bodySemibold,
              color:
                activeTab === "allTerms"
                  ? theme.colors.primaryText
                  : theme.colors.secondaryText,
            }}
          >
            All Terms
          </Text>
        </Pressable>
      </View>

      {activeTab === "queue" ? (
        isLoadingFlags ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : flags.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text variant="heading" style={{ marginBottom: 8 }}>
              Nothing flagged
            </Text>
            <Text variant="muted">
              Flagged terms from the Feed will show up here.
            </Text>
          </Card>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {flags.map((flag) => (
              <Pressable key={flag.id} onPress={() => setFlagDetail(flag)}>
                <Card style={[styles.flagCard, theme.shadow.card]}>
                  <View style={styles.flagRow}>
                    <View style={styles.flagRowMain}>
                      <Text style={styles.termText}>{flag.termSnapshot}</Text>
                      <Text variant="muted" style={{ marginBottom: 2 }}>
                        {FLAG_REASON_LABEL[flag.reason]}
                      </Text>
                      <Text variant="muted">
                        Reported by {flag.reporterName}
                      </Text>
                    </View>
                    <CaretRight
                      size={18}
                      weight="bold"
                      color={theme.colors.textMuted}
                    />
                  </View>
                </Card>
              </Pressable>
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
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={{ marginTop: 24 }}
            />
          ) : visibleTerms.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text variant="heading" style={{ marginBottom: 8 }}>
                No terms match
              </Text>
              <Text variant="muted">Try a different search or filter.</Text>
            </Card>
          ) : (
            visibleTerms.map((term) => (
              <Card key={term.id} style={styles.termRow}>
                <Pressable
                  onPress={() => setDetailTerm(term)}
                  style={styles.termRowMain}
                >
                  <Text style={styles.termRowText} numberOfLines={1}>
                    {term.term}
                  </Text>
                  {term.flagCount && term.flagCount > 0 ? (
                    <FlagIcon
                      size={16}
                      weight="fill"
                      color={theme.colors.protea}
                    />
                  ) : null}
                  <CaretRight
                    size={18}
                    weight="bold"
                    color={theme.colors.textMuted}
                  />
                </Pressable>
                <Pressable
                  onPress={() => confirmDeleteTerm(term)}
                  hitSlop={10}
                  style={styles.termRowDelete}
                >
                  <Trash size={20} weight="bold" color={theme.colors.protea} />
                </Pressable>
              </Card>
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

              <ScrollView
                style={styles.detailScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.subheadingRow}>
                  <BookOpen
                    size={13}
                    weight="bold"
                    color={theme.colors.inkSoft}
                  />
                  <Text variant="muted" style={styles.subheadingText}>
                    Definition
                  </Text>
                </View>
                <Text style={styles.detailMeaning}>{detailTerm.meaning}</Text>

                {detailTerm.examples && detailTerm.examples.length > 0 ? (
                  <>
                    <View style={styles.subheadingRow}>
                      <Quotes
                        size={13}
                        weight="bold"
                        color={theme.colors.inkSoft}
                      />
                      <Text variant="muted" style={styles.subheadingText}>
                        In a sentence
                      </Text>
                    </View>
                    {detailTerm.examples.map((example, index) => (
                      <View
                        key={index}
                        style={
                          index > 0 ? styles.exampleBlockSpacing : undefined
                        }
                      >
                        <Text style={styles.exampleText}>
                          &quot;{example.sentence}&quot;
                        </Text>
                        {example.context ? (
                          <Text
                            variant="muted"
                            style={styles.exampleContextText}
                          >
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
                  <PencilSimple
                    size={20}
                    weight="bold"
                    color={theme.colors.indigo}
                  />
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

      <Modal
        visible={flagDetail !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFlagDetail(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setFlagDetail(null)}>
          {flagDetail ? (
            <View style={styles.detailCard}>
              <Pressable
                onPress={() => setFlagDetail(null)}
                hitSlop={12}
                style={styles.closeButton}
              >
                <X size={20} weight="bold" color={theme.colors.textMuted} />
              </Pressable>

              <Text style={styles.detailTermText}>
                {flagDetail.term?.term ?? flagDetail.termSnapshot}
              </Text>
              {flagDetail.term ? (
                <Chip
                  label={flagDetail.term.language}
                  selected={false}
                  small
                  style={styles.detailChip}
                />
              ) : null}

              <ScrollView
                style={styles.detailScroll}
                showsVerticalScrollIndicator={false}
              >
                {flagDetail.term ? (
                  <>
                    <View style={styles.subheadingRow}>
                      <BookOpen
                        size={13}
                        weight="bold"
                        color={theme.colors.inkSoft}
                      />
                      <Text variant="muted" style={styles.subheadingText}>
                        Definition
                      </Text>
                    </View>
                    <Text style={styles.detailMeaning}>
                      {flagDetail.term.meaning}
                    </Text>

                    {flagDetail.term.examples &&
                    flagDetail.term.examples.length > 0 ? (
                      <>
                        <View style={styles.subheadingRow}>
                          <Quotes
                            size={13}
                            weight="bold"
                            color={theme.colors.inkSoft}
                          />
                          <Text variant="muted" style={styles.subheadingText}>
                            In a sentence
                          </Text>
                        </View>
                        {flagDetail.term.examples.map((example, index) => (
                          <View
                            key={index}
                            style={
                              index > 0 ? styles.exampleBlockSpacing : undefined
                            }
                          >
                            <Text style={styles.exampleText}>
                              &quot;{example.sentence}&quot;
                            </Text>
                            {example.context ? (
                              <Text
                                variant="muted"
                                style={styles.exampleContextText}
                              >
                                {example.context}
                              </Text>
                            ) : null}
                          </View>
                        ))}
                      </>
                    ) : null}
                  </>
                ) : (
                  <Text variant="muted">
                    This term may have already been deleted.
                  </Text>
                )}

                <View style={styles.subheadingRow}>
                  <FlagIcon
                    size={13}
                    weight="bold"
                    color={theme.colors.inkSoft}
                  />
                  <Text variant="muted" style={styles.subheadingText}>
                    Flag reason
                  </Text>
                </View>
                <Text style={styles.detailMeaning}>
                  {FLAG_REASON_LABEL[flagDetail.reason]}
                </Text>

                <Text variant="muted" style={styles.flagReporterText}>
                  Reported by {flagDetail.reporterName}
                </Text>
              </ScrollView>

              <View style={styles.flagDetailActionsRow}>
                <Button
                  label="Dismiss"
                  variant="secondary"
                  onPress={() => {
                    const flag = flagDetail;
                    setFlagDetail(null);
                    confirmDismiss(flag.id);
                  }}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  label="Delete"
                  variant="primary"
                  onPress={() => {
                    const flag = flagDetail;
                    setFlagDetail(null);
                    confirmDeleteFlaggedTerm(flag);
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}
