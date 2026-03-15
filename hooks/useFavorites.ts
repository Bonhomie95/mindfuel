/**
 * useFavorites — module-level shared state
 *
 * All hook instances share the same underlying array.
 * When any instance calls toggleFavorite(), every mounted component
 * (QuoteCard, Favorites tab, etc.) updates instantly — no AsyncStorage
 * re-read needed.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

const KEY = 'mindfuel_favorites_v2';

// ─── Module-level singleton ───────────────────────────────────────────────────
let _data: string[] = [];
let _loaded = false;
const _listeners = new Set<(f: string[]) => void>();

function _broadcast(next: string[]) {
  _data = next;
  _listeners.forEach((fn) => fn([...next]));
}

async function _ensureLoaded() {
  if (_loaded) return;
  _loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) _broadcast(JSON.parse(raw));
  } catch {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(_data);

  useEffect(() => {
    _listeners.add(setFavorites);
    // If another instance already loaded, hydrate immediately
    setFavorites([..._data]);
    // Load from storage on first ever mount
    _ensureLoaded().then(() => setFavorites([..._data]));
    return () => { _listeners.delete(setFavorites); };
  }, []);

  const toggleFavorite = async (id: string) => {
    const isFav = _data.includes(id);
    const next = isFav ? _data.filter((f) => f !== id) : [..._data, id];
    _broadcast(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    if (!isFav) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}
