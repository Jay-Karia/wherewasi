import { CiSearch } from 'react-icons/ci';
import { Input } from './input';
import { useAtom, useSetAtom } from 'jotai';
import { queryAtom, searchFocusAtom } from '../../../atoms';

export default function Search() {
  const [query, setQuery] = useAtom(queryAtom);
  const setSearchFocus = useSetAtom(searchFocusAtom);

  const searchInput = document.getElementById('search-input');
  document.onkeydown = e => {
    if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'k') {
      searchInput?.focus();
    }
  };

  const shortcut = query ? '' : 'Shift+Alt+K';

  return (
    <div className="flex-1 flex justify-center w-full">
      <div className="w-full max-w-3xl">
        <Input
          type="text"
          placeholder="Search sessions, keywords, or sites..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          icon={<CiSearch size={18} />}
          shortcut={shortcut}
          id="search-input"
          showClear={!!query}
          setQuery={setQuery}
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
        />
      </div>
    </div>
  );
}
