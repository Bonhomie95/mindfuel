import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import {
  Animated, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { getCategoryGradient, getCategoryLabel, type CategoryKey } from '../assets/data/categoryColors';
import { useFavorites } from '../hooks/useFavorites';

// ─── Share card dimensions ────────────────────────────────────────────────────
// Fixed size so the captured image is always consistent regardless of device.
const SHARE_W = 900;
const SHARE_H = 900;

type Props = {
  id: string;
  text: string;
  author?: string;
  category?: CategoryKey;
  onJournal?: () => void;
  isQOTD?: boolean;
};

// ─── Off-screen share card ────────────────────────────────────────────────────
// Rendered absolutely off-screen so view-shot can capture it but users never see it.
function ShareCard({
  shareRef,
  text,
  author,
  category,
}: {
  shareRef: React.RefObject<View>;
  text: string;
  author?: string;
  category: CategoryKey;
}) {
  const gradient = getCategoryGradient(category);
  const label = getCategoryLabel(category);

  // Truncate long quotes gracefully in the share image
  const displayText = text.length > 200 ? text.slice(0, 197) + '…' : text;

  return (
    <View
      ref={shareRef}
      collapsable={false}
      style={{
        position: 'absolute',
        top: -99999,
        left: 0,
        width: SHARE_W,
        height: SHARE_H,
      }}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Top-left shimmer */}
      <LinearGradient
        colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Bottom vignette */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={sc.inner}>
        {/* Category pill */}
        <View style={sc.catPill}>
          <Text style={sc.catText}>{label.toUpperCase()}</Text>
        </View>

        {/* Quote body */}
        <View style={sc.quoteBlock}>
          <Text style={sc.openQuote}>"</Text>
          <Text style={sc.quoteText}>{displayText}</Text>
          {author ? (
            <Text style={sc.authorText}>— {author}</Text>
          ) : null}
        </View>

        {/* Divider */}
        <View style={sc.divider} />

        {/* Branding row */}
        <View style={sc.brandRow}>
          {/* Lightning bolt icon placeholder — rendered as text since SVG not available here */}
          <View style={sc.iconCircle}>
            <Text style={sc.iconText}>⚡</Text>
          </View>
          <View style={sc.brandText}>
            <Text style={sc.appName}>MindFuel</Text>
            <Text style={sc.tagline}>Fuel Your Mind Daily</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Main QuoteCard ───────────────────────────────────────────────────────────
export default function QuoteCard({
  id, text, author, category = 'default', onJournal, isQOTD,
}: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(id);
  const shareRef = useRef<View>(null);
  const heartScale = useRef(new Animated.Value(1)).current;
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const gradient = getCategoryGradient(category as CategoryKey);
  const label = getCategoryLabel(category as CategoryKey);

  const handleHeart = () => {
    toggleFavorite(id);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.5, useNativeDriver: true, speed: 60 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const handleJournal = () => {
    if (onJournal) onJournal();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleCopy = async () => {
    const fullText = author ? `"${text}" — ${author}` : `"${text}"`;
    await Clipboard.setStringAsync(fullText);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (sharing || !shareRef.current) return;
    setSharing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      // Capture the off-screen share card at 2× for retina quality
      const uri = await captureRef(shareRef, {
        format: 'png',
        quality: 1,
        width: SHARE_W,
        height: SHARE_H,
      });
      const dest = `${FileSystem.cacheDirectory}mf_share_${id}.png`;
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
      {/* Visible card gradients */}
      <LinearGradient colors={[gradient[0], gradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 0.65, y: 0.65 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']} start={{ x: 0.5, y: 0.25 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />

      {/* Off-screen share card (never visible, only captured) */}
      <ShareCard
        shareRef={shareRef}
        text={text}
        author={author}
        category={category as CategoryKey}
      />

      {/* Visible card content */}
      <View style={styles.content}>
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

        <View style={styles.quoteZone}>
          <Text style={styles.openQuote}>"</Text>
          <Text style={styles.quoteText}>{text}</Text>
          {author ? <Text style={styles.author}>— {author}</Text> : null}
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem} onPress={handleHeart} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color={isFav ? '#FF6B8A' : 'rgba(255,255,255,0.9)'} />
            </Animated.View>
            <Text style={styles.actionLabel}>{isFav ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleCopy} activeOpacity={0.7}>
            <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={22} color={copied ? '#34D399' : 'rgba(255,255,255,0.9)'} />
            <Text style={styles.actionLabel}>{copied ? 'Copied!' : 'Copy'}</Text>
          </TouchableOpacity>

          {onJournal && (
            <TouchableOpacity style={styles.actionItem} onPress={handleJournal} activeOpacity={0.7}>
              <Ionicons name="pencil" size={22} color="rgba(255,255,255,0.9)" />
              <Text style={styles.actionLabel}>Journal</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionItem} onPress={handleShare} disabled={sharing} activeOpacity={0.7}>
            <Ionicons
              name={sharing ? 'hourglass-outline' : 'share-social'}
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

// ─── Visible card styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { flex: 1, margin: 14, borderRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 14 },
  content: { flex: 1, justifyContent: 'space-between', padding: 26, paddingTop: 30, paddingBottom: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  qotdBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(251,191,36,0.22)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.55)' },
  qotdText: { color: '#FBBF24', fontSize: 9, fontWeight: '800', letterSpacing: 1.6 },
  catBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  catText: { color: 'rgba(255,255,255,0.92)', fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  quoteZone: { flex: 1, justifyContent: 'center', paddingVertical: 16 },
  openQuote: { fontSize: 80, lineHeight: 68, color: 'rgba(255,255,255,0.18)', fontWeight: '900', marginBottom: -8, marginLeft: -4 },
  quoteText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', lineHeight: 34, letterSpacing: -0.2, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  author: { fontSize: 14, color: 'rgba(255,255,255,0.68)', fontStyle: 'italic', marginTop: 12 },
  actionBar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.16)' },
  actionItem: { alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.18)' },
  actionLabel: { color: 'rgba(255,255,255,0.88)', fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  brand: { position: 'absolute', bottom: 86, right: 26, color: 'rgba(255,255,255,0.15)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
});

// ─── Share card styles (fixed px — these are in the captured image, not screen) ─
const sc = StyleSheet.create({
  inner: {
    flex: 1,
    padding: 80,
    justifyContent: 'space-between',
  },
  catPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  catText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
  },
  quoteBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  openQuote: {
    fontSize: 180,
    lineHeight: 140,
    color: 'rgba(255,255,255,0.15)',
    fontWeight: '900',
    marginBottom: -20,
    marginLeft: -10,
  },
  quoteText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 80,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  authorText: {
    marginTop: 30,
    fontSize: 36,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 48,
  },
  brandText: {
    gap: 4,
  },
  appName: {
    fontSize: 46,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  tagline: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});
