import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { getCategoryGradient, getCategoryLabel, type CategoryKey } from '../assets/data/categoryColors';
import { theme } from '../constants/theme';
import { useFavorites } from '../hooks/useFavorites';

type Props = {
  id: string;
  text: string;
  author?: string;
  category?: CategoryKey;
  onJournal?: () => void;
  isQOTD?: boolean;
};

export default function QuoteCard({ id, text, author, category = 'default', onJournal, isQOTD }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(id);
  const cardRef = useRef<View>(null);
  const heartScale = useRef(new Animated.Value(1)).current;
  const [sharing, setSharing] = useState(false);

  const gradient = getCategoryGradient(category as CategoryKey);
  const label = getCategoryLabel(category as CategoryKey);

  const handleHeart = async () => {
    await toggleFavorite(id);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 50 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  };

  const handleShare = async () => {
    if (sharing || !cardRef.current) return;
    setSharing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      const dest = `${FileSystem.cacheDirectory}mindfuel_${id}.png`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      await Sharing.shareAsync(dest, { mimeType: 'image/png' });
    } catch (e) {
      console.log('Share error', e);
    } finally {
      setSharing(false);
    }
  };

  const handleJournal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onJournal?.();
  };

  return (
    <LinearGradient
      colors={[gradient[0], gradient[1], '#08080E']}
      locations={[0, 0.6, 1]}
      style={styles.card}
    >
      <View ref={cardRef} style={styles.captureZone} collapsable={false}>
        {isQOTD && (
          <View style={styles.qotdBadge}>
            <Text style={styles.qotdText}>✦ QUOTE OF THE DAY</Text>
          </View>
        )}

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{label.toUpperCase()}</Text>
        </View>

        <Text style={styles.quote}>{text}</Text>

        {author && (
          <Text style={styles.author}>— {author}</Text>
        )}

        <View style={styles.brandRow}>
          <Text style={styles.brand}>MindFuel</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableWithoutFeedback onPress={handleHeart}>
          <View style={styles.actionBtn}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={26}
                color={isFav ? theme.colors.danger : theme.colors.text}
              />
            </Animated.View>
            <Text style={styles.actionLabel}>{isFav ? 'Saved' : 'Save'}</Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableOpacity style={styles.actionBtn} onPress={handleJournal}>
          <Ionicons name="pencil-outline" size={24} color={theme.colors.text} />
          <Text style={styles.actionLabel}>Journal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} disabled={sharing}>
          <Ionicons
            name="share-outline"
            size={24}
            color={sharing ? theme.colors.textMuted : theme.colors.text}
          />
          <Text style={[styles.actionLabel, sharing && { color: theme.colors.textMuted }]}>
            {sharing ? '...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  captureZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  qotdBadge: {
    position: 'absolute',
    top: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: '#FBBF2430',
    borderWidth: 1,
    borderColor: '#FBBF24AA',
  },
  qotdText: {
    color: theme.colors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 8,
  },
  categoryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  quote: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  author: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  brandRow: {
    position: 'absolute',
    bottom: 20,
  },
  brand: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
  },
  actionLabel: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
  },
});
