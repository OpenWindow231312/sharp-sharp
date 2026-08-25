import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { auth } from "@/services/firebase";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { Link, useRouter } from "expo-router";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  async function handleLogin() {
    setErrorMsg("");
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)/feed");
    } catch (error) {
      setErrorMsg(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }
  function handleForgotPassword() {
    Alert.prompt(
      "Reset password",
      "Enter your email address and we'll send you a reset link.",
      async (inputEmail) => {
        const targetEmail = (inputEmail ?? "").trim();
        if (!targetEmail) return;
        try {
          await sendPasswordResetEmail(auth, targetEmail);
        } catch (error) {
          console.log("Password reset error:", error);
        } finally {
          Alert.alert(
            "Check your email",
            "If an account exists for this email, a reset link has been sent.",
          );
        }
      },
      "plain-text",
      email.trim(),
    );
  }
  return (
    <View style={styles.container}>
      <Text variant="display" style={{ marginBottom: 4 }}>
        Sharp Sharp
      </Text>
      <Text variant="muted" style={{ marginBottom: 32 }}>
        Real slang. Real South Africa.
      </Text>
      <Input
        label="Email"
        placeholder="your@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable
        onPress={handleForgotPassword}
        style={{ alignSelf: "flex-end", marginBottom: 16 }}
      >
        <Text variant="muted" style={{ textDecorationLine: "underline" }}>
          Forgot password?
        </Text>
      </Pressable>
      {errorMsg ? (
        <Text style={{ color: theme.colors.protea, marginBottom: 8 }}>
          {errorMsg}
        </Text>
      ) : null}
      <Button
        label={isLoading ? "Logging in..." : "Let's go"}
        variant="primary"
        disabled={isLoading}
        onPress={handleLogin}
        style={{ marginTop: 8, marginBottom: 16 }}
      />
      <View style={styles.footer}>
        <Text variant="muted">Don't have an account? </Text>
        <Link href="/auth/signup">
          <Text style={{ textDecorationLine: "underline" }}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 100,
    backgroundColor: theme.colors.background,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
