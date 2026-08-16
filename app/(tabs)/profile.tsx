import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await signOut(auth);
      // Explicitly navigate to login instead of relying on app/index.tsx —
      // that screen only redirects based on auth state while it's actually
      // mounted, which is only true right when the app first opens. Once
      // we've navigated into (tabs), it's gone from the stack and isn't
      // watching anything anymore, so without this line the user was left
      // stuck on Profile after a successful logout with no way forward.
      router.replace("/auth/login");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      // Moved out of the catch block so this always runs, success or not —
      // previously a successful logout never reset this, leaving the
      // button stuck on "Logging out..." even though the user was already
      // signed out behind the scenes.
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="heading" style={{ marginBottom: 4 }}>
        Profile
      </Text>
      <Text variant="muted" style={{ marginBottom: 32 }}>
        {user?.email ?? "Not signed in"}
      </Text>
      <Button
        label={isLoading ? "Logging out..." : "Log out"}
        variant="secondary"
        disabled={isLoading}
        onPress={handleLogout}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: theme.colors.background,
  },
});
