import { useAtomValue } from 'jotai';
import { queryAtom } from '../../atoms';

export default function SearchResults() {
  const query = useAtomValue(queryAtom);
  return <div>Search Results for {query}</div>;
}
