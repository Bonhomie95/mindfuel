import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { cancelDaily, requestNotificationPermission, scheduleDaily } from '../hooks/useNotifications';
import { useSettings, type JournalDepth, type NotificationTone, type SwipeDirection } from '../hooks/useSettings';

const TIMES = ['06:00', '07:00', '07:30', '08:00', '09:00', '10:00', '12:00', '20:00', '21:00'];
const TIME_LABELS: Record<string, string> = {
  '06:00': '6:00 AM', '07:00': '7:00 AM', '07:30': '7:30 AM',
  '08:00': '8:00 AM', '09:00': '9:00 AM', '10:00': '10:00 AM',
  '12:00': '12:00 PM', '20:00': '8:00 PM', '21:00': '9:00 PM',
};

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>;
}

function Toggle({ label, sub, value, onToggle }: { label: string; sub?: string; value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.row} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </TouchableOpacity>
  );
}

function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.radioGroup}>
      <Text style={styles.radioGroupLabel}>{label}</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[styles.radioRow, value === opt.value && styles.radioRowSelected]}
          activeOpacity={0.7}
        >
          <View style={[styles.radioCircle, value === opt.value && styles.radioCircleSelected]}>
            {value === opt.value && <View style={styles.radioDot} />}
          </View>
          <View style={styles.radioText}>
            <Text style={styles.radioLabel}>{opt.label}</Text>
            {opt.sub && <Text style={styles.radioSub}>{opt.sub}</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, update } = useSettings();

  const toggleNotifications = async () => {
    const next = !settings.notificationEnabled;
    await update({ notificationEnabled: next });
    if (next) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDaily(settings.notificationTime, {
          quoteText: 'Fuel your mind today.',
          tone: settings.notificationTone,
        });
      } else {
        await update({ notificationEnabled: false });
        Alert.alert('Permission required', 'Please allow notifications in your device settings.');
      }
    } else {
      await cancelDaily();
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const setTime = async (time: string) => {
    await update({ notificationTime: time });
    if (settings.notificationEnabled) {
      await scheduleDaily(time, {
        quoteText: 'Fuel your mind today.',
        tone: settings.notificationTone,
      });
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

  return (
    <View style={styles.root}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.colors.textSub} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 38 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <SectionHeader title="Notifications" />
        <View style={styles.card}>
          <Toggle
            label="Daily reminder"
            sub="Get a quote every day at your chosen time"
            value={settings.notificationEnabled}
            onToggle={toggleNotifications}
          />
        </View>

        {settings.notificationEnabled && (
          <>
            <Text style={styles.subLabel}>Notification time</Text>
            <View style={styles.timeGrid}>
              {TIMES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTime(t)}
                  style={[styles.timeChip, settings.notificationTime === t && styles.timeChipActive]}
                >
                  <Text
                    style={[styles.timeChipText, settings.notificationTime === t && styles.timeChipTextActive]}
                  >
                    {TIME_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.card}>
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
              />
            </View>
          </>
        )}

        <SectionHeader title="Reading Preferences" />
        <View style={styles.card}>
          <RadioGroup<SwipeDirection>
            label="Swipe direction"
            value={settings.swipeDirection}
            onChange={(v) => update({ swipeDirection: v })}
            options={[
              { value: 'vertical', label: 'Up / Down', sub: 'Like TikTok — swipe vertically' },
              { value: 'horizontal', label: 'Left / Right', sub: 'Like Tinder — swipe sideways' },
            ]}
          />
        </View>

        <SectionHeader title="Journal Style" />
        <View style={styles.card}>
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
          />
        </View>

        <SectionHeader title="About" />
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.rowLabel}>MindFuel</Text>
            <Text style={styles.rowSub}>Version 2.0.0</Text>
          </View>
          <View style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
            <Text style={styles.rowLabel}>Quotes</Text>
            <Text style={styles.rowSub}>128 curated quotes</Text>
          </View>
        </View>

        <TouchableOpacity onPress={resetApp} style={styles.dangerBtn}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          <Text style={styles.dangerText}>Reset all app data</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  content: { padding: 20, gap: 12 },
  sectionHeader: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  subLabel: {
    color: theme.colors.textSub,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '500' },
  rowSub: { color: theme.colors.textSub, fontSize: 12, marginTop: 2 },
  toggle: {
    width: 48,
    height: 27,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: theme.colors.primary },
  knob: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  knobOn: { alignSelf: 'flex-end' },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeChipActive: {
    backgroundColor: theme.colors.primaryDim,
    borderColor: theme.colors.primary,
  },
  timeChipText: { color: theme.colors.textSub, fontSize: 13, fontWeight: '500' },
  timeChipTextActive: { color: theme.colors.primaryLight, fontWeight: '700' },
  radioGroup: { padding: 16, gap: 12 },
  radioGroupLabel: {
    color: theme.colors.textSub,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 10,
    borderRadius: theme.radius.sm,
  },
  radioRowSelected: { backgroundColor: theme.colors.primaryDim },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioCircleSelected: { borderColor: theme.colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  radioText: { flex: 1 },
  radioLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '500' },
  radioSub: { color: theme.colors.textSub, fontSize: 12, marginTop: 2 },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.dangerDim,
    backgroundColor: theme.colors.dangerDim,
  },
  dangerText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
