import type { Session, SortOption } from '@/types';
import { cn, filterSessions } from '@/lib/utils';
import {
  MdDelete,
  MdDownload,
  MdEdit,
  MdOutlineKeyboardArrowDown,
} from 'react-icons/md';
import { useMemo, useState } from 'react';
import { tinyAccentForSeed } from './timeline';
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
  sortOption?: SortOption;
  className?: string;
};

export default function SessionsView({
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
        const data = await new Promise<{ sessions: Session[] }>(resolve => {
          chrome.storage.local.get(['sessions'], res => {
            resolve(res as { sessions: Session[] });
          });
        });

        const sessions = Array.isArray(data.sessions) ? data.sessions : [];
        const updatedSessions = sessions.map(s =>
          s.id === sessionId
            ? { ...s, title: newTitle, updatedAt: Date.now() }
            : s
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
        console.error(
          'Failed to update session title in Chrome storage:',
          error
        );
        throw error;
      }
    } else {
      // Fallback for non-extension environment
      const updatedSessions = storedSessions.map(s =>
        s.id === sessionId
          ? { ...s, title: newTitle, updatedAt: Date.now() }
          : s
      );
      await setStoredSessions(updatedSessions);
    }
  };

  const variants = [
    'w-full sm:w-[14rem] lg:w-[18rem]',
    'w-full sm:w-[18rem] lg:w-[24rem]',
    'w-full sm:w-[22rem] lg:w-[30rem]',
    'w-full sm:w-[26rem] lg:w-[36rem]',
    'w-full sm:w-[30rem] lg:w-[42rem]',
  ] as const;

  const sortedSessions = useMemo(() => {
    if (!sortOption || sortOption === 'date-desc') {
      return [...sessions].sort(
        (a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)
      );
    }
    if (sortOption === 'date-asc') {
      return [...sessions].sort(
        (a, b) => (a.updatedAt ?? a.createdAt) - (b.updatedAt ?? b.createdAt)
      );
    }
    return sessions;
  }, [sessions, sortOption]);

  const filteredSessions = useMemo(() => {
    return filterSessions(sortedSessions, filters);
  }, [sortedSessions, filters]);

  let prevIdx = -1;
  return (
    <div
      className={cn(
        'mx-auto max-w-7xl flex flex-row justify-center items-center gap-6 mt-8 flex-wrap',
        className
      )}
    >
      {filteredSessions.map((s, idx) => {
        const pick = pickWidthVariant(s.id, idx, prevIdx, variants.length);
        const accent = tinyAccentForSeed(s.id);
        const isExpanded = !!expanded[s.id];
        const widthClass = isExpanded
          ? 'w-full sm:w-[42rem] lg:w-[64rem]'
          : variants[pick];
        prevIdx = pick;
        return (
          <ContextMenu>
            <ContextMenuTrigger>
              <article
                key={s.id}
                className={cn(
                  'group relative shrink-0 overflow-hidden rounded-xl border bg-card/60 p-3 px-7 shadow-sm transition hover:shadow-md',
                  widthClass
                )}
              >
                <header className="mb-2 flex items-center justify-between gap-3">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <h3
                    className="line-clamp-1 text-base font-semibold text-foreground"
                    title={s.title || 'Untitled session'}
                  >
                    {s.title || 'Untitled session'}
                  </h3>
                  {typeof s.tabsCount === 'number' && (
                    <span className="shrink-0 rounded-full py-0.5 text-xs font-medium border border-black/5 opacity-70 bg-muted/60 px-2 text-[11px] text-muted-foreground">
                      {s.tabsCount} tabs
                    </span>
                  )}
                  <button
                    aria-expanded={!!expanded[s.id]}
                    onClick={() => toggle(s.id)}
                    className="ml-auto flex items-center justify-center rounded-full transition-colors hover:bg-accent/50 hover:text-accent-foreground"
                    title={expanded[s.id] ? 'Collapse' : 'Expand'}
                  >
                    <MdOutlineKeyboardArrowDown
                      className={cn(
                        'h-5 w-5 text-muted-foreground transition-transform',
                        expanded[s.id] && 'rotate-180'
                      )}
                    />
                  </button>
                </header>

                {expanded[s.id] && s.summary && (
                  <p
                    className="mb-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground"
                    title={s.summary}
                  >
                    {s.summary}
                  </p>
                )}

                <footer className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <time dateTime={toDateTimeAttr(s.updatedAt ?? s.createdAt)}>
                    {formatRelativeDate(s.updatedAt ?? s.createdAt)}
                  </time>
                </footer>

                {expanded[s.id] && (
                  <div className="mt-3 rounded-lg border bg-background/60 p-2 sm:p-3">
                    <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground md:grid-cols-3">
                      <div className="break-all">
                        <span className="opacity-70">Session ID:</span>{' '}
                        <span className="text-foreground/90">{s.id}</span>
                      </div>
                      <div>
                        <span className="opacity-70">Created:</span>{' '}
                        <span className="block sm:inline">
                          {formatTimeSafe(s.createdAt)} •{' '}
                          {formatRelativeDate(s.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-70">Updated:</span>{' '}
                        <span className="block sm:inline">
                          {formatTimeSafe(s.updatedAt)} •{' '}
                          {formatRelativeDate(s.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 overflow-x-auto hidden md:block">
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
                          {(Array.isArray(s.tabs) ? (s.tabs as any[]) : []).map(
                            (t, i) => {
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
                                  key={i}
                                  className="border-b last:border-b-0 align-top"
                                >
                                  <td className="py-2 pr-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {fav ? (
                                        <img
                                          src={fav}
                                          alt=""
                                          className="h-4 w-4 rounded-sm shrink-0"
                                        />
                                      ) : (
                                        <span className="h-4 w-4 rounded-sm bg-muted/60 inline-block shrink-0" />
                                      )}
                                      <span
                                        className="truncate text-foreground"
                                        title={title || 'Untitled tab'}
                                      >
                                        {title
                                          ? title.length > 50
                                            ? `${title.slice(0, 50)}...`
                                            : title
                                          : 'Untitled tab'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2 pr-3 max-w-[20rem] lg:max-w-[28rem]">
                                    {url ? (
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="truncate text-blue-600 hover:underline dark:text-blue-400 block"
                                        title={url}
                                      >
                                        {url.length > 50
                                          ? `${url.slice(0, 50)}...`
                                          : url}
                                      </a>
                                    ) : (
                                      <span className="opacity-60">—</span>
                                    )}
                                  </td>
                                  <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                                    {closedMs ? (
                                      <span className="block lg:inline">
                                        {formatTimeSafe(closedMs)} •{' '}
                                        {formatRelativeDate(closedMs)}
                                      </span>
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
                            }
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3 space-y-2 md:hidden">
                      {(Array.isArray(s.tabs) ? (s.tabs as any[]) : []).map(
                        (t, i) => {
                          const fav = (t as any)?.favIconUrl as
                            | string
                            | undefined;
                          const title = (t as any)?.title as string | undefined;
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
                            <div
                              key={i}
                              className="rounded border bg-background/40 p-2 text-xs"
                            >
                              <div className="flex items-start gap-2 mb-2">
                                {fav ? (
                                  <img
                                    src={fav}
                                    alt=""
                                    className="h-4 w-4 rounded-sm shrink-0 mt-0.5"
                                  />
                                ) : (
                                  <span className="h-4 w-4 rounded-sm bg-muted/60 inline-block shrink-0 mt-0.5" />
                                )}
                                <span
                                  className="text-foreground font-medium leading-tight flex-1 break-words"
                                  title={title || 'Untitled tab'}
                                >
                                  {title || 'Untitled tab'}
                                </span>
                              </div>
                              {url && (
                                <div className="mb-1">
                                  <span className="text-[10px] text-muted-foreground opacity-70">
                                    URL:
                                  </span>{' '}
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline dark:text-blue-400 break-all"
                                    title={url}
                                  >
                                    {url}
                                  </a>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                                {closedMs && (
                                  <div>
                                    <span className="opacity-70">Closed:</span>{' '}
                                    {formatTimeSafe(closedMs)} •{' '}
                                    {formatRelativeDate(closedMs)}
                                  </div>
                                )}
                                {tabId && (
                                  <div>
                                    <span className="opacity-70">ID:</span>{' '}
                                    {tabId}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-transparent via-transparent to-foreground/5 group-hover:block" />
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

function toDateTimeAttr(ts?: number) {
  if (!ts) return '';
  try {
    return new Date(ts).toISOString();
  } catch {
    return '';
  }
}

function formatRelativeDate(ts?: number) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

function formatTimeSafe(ts?: number) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function pickWidthVariant(
  id: string,
  index: number,
  prevIdx: number,
  len: number
): number {
  const base = seededIndex(id, index, len);
  if (prevIdx < 0) return base;
  const distance = Math.abs(base - prevIdx);
  if (distance <= 1) {
    const toStart = prevIdx;
    const toEnd = len - 1 - prevIdx;
    return toStart > toEnd ? 0 : len - 1;
  }
  return base;
}

function seededIndex(id: string, index: number, len: number): number {
  let h = 2166136261 ^ index;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  if (h < 0) h = ~h;
  return h % len;
}
