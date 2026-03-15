import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryMeta, type CategoryKey } from '../assets/data/categoryColors';
import CategoryCard from '../components/CategoryCard';
import { useTheme } from '../contexts/ThemeContext';
import { requestNotificationPermission, scheduleDaily } from '../hooks/useNotifications';
import { useSettings } from '../hooks/useSettings';

const TIMES = ['06:00', '07:00', '07:30', '08:00', '09:00', '10:00', '12:00', '20:00', '21:00'];
const TIME_LABELS: Record<string, string> = {
  '06:00': '6:00 AM', '07:00': '7:00 AM', '07:30': '7:30 AM',
  '08:00': '8:00 AM', '09:00': '9:00 AM', '10:00': '10:00 AM',
  '12:00': '12:00 PM', '20:00': '8:00 PM', '21:00': '9:00 PM',
};

const ALL_CATEGORIES = Object.entries(categoryMeta)
  .filter(([k]) => k !== 'default')
  .map(([key, meta]) => ({ key: key as CategoryKey, ...meta }));

export default function Onboarding() {
  const router = useRouter();
  const { theme } = useTheme();
  const { update } = useSettings();
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>([]);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [loading, setLoading] = useState(false);

  const toggleCategory = (key: CategoryKey) =>
    setSelectedCategories((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const finish = async () => {
    setLoading(true);
    await update({
      favoriteCategories: selectedCategories.length > 0 ? selectedCategories : ['morning'],
      notificationEnabled: notifEnabled,
      notificationTime: selectedTime,
    });
    if (notifEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) await scheduleDaily(selectedTime, { quoteText: 'Fuel your mind today.', tone: 'teaser' });
    }
    await AsyncStorage.setItem('mindfuel_onboarded', 'true');
    router.replace('/(tabs)');
  };

  const c = theme.colors;
  const r = theme.radius;

  return (
    <LinearGradient colors={[c.bg, theme.dark ? '#0F0A1A' : '#F0EAF5', c.bg]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Progress dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 16, paddingBottom: 8 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? c.primary : c.border }} />
          ))}
        </View>

        {/* Step 0 – Welcome */}
        {step === 0 && (
          <View style={{ flex: 1, paddingTop: 16, paddingBottom: 24, gap: 16 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 64 }}>⚡</Text>
              <Text style={{ fontSize: 42, fontWeight: '800', color: c.text, letterSpacing: -1 }}>MindFuel</Text>
              <Text style={{ fontSize: 16, color: c.textSub, letterSpacing: 0.5 }}>Fuel Your Mind Daily</Text>
            </View>
            <View style={{ gap: 12 }}>
              {[['🌟', 'Daily quotes that inspire action'], ['🔥', 'Streak system to build the habit'], ['📓', 'Journal your thoughts & growth'], ['🔔', 'Personalized daily reminders'], ['🎨', '6 beautiful themes to personalize']].map(([icon, text]) => (
                <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.card, padding: 16, borderRadius: r.md, borderWidth: 1, borderColor: c.border }}>
                  <Text style={{ fontSize: 22 }}>{icon}</Text>
                  <Text style={{ color: c.text, fontSize: 15, fontWeight: '500', flex: 1 }}>{text}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={{ backgroundColor: c.primary, padding: 18, borderRadius: r.lg, alignItems: 'center' }} onPress={() => setStep(1)}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Get Started →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 1 – Categories */}
        {step === 1 && (
          <View style={{ flex: 1, paddingTop: 16, paddingBottom: 24, gap: 16 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: '800', color: c.text, letterSpacing: -0.5 }}>What fuels you?</Text>
              <Text style={{ fontSize: 15, color: c.textSub, lineHeight: 22, marginTop: 4 }}>Pick the topics that resonate most.</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 16 }}>
                {ALL_CATEGORIES.map(({ key, label, gradient, icon }) => (
                  <CategoryCard key={key} label={label} icon={icon} gradient={gradient} onPress={() => toggleCategory(key)} selected={selectedCategories.includes(key)} />
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={{ backgroundColor: c.primary, padding: 18, borderRadius: r.lg, alignItems: 'center', opacity: selectedCategories.length === 0 ? 0.6 : 1 }} onPress={() => setStep(2)}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {selectedCategories.length > 0 ? `Continue (${selectedCategories.length} selected) →` : 'Skip for now →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 – Notifications */}
        {step === 2 && (
          <View style={{ flex: 1, paddingTop: 16, paddingBottom: 24, gap: 20 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: '800', color: c.text, letterSpacing: -0.5 }}>Never miss a day</Text>
              <Text style={{ fontSize: 15, color: c.textSub, lineHeight: 22, marginTop: 4 }}>A daily reminder builds the habit.</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.card, padding: 18, borderRadius: r.md, borderWidth: 1, borderColor: c.border }}>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>Daily reminder</Text>
              <TouchableOpacity onPress={() => setNotifEnabled(!notifEnabled)}
                style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: notifEnabled ? c.primary : c.border, justifyContent: 'center', paddingHorizontal: 3 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignSelf: notifEnabled ? 'flex-end' : 'flex-start' }} />
              </TouchableOpacity>
            </View>
            {notifEnabled && (
              <View style={{ gap: 12 }}>
                <Text style={{ color: c.textSub, fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>Choose a time</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {TIMES.map((t) => (
                    <TouchableOpacity key={t} onPress={() => setSelectedTime(t)}
                      style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: r.full, backgroundColor: selectedTime === t ? c.primaryDim : c.card, borderWidth: 1, borderColor: selectedTime === t ? c.primary : c.border }}>
                      <Text style={{ color: selectedTime === t ? c.primaryLight : c.textSub, fontSize: 14, fontWeight: selectedTime === t ? '700' : '500' }}>{TIME_LABELS[t]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={{ backgroundColor: c.primary, padding: 18, borderRadius: r.lg, alignItems: 'center', opacity: loading ? 0.6 : 1 }} onPress={finish} disabled={loading}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{loading ? 'Setting up...' : 'Start My Journey 🚀'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
