import affirmations from '../assets/data/affirmations.json';
import { CategoryKey } from '../assets/data/categoryColors';
import rawQuotes from '../assets/data/quotes.json';

type Quote = {
  id: string;
  text: string;
  category: CategoryKey;
};
const quotes: Quote[] = rawQuotes as Quote[];

export const useQuotes = () => {
  return {
    quotes,
    affirmations: affirmations as Quote[],
  };
};
