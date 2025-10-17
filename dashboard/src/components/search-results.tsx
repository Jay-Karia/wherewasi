import { useAtom, useAtomValue } from 'jotai';
import { queryAtom, sessionsAtom } from '../../atoms';
import type { Session } from '@/types';
import {
  tinyAccentForSeed,
  formatTime,
  formatRelative,
} from './views/timeline';

function highlightText(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function SearchResults() {
  const [query, setQuery] = useAtom(queryAtom);
  const trimmedQuery = query.trim();
  const q = trimmedQuery.toLowerCase();

  const sessions = useAtomValue(sessionsAtom) as Session[];
  const results = sessions.filter(session => {
    const titleMatch = session.title.toLowerCase().includes(q);
    const summaryMatch = session.summary.toLowerCase().includes(q);
    const tabsMatch = session.tabs.some(tab => {
      // string tab
      if (typeof tab === 'string') return tab.toLowerCase().includes(q);
      // object tab with title or url
      if (tab && typeof tab === 'object') {
        const t = tab as Record<string, unknown>;
        if (typeof t.title === 'string' && t.title.toLowerCase().includes(q))
          return true;
        if (typeof t.url === 'string' && t.url.toLowerCase().includes(q))
          return true;
      }
      return false;
    });
    return titleMatch || summaryMatch || tabsMatch;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Search Results for &quot;{trimmedQuery}&quot;
      </h2>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">{results.length} result(s) found</p>
      </div>
      {results.length === 0 ? (
        <p className="text-gray-600">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((session: Session) => {
            const matchedTabs = session.tabs.filter(tab => {
              if (typeof tab === 'string') return tab.toLowerCase().includes(q);
              if (tab && typeof tab === 'object') {
                const t = tab as Record<string, unknown>;
                return (
                  (typeof t.title === 'string' &&
                    t.title.toLowerCase().includes(q)) ||
                  (typeof t.url === 'string' && t.url.toLowerCase().includes(q))
                );
              }
              return false;
            }) as (string | Record<string, unknown>)[];
            const accent = tinyAccentForSeed(session.id);
            return (
              <article
                key={session.id}
                className="group rounded-lg border bg-card/60 p-4 transition hover:shadow-md ring-1 ring-border/60"
              >
                <header className="mb-2 flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <h3 className="text-lg font-semibold text-foreground">
                    {highlightText(session.title, q)}
                  </h3>
                </header>
                <p className="text-xs text-muted-foreground mb-4">
                  {highlightText(session.summary, q) || (
                    <span className="opacity-60">No summary</span>
                  )}
                </p>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground mb-2">
                  <span>Tabs: {session.tabs.length}</span>
                  <span>
                    {formatTime(session.createdAt as number)} •{' '}
                    {formatRelative(session.createdAt as number)}
                  </span>
                </div>
                {matchedTabs.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      Matched Tabs:
                    </h4>
                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                      {matchedTabs.slice(0, 3).map((tab, idx) => {
                        const label =
                          typeof tab === 'string'
                            ? tab
                            : (tab as Record<string, unknown>).title ||
                              (tab as Record<string, unknown>).url ||
                              '';
                        return (
                          <li key={idx}>{highlightText(label as string, q)}</li>
                        );
                      })}
                      {matchedTabs.length > 3 && (
                        <li className="mt-1">
                          ...and {matchedTabs.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
