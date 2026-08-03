import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

      <Button
        label="Create account"
        variant="primary"
        onPress={() => router.push('/onboarding')}
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
