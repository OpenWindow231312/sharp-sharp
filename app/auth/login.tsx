import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { auth } from "@/services/firebase";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { Link, useRouter } from "expo-router";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useId, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import Svg, { Defs, Line, Pattern, Rect } from "react-native-svg";
import { styles } from "@/styles/auth/login.styles";

// Same hairline texture used for the Indigo colorway in
// components/ui/SwipeCard.tsx's per-term card system, copied inline since
// that component doesn't export its pattern-rendering pieces.
function LoginTexture() {
  const id = `login-hairline-${useId()}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={4}
          height={4}
          patternTransform="rotate(115)"
        >
          <Line
            x1={0}
            y1={0}
            x2={0}
            y2={4}
            stroke="white"
            strokeOpacity={0.035}
            strokeWidth={1}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

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
      <LoginTexture />
      <View style={styles.header}>
        <View style={styles.wordmark}>
          <Text style={[styles.wordmarkLine, styles.wordmarkWhite]}>
            Sharp
          </Text>
          <Text style={[styles.wordmarkLine, styles.wordmarkMarigold]}>
            Sharp
          </Text>
        </View>
        <Text style={styles.tagline}>Real slang. Real South Africa.</Text>
      </View>

      <View style={styles.card}>
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
    </View>
  );
}
