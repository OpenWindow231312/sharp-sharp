import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { safeBack } from "@/utils/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function EditNameScreen() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        const stored = snap.exists() ? snap.data().name : null;
        setName(stored || user.displayName || "");
      })
      .catch((error) => console.log("Load name error:", error))
      .finally(() => setIsLoaded(true));
  }, [user]);

  async function handleSave() {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Your name can't be empty.");
      return;
    }
    setIsSaving(true);
    setErrorMsg("");
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { name: trimmed },
        { merge: true },
      );
      safeBack("/settings");
    } catch (error) {
      console.log("Update name error:", error);
      setErrorMsg("Couldn't save. Check your connection and try again.");
      setIsSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader title="Name" backTo="/settings" />
        <Text variant="muted" style={{ marginBottom: theme.spacing.lg }}>
          This is how you appear on terms you add to the Feed.
        </Text>
        <Input
          label="Your name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoFocus={isLoaded}
          editable={isLoaded}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
        {errorMsg ? (
          <Text style={{ color: theme.colors.protea, marginBottom: 8 }}>
            {errorMsg}
          </Text>
        ) : null}
        <Button
          label={isSaving ? "Saving..." : "Save"}
          variant="primary"
          disabled={isSaving || !isLoaded || !name.trim()}
          onPress={handleSave}
          style={{ marginTop: theme.spacing.sm }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: { paddingHorizontal: theme.spacing.lg, paddingTop: 0 },
});
