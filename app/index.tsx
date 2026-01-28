import PagerView from 'react-native-pager-view';
import QuoteCard from '../components/QuoteCard';
import { useQuotes } from '../hooks/useQuotes';

export default function Home() {
  const { quotes } = useQuotes();

  return (
    <PagerView style={{ flex: 1 }} initialPage={0}>
      {quotes.map((q) => (
        <QuoteCard key={q.id} id={q.id} text={q.text} category={q.category} />
      ))}
    </PagerView>
  );
}
