import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';

export default function AddTermScreen() {
  return (
    <View style={styles.container}>
      <Text variant="heading">Add a term</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: '#FFFFFF' },
});
