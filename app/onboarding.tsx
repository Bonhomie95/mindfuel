import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { categoryMeta, type CategoryKey } from '../assets/data/categoryColors';
import CategoryCard from '../components/CategoryCard';
import { theme } from '../constants/theme';
import { requestNotificationPermission, scheduleDaily } from '../hooks/useNotifications';
import { useSettings } from '../hooks/useSettings';

const TIMES = ['06:00', '07:00', '07:30', '08:00', '09:00', '10:00', '12:00', '20:00', '21:00'];
const TIME_LABELS: Record<string, string> = {
  '06:00': '6:00 AM', '07:00': '7:00 AM', '07:30': '7:30 AM',
  '08:00': '8:00 AM', '09:00': '9:00 AM', '10:00': '10:00 AM',
  '12:00': '12:00 PM', '20:00': '8:00 PM', '21:00': '9:00 PM',
};

const { width } = Dimensions.get('window');

const ALL_CATEGORIES = Object.entries(categoryMeta)
  .filter(([k]) => k !== 'default')
  .map(([key, meta]) => ({ key: key as CategoryKey, ...meta }));

export default function Onboarding() {
  const router = useRouter();
  const { update } = useSettings();
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>([]);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [loading, setLoading] = useState(false);

  const toggleCategory = (key: CategoryKey) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const finish = async () => {
    setLoading(true);
    await update({
      favoriteCategories: selectedCategories.length > 0 ? selectedCategories : ['morning'],
      notificationEnabled: notifEnabled,
      notificationTime: selectedTime,
    });

    if (notifEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDaily(selectedTime, {
          quoteText: 'Fuel your mind today.',
          tone: 'teaser',
        });
      }
    }

    await AsyncStorage.setItem('mindfuel_onboarded', 'true');
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={[theme.colors.bg, '#0F0A1A', theme.colors.bg]} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Step dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        {/* Step 0 - Welcome */}
        {step === 0 && (
          <View style={styles.step}>
            <View style={styles.logoZone}>
              <Text style={styles.logoEmoji}>⚡</Text>
              <Text style={styles.appName}>MindFuel</Text>
              <Text style={styles.tagline}>Fuel Your Mind Daily</Text>
            </View>
            <View style={styles.featureList}>
              {[
                ['🌟', 'Daily quotes that inspire action'],
                ['🔥', 'Streak system to build the habit'],
                ['📓', 'Journal your thoughts & growth'],
                ['🔔', 'Personalized daily reminders'],
              ].map(([icon, text]) => (
                <View key={text} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{icon}</Text>
                  <Text style={styles.featureText}>{text}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)}>
              <Text style={styles.primaryBtnText}>Get Started →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 1 - Choose Categories */}
        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>What fuels you?</Text>
            <Text style={styles.stepSub}>Pick the topics that resonate most.</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              <View style={styles.grid}>
                {ALL_CATEGORIES.map(({ key, label, gradient, icon }) => (
                  <CategoryCard
                    key={key}
                    label={label}
                    icon={icon}
                    gradient={gradient}
                    onPress={() => toggleCategory(key)}
                    selected={selectedCategories.includes(key)}
                  />
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={[styles.primaryBtn, selectedCategories.length === 0 && styles.primaryBtnDim]}
              onPress={() => setStep(2)}
            >
              <Text style={styles.primaryBtnText}>
                {selectedCategories.length > 0
                  ? `Continue (${selectedCategories.length} selected) →`
                  : 'Skip for now →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 - Notifications */}
        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Never miss a day</Text>
            <Text style={styles.stepSub}>A daily reminder builds the habit. When should we send it?</Text>

            <View style={styles.notifToggleRow}>
              <Text style={styles.notifToggleLabel}>Daily reminder</Text>
              <TouchableOpacity
                onPress={() => setNotifEnabled(!notifEnabled)}
                style={[styles.toggle, notifEnabled && styles.toggleOn]}
              >
                <View style={[styles.toggleKnob, notifEnabled && styles.toggleKnobOn]} />
              </TouchableOpacity>
            </View>

            {notifEnabled && (
              <>
                <Text style={styles.timeSectionLabel}>Choose a time</Text>
                <View style={styles.timeGrid}>
                  {TIMES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setSelectedTime(t)}
                      style={[styles.timeChip, selectedTime === t && styles.timeChipSelected]}
                    >
                      <Text
                        style={[styles.timeChipText, selectedTime === t && styles.timeChipTextSelected]}
                      >
                        {TIME_LABELS[t]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDim]}
              onPress={finish}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Setting up...' : 'Start My Journey 🚀'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  step: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  logoZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  logoEmoji: { fontSize: 64 },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSub,
    letterSpacing: 0.5,
  },
  featureList: {
    gap: 14,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureIcon: { fontSize: 22 },
  featureText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  primaryBtnDim: { opacity: 0.6 },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  stepSub: {
    fontSize: 15,
    color: theme.colors.textSub,
    lineHeight: 22,
  },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  notifToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 18,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notifToggleLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: theme.colors.primary },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  toggleKnobOn: { alignSelf: 'flex-end' },
  timeSectionLabel: {
    color: theme.colors.textSub,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeChipSelected: {
    backgroundColor: theme.colors.primaryDim,
    borderColor: theme.colors.primary,
  },
  timeChipText: {
    color: theme.colors.textSub,
    fontSize: 14,
    fontWeight: '500',
  },
  timeChipTextSelected: {
    color: theme.colors.primaryLight,
    fontWeight: '700',
  },
});
