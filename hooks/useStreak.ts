import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

type StreakData = {
  current: number;
  longest: number;
  lastVisit: string; // ISO date string YYYY-MM-DD
};

const KEY = 'mindfuel_streak_v2';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastVisit: '' });

  useEffect(() => {
    tick();
  }, []);

  const tick = async () => {
    const raw = await AsyncStorage.getItem(KEY);
    const today = todayStr();
    const yesterday = yesterdayStr();

    let data: StreakData = raw
      ? JSON.parse(raw)
      : { current: 0, longest: 0, lastVisit: '' };

    if (data.lastVisit === today) {
      // Already visited today — just load
      setStreak(data);
      return;
    }

    if (data.lastVisit === yesterday) {
      // Consecutive day — increment
      data.current += 1;
    } else {
      // Streak broken
      data.current = 1;
    }

    data.longest = Math.max(data.current, data.longest);
    data.lastVisit = today;

    setStreak(data);
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  };

  return streak;
}
