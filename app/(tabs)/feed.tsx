import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="display">Sharp Sharp</Text>
      <Text variant="muted" style={{ marginBottom: 24 }}>
        Design system test screen
      </Text>

      <Card style={{ marginBottom: 16 }}>
        <Text variant="heading">Eish</Text>
        <Text variant="muted">An exclamation of surprise or disbelief.</Text>
      </Card>

      <Button label="Primary button" variant="primary" onPress={() => {}} style={{ marginBottom: 12 }} />
      <Button label="Secondary button" variant="secondary" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#FFFFFF',
  },
});
