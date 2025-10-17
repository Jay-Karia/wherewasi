import { useAtom, useAtomValue } from 'jotai';
import { useState, useMemo } from 'react';
import { queryAtom, sessionsAtom } from '../../atoms';
import type { Session } from '@/types';
import {
  tinyAccentForSeed,
  formatTime,
  formatRelative,
  toISO,
} from './views/timeline';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { cn } from '@/lib/utils';

function highlightText(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function groupByDay(list: Array<Session & { _ts: number }>) {
  const out: Record<string, Array<Session & { _ts: number }>> = {};
  for (const s of list) {
    const d = new Date(s._ts);
    d.setHours(0, 0, 0, 0);
    const key = String(d.getTime());
    (out[key] ||= []).push(s);
  }
  return out;
}

function DaySeparator({ ts, count }: { ts: number; count: number }) {
  const label = formatDay(ts);
  return (
    <div className="relative mt-2 mb-2">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border/90" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 py-1 text-xs font-medium text-foreground rounded-full border border-gray-700 shadow-sm">
          {label}
          <span className="ml-2 text-muted-foreground">
            • {count} {count === 1 ? 'result' : 'results'}
          </span>
        </span>
      </div>
    </div>
  );
}

function formatDay(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOf = (T: Date) =>
    new Date(T.getFullYear(), T.getMonth(), T.getDate()).getTime();
  const diffDays = Math.floor((startOf(now) - startOf(d)) / dayMs);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SearchResults() {
  const [query] = useAtom(queryAtom);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded(m => ({ ...m, [id]: !m[id] }));
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

  // Normalize and group by day
  const normalized = useMemo(() => {
    return results
      .map((s) => ({
        ...s,
        _ts: (s.updatedAt ?? s.createdAt ?? 0) as number,
      }))
      .filter((s) => Number.isFinite(s._ts) && s._ts > 0);
  }, [results]);

  const groups = useMemo(() => groupByDay(normalized), [normalized]);
  const dayKeys = useMemo(() => {
    return Object.keys(groups).sort((a, b) => Number(b) - Number(a));
  }, [groups]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8 lg:px-12 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Search Results for &quot;{trimmedQuery}&quot;
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? 'result' : 'results'} found
        </p>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No results found.</p>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Try a different search term
          </p>
        </div>
      ) : (
        <div>
          {dayKeys.map((k, idx) => {
            const ts = Number(k);
            const items = groups[k];
            return (
              <section key={k} className={cn(idx > 0 && 'mt-8')}>
                <DaySeparator ts={ts} count={items.length} />
                <div className="mt-4 space-y-4 mb-12">
                  {items.map((session: Session & { _ts: number }) => {
                    const accent = tinyAccentForSeed(session.id);
                    const isExpanded = expanded[session.id];

                    return (
                      <article
                        key={session.id}
                        className="group relative overflow-hidden rounded-lg border bg-card/60 shadow-sm transition hover:shadow-md"
                      >
                        {/* Vertical line indicator on the left */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1"
                          style={{ backgroundColor: accent }}
                        />

                        <div className="pl-4 pr-4 py-4">
                          <header className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: accent }}
                              />
                              <h4 className="line-clamp-1 text-base font-semibold text-foreground">
                                {highlightText(session.title || 'Untitled session', q)}
                              </h4>
                            </div>
                            {typeof session.tabsCount === 'number' && (
                              <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {session.tabsCount} tabs
                              </span>
                            )}
                            <button
                              onClick={() => toggle(session.id)}
                              aria-expanded={isExpanded}
                              className="ml-1 inline-flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground transition hover:bg-accent/60 hover:text-accent-foreground"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              <MdOutlineKeyboardArrowDown
                                className={cn(
                                  'h-5 w-5 transition-transform',
                                  isExpanded && 'rotate-180'
                                )}
                              />
                            </button>
                          </header>

                          <p
                            className={cn(
                              'mt-2 text-sm text-muted-foreground',
                              !isExpanded && 'line-clamp-2'
                            )}
                          >
                            {highlightText(session.summary || 'No summary', q)}
                          </p>

                          <footer className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                            <time dateTime={toISO(session.createdAt as number)}>
                              {formatTime(session.createdAt as number)}
                            </time>
                            <span className="opacity-80">
                              {formatRelative(session.createdAt as number)}
                            </span>
                          </footer>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t bg-background/40 px-4 pb-4 pt-3">
                            <div className="rounded-md border bg-background/60 p-3">
                              <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground sm:grid-cols-3">
                                <div>
                                  <span className="opacity-70">Session ID:</span>{' '}
                                  <span className="break-all text-foreground/90">
                                    {session.id}
                                  </span>
                                </div>
                                <div>
                                  <span className="opacity-70">Created:</span>{' '}
                                  <span>
                                    {formatTime(session.createdAt as number)} •{' '}
                                    {formatRelative(session.createdAt as number)}
                                  </span>
                                </div>
                                <div>
                                  <span className="opacity-70">Updated:</span>{' '}
                                  <span>
                                    {formatTime(session.updatedAt as number)} •{' '}
                                    {formatRelative(session.updatedAt as number)}
                                  </span>
                                </div>
                              </div>

                              {/* Tabs table */}
                              <div className="mt-3 overflow-x-auto">
                                <table className="min-w-full text-left">
                                  <thead className="text-[11px] text-muted-foreground">
                                    <tr className="border-b">
                                      <th className="py-1 pr-3 font-medium">Tab</th>
                                      <th className="py-1 pr-3 font-medium">URL</th>
                                      <th className="py-1 pr-3 font-medium">Closed</th>
                                      <th className="py-1 pr-3 font-medium">Tab ID</th>
                                    </tr>
                                  </thead>
                                  <tbody className="text-xs">
                                    {(Array.isArray(session.tabs)
                                      ? (session.tabs as any[])
                                      : []
                                    ).map((t, idx) => {
                                      const fav = (t as any)?.favIconUrl as
                                        | string
                                        | undefined;
                                      const title = (t as any)?.title as
                                        | string
                                        | undefined;
                                      const url = (t as any)?.url as string | undefined;
                                      const tabId = (t as any)?.id as
                                        | number
                                        | string
                                        | undefined;
                                      const closedAt = (t as any)?.closedAt as
                                        | string
                                        | number
                                        | undefined;
                                      const closedMs =
                                        typeof closedAt === 'string'
                                          ? Date.parse(closedAt)
                                          : typeof closedAt === 'number'
                                            ? closedAt
                                            : undefined;
                                      return (
                                        <tr
                                          key={idx}
                                          className="border-b last:border-b-0 align-top"
                                        >
                                          <td className="py-2 pr-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                              {fav ? (
                                                <img
                                                  src={fav}
                                                  alt=""
                                                  className="h-4 w-4 rounded-sm"
                                                />
                                              ) : (
                                                <span className="inline-block h-4 w-4 rounded-sm bg-muted/60" />
                                              )}
                                              <span
                                                className="truncate text-foreground"
                                                title={title || 'Untitled tab'}
                                              >
                                                {highlightText(
                                                  title
                                                    ? title.length > 50
                                                      ? `${title.slice(0, 50)}...`
                                                      : title
                                                    : 'Untitled tab',
                                                  q
                                                )}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="max-w-[28rem] py-2 pr-3">
                                            {url ? (
                                              <a
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="truncate text-blue-600 hover:underline dark:text-blue-400"
                                                title={url}
                                              >
                                                <span className="truncate block">
                                                  {highlightText(
                                                    url.length > 50
                                                      ? `${url.slice(0, 50)}...`
                                                      : url,
                                                    q
                                                  )}
                                                </span>
                                              </a>
                                            ) : (
                                              <span className="opacity-60">—</span>
                                            )}
                                          </td>
                                          <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground">
                                            {closedMs ? (
                                              `${formatTime(closedMs)} • ${formatRelative(closedMs)}`
                                            ) : (
                                              <span className="opacity-60">—</span>
                                            )}
                                          </td>
                                          <td className="py-2 pr-3 text-muted-foreground">
                                            {tabId ?? (
                                              <span className="opacity-60">—</span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-transparent via-transparent to-foreground/5 group-hover:block" />
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
