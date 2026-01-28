import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function IconButton({
  name,
  onPress,
  color = '#fff',
}: {
  name: any;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Ionicons name={name} size={26} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 10 },
});
