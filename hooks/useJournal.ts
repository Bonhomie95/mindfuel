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
  createdAt: string; // ISO
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

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setEntries(JSON.parse(raw));
    });
  }, []);

  const save = async (updated: JournalEntry[]) => {
    setEntries(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  };

  const addEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `j_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await save([newEntry, ...entries]);
    return newEntry;
  };

  const updateEntry = async (id: string, patch: Partial<JournalEntry>) => {
    const updated = entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
    await save(updated);
  };

  const deleteEntry = async (id: string) => {
    await save(entries.filter((e) => e.id !== id));
  };

  const getEntryForQuote = (quoteId: string) =>
    entries.find((e) => e.quoteId === quoteId);

  return { entries, addEntry, updateEntry, deleteEntry, getEntryForQuote };
}
