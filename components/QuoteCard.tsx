import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { categoryColors, CategoryKey } from '../assets/data/categoryColors';
import { useFavorites } from '../hooks/useFavorites';

type Props = {
  id: string;
  text: string;
  category?: CategoryKey;
};

export default function QuoteCard({ id, text, category = 'default' }: Props) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFav = favorites.includes(id);
  const cardRef = useRef<View>(null);
  const shareQuote = async () => {
    try {
      if (!cardRef.current) return;

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });

      const fileUri = `${FileSystem.Paths.cache}quote-${id}.png`;

      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      await Sharing.shareAsync(fileUri);
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const gradient = categoryColors[category];

  return (
    <LinearGradient colors={gradient} style={styles.card}>
      <View ref={cardRef} style={styles.inner}>
        <Text style={styles.quote}>{text}</Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => toggleFavorite(id)}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={28}
              color={isFav ? '#ff4d6d' : '#fff'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={shareQuote}>
            <Ionicons name="share-social-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 20, borderRadius: 20, overflow: 'hidden' },
  inner: { flex: 1, justifyContent: 'center', padding: 30 },
  quote: {
    fontSize: 24,
    textAlign: 'center',
    color: '#fff',
    lineHeight: 34,
    marginBottom: 40,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
});
