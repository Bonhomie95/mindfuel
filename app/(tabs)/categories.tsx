import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryMeta, type CategoryKey } from '../../assets/data/categoryColors';
import rawQuotes from '../../assets/data/quotes.json';
import CategoryCard from '../../components/CategoryCard';
import { useTheme } from '../../contexts/ThemeContext';

const quotesData = rawQuotes as { id: string; text: string; category: string }[];
function countByCategory(key: string) {
  return quotesData.filter((q) => q.category === key).length;
}

const CATEGORIES = Object.entries(categoryMeta)
  .filter(([k]) => k !== 'default')
  .map(([key, meta]) => ({ key: key as CategoryKey, ...meta, count: countByCategory(key) }))
  .sort((a, b) => b.count - a.count);

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <SafeAreaView>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 }}>Explore</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSub, marginTop: 4 }}>
            {CATEGORIES.length} categories to fuel your mind
          </Text>
        </View>
      </SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 }}>
          {CATEGORIES.map(({ key, label, gradient, icon, count }) => (
            <CategoryCard
              key={key} label={label} icon={icon} gradient={gradient} count={count}
              onPress={() => router.push({ pathname: '/category/[id]', params: { id: key } })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
