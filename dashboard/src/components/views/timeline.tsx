import type { Session, SortOption } from '@/types';
import { cn, filterSessions } from '@/lib/utils';
import {
  MdDelete,
  MdDownload,
  MdEdit,
  MdOutlineKeyboardArrowDown,
} from 'react-icons/md';
import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { filtersAtom } from '../../../atoms';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { EditSessionTitle } from '@/components/ui/edit-session-title';
import { useStorage } from '@/hooks/useStorage';

type Props = {
  sessions: Session[];
  sortOption: SortOption;
  className?: string;
};

export function tinyAccentForSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const abs = Math.abs(h);
  const huePalette = [170, 150, 200, 185];
  const hue = huePalette[abs % huePalette.length];
  const sat = 55 + ((abs >> 3) % 10); // 55..64
  const light = 48 + ((abs >> 5) % 8); // 48..55
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

export default function TimelineView({
  sessions,
  sortOption,
  className,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const toggle = (id: string) => setExpanded(m => ({ ...m, [id]: !m[id] }));
  const filters = useAtomValue(filtersAtom);
  const [storedSessions, setStoredSessions] = useStorage<Session[]>({
    key: 'sessions',
    initialValue: [],
  });

  const handleEditTitle = (session: Session) => {
    setEditingSession(session);
    setEditDialogOpen(true);
  };

  const handleSaveTitle = async (sessionId: string, newTitle: string) => {
    // Update in Chrome storage using the storage service
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        const data = await new Promise<{ sessions: Session[] }>((resolve) => {
          chrome.storage.local.get(['sessions'], (res) => {
            resolve(res as { sessions: Session[] });
          });
        });

        const sessions = Array.isArray(data.sessions) ? data.sessions : [];
        const updatedSessions = sessions.map(s =>
          s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s
        );

        await new Promise<void>((resolve, reject) => {
          chrome.storage.local.set({ sessions: updatedSessions }, () => {
            if (chrome.runtime?.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });

        // Also update local state
        await setStoredSessions(updatedSessions);
      } catch (error) {
        console.error('Failed to update session title in Chrome storage:', error);
        throw error;
      }
    } else {
      // Fallback for non-extension environment
      const updatedSessions = storedSessions.map(s =>
        s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s
      );
      await setStoredSessions(updatedSessions);
    }
  };

  const sortedSessions = useMemo(() => {
    const list = [...sessions];
    switch (sortOption) {
      case 'date-asc':
        return list.sort((a, b) => {
          const ta = (a.updatedAt ?? a.createdAt ?? 0) as number;
          const tb = (b.updatedAt ?? b.createdAt ?? 0) as number;
          return ta - tb;
        });
      case 'date-desc':
      default:
        return list.sort((a, b) => {
          const ta = (a.updatedAt ?? a.createdAt ?? 0) as number;
          const tb = (b.updatedAt ?? b.createdAt ?? 0) as number;
          return tb - ta;
        });
    }
  }, [sessions, sortOption]);

  const filteredSessions = useMemo(() => {
    return filterSessions(sortedSessions, filters);
  }, [sortedSessions, filters]);

  const normalized = (filteredSessions || [])
    .map(s => ({
      ...s,
      _ts: (s.updatedAt ?? s.createdAt ?? 0) as number,
    }))
    .filter(s => Number.isFinite(s._ts) && s._ts > 0);

  const groups = groupByDay(normalized);
  const dayKeys = Object.keys(groups).sort((a, b) => {
    if (sortOption === 'date-asc') {
      return Number(a) - Number(b);
    }
    return Number(b) - Number(a);
  });

  return (
    <div
      className={cn(
        'mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8 mb-12',
        className
      )}
    >
      {dayKeys.map((dayKey, idx) => {
        const dayTs = Number(dayKey);
        const items = groups[dayKey];
        return (
          <section key={dayKey} className={cn('relative', idx > 0 && 'mt-10')}>
            <DayHeader ts={dayTs} count={items.length} />
            <div className="pointer-events-none absolute left-1/2 top-16 bottom-2 -translate-x-1/2 hidden w-px bg-border/60 md:block" />
            <ul className="mt-4 space-y-6">
              {items.map((s, i) => {
                const accent = tinyAccentForSeed(s.id);
                const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';
                const isExpanded = !!expanded[s.id];
                if (isExpanded) {
                  return (
                    <li key={s.id}>
                      <div className="md:mx-auto md:max-w-6xl">
                        <ContextMenu>
                          <ContextMenuTrigger>
                            <article
                              className={cn(
                                'relative rounded-lg border bg-card/60 p-2 sm:p-4 shadow-sm transition md:p-5 hover:shadow-md ring-1 ring-border/60'
                              )}
                            >
                              <header className="flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: accent }}
                                  />
                                  <h4 className="line-clamp-1 text-[14px] font-semibold text-foreground">
                                    {s.title || 'Untitled session'}
                                  </h4>
                                </div>
                                {typeof s.tabsCount === 'number' && (
                                  <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    {s.tabsCount} tabs
                                  </span>
                                )}
                                <button
                                  onClick={() => toggle(s.id)}
                                  aria-expanded={isExpanded}
                                  className="ml-1 inline-flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground transition hover:bg-accent/60 hover:text-accent-foreground"
                                  title="Collapse"
                                >
                                  <MdOutlineKeyboardArrowDown className="h-4 w-4 rotate-180 transition-transform" />
                                </button>
                              </header>
                              {s.summary && (
                                <p
                                  className="mt-1 line-clamp-3 text-xs text-muted-foreground md:text-[13px]"
                                  title={s.summary}
                                >
                                  {s.summary}
                                </p>
                              )}
                              <footer className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                <time dateTime={toISO(s._ts)}>
                                  {formatTime(s._ts)}
                                </time>
                                <span className="opacity-80">
                                  {formatRelative(s._ts)}
                                </span>
                              </footer>
                              <ExpandedDetails session={s} />
                            </article>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onSelect={() => handleEditTitle(s)}>
                              <MdEdit className="mr-2 h-4 w-4" />
                              Edit Title
                            </ContextMenuItem>
                            <ContextMenuItem>
                              <MdDownload className="mr-2 h-4 w-4" />
                              Export Session
                            </ContextMenuItem>
                            <ContextMenuItem className="text-destructive">
                              <MdDelete className="mr-2 h-4 w-4" />
                              Delete Session
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={s.id}>
                    <div className="md:grid md:grid-cols-[1fr_16px_1fr] md:items-start md:gap-0">
                      {side === 'left' ? (
                        <>
                          <div className="md:pr-6">
                            <ContextMenu>
                              <ContextMenuTrigger>
                                <article
                                  className={cn(
                                    'relative rounded-lg border bg-card/60 p-2 sm:p-3 shadow-sm transition hover:shadow-md',
                                    isExpanded && 'ring-1 ring-border/60'
                                  )}
                                >
                                  <div
                                    className="pointer-events-none absolute left-2 w-px bg-border/60 md:hidden"
                                    style={{ top: -14, bottom: -14 }}
                                  />
                                  <header className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span
                                        className="h-2 w-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: accent }}
                                      />
                                      <h4
                                        className="line-clamp-1 text-[13px] font-semibold text-foreground"
                                        title={s.title}
                                      >
                                        {s.title || 'Untitled session'}
                                      </h4>
                                    </div>
                                    {typeof s.tabsCount === 'number' && (
                                      <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                        {s.tabsCount} tabs
                                      </span>
                                    )}
                                    <button
                                      onClick={() => toggle(s.id)}
                                      aria-expanded={isExpanded}
                                      className="ml-1 inline-flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground transition hover:bg-accent/60 hover:text-accent-foreground"
                                      title={isExpanded ? 'Collapse' : 'Expand'}
                                    >
                                      <MdOutlineKeyboardArrowDown
                                        className={cn(
                                          'h-4 w-4 transition-transform',
                                          isExpanded && 'rotate-180'
                                        )}
                                      />
                                    </button>
                                  </header>
                                  {s.summary && (
                                    <p
                                      className="mt-1 line-clamp-2 text-xs text-muted-foreground"
                                      title={s.summary}
                                    >
                                      {s.summary}
                                    </p>
                                  )}
                                  <footer className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <time dateTime={toISO(s._ts)}>
                                      {formatTime(s._ts)}
                                    </time>
                                    <span className="opacity-80">
                                      {formatRelative(s._ts)}
                                    </span>
                                  </footer>
                                  {isExpanded && (
                                    <ExpandedDetails session={s} />
                                  )}
                                </article>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <ContextMenuItem onSelect={() => handleEditTitle(s)}>
                                  <MdEdit className="mr-2 h-4 w-4" />
                                  Edit Title
                                </ContextMenuItem>
                                <ContextMenuItem>
                                  <MdDownload className="mr-2 h-4 w-4" />
                                  Export Session
                                </ContextMenuItem>
                                <ContextMenuItem className="text-destructive">
                                  <MdDelete className="mr-2 h-4 w-4" />
                                  Delete Session
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          </div>
                          <div className="relative hidden items-center justify-center md:flex">
                            <span className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-transparent" />
                            <span className="absolute left-0 right-1/2 top-1/2 h-px -translate-y-1/2 bg-border/60" />
                            <span
                              className="relative z-10 h-3 w-3 rounded-full ring-2 ring-background"
                              style={{ backgroundColor: accent }}
                            />
                          </div>
                          <div className="hidden md:block" />
                        </>
                      ) : (
                        <>
                          <div className="hidden md:block" />
                          <div className="relative hidden items-center justify-center md:flex">
                            <span className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-transparent" />
                            <span className="absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-border/60" />
                            <span
                              className="relative z-10 h-3 w-3 rounded-full ring-2 ring-background"
                              style={{ backgroundColor: accent }}
                            />
                          </div>
                          <div className="md:pl-6">
                            <ContextMenu>
                              <ContextMenuTrigger>
                                <article
                                  className={cn(
                                    'relative rounded-lg border bg-card/60 p-2 sm:p-3 shadow-sm transition hover:shadow-md',
                                    isExpanded && 'ring-1 ring-border/60'
                                  )}
                                >
                                  <div
                                    className="pointer-events-none absolute left-2 w-px bg-border/60 md:hidden"
                                    style={{ top: -14, bottom: -14 }}
                                  />
                                  <header className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span
                                        className="h-2 w-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: accent }}
                                      />
                                      <h4 className="line-clamp-1 text-[13px] font-semibold text-foreground">
                                        {s.title || 'Untitled session'}
                                      </h4>
                                    </div>
                                    {typeof s.tabsCount === 'number' && (
                                      <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                        {s.tabsCount} tabs
                                      </span>
                                    )}
                                    <button
                                      onClick={() => toggle(s.id)}
                                      aria-expanded={isExpanded}
                                      className="ml-1 inline-flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground transition hover:bg-accent/60 hover:text-accent-foreground"
                                      title={isExpanded ? 'Collapse' : 'Expand'}
                                    >
                                      <MdOutlineKeyboardArrowDown
                                        className={cn(
                                          'h-4 w-4 transition-transform',
                                          isExpanded && 'rotate-180'
                                        )}
                                      />
                                    </button>
                                  </header>
                                  {s.summary && (
                                    <p
                                      className="mt-1 line-clamp-2 text-xs text-muted-foreground"
                                      title={s.summary}
                                    >
                                      {s.summary}
                                    </p>
                                  )}
                                  <footer className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <time dateTime={toISO(s._ts)}>
                                      {formatTime(s._ts)}
                                    </time>
                                    <span className="opacity-80">
                                      {formatRelative(s._ts)}
                                    </span>
                                  </footer>
                                  {isExpanded && (
                                    <ExpandedDetails session={s} />
                                  )}
                                </article>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <ContextMenuItem onSelect={() => handleEditTitle(s)}>
                                  <MdEdit className="mr-2 h-4 w-4" />
                                  Edit Title
                                </ContextMenuItem>
                                <ContextMenuItem>
                                  <MdDownload className="mr-2 h-4 w-4" />
                                  Export Session
                                </ContextMenuItem>
                                <ContextMenuItem className="text-destructive">
                                  <MdDelete className="mr-2 h-4 w-4" />
                                  Delete Session
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {editingSession && (
        <EditSessionTitle
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          session={editingSession}
          onSave={handleSaveTitle}
        />
      )}
    </div>
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

function DayHeader({ ts, count }: { ts: number; count: number }) {
  const label = formatDay(ts);
  return (
    <div className="relative mt-2 mb-2">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-600" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 py-1 text-xs font-medium text-foreground rounded-full border border-gray-500 shadow-sm">
          {label}
          <span className="ml-2 text-muted-foreground">
            • {count} {count === 1 ? 'entry' : 'entries'}
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

export function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelative(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

export function toISO(ts: number) {
  try {
    return new Date(ts).toISOString();
  } catch {
    return '';
  }
}

function ExpandedDetails({ session }: { session: Session & { _ts?: number } }) {
  return (
    <div className="mt-3 rounded-md border bg-background/60 p-2 sm:p-3">
      <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <span className="opacity-70">Session ID:</span>{' '}
          <span className="break-all text-foreground/90">{session.id}</span>
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
      <div className="mt-3 overflow-x-auto -mx-2 sm:mx-0">
        <table className="min-w-full text-left">
          <thead className="text-[11px] text-muted-foreground">
            <tr className="border-b">
              <th className="py-1 pl-2 pr-3 sm:pl-0 font-medium">Tab</th>
              <th className="py-1 pr-3 font-medium hidden sm:table-cell">
                URL
              </th>
              <th className="py-1 pr-3 font-medium hidden md:table-cell">
                Closed
              </th>
              <th className="py-1 pr-3 font-medium hidden lg:table-cell">
                Tab ID
              </th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {(Array.isArray((session as any).tabs)
              ? ((session as any).tabs as any[])
              : []
            ).map((t, i) => {
              const fav = (t as any)?.favIconUrl as string | undefined;
              const title = (t as any)?.title as string | undefined;
              const url = (t as any)?.url as string | undefined;
              const tabId = (t as any)?.id as number | string | undefined;
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
                <tr key={i} className="border-b last:border-b-0 align-top">
                  <td className="py-2 pl-2 pr-3 sm:pl-0">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {fav ? (
                          <img
                            src={fav}
                            alt=""
                            className="h-4 w-4 rounded-sm shrink-0"
                          />
                        ) : (
                          <span className="inline-block h-4 w-4 rounded-sm bg-muted/60 shrink-0" />
                        )}
                        <span
                          className="break-words text-foreground"
                          title={title || 'Untitled tab'}
                        >
                          {title || 'Untitled tab'}
                        </span>
                      </div>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="sm:hidden text-blue-600 hover:underline dark:text-blue-400 break-all text-[10px] pl-6"
                          title={url}
                        >
                          {url}
                        </a>
                      )}
                      {closedMs && (
                        <span className="md:hidden text-muted-foreground text-[10px] pl-6">
                          Closed: {formatTime(closedMs)} •{' '}
                          {formatRelative(closedMs)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[20rem] py-2 pr-3 hidden sm:table-cell">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                        title={url}
                      >
                        <span className="truncate block" title={url}>
                          {url}
                        </span>
                      </a>
                    ) : (
                      <span className="opacity-60">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground hidden md:table-cell">
                    {closedMs ? (
                      <>
                        {formatTime(closedMs)} • {formatRelative(closedMs)}
                      </>
                    ) : (
                      <span className="opacity-60">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground hidden lg:table-cell">
                    {tabId ?? <span className="opacity-60">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
