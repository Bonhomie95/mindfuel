import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const KEY = 'mindfuel_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await AsyncStorage.getItem(KEY);
    if (data) setFavorites(JSON.parse(data));
  };

  const toggleFavorite = async (id: string) => {
    let updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];

    setFavorites(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  };

  return { favorites, toggleFavorite };
};
