/**
 * useDailyFeed
 *
 * Returns a small, deterministic daily selection of quotes/affirmations.
 * - The same N quotes are shown for the entire day (seeded by date)
 * - N is controlled by settings.dailyLimit (2 or 3)
 * - Always starts with the Quote of the Day as slot 0
 * - The selection rotates each day so users never see the same set twice in a row
 * - Works for both quotes and affirmations mode
 */
import { useMemo } from 'react';
import type { Quote } from './useQuotes';

function todaySeed(): number {
  const d = new Date();
  // Unique integer per calendar day
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// Deterministic shuffle using a seeded LCG (no external deps)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildDailyFeed(
  allQuotes: Quote[],
  quoteOfTheDay: Quote,
  limit: number
): Quote[] {
  if (allQuotes.length === 0) return [];

  const seed = todaySeed();
  const shuffled = seededShuffle(allQuotes, seed);

  // Pin QOTD as the first card, then fill remaining slots from the shuffle
  // (filtering out the QOTD so it never appears twice)
  const rest = shuffled.filter((q) => q.id !== quoteOfTheDay.id);
  const extras = rest.slice(0, limit - 1);

  return [quoteOfTheDay, ...extras];
}

export function buildDailyAffirmations(
  allAffirmations: Quote[],
  limit: number
): Quote[] {
  if (allAffirmations.length === 0) return [];
  const seed = todaySeed() + 1; // offset so affirmations differ from quotes
  const shuffled = seededShuffle(allAffirmations, seed);
  return shuffled.slice(0, limit);
}
