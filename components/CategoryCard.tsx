import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  label: string;
  icon: string;
  gradient: readonly [string, string];
  count?: number;
  onPress: () => void;
  selected?: boolean;
};

export default function CategoryCard({ label, icon, gradient, count, onPress, selected }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}
      style={{ width: '47%', margin: '1.5%', borderRadius: 22, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 }}>
      <LinearGradient colors={[gradient[0], gradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ padding: 20, minHeight: 120, justifyContent: 'flex-end', gap: 6, opacity: selected ? 0.7 : 1 }}>
        {selected && (
          <View style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
        <Ionicons name={icon as any} size={28} color="rgba(255,255,255,0.9)" />
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{label}</Text>
        {count !== undefined && <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500' }}>{count} quotes</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}
