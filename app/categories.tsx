import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { categoryColors, CategoryKey } from '../assets/data/categoryColors';
import CategoryButton from '../components/CategoryButton';

export default function CategoriesScreen() {
  const router = useRouter();

  const categories: { key: CategoryKey; label: string }[] = [
    { key: 'morning', label: 'Morning Boost' },
    { key: 'discipline', label: 'Discipline' },
    { key: 'self_love', label: 'Self Love' },
    { key: 'anxiety', label: 'Anxiety Relief' },
    { key: 'success', label: 'Success Mindset' },
  ];

  return (
    <View style={styles.container}>
      {categories.map((cat) => (
        <CategoryButton
          key={cat.key}
          title={cat.label}
          colors={categoryColors[cat.key]}
          onPress={() =>
            router.push({ pathname: '/', params: { category: cat.key } })
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
});
