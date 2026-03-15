import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, ScrollView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { type CategoryKey } from '../../assets/data/categoryColors';
import QuoteCard from '../../components/QuoteCard';
import StreakBadge from '../../components/StreakBadge';
import { useTheme } from '../../contexts/ThemeContext';
import { buildDailyAffirmations, buildDailyFeed } from '../../hooks/useDailyFeed';
import { GUIDED_PROMPTS, MOODS, MOOD_LABELS, useJournal, type Mood } from '../../hooks/useJournal';
import { useQuotes } from '../../hooks/useQuotes';
import { useSettings } from '../../hooks/useSettings';
import { useStreak } from '../../hooks/useStreak';

type JournalTarget = { id: string; text: string; author?: string } | null;

// ─── Journal Modal ────────────────────────────────────────────────────────────
function JournalModal({ target, onClose }: { target: JournalTarget; onClose: () => void }) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { addEntry, getEntryForQuote } = useJournal();
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const existingEntry = target ? getEntryForQuote(target.id) : null;

  const handleSave = async () => {
    if (!target || (!note.trim() && !mood)) return;
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
    } catch {
      setSaving(false);
    }
  };

  const handleClose = () => { setMood(null); setNote(''); onClose(); };
  const canSave = (note.trim().length > 0 || mood !== null) && !saving;
  const showMoods = settings.journalDepth === 'mood' || settings.journalDepth === 'rich';
  const showPrompt = settings.journalDepth === 'guided' || settings.journalDepth === 'rich';

  return (
    <Modal visible animationType="slide" transparent={false} hardwareAccelerated onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView edges={['top']} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.bg }}>
          <TouchableOpacity onPress={handleClose} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.card, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="chevron-down" size={24} color={theme.colors.textSub} />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text }}>Journal</Text>
          <TouchableOpacity onPress={handleSave} disabled={!canSave} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 999, opacity: canSave ? 1 : 0.35 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {target && (
            <View style={{ backgroundColor: theme.colors.card, borderRadius: theme.radius.md, padding: 16, borderLeftWidth: 3, borderLeftColor: theme.colors.primary, gap: 6 }}>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontStyle: 'italic', lineHeight: 23 }} numberOfLines={3}>"{target.text}"</Text>
              {target.author ? <Text style={{ color: theme.colors.textSub, fontSize: 12 }}>— {target.author}</Text> : null}
            </View>
          )}
          {showPrompt && (
            <View style={{ backgroundColor: theme.colors.cardHigh, borderRadius: theme.radius.md, padding: 16, gap: 8, borderWidth: 1, borderColor: theme.colors.primaryDim }}>
              <Text style={{ color: theme.colors.primaryLight, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>✦ Reflect on this</Text>
              <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 23 }}>{GUIDED_PROMPTS[Math.floor(Math.random() * GUIDED_PROMPTS.length)]}</Text>
            </View>
          )}
          {showMoods && (
            <View style={{ gap: 12 }}>
              <Text style={{ color: theme.colors.textSub, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>How are you feeling?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 4 }}>
                  {MOODS.map((m) => (
                    <TouchableOpacity key={m} onPress={() => setMood(mood === m ? null : m)}
                      style={{ alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: theme.radius.md, backgroundColor: mood === m ? theme.colors.primaryDim : theme.colors.card, borderWidth: 1, borderColor: mood === m ? theme.colors.primary : theme.colors.border, minWidth: 72, gap: 5 }}
                      activeOpacity={0.7}>
                      <Text style={{ fontSize: 26 }}>{m}</Text>
                      <Text style={{ color: mood === m ? theme.colors.primaryLight : theme.colors.textMuted, fontSize: 10, fontWeight: '600' }}>{MOOD_LABELS[m]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.textSub, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>Your thoughts</Text>
            <TextInput
              value={note} onChangeText={setNote}
              placeholder="Write freely — no rules, no judgment…"
              placeholderTextColor={theme.colors.textMuted}
              style={{ backgroundColor: theme.colors.card, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 16, color: theme.colors.text, fontSize: 16, lineHeight: 26, minHeight: 180 }}
              multiline textAlignVertical="top"
            />
          </View>
          {existingEntry && (
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', paddingBottom: 20 }}>
              You already have an entry for this quote. Saving will add a new one.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Dot indicators ───────────────────────────────────────────────────────────
function DotIndicators({ total, current, theme }: { total: number; current: number; theme: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: i === current ? 18 : 7, height: 7, borderRadius: 999, backgroundColor: i === current ? theme.colors.primary : theme.colors.border }} />
      ))}
    </View>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const streak = useStreak();
  const { quotes, quoteOfTheDay, affirmations } = useQuotes();
  const { settings, update } = useSettings();
  const [currentPage, setCurrentPage] = useState(0);

  // Journal modal two-stage mount (fixes Android touch-lock)
  const [journalTarget, setJournalTarget] = useState<JournalTarget>(null);
  const [journalMounted, setJournalMounted] = useState(false);
  const unmountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Mode switch key ──────────────────────────────────────────────────────
  // Changing the PagerView `key` forces a full native remount.
  // This is the fix for both bugs:
  //   1. Affirmations save/journal not working (stale native page 0)
  //   2. First card unresponsive after mode switch
  const pagerKey = settings.affirmationsMode ? 'affirmations' : 'quotes';

  const switchMode = (affirmations: boolean) => {
    // Close journal if open before switching
    if (journalMounted) {
      setJournalMounted(false);
      setJournalTarget(null);
    }
    setCurrentPage(0);
    update({ affirmationsMode: affirmations });
  };

  const openJournal = (q: { id: string; text: string; author?: string }) => {
    if (unmountTimer.current) clearTimeout(unmountTimer.current);
    setJournalTarget(q);
    setJournalMounted(true);
  };

  const closeJournal = () => {
    // Wait for slide-down animation to finish before unmounting
    unmountTimer.current = setTimeout(() => {
      setJournalMounted(false);
      setJournalTarget(null);
    }, 450);
  };

  const feed = useMemo(() => {
    if (settings.affirmationsMode) return buildDailyAffirmations(affirmations, settings.dailyLimit);
    return buildDailyFeed(quotes, quoteOfTheDay, settings.dailyLimit);
  }, [settings.affirmationsMode, settings.dailyLimit, quotes, affirmations, quoteOfTheDay]);

  const isLastPage = currentPage === feed.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.bg }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.3 }}>⚡ MindFuel</Text>
            <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>Fuel Your Mind Daily</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <StreakBadge count={streak.current} />
            <TouchableOpacity onPress={() => router.push('/settings')} style={{ padding: 4 }}>
              <Ionicons name="settings-outline" size={22} color={theme.colors.textSub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode toggle */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 10, gap: 8 }}>
          {([['Quotes', false], ['Affirmations', true]] as const).map(([label, isAff]) => {
            const active = settings.affirmationsMode === isAff;
            return (
              <TouchableOpacity
                key={label}
                style={{ paddingHorizontal: 18, paddingVertical: 7, borderRadius: 999, backgroundColor: active ? theme.colors.primaryDim : theme.colors.card, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border }}
                onPress={() => switchMode(isAff)}
                activeOpacity={0.7}
              >
                <Text style={{ color: active ? theme.colors.primaryLight : theme.colors.textSub, fontSize: 13, fontWeight: '600' }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      <DotIndicators total={feed.length} current={currentPage} theme={theme} />

      {/*
        KEY FIX: `key={pagerKey}` forces PagerView to fully unmount+remount
        when the mode switches. This gives us a fresh native touch responder
        on page 0 every time, fixing both the frozen-first-card and the
        affirmations-not-saving bugs.
      */}
      <PagerView
        key={pagerKey}
        style={{ flex: 1 }}
        initialPage={0}
        orientation="horizontal"
        onPageSelected={(e) => {
          setCurrentPage(e.nativeEvent.position);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }}
      >
        {feed.map((q) => (
          <QuoteCard
            key={q.id}
            id={q.id}
            text={q.text}
            author={(q as any).author}
            category={q.category as CategoryKey}
            isQOTD={q.id === quoteOfTheDay?.id && !settings.affirmationsMode}
            onJournal={() => openJournal({ id: q.id, text: q.text, author: (q as any).author })}
          />
        ))}
      </PagerView>

      {isLastPage && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 12, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '500' }}>
            ✓ All done for today — new quotes tomorrow
          </Text>
        </View>
      )}

      {journalMounted && journalTarget && (
        <JournalModal target={journalTarget} onClose={closeJournal} />
      )}
    </View>
  );
}
