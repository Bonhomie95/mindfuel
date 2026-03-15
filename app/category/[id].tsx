import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { categoryMeta, type CategoryKey } from '../../assets/data/categoryColors';
import QuoteCard from '../../components/QuoteCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuotes } from '../../hooks/useQuotes';

function DotIndicators({ total, current, theme }: { total: number; current: number; theme: any }) {
  const visible = Math.min(total, 7); // show max 7 dots for long categories
  const start = Math.max(0, Math.min(current - 3, total - visible));
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingVertical: 8 }}>
      {Array.from({ length: visible }).map((_, i) => {
        const idx = start + i;
        return (
          <View key={idx} style={{
            width: idx === current ? 16 : 6,
            height: 6,
            borderRadius: 999,
            backgroundColor: idx === current ? theme.colors.primary : theme.colors.border,
          }} />
        );
      })}
    </View>
  );
}

export default function CategoryFeedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const category = id as CategoryKey;
  const meta = categoryMeta[category] ?? categoryMeta.default;
  const { quotes } = useQuotes(category);
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <LinearGradient colors={[meta.gradient[0] + 'AA', theme.colors.bg]} style={{ paddingBottom: 4 }}>
        <SafeAreaView>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999 }}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name={meta.icon as any} size={22} color="#fff" />
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>{meta.label}</Text>
            </View>
            {/* No count shown — just the category name */}
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <DotIndicators total={quotes.length} current={currentPage} theme={theme} />

      {quotes.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textSub, fontSize: 16 }}>No quotes in this category yet.</Text>
        </View>
      ) : (
        <PagerView
          style={{ flex: 1 }}
          orientation="horizontal"
          onPageSelected={(e) => {
            setCurrentPage(e.nativeEvent.position);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          {quotes.map((q) => (
            <QuoteCard
              key={q.id}
              id={q.id}
              text={q.text}
              author={q.author}
              category={q.category as CategoryKey}
            />
          ))}
        </PagerView>
      )}
    </View>
  );
}
