import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Text variant="heading">My learning list</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: '#FFFFFF' },
});
