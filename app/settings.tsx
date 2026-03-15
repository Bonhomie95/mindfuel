import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_LIST, type ThemeId } from '../constants/themes';
import { cancelDaily, requestNotificationPermission, scheduleDaily } from '../hooks/useNotifications';
import { useSettings, type JournalDepth, type NotificationTone, type SwipeDirection } from '../hooks/useSettings';
import { useFavorites } from '../hooks/useFavorites';
import { useJournal } from '../hooks/useJournal';
import { useStreak } from '../hooks/useStreak';

const TIMES = ['06:00', '07:00', '07:30', '08:00', '09:00', '10:00', '12:00', '20:00', '21:00'];
const TIME_LABELS: Record<string, string> = {
  '06:00': '6:00 AM', '07:00': '7:00 AM', '07:30': '7:30 AM',
  '08:00': '8:00 AM', '09:00': '9:00 AM', '10:00': '10:00 AM',
  '12:00': '12:00 PM', '20:00': '8:00 PM', '21:00': '9:00 PM',
};

function SectionHeader({ title, theme }: { title: string; theme: any }) {
  return (
    <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 8, marginBottom: 4 }}>
      {title.toUpperCase()}
    </Text>
  );
}

function Toggle({ label, sub, value, onToggle, theme }: { label: string; sub?: string; value: boolean; onToggle: () => void; theme: any }) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  return (
    <TouchableOpacity onPress={onToggle} style={s.row} activeOpacity={0.7}>
      <View style={s.rowLeft}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      <View style={[s.toggle, value && s.toggleOn]}>
        <View style={[s.knob, value && s.knobOn]} />
      </View>
    </TouchableOpacity>
  );
}

function RadioGroup<T extends string>({
  label, options, value, onChange, theme,
}: {
  label: string;
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
  theme: any;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={s.radioGroup}>
      <Text style={s.radioGroupLabel}>{label}</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[s.radioRow, value === opt.value && s.radioRowSelected]}
          activeOpacity={0.7}
        >
          <View style={[s.radioCircle, value === opt.value && s.radioCircleSelected]}>
            {value === opt.value && <View style={s.radioDot} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.radioLabel}>{opt.label}</Text>
            {opt.sub && <Text style={s.radioSub}>{opt.sub}</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeId, setThemeId } = useTheme();
  const { settings, update } = useSettings();
  const { favorites } = useFavorites();
  const { entries } = useJournal();
  const streak = useStreak();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const toggleNotifications = async () => {
    const next = !settings.notificationEnabled;
    await update({ notificationEnabled: next });
    if (next) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDaily(settings.notificationTime, { quoteText: 'Fuel your mind today.', tone: settings.notificationTone });
      } else {
        await update({ notificationEnabled: false });
        Alert.alert('Permission required', 'Please allow notifications in your device settings.');
      }
    } else {
      await cancelDaily();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const setTime = async (time: string) => {
    await update({ notificationTime: time });
    if (settings.notificationEnabled) {
      await scheduleDaily(time, { quoteText: 'Fuel your mind today.', tone: settings.notificationTone });
    }
  };

  const resetApp = () => {
    Alert.alert(
      'Reset App',
      'This will clear all your data including favorites, journal entries, and streak. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            await cancelDaily();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleThemeSelect = async (id: ThemeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await setThemeId(id);
  };

  return (
    <View style={s.root}>
      <SafeAreaView>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
            <Ionicons name="close" size={22} color={theme.colors.textSub} />
          </TouchableOpacity>
          <Text style={s.title}>Settings</Text>
          <View style={{ width: 38 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ── Stats ── */}
        <SectionHeader title="Your Stats" theme={theme} />
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statEmoji}>🔥</Text>
            <Text style={s.statNumber}>{streak.current}</Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statEmoji}>❤️</Text>
            <Text style={s.statNumber}>{favorites.length}</Text>
            <Text style={s.statLabel}>Saved</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statEmoji}>📓</Text>
            <Text style={s.statNumber}>{entries.length}</Text>
            <Text style={s.statLabel}>Entries</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statEmoji}>⚡</Text>
            <Text style={s.statNumber}>{streak.longest}</Text>
            <Text style={s.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* ── Appearance ── */}
        <SectionHeader title="Appearance" theme={theme} />
        <View style={s.card}>
          <Text style={[s.radioGroupLabel, { padding: 16, paddingBottom: 12 }]}>Choose your theme</Text>
          <View style={s.themeGrid}>
            {THEME_LIST.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => handleThemeSelect(t.id)}
                style={[s.themeSwatch, themeId === t.id && s.themeSwatchActive]}
                activeOpacity={0.8}
              >
                {/* Mini preview */}
                <View style={[s.swatchPreview, { backgroundColor: t.previewColors[0] }]}>
                  <View style={[s.swatchDot, { backgroundColor: t.previewColors[1] }]} />
                  <View style={[s.swatchDotSm, { backgroundColor: t.previewColors[2] }]} />
                </View>
                <Text style={s.swatchEmoji}>{t.emoji}</Text>
                <Text style={[s.swatchName, themeId === t.id && s.swatchNameActive]}>
                  {t.name}
                </Text>
                {themeId === t.id && (
                  <View style={s.swatchCheck}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Notifications ── */}
        <SectionHeader title="Notifications" theme={theme} />
        <View style={s.card}>
          <Toggle
            label="Daily reminder"
            sub="Get a quote every day at your chosen time"
            value={settings.notificationEnabled}
            onToggle={toggleNotifications}
            theme={theme}
          />
        </View>

        {settings.notificationEnabled && (
          <>
            <Text style={s.subLabel}>Notification time</Text>
            <View style={s.timeGrid}>
              {TIMES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTime(t)}
                  style={[s.timeChip, settings.notificationTime === t && s.timeChipActive]}
                >
                  <Text style={[s.timeChipText, settings.notificationTime === t && s.timeChipTextActive]}>
                    {TIME_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.card}>
              <RadioGroup<NotificationTone>
                label="Notification style"
                value={settings.notificationTone}
                onChange={(v) => update({ notificationTone: v })}
                options={[
                  { value: 'quote', label: 'Full quote', sub: 'Show the quote text directly' },
                  { value: 'teaser', label: 'Teaser', sub: '"Tap to fuel your mind"' },
                  { value: 'category', label: 'Category hint', sub: 'Show category + icon' },
                  { value: 'personalized', label: 'Personalized', sub: 'First few words as preview' },
                ]}
                theme={theme}
              />
            </View>
          </>
        )}

        {/* ── Reading Preferences ── */}
        <SectionHeader title="Reading Preferences" theme={theme} />

        {/* Daily limit picker */}
        <View style={s.card}>
          <View style={{ padding: 16, gap: 12 }}>
            <Text style={[s.radioGroupLabel, { marginBottom: 4 }]}>Daily quotes</Text>
            <Text style={[s.radioSub, { marginTop: -8 }]}>How many quotes do you want per day?</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[2, 3].map((n) => {
                const active = settings.dailyLimit === n;
                return (
                  <TouchableOpacity
                    key={n}
                    onPress={() => update({ dailyLimit: n })}
                    activeOpacity={0.7}
                    style={{
                      flex: 1, paddingVertical: 14, borderRadius: s.card.borderRadius ?? theme.radius.md,
                      alignItems: 'center', gap: 4,
                      backgroundColor: active ? theme.colors.primaryDim : theme.colors.surface,
                      borderWidth: 1.5,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 22, fontWeight: '800', color: active ? theme.colors.primaryLight : theme.colors.textSub }}>{n}</Text>
                    <Text style={{ fontSize: 11, color: active ? theme.colors.primaryLight : theme.colors.textMuted, fontWeight: '600' }}>
                      {n === 2 ? 'Focused' : 'Standard'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Journal Style ── */}
        <SectionHeader title="Journal Style" theme={theme} />
        <View style={s.card}>
          <RadioGroup<JournalDepth>
            label="How deep do you want to go?"
            value={settings.journalDepth}
            onChange={(v) => update({ journalDepth: v })}
            options={[
              { value: 'simple', label: 'Simple', sub: 'Just a text note' },
              { value: 'mood', label: 'Mood + Note', sub: 'Pick an emoji mood, then write' },
              { value: 'guided', label: 'Guided', sub: 'A prompt helps you reflect deeper' },
              { value: 'rich', label: 'Full Journal', sub: 'Mood + prompt + rich entry' },
            ]}
            theme={theme}
          />
        </View>

        {/* ── About ── */}
        <SectionHeader title="About" theme={theme} />
        <View style={s.card}>
          <View style={s.aboutRow}>
            <Text style={s.rowLabel}>MindFuel</Text>
            <Text style={s.rowSub}>Version 2.0.0</Text>
          </View>
          <View style={[s.aboutRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
            <Text style={s.rowLabel}>Quotes in library</Text>
            <Text style={s.rowSub}>128 curated quotes</Text>
          </View>
          <View style={[s.aboutRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
            <Text style={s.rowLabel}>Themes available</Text>
            <Text style={s.rowSub}>6 unique skins</Text>
          </View>
        </View>

        <TouchableOpacity onPress={resetApp} style={s.dangerBtn}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          <Text style={s.dangerText}>Reset all app data</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    closeBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: theme.colors.card,
      justifyContent: 'center', alignItems: 'center',
    },
    title: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
    content: { padding: 20, gap: 12 },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },

    // Stats
    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      alignItems: 'center',
      gap: 4,
    },
    statEmoji: { fontSize: 20 },
    statNumber: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
    statLabel: { fontSize: 10, fontWeight: '600', color: theme.colors.textMuted, textAlign: 'center' },

    // Theme grid
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 12,
      paddingBottom: 16,
      gap: 10,
    },
    themeSwatch: {
      width: '30%',
      alignItems: 'center',
      gap: 6,
      padding: 10,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      position: 'relative',
    },
    themeSwatchActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryDim,
    },
    swatchPreview: {
      width: 52,
      height: 34,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    swatchDot: { width: 14, height: 14, borderRadius: 7 },
    swatchDotSm: { width: 8, height: 8, borderRadius: 4 },
    swatchEmoji: { fontSize: 18 },
    swatchName: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSub,
      textAlign: 'center',
    },
    swatchNameActive: { color: theme.colors.primary },
    swatchCheck: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Rows
    row: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', padding: 16,
    },
    rowLeft: { flex: 1, marginRight: 12 },
    rowLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '500' },
    rowSub: { color: theme.colors.textSub, fontSize: 12, marginTop: 2 },

    // Toggle
    toggle: {
      width: 48, height: 27, borderRadius: 14,
      backgroundColor: theme.colors.border,
      justifyContent: 'center', paddingHorizontal: 3,
    },
    toggleOn: { backgroundColor: theme.colors.primary },
    knob: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#fff' },
    knobOn: { alignSelf: 'flex-end' },

    // Time
    subLabel: { color: theme.colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    timeChip: {
      paddingHorizontal: 14, paddingVertical: 9,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.card,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    timeChipActive: { backgroundColor: theme.colors.primaryDim, borderColor: theme.colors.primary },
    timeChipText: { color: theme.colors.textSub, fontSize: 13, fontWeight: '500' },
    timeChipTextActive: { color: theme.colors.primaryLight, fontWeight: '700' },

    // Radio
    radioGroup: { padding: 16, gap: 12 },
    radioGroupLabel: { color: theme.colors.textSub, fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
    radioRow: {
      flexDirection: 'row', alignItems: 'flex-start',
      gap: 12, padding: 10, borderRadius: theme.radius.sm,
    },
    radioRowSelected: { backgroundColor: theme.colors.primaryDim },
    radioCircle: {
      width: 20, height: 20, borderRadius: 10,
      borderWidth: 2, borderColor: theme.colors.border,
      justifyContent: 'center', alignItems: 'center', marginTop: 2,
    },
    radioCircleSelected: { borderColor: theme.colors.primary },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
    radioLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '500' },
    radioSub: { color: theme.colors.textSub, fontSize: 12, marginTop: 2 },

    // About
    aboutRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', padding: 16,
    },

    // Danger
    dangerBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, padding: 16, marginTop: 8,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.dangerDim,
      backgroundColor: theme.colors.dangerDim,
    },
    dangerText: { color: theme.colors.danger, fontSize: 14, fontWeight: '600' },
  });
}
