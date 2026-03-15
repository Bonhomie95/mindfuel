import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getCategoryGradient, getCategoryLabel, type CategoryKey } from '../assets/data/categoryColors';
import { useFavorites } from '../hooks/useFavorites';

type Props = {
  id: string;
  text: string;
  author?: string;
  category?: CategoryKey;
  onPress?: () => void;
  onJournal?: () => void;
};

export default function QuoteCardCompact({ id, text, author, category = 'default', onPress, onJournal }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(id);
  const gradient = getCategoryGradient(category as CategoryKey);
  const label = getCategoryLabel(category as CategoryKey);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullText = author ? `"${text}" — ${author}` : `"${text}"`;
    await Clipboard.setStringAsync(fullText);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}
      style={{ marginHorizontal: 16, marginVertical: 8, borderRadius: 22, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}>
      <LinearGradient colors={[gradient[0], gradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ padding: 20, minHeight: 140, gap: 8 }}>
        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 }}>{label.toUpperCase()}</Text>
        </View>
        <Text style={{ fontSize: 16, color: '#fff', fontWeight: '500', lineHeight: 24, flex: 1 }} numberOfLines={3}>{text}</Text>
        {author && <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>— {author}</Text>}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <TouchableOpacity onPress={() => { toggleFavorite(id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); }} style={{ padding: 4 }}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#FF6B8A' : 'rgba(255,255,255,0.7)'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCopy} style={{ padding: 4 }}>
            <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={20} color={copied ? '#34D399' : 'rgba(255,255,255,0.7)'} />
          </TouchableOpacity>
          {onJournal && (
            <TouchableOpacity onPress={onJournal} style={{ padding: 4 }}>
              <Ionicons name="pencil-outline" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
