import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getAuthErrorMessage } from '@/utils/authErrors';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSignup() {
    setErrorMsg('');

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
      await createUserWithEmailAndPassword(auth, email.trim(), password);
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
        <Text style={{ color: '#C0392B', marginBottom: 8 }}>{errorMsg}</Text>
      ) : null}
      <Button
        label={isLoading ? 'Creating account...' : 'Create account'}
        variant="primary"
        disabled={isLoading}
        onPress={handleSignup}
        style={{ marginTop: 8, marginBottom: 16 }}
      />
      <Link href="/auth/login">
        <Text variant="muted">Already in? <Text style={{ fontWeight: '600' }}>Log in</Text></Text>
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 100,
    backgroundColor: '#FFFFFF',
  },
});
