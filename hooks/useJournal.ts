/**
 * useJournal — module-level shared state
 *
 * Same singleton pattern as useFavorites.
 * addEntry/deleteEntry in the home screen's JournalModal immediately
 * reflects in the Journal tab without any reload.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type Mood = '😊' | '😌' | '🔥' | '😢' | '😤' | '🙏' | '💪' | '🤔';

export type JournalEntry = {
  id: string;
  quoteId: string;
  quoteText: string;
  quoteAuthor?: string;
  mood?: Mood;
  note: string;
  prompt?: string;
  createdAt: string;
};

const KEY = 'mindfuel_journal_v2';

export const MOODS: Mood[] = ['😊', '😌', '🔥', '😢', '😤', '🙏', '💪', '🤔'];

export const MOOD_LABELS: Record<Mood, string> = {
  '😊': 'Happy',
  '😌': 'Peaceful',
  '🔥': 'Motivated',
  '😢': 'Sad',
  '😤': 'Frustrated',
  '🙏': 'Grateful',
  '💪': 'Strong',
  '🤔': 'Reflective',
};

export const GUIDED_PROMPTS = [
  'How does this quote apply to your life right now?',
  'What specific action can this inspire you to take today?',
  'When have you experienced this truth firsthand?',
  'Who in your life embodies this wisdom? What can you learn from them?',
  'What would change in your life if you truly lived by this?',
  'What feelings come up when you read this?',
  'Write about a challenge where this wisdom would have helped.',
  'How has your understanding of this idea grown over time?',
];

// ─── Module-level singleton ───────────────────────────────────────────────────
let _data: JournalEntry[] = [];
let _loaded = false;
const _listeners = new Set<(e: JournalEntry[]) => void>();

function _broadcast(next: JournalEntry[]) {
  _data = next;
  _listeners.forEach((fn) => fn([...next]));
}

async function _persist(next: JournalEntry[]) {
  _broadcast(next);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
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
export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(_data);

  useEffect(() => {
    _listeners.add(setEntries);
    setEntries([..._data]);
    _ensureLoaded().then(() => setEntries([..._data]));
    return () => { _listeners.delete(setEntries); };
  }, []);

  const addEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `j_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await _persist([newEntry, ..._data]);
    return newEntry;
  };

  const updateEntry = async (id: string, patch: Partial<JournalEntry>) => {
    await _persist(_data.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const deleteEntry = async (id: string) => {
    await _persist(_data.filter((e) => e.id !== id));
  };

  const getEntryForQuote = (quoteId: string) =>
    _data.find((e) => e.quoteId === quoteId);

  return { entries, addEntry, updateEntry, deleteEntry, getEntryForQuote };
}
