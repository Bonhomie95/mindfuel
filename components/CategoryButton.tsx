import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GradientTuple } from '../assets/data/categoryColors';

type Props = {
  title: string;
  colors: GradientTuple;
  onPress: () => void;
};

export default function CategoryButton({ title, colors, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.wrapper}>
      <LinearGradient colors={colors} style={styles.btn}>
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 10 },
  btn: { padding: 20, borderRadius: 15 },
  text: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
