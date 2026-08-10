import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/designTheme';
import { getAuthErrorMessage } from '@/utils/authErrors';

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSignup() {
    setErrorMsg('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter your first and last name.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const displayName = `${firstName.trim()} ${lastName.trim()}`;

      // Sets Auth's displayName so it's instantly available anywhere via
      // auth.currentUser.displayName, with no extra Firestore read needed
      await updateProfile(userCredential.user, { displayName });

      // Mirrors the same info into a proper Firestore profile doc — this is
      // the durable, queryable, editable version (e.g. for a future
      // "edit your name" screen), separate from Auth's displayName
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
      }, { merge: true });

      router.replace('/onboarding');
    } catch (error) {
      setErrorMsg(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="display" style={{ marginBottom: 4 }}>Join in</Text>
      <Text variant="muted" style={{ marginBottom: 32 }}>Create your account to start learning.</Text>

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
        <Text style={{ color: theme.colors.protea, marginBottom: 8 }}>{errorMsg}</Text>
      ) : null}

      <Button
        label={isLoading ? 'Creating account...' : 'Create account'}
        variant="primary"
        disabled={isLoading}
        onPress={handleSignup}
        style={{ marginTop: 8, marginBottom: 16 }}
      />
      <Link href="/auth/login">
        <Text variant="muted">
          Already in? <Text style={{ fontFamily: theme.fonts.bodySemibold }}>Log in</Text>
        </Text>
      </Link>
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
});
