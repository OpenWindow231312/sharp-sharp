import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/designTheme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await signOut(auth);
      // No manual navigation needed here — app/index.tsx watches auth
      // state via useAuth() and redirects to /auth/login automatically
      // the moment `user` becomes null.
    } catch (error) {
      console.log('Logout error:', error);
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="heading" style={{ marginBottom: 4 }}>Profile</Text>
      <Text variant="muted" style={{ marginBottom: 32 }}>
        {user?.email ?? 'Not signed in'}
      </Text>

      <Button
        label={isLoading ? 'Logging out...' : 'Log out'}
        variant="secondary"
        disabled={isLoading}
        onPress={handleLogout}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: theme.colors.background },
});
