import { BadgeMedallion } from "@/components/ui/BadgeMedallion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { LEVELS } from "@/constants/levels";
import { MOCK_TERMS } from "@/constants/mockTerms";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/services/firebase";
import { deleteSlangTerm, getUserSubmittedTerms } from "@/services/slangTerms";
import type { SlangTerm } from "@/types/slangTerm";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { PencilSimple, Trash } from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { styles } from "@/styles/tabs/profile.styles";

type Tab = "overview" | "myTerms";

// Placeholder copy for now — no real per-level unlock mechanics exist yet.
const LEVEL_UNLOCK_TEXT: Record<string, string> = {
  "Eish!": "Just getting started — keep swiping to earn XP.",
  Ubuntu: "You're learning the community's words.",
  Lekker: "Solid progress — you're getting the hang of this.",
  Ayoba: "You know your stuff. Keep going.",
  "Local Legend": "You've earned real street cred.",
  "Sharp Sharp": "Maximum level. You're fluent in the culture.",
};

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
  const [learnedCount, setLearnedCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const [myTerms, setMyTerms] = useState<SlangTerm[]>([]);
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setXp(35);
      setSavedCount(3);
      setLearnedCount(1);
      return;
    }
    if (!user) return;
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

  async function handlePickPhoto() {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to set a profile photo.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (result.canceled || !result.assets[0]) return;

    setIsUploadingPhoto(true);
    try {
      const manipulated = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 200, height: 200 } }],
        { compress: 0.7, format: SaveFormat.JPEG, base64: true },
      );
      if (!manipulated.base64) {
        throw new Error("No base64 data returned from image manipulator.");
      }
      const dataUri = `data:image/jpeg;base64,${manipulated.base64}`;
      // Same users/{uid} merge-write pattern as services/xp.ts and
      // services/savedTerms.ts, for consistency with how this doc is
      // updated elsewhere.
      await setDoc(
        doc(db, "users", user.uid),
        { photoBase64: dataUri },
        { merge: true },
      );
    } catch (error) {
      console.log("Photo upload error:", error);
      Alert.alert(
        "Couldn't update photo",
        "Check your connection and try again.",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function handleEditName() {
    if (!user) return;
    Alert.prompt(
      "Edit name",
      "Enter your name.",
      async (inputName) => {
        const trimmed = (inputName ?? "").trim();
        if (!trimmed) return;
        try {
          await setDoc(
            doc(db, "users", user.uid),
            { name: trimmed },
            { merge: true },
          );
        } catch (error) {
          console.log("Update name error:", error);
          Alert.alert(
            "Couldn't update name",
            "Check your connection and try again.",
          );
        }
      },
      "plain-text",
      displayName,
    );
  }

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

  const displayName =
    name || user?.displayName || user?.email || "Sharp Sharp user";

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginTop: 16, marginBottom: 24 }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {isUploadingPhoto ? (
            <ActivityIndicator size="small" color={theme.colors.primaryText} />
          ) : photoBase64 ? (
            <Image
              source={{ uri: photoBase64 }}
              style={{ width: 120, height: 120, borderRadius: 60 }}
            />
          ) : (
            <Text
              style={{
                fontFamily: theme.fonts.displayExtraBold,
                fontSize: 44,
                color: theme.colors.primaryText,
              }}
            >
              {getInitial(displayName)}
            </Text>
          )}
        </View>

        <Pressable
          onPress={handlePickPhoto}
          disabled={isUploadingPhoto}
          hitSlop={8}
          style={{ marginTop: 8 }}
        >
          <Text
            variant="muted"
            style={{ fontSize: 12, textDecorationLine: "underline" }}
          >
            {isUploadingPhoto ? "Uploading..." : "Change photo"}
          </Text>
        </Pressable>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <Text
            style={{ fontFamily: theme.fonts.bodyBold, fontSize: 17 }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Pressable onPress={handleEditName} hitSlop={8} style={{ marginLeft: 6 }}>
            <PencilSimple size={16} color={theme.colors.textMuted} />
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
          {isAdmin ? (
            <Button
              label="Control Center"
              variant="secondary"
              onPress={() => router.push("/admin")}
              style={{ marginBottom: 16 }}
            />
          ) : null}

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
            <Card style={[styles.statCard, { marginLeft: 12 }]}>
              <Text style={styles.statNumber}>{learnedCount}</Text>
              <Text variant="muted" style={{ fontSize: 12 }}>
                Terms learned
              </Text>
            </Card>
          </View>

          <Text variant="heading" style={{ marginTop: 24, marginBottom: 12 }}>
            Levels
          </Text>
          <View style={{ gap: 10 }}>
            {LEVELS.map((level) => {
              const unlocked = xp >= level.threshold;
              const isExpanded = expandedLevel === level.title;
              return (
                <Pressable
                  key={level.title}
                  onPress={() =>
                    setExpandedLevel(isExpanded ? null : level.title)
                  }
                >
                  <Card>
                    <View style={styles.levelListRow}>
                      <BadgeMedallion
                        variant={level.pattern}
                        shape={level.shape}
                        unlocked={unlocked}
                        size={44}
                      />
                      <Text style={styles.levelListTitle}>{level.title}</Text>
                    </View>
                    {isExpanded ? (
                      <Text variant="muted" style={styles.levelUnlockText}>
                        {LEVEL_UNLOCK_TEXT[level.title]}
                      </Text>
                    ) : null}
                  </Card>
                </Pressable>
              );
            })}
          </View>

          <Button
            label={isLoggingOut ? "Logging out..." : "Log out"}
            variant="secondary"
            disabled={isLoggingOut}
            onPress={handleLogout}
            style={{ marginTop: 8, marginBottom: 24 }}
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
