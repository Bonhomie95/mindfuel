import { useMemo } from 'react';
import rawAffirmations from '../assets/data/affirmations.json';
import rawQuotes from '../assets/data/quotes.json';
import type { CategoryKey } from '../assets/data/categoryColors';

export type Quote = {
  id: string;
  text: string;
  author?: string;
  category: CategoryKey;
};

const quotes: Quote[] = rawQuotes as Quote[];
const affirmations: Quote[] = rawAffirmations as Quote[];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function useQuotes(categoryFilter?: CategoryKey | null) {
  const filtered = useMemo(() => {
    if (!categoryFilter) return quotes;
    return quotes.filter((q) => q.category === categoryFilter);
  }, [categoryFilter]);

  const quoteOfTheDay = useMemo(() => {
    const day = getDayOfYear() + new Date().getFullYear();
    return quotes[day % quotes.length];
  }, []);

  const search = (query: string): Quote[] => {
    if (query.length < 3) return [];
    const q = query.toLowerCase();
    const results = quotes.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
    // Fallback: if no results, search affirmations too
    if (results.length === 0) {
      return affirmations.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }
    return results;
  };

  return { quotes: filtered, allQuotes: quotes, affirmations, quoteOfTheDay, search };
}
