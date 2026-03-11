import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type NotificationTone = 'quote' | 'teaser' | 'category' | 'personalized';
export type SwipeDirection = 'horizontal' | 'vertical';
export type JournalDepth = 'simple' | 'mood' | 'guided' | 'rich';

export type Settings = {
  favoriteCategories: string[];
  notificationEnabled: boolean;
  notificationTime: string; // "HH:mm"
  notificationTone: NotificationTone;
  swipeDirection: SwipeDirection;
  journalDepth: JournalDepth;
  affirmationsMode: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  favoriteCategories: [],
  notificationEnabled: false,
  notificationTime: '08:00',
  notificationTone: 'quote',
  swipeDirection: 'vertical',
  journalDepth: 'mood',
  affirmationsMode: false,
};

const KEY = 'mindfuel_settings_v2';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const update = async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  return { settings, update, loaded };
}
