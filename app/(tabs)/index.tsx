import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { type CategoryKey } from '../../assets/data/categoryColors';
import QuoteCard from '../../components/QuoteCard';
import StreakBadge from '../../components/StreakBadge';
import { theme } from '../../constants/theme';
import { GUIDED_PROMPTS, MOODS, MOOD_LABELS, useJournal, type Mood } from '../../hooks/useJournal';
import { useQuotes } from '../../hooks/useQuotes';
import { useSettings } from '../../hooks/useSettings';
import { useStreak } from '../../hooks/useStreak';

// ─── Journal Modal ───────────────────────────────────────────────────────────
type JournalTarget = { id: string; text: string; author?: string } | null;

function JournalModal({
  visible,
  target,
  onClose,
}: {
  visible: boolean;
  target: JournalTarget;
  onClose: () => void;
}) {
  const { settings } = useSettings();
  const { addEntry, getEntryForQuote } = useJournal();
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync state when target changes
  const existingEntry = target ? getEntryForQuote(target.id) : null;

  const handleSave = async () => {
    if (!target) return;
    if (!note.trim() && !mood) return;
    setSaving(true);
    try {
      const prompt =
        settings.journalDepth === 'guided' || settings.journalDepth === 'rich'
          ? GUIDED_PROMPTS[Math.floor(Math.random() * GUIDED_PROMPTS.length)]
          : undefined;
      await addEntry({
        quoteId: target.id,
        quoteText: target.text,
        quoteAuthor: target.author,
        mood: mood ?? undefined,
        note: note.trim() || (mood ? `Feeling ${MOOD_LABELS[mood]}` : ''),
        prompt,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setMood(null);
      setNote('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setMood(null);
    setNote('');
    onClose();
  };

  const canSave = (note.trim().length > 0 || mood !== null) && !saving;
  const showMoods = settings.journalDepth === 'mood' || settings.journalDepth === 'rich';
  const showPrompt = settings.journalDepth === 'guided' || settings.journalDepth === 'rich';

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.journalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.journalHeader}>
          <TouchableOpacity onPress={handleClose} style={styles.journalClose}>
            <Ionicons name="chevron-down" size={24} color={theme.colors.textSub} />
          </TouchableOpacity>
          <Text style={styles.journalTitle}>Journal</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={[styles.journalSaveBtn, !canSave && styles.journalSaveBtnDim]}
          >
            <Text style={styles.journalSaveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <ScrollView
          style={styles.journalBody}
          contentContainerStyle={styles.journalBodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Quote preview */}
          {target && (
            <View style={styles.quotePreview}>
              <Text style={styles.previewQuote} numberOfLines={3}>"{target.text}"</Text>
              {target.author ? <Text style={styles.previewAuthor}>— {target.author}</Text> : null}
            </View>
          )}

          {/* Guided prompt */}
          {showPrompt && (
            <View style={styles.promptBox}>
              <Text style={styles.promptLabel}>✦ Reflect on this</Text>
              <Text style={styles.promptText}>
                {GUIDED_PROMPTS[Math.floor(Math.random() * GUIDED_PROMPTS.length)]}
              </Text>
            </View>
          )}

          {/* Mood picker */}
          {showMoods && (
            <View style={styles.moodSection}>
              <Text style={styles.sectionLabel}>How are you feeling?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
                <View style={styles.moodRow}>
                  {MOODS.map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMood(mood === m ? null : m)}
                      style={[styles.moodChip, mood === m && styles.moodChipOn]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.moodEmoji}>{m}</Text>
                      <Text style={[styles.moodChipLabel, mood === m && { color: theme.colors.primaryLight }]}>
                        {MOOD_LABELS[m]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Note */}
          <View style={styles.noteSection}>
            <Text style={styles.sectionLabel}>Your thoughts</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Write freely — no rules, no judgment…"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.noteInput}
              multiline
              textAlignVertical="top"
              autoFocus={false}
            />
          </View>

          {existingEntry && (
            <Text style={styles.existingNote}>
              You already have an entry for this quote. Saving will add a new one.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const streak = useStreak();
  const { quotes, quoteOfTheDay, affirmations } = useQuotes();
  const { settings, update } = useSettings();

  const [journalVisible, setJournalVisible] = useState(false);
  const [journalTarget, setJournalTarget] = useState<JournalTarget>(null);

  const openJournal = (q: { id: string; text: string; author?: string }) => {
    setJournalTarget(q);
    setJournalVisible(true);
  };

  const feed = settings.affirmationsMode ? affirmations : quotes;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.logo}>⚡ MindFuel</Text>
            <Text style={styles.tagline}>Fuel Your Mind Daily</Text>
          </View>
          <View style={styles.headerRight}>
            <StreakBadge count={streak.current} />
            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={22} color={theme.colors.textSub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeChip, !settings.affirmationsMode && styles.modeChipOn]}
            onPress={() => update({ affirmationsMode: false })}
          >
            <Text style={[styles.modeChipText, !settings.affirmationsMode && styles.modeChipTextOn]}>
              Quotes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeChip, settings.affirmationsMode && styles.modeChipOn]}
            onPress={() => update({ affirmationsMode: true })}
          >
            <Text style={[styles.modeChipText, settings.affirmationsMode && styles.modeChipTextOn]}>
              Affirmations
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Swipe hint */}
      <Text style={styles.swipeHint}>
        {settings.swipeDirection === 'horizontal' ? '← Swipe →' : '↕ Swipe'} for more
      </Text>

      {/* Swipeable quote feed */}
      <PagerView
        style={styles.pager}
        initialPage={0}
        orientation={settings.swipeDirection === 'horizontal' ? 'horizontal' : 'vertical'}
        onPageSelected={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }}
      >
        {feed.map((q, index) => (
          <QuoteCard
            key={q.id}
            id={q.id}
            text={q.text}
            author={(q as any).author}
            category={q.category as CategoryKey}
            isQOTD={index === 0 && !settings.affirmationsMode}
            onJournal={() => openJournal(q)}
          />
        ))}
      </PagerView>

      {/* Journal modal — rendered at root so PagerView can't intercept */}
      <JournalModal
        visible={journalVisible}
        target={journalTarget}
        onClose={() => setJournalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  safeHeader: { backgroundColor: theme.colors.bg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
  },
  logo: { fontSize: 20, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.3 },
  tagline: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsBtn: { padding: 4 },
  modeRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 10, gap: 8 },
  modeChip: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeChipOn: { backgroundColor: theme.colors.primaryDim, borderColor: theme.colors.primary },
  modeChipText: { color: theme.colors.textSub, fontSize: 13, fontWeight: '600' },
  modeChipTextOn: { color: theme.colors.primaryLight },
  swipeHint: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    paddingBottom: 4,
  },
  pager: { flex: 1 },

  // ── Journal modal ──
  journalRoot: { flex: 1, backgroundColor: theme.colors.bg },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
  },
  journalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  journalTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  journalSaveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 999,
  },
  journalSaveBtnDim: { opacity: 0.35 },
  journalSaveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  journalBody: { flex: 1 },
  journalBodyContent: { padding: 20, gap: 20, paddingBottom: 60 },

  quotePreview: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    gap: 6,
  },
  previewQuote: {
    color: theme.colors.text,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 23,
  },
  previewAuthor: { color: theme.colors.textSub, fontSize: 12 },

  promptBox: {
    backgroundColor: theme.colors.cardHigh,
    borderRadius: theme.radius.md,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.primaryDim,
  },
  promptLabel: {
    color: theme.colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  promptText: { color: theme.colors.text, fontSize: 15, lineHeight: 23 },

  moodSection: { gap: 12 },
  moodScroll: {},
  moodRow: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  moodChip: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 72,
    gap: 5,
  },
  moodChipOn: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryDim },
  moodEmoji: { fontSize: 26 },
  moodChipLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '600' },

  sectionLabel: {
    color: theme.colors.textSub,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  noteSection: { gap: 12 },
  noteInput: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 26,
    minHeight: 180,
  },
  existingNote: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 20,
  },
});
