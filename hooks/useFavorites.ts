import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

const KEY = 'mindfuel_favorites_v2';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setFavorites(JSON.parse(raw));
    });
  }, []);

  const toggleFavorite = async (id: string) => {
    const isFav = favorites.includes(id);
    const updated = isFav
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];

    setFavorites(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));

    if (!isFav) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}
