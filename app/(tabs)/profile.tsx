import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { getLevelInfo } from "@/constants/levels";
import { MOCK_TERMS } from "@/constants/mockTerms";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/services/firebase";
import { deleteSlangTerm, getUserSubmittedTerms } from "@/services/slangTerms";
import type { SlangTerm } from "@/types/slangTerm";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { Trash } from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";

type Tab = "overview" | "myTerms";

function getInitial(nameOrEmail: string | null | undefined): string {
  const trimmed = (nameOrEmail ?? "").trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [xp, setXp] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  const [myTerms, setMyTerms] = useState<SlangTerm[]>([]);
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setXp(35);
      setSavedCount(3);
      return;
    }
    if (!user) return;
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setXp(data.xp ?? 0);
        setSavedCount((data.savedTerms ?? []).length);
      },
      (error) => console.log("Profile stats listener error:", error),
    );
    return unsubscribe;
  }, [user]);

  const loadMyTerms = useCallback(() => {
    if (USE_MOCK_DATA) {
      setMyTerms(MOCK_TERMS);
      setIsLoadingTerms(false);
      return;
    }
    if (!user) return;
    setIsLoadingTerms(true);
    getUserSubmittedTerms(user.uid)
      .then(setMyTerms)
      .catch((error) => console.log("Load my terms error:", error))
      .finally(() => setIsLoadingTerms(false));
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadMyTerms();
    }, [loadMyTerms]),
  );

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.replace("/auth/login");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  function openTerm(termId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          onPress: () => handleDeleteTerm(term.id),
        },
      ],
    );
  }

  async function handleDeleteTerm(termId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMyTerms((prev) => prev.filter((t) => t.id !== termId));
    if (USE_MOCK_DATA) return;
    try {
      await deleteSlangTerm(termId);
    } catch (error) {
      console.log("Delete term error:", error);
      loadMyTerms();
    }
  }

  const levelInfo = getLevelInfo(xp);
  const displayName = user?.displayName || user?.email || "Sharp Sharp user";

  return (
    <View style={styles.container}>
      <Text variant="display" style={{ marginBottom: 24 }}>
        Profile
      </Text>

      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {getInitial(user?.displayName || user?.email)}
          </Text>
        </View>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Text
            style={{ fontFamily: theme.fonts.bodyBold, fontSize: 17 }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text variant="muted" numberOfLines={1}>
            {user?.email}
          </Text>
          <Pressable disabled hitSlop={8} style={{ marginTop: 4 }}>
            <Text
              variant="muted"
              style={{ fontSize: 12, textDecorationLine: "underline" }}
            >
              Change photo (coming soon)
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab("overview")}
          style={[
            styles.tabButton,
            activeTab === "overview" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={{
              fontFamily: theme.fonts.bodySemibold,
              color:
                activeTab === "overview"
                  ? theme.colors.primaryText
                  : theme.colors.secondaryText,
            }}
          >
            Overview
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("myTerms")}
          style={[
            styles.tabButton,
            activeTab === "myTerms" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={{
              fontFamily: theme.fonts.bodySemibold,
              color:
                activeTab === "myTerms"
                  ? theme.colors.primaryText
                  : theme.colors.secondaryText,
            }}
          >
            My Terms{myTerms.length > 0 ? ` (${myTerms.length})` : ""}
          </Text>
        </Pressable>
      </View>

      {activeTab === "overview" ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card style={{ marginBottom: 16 }}>
            <View style={styles.levelRow}>
              <Text style={{ fontFamily: theme.fonts.bodyBold }}>
                {levelInfo.title}
              </Text>
              <Text variant="muted">{xp} XP</Text>
            </View>
            <ProgressBar progress={levelInfo.progress} />
            <Text variant="muted" style={{ marginTop: 8, fontSize: 12 }}>
              {levelInfo.isMaxLevel
                ? "You've hit the top level — Slang Master!"
                : `${levelInfo.xpForNextLevel - levelInfo.xpIntoLevel} XP to next level`}
            </Text>
          </Card>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{myTerms.length}</Text>
              <Text variant="muted" style={{ fontSize: 12 }}>
                Terms added
              </Text>
            </Card>
            <Card style={[styles.statCard, { marginLeft: 12 }]}>
              <Text style={styles.statNumber}>{savedCount}</Text>
              <Text variant="muted" style={{ fontSize: 12 }}>
                Terms saved
              </Text>
            </Card>
          </View>

          <Button
            label={isLoggingOut ? "Logging out..." : "Log out"}
            variant="secondary"
            disabled={isLoggingOut}
            onPress={handleLogout}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {isLoadingTerms ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={{ marginTop: 40 }}
            />
          ) : myTerms.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text variant="heading" style={{ marginBottom: 8 }}>
                Nothing here yet
              </Text>
              <Text variant="muted">
                Terms you submit in Add will show up here.
              </Text>
            </Card>
          ) : (
            myTerms.map((term) => (
              <Animated.View
                key={term.id}
                entering={FadeIn}
                exiting={FadeIn}
                layout={Layout.springify()}
              >
                <Card style={styles.termCard}>
                  <View style={styles.cardTop}>
                    <Chip label={term.language} selected={false} small />
                    <Pressable
                      onPress={() => confirmDeleteTerm(term)}
                      hitSlop={10}
                      style={styles.deleteIconButton}
                    >
                      <Trash size={20} color={theme.colors.protea} />
                    </Pressable>
                  </View>
                  {/* This Pressable is now a SIBLING of the delete button above,
                      not a parent wrapping it — that's the fix. Their touch
                      zones no longer overlap, so tapping Trash can never also
                      trigger navigation. */}
                  <Pressable onPress={() => openTerm(term.id)}>
                    <Text style={styles.termText}>{term.term}</Text>
                    <Text variant="muted" numberOfLines={2}>
                      {term.meaning}
                    </Text>
                  </Pressable>
                </Card>
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
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
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 26,
    color: theme.colors.primaryText,
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
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statsRow: { flexDirection: "row" },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 20 },
  statNumber: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 28,
    color: theme.colors.text,
  },
  emptyCard: { alignItems: "center", padding: 32 },
  termCard: { marginBottom: 12 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  deleteIconButton: { padding: 4 },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 4,
  },
});
