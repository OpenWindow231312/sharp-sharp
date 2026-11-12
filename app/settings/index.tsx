import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SettingsGroup, SettingsRow } from "@/components/ui/SettingsRow";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/services/firebase";
import { showAlert } from "@/utils/alert";
import { getInitial } from "@/utils/initials";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import {
  Camera,
  EnvelopeSimple,
  SignOut,
  Translate,
  Trophy,
  UserCircle,
} from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (USE_MOCK_DATA || !user) return;
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setName(data.name ?? null);
        setPhotoBase64(data.photoBase64 ?? null);
        setLanguages(Array.isArray(data.languages) ? data.languages : []);
      },
      (error) => console.log("Settings listener error:", error),
    );
    return unsubscribe;
  }, [user]);

  async function handlePickPhoto() {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert(
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
      // Stored inline on the user doc (no Storage bucket on the free plan).
      await setDoc(
        doc(db, "users", user.uid),
        { photoBase64: `data:image/jpeg;base64,${manipulated.base64}` },
        { merge: true },
      );
    } catch (error) {
      console.log("Photo upload error:", error);
      showAlert(
        "Couldn't update photo",
        "Check your connection and try again.",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function confirmLogout() {
    showAlert("Log out?", "You'll need your password to get back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: handleLogout },
    ]);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.replace("/auth/login");
    } catch (error) {
      console.log("Logout error:", error);
      setIsLoggingOut(false);
    }
  }

  const displayName = name || user?.displayName || "";
  const languagesValue =
    languages.length === 0
      ? "All"
      : languages.length === 1
        ? languages[0]
        : `${languages.length} picked`;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Settings" />

      <Pressable
        onPress={handlePickPhoto}
        disabled={isUploadingPhoto}
        style={styles.photoBlock}
      >
        <View style={styles.avatar}>
          {isUploadingPhoto ? (
            <ActivityIndicator color={theme.colors.primaryText} />
          ) : photoBase64 ? (
            <Image source={{ uri: photoBase64 }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>
              {getInitial(name, user?.displayName, user?.email)}
            </Text>
          )}
          <View style={styles.cameraBadge}>
            <Camera size={14} weight="bold" color={theme.colors.primaryText} />
          </View>
        </View>
        <Text variant="muted" style={styles.photoHint}>
          {isUploadingPhoto ? "Uploading..." : "Tap to change photo"}
        </Text>
      </Pressable>

      <SettingsGroup title="Account">
        <SettingsRow
          icon={UserCircle}
          label="Name"
          value={displayName}
          onPress={() => router.push("/settings/name")}
        />
        <SettingsRow
          icon={EnvelopeSimple}
          label="Email"
          value={user?.email ?? ""}
          trailing="none"
          isLast
        />
      </SettingsGroup>

      <SettingsGroup title="Learning">
        <SettingsRow
          icon={Translate}
          label="Languages"
          value={languagesValue}
          onPress={() => router.push("/settings/languages")}
        />
        <SettingsRow
          icon={Trophy}
          label="How levels work"
          onPress={() => router.push("/levels")}
          isLast
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={SignOut}
          label={isLoggingOut ? "Logging out..." : "Log out"}
          onPress={isLoggingOut ? undefined : confirmLogout}
          trailing="none"
          destructive
          isLast
        />
      </SettingsGroup>

      <Text variant="muted" style={styles.version}>
        Sharp Sharp 1.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 0,
    paddingBottom: theme.spacing.xxl,
  },
  photoBlock: { alignItems: "center", marginBottom: theme.spacing.xl },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarInitial: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 38,
    color: theme.colors.primaryText,
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.indigoDeep,
    borderWidth: 3,
    borderColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  photoHint: { fontSize: 12, marginTop: theme.spacing.sm },
  version: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
});
