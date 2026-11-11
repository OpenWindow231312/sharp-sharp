import { BadgeMedallion } from "@/components/ui/BadgeMedallion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SettingsGroup, SettingsRow } from "@/components/ui/SettingsRow";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { getLevelInfo, LEVELS } from "@/constants/levels";
import { MOCK_TERMS } from "@/constants/mockTerms";
import { useAuth } from "@/context/AuthContext";
import {
  TAB_BAR_CLEARANCE,
  useHideTabBarOnScroll,
} from "@/context/TabBarContext";
import { db } from "@/services/firebase";
import { getUserSubmittedTerms } from "@/services/slangTerms";
import { styles } from "@/styles/tabs/profile.styles";
import { getInitial } from "@/utils/initials";
import { useFocusEffect, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import {
  BookOpen,
  Bookmark,
  CaretRight,
  GearSix,
  GraduationCap,
  ShieldCheck,
} from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

// The profile is a summary, not a control panel. Everything you change
// lives behind the gear (Settings); everything you've made or saved is a
// row that opens its own screen.
export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const onScroll = useHideTabBarOnScroll();

  // Mock values seed the state directly so no effect has to set them.
  const [xp, setXp] = useState(USE_MOCK_DATA ? 35 : 0);
  const [savedCount, setSavedCount] = useState(USE_MOCK_DATA ? 3 : 0);
  const [learnedCount, setLearnedCount] = useState(USE_MOCK_DATA ? 1 : 0);
  const [addedCount, setAddedCount] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (USE_MOCK_DATA || !user) return;
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setXp(data.xp ?? 0);
        setSavedCount((data.savedTerms ?? []).length);
        setLearnedCount((data.learnedTerms ?? []).length);
        setIsAdmin(data.isAdmin === true);
        setName(data.name ?? null);
        setPhotoBase64(data.photoBase64 ?? null);
        setLanguages(Array.isArray(data.languages) ? data.languages : []);
      },
      (error) => console.log("Profile listener error:", error),
    );
    return unsubscribe;
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (USE_MOCK_DATA) {
        setAddedCount(MOCK_TERMS.length);
        return;
      }
      if (!user) return;
      getUserSubmittedTerms(user.uid)
        .then((terms) => setAddedCount(terms.length))
        .catch((error) => console.log("Count my terms error:", error));
    }, [user]),
  );

  const displayName = name || user?.displayName || "Sharp Sharp user";
  const levelInfo = getLevelInfo(xp);
  const level = LEVELS[levelInfo.level - 1];
  const nextLevel = LEVELS[levelInfo.level];
  const nextLine = nextLevel
    ? `${nextLevel.threshold - xp} XP to ${nextLevel.title}`
    : "Top tier reached";
  const languagesLine =
    languages.length === 0
      ? "All languages"
      : languages.length <= 2
        ? languages.join(" and ")
        : `${languages.slice(0, 2).join(", ")} and ${languages.length - 2} more`;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: TAB_BAR_CLEARANCE },
      ]}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.titleRow}>
        <Text variant="display" style={styles.title}>
          Profile
        </Text>
        <Pressable
          onPress={() => router.push("/settings")}
          hitSlop={8}
          style={styles.gearButton}
          accessibilityLabel="Settings"
        >
          <GearSix size={24} weight="bold" color={theme.colors.ink} />
        </Pressable>
      </View>

      <View style={styles.identityRow}>
        <View style={styles.avatar}>
          {photoBase64 ? (
            <Image source={{ uri: photoBase64 }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>
              {getInitial(name, user?.displayName, user?.email)}
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text variant="muted" style={styles.subline} numberOfLines={1}>
            Learning {languagesLine}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/levels")}
        style={({ pressed }) => [styles.levelCard, pressed && { opacity: 0.9 }]}
      >
        <View style={styles.levelTop}>
          <BadgeMedallion
            variant={level.pattern}
            shape={level.shape}
            unlocked
            size={48}
          />
          <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
            <Text variant="muted" style={styles.levelLabel}>
              Current level
            </Text>
            <Text style={styles.levelTitle}>{level.title}</Text>
          </View>
          <CaretRight size={18} weight="bold" color={theme.colors.textMuted} />
        </View>
        <ProgressBar progress={levelInfo.progress} />
        <View style={styles.levelBottom}>
          <Text variant="muted" style={styles.levelMeta}>
            {xp} XP
          </Text>
          <Text variant="muted" style={styles.levelMeta}>
            {nextLine}
          </Text>
        </View>
      </Pressable>

      <SettingsGroup title="Your words">
        <SettingsRow
          icon={BookOpen}
          label="Terms you added"
          value={addedCount === null ? "" : String(addedCount)}
          onPress={() => router.push("/my-terms")}
        />
        <SettingsRow
          icon={Bookmark}
          label="Saved to dictionary"
          value={String(savedCount)}
          onPress={() => router.push("/(tabs)/saved")}
        />
        <SettingsRow
          icon={GraduationCap}
          label="Studied in dictionary mode"
          value={String(learnedCount)}
          trailing="none"
          isLast
        />
      </SettingsGroup>

      {isAdmin ? (
        <SettingsGroup title="Admin">
          <SettingsRow
            icon={ShieldCheck}
            label="Control Center"
            onPress={() => router.push("/admin")}
            isLast
          />
        </SettingsGroup>
      ) : null}
    </ScrollView>
  );
}
