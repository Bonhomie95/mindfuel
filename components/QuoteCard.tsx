import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
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

  const handleHeart = () => {
    toggleFavorite(id);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.5, useNativeDriver: true, speed: 60 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();
  };

  // Synchronous — no async, no await. Nothing can block it.
  const handleJournal = () => {
    if (onJournal) onJournal();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleShare = async () => {
    if (sharing || !cardRef.current) return;
    setSharing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      const dest = `${FileSystem.cacheDirectory}mf_${id}.png`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      await Sharing.shareAsync(dest, { mimeType: 'image/png' });
    } catch (e) {
      console.log('Share error', e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Diagonal main gradient */}
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Top-left shimmer highlight */}
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.65, y: 0.65 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Bottom vignette so text pops */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
        start={{ x: 0.5, y: 0.25 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Capture ref covers the whole card visually */}
      <View ref={cardRef} style={StyleSheet.absoluteFill} collapsable={false} />

      {/* Content layer */}
      <View style={styles.content}>
        {/* Badges row */}
        <View style={styles.topRow}>
          {isQOTD && (
            <View style={styles.qotdBadge}>
              <Text style={styles.qotdText}>✦ TODAY'S QUOTE</Text>
            </View>
          )}
          <View style={styles.catBadge}>
            <Text style={styles.catText}>{label.toUpperCase()}</Text>
          </View>
        </View>

        {/* Quote text */}
        <View style={styles.quoteZone}>
          <Text style={styles.openQuote}>"</Text>
          <Text style={styles.quoteText}>{text}</Text>
          {author ? <Text style={styles.author}>— {author}</Text> : null}
        </View>

        {/* Action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem} onPress={handleHeart} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={24}
                color={isFav ? '#FF6B8A' : 'rgba(255,255,255,0.9)'}
              />
            </Animated.View>
            <Text style={styles.actionLabel}>{isFav ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleJournal} activeOpacity={0.7}>
            <Ionicons name="pencil" size={22} color="rgba(255,255,255,0.9)" />
            <Text style={styles.actionLabel}>Journal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleShare} disabled={sharing} activeOpacity={0.7}>
            <Ionicons
              name="share-social"
              size={22}
              color={sharing ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)'}
            />
            <Text style={[styles.actionLabel, sharing && { opacity: 0.35 }]}>
              {sharing ? '...' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.brand}>MindFuel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 14,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 26,
    paddingTop: 30,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  qotdBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.55)',
  },
  qotdText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  catBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  catText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  quoteZone: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  openQuote: {
    fontSize: 80,
    lineHeight: 68,
    color: 'rgba(255,255,255,0.18)',
    fontWeight: '900',
    marginBottom: -8,
    marginLeft: -4,
  },
  quoteText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 34,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  author: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.68)',
    fontStyle: 'italic',
    marginTop: 12,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  actionItem: {
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  actionLabel: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  brand: {
    position: 'absolute',
    bottom: 86,
    right: 26,
    color: 'rgba(255,255,255,0.15)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
