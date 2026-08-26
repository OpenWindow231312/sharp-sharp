import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { auth, db } from "@/services/firebase";
import { getAuthErrorMessage } from "@/utils/authErrors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useId, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { styles } from "@/styles/auth/signup.styles";

// Same ndebele texture used for the Highveld colorway in
// components/ui/SwipeCard.tsx's per-term card system, copied inline since
// that component doesn't export its pattern-rendering pieces.
function SignupTexture() {
  const id = `signup-ndebele-${useId()}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={48}
          height={24}
        >
          <Path d="M0 24 L12 0 L24 24 Z" fill="white" fillOpacity={0.07} />
          <Path d="M24 24 L36 0 L48 24 Z" fill="white" fillOpacity={0.07} />
          <Path d="M0 0 L12 24 L24 0 Z" fill="white" fillOpacity={0.045} />
          <Path d="M24 0 L36 24 L48 0 Z" fill="white" fillOpacity={0.045} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignup() {
    setErrorMsg("");

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Please enter your first and last name.");
      return;
    }
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password should be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const displayName = `${firstName.trim()} ${lastName.trim()}`;

      // Sets Auth's displayName so it's instantly available anywhere via
      // auth.currentUser.displayName, with no extra Firestore read needed
      await updateProfile(userCredential.user, { displayName });

      // Mirrors the same info into a proper Firestore profile doc — this is
      // the durable, queryable, editable version (e.g. for a future
      // "edit your name" screen), separate from Auth's displayName
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      const hasCompletedOnboarding = await AsyncStorage.getItem(
        "hasCompletedOnboarding",
      );
      router.replace(
        hasCompletedOnboarding === "true"
          ? "/(tabs)/feed"
          : "/onboarding/story",
      );
    } catch (error) {
      setErrorMsg(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <SignupTexture />
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
        <Text variant="display" style={styles.cardHeading}>
          Get started
        </Text>
        <Input
          label="First name"
          placeholder="Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Input
          label="Last name"
          placeholder="Surname"
          value={lastName}
          onChangeText={setLastName}
        />
        <Input
          label="Email"
          placeholder="your.email@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Password"
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {errorMsg ? (
          <Text style={{ color: theme.colors.protea, marginBottom: 8 }}>
            {errorMsg}
          </Text>
        ) : null}

        <Button
          label={isLoading ? "Creating account..." : "Create account"}
          variant="primary"
          disabled={isLoading}
          onPress={handleSignup}
          style={{ marginTop: 8, marginBottom: 16 }}
        />
        <Link href="/auth/login">
          <Text variant="muted">
            Already in?{" "}
            <Text style={{ fontFamily: theme.fonts.bodySemibold }}>
              Log in
            </Text>
          </Text>
        </Link>
      </View>
    </View>
  );
}
