import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { categoryMeta, type CategoryKey } from '../../assets/data/categoryColors';
import QuoteCard from '../../components/QuoteCard';
import StreakBadge from '../../components/StreakBadge';
import { theme } from '../../constants/theme';
import { GUIDED_PROMPTS, MOODS, MOOD_LABELS, useJournal, type Mood } from '../../hooks/useJournal';
import { useQuotes } from '../../hooks/useQuotes';
import { useSettings } from '../../hooks/useSettings';
import { useStreak } from '../../hooks/useStreak';

export default function HomeScreen() {
  const router = useRouter();
  const streak = useStreak();
  const { quotes, quoteOfTheDay } = useQuotes();
  const { entries, addEntry, getEntryForQuote } = useJournal();
  const { settings } = useSettings();

  // Journal modal state
  const [journalVisible, setJournalVisible] = useState(false);
  const [journalQuote, setJournalQuote] = useState<{ id: string; text: string; author?: string } | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [journalNote, setJournalNote] = useState('');
  const [journalSaving, setJournalSaving] = useState(false);

  const openJournal = (q: { id: string; text: string; author?: string }) => {
    const existing = getEntryForQuote(q.id);
    setJournalQuote(q);
    setSelectedMood(existing?.mood ?? null);
    setJournalNote(existing?.note ?? '');
    setJournalVisible(true);
  };

  const saveJournal = async () => {
    if (!journalQuote || !journalNote.trim()) return;
    setJournalSaving(true);
    const prompt =
      settings.journalDepth === 'guided'
        ? GUIDED_PROMPTS[Math.floor(Math.random() * GUIDED_PROMPTS.length)]
        : undefined;

    await addEntry({
      quoteId: journalQuote.id,
      quoteText: journalQuote.text,
      quoteAuthor: journalQuote.author,
      mood: selectedMood ?? undefined,
      note: journalNote.trim(),
      prompt,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setJournalVisible(false);
    setJournalSaving(false);
    setJournalNote('');
    setSelectedMood(null);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.logo}>⚡ MindFuel</Text>
            <Text style={styles.tagline}>Fuel Your Mind Daily</Text>
          </View>
          <View style={styles.headerRight}>
            <StreakBadge count={streak.current} />
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.settingsBtn}
            >
              <Ionicons name="settings-outline" size={22} color={theme.colors.textSub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Affirmations mode toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeChip, !settings.affirmationsMode && styles.modeChipActive]}
            onPress={() => {}}
          >
            <Text style={[styles.modeChipText, !settings.affirmationsMode && styles.modeChipTextActive]}>
              Quotes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeChip, settings.affirmationsMode && styles.modeChipActive]}
            onPress={() => {}}
          >
            <Text style={[styles.modeChipText, settings.affirmationsMode && styles.modeChipTextActive]}>
              Affirmations
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Quote of the Day hero */}
      {quoteOfTheDay && (
        <View style={styles.qotdWrapper}>
          <QuoteCard
            id={quoteOfTheDay.id}
            text={quoteOfTheDay.text}
            author={quoteOfTheDay.author}
            category={quoteOfTheDay.category as CategoryKey}
            isQOTD
            onJournal={() => openJournal(quoteOfTheDay)}
          />
        </View>
      )}

      {/* Swipe hint */}
      <Text style={styles.swipeHint}>↕ Swipe for more</Text>

      {/* Pager feed */}
      <PagerView
        style={styles.pager}
        initialPage={0}
        orientation={settings.swipeDirection === 'horizontal' ? 'horizontal' : 'vertical'}
        onPageSelected={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        {quotes.map((q) => (
          <QuoteCard
            key={q.id}
            id={q.id}
            text={q.text}
            author={q.author}
            category={q.category as CategoryKey}
            onJournal={() => openJournal(q)}
          />
        ))}
      </PagerView>

      {/* Journal Modal */}
      <Modal
        visible={journalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setJournalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setJournalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.textSub} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Journal Entry</Text>
            <TouchableOpacity
              onPress={saveJournal}
              disabled={!journalNote.trim() || journalSaving}
              style={[styles.saveBtn, (!journalNote.trim() || journalSaving) && { opacity: 0.4 }]}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            {/* Quote preview */}
            {journalQuote && (
              <View style={styles.quotePreview}>
                <Text style={styles.quotePreviewText} numberOfLines={2}>
                  "{journalQuote.text}"
                </Text>
                {journalQuote.author && (
                  <Text style={styles.quotePreviewAuthor}>— {journalQuote.author}</Text>
                )}
              </View>
            )}

            {/* Guided prompt if depth = guided */}
            {settings.journalDepth === 'guided' && (
              <View style={styles.promptBox}>
                <Text style={styles.promptLabel}>Reflect on this</Text>
                <Text style={styles.promptText}>
                  {GUIDED_PROMPTS[Math.floor(Math.random() * GUIDED_PROMPTS.length)]}
                </Text>
              </View>
            )}

            {/* Mood picker if depth = mood or rich */}
            {(settings.journalDepth === 'mood' || settings.journalDepth === 'rich') && (
              <View style={styles.moodSection}>
                <Text style={styles.sectionLabel}>How are you feeling?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.moodRow}>
                    {MOODS.map((m) => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setSelectedMood(m)}
                        style={[styles.moodChip, selectedMood === m && styles.moodChipSelected]}
                      >
                        <Text style={styles.moodEmoji}>{m}</Text>
                        <Text style={[styles.moodLabel, selectedMood === m && { color: theme.colors.text }]}>
                          {MOOD_LABELS[m]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Note input */}
            <View style={styles.noteSection}>
              <Text style={styles.sectionLabel}>Your thoughts</Text>
              <TextInput
                value={journalNote}
                onChangeText={setJournalNote}
                placeholder={
                  settings.journalDepth === 'simple'
                    ? 'Write a note about this quote...'
                    : 'Write freely — no rules, no judgment...'
                }
                placeholderTextColor={theme.colors.textMuted}
                style={styles.noteInput}
                multiline
                textAlignVertical="top"
                autoFocus
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: { backgroundColor: theme.colors.bg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsBtn: {
    padding: 4,
  },
  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeChipActive: {
    backgroundColor: theme.colors.primaryDim,
    borderColor: theme.colors.primary,
  },
  modeChipText: {
    color: theme.colors.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  modeChipTextActive: {
    color: theme.colors.primaryLight,
  },
  qotdWrapper: {
    height: 280,
  },
  swipeHint: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    paddingVertical: 4,
  },
  pager: { flex: 1 },

  // Modal
  modalRoot: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  quotePreview: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  quotePreviewText: {
    color: theme.colors.text,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quotePreviewAuthor: {
    color: theme.colors.textSub,
    fontSize: 12,
    marginTop: 6,
  },
  promptBox: {
    backgroundColor: theme.colors.cardHigh,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primaryDim,
  },
  promptLabel: {
    color: theme.colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  promptText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  moodSection: { marginBottom: 20 },
  sectionLabel: {
    color: theme.colors.textSub,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  moodChip: {
    alignItems: 'center',
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 70,
    gap: 4,
  },
  moodChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryDim,
  },
  moodEmoji: { fontSize: 24 },
  moodLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  noteSection: { marginBottom: 40 },
  noteInput: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 160,
  },
});
