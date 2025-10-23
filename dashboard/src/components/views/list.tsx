import type { Session, SortOption } from '@/types';
import {
  cn,
  filterSessions,
  updateSessionTitle,
  deleteSession,
  removeTabsFromSession,
  moveTabBetweenSessions,
  updateSessionSummary,
} from '@/lib/utils';
import { tinyAccentForSeed } from './timeline';
import { IoMdExpand } from 'react-icons/io';
import { useState, useMemo, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { filtersAtom } from '../../../atoms';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { MdAutorenew, MdDelete, MdEdit } from 'react-icons/md';
import { FiMinus } from 'react-icons/fi';
import { EditSessionTitle } from '@/components/ui/edit-session-title';
import { useStorage } from '@/hooks/useStorage';
import { Checkbox } from '@/components/ui/checkbox';

export default function ListView({
  sessions,
  sortOption,
}: {
  sessions: Session[];
  sortOption: SortOption;
}) {
  const filters = useAtomValue(filtersAtom);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [selectedTabs, setSelectedTabs] = useState<Record<string, Set<number>>>(
    {}
  );
  const [removalMode, setRemovalMode] = useState<Record<string, boolean>>({});
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [draggedTab, setDraggedTab] = useState<{
    sessionId: string;
    tabIndex: number;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(m => ({ ...m, [id]: !m[id] }));
  const [, setStoredSessions] = useStorage<Session[]>({
    key: 'sessions',
    initialValue: [],
  });

  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const storage = (window as any).chrome?.storage?.local;
    let mounted = true;

    async function readInitial() {
      if (!storage) return;
      try {
        const res = await storage.get(['disabled']);
        if (mounted) setIsDisabled(Boolean(res?.disabled));
      } catch {
        // fallback to callback style
        try {
          storage.get(['disabled'], (result: any) => {
            if (mounted) setIsDisabled(Boolean(result?.disabled));
          });
        } catch {
          // ignore
        }
      }
    }

    readInitial();

    const onChanged = (changes: any, areaName: string) => {
      if (areaName !== 'local') return;
      if (changes?.disabled) {
        setIsDisabled(Boolean(changes.disabled.newValue));
      }
    };

    try {
      (window as any).chrome?.storage?.onChanged?.addListener(onChanged);
    } catch {
      // ignore if API not available (e.g., in tests)
    }

    return () => {
      mounted = false;
      try {
        (window as any).chrome?.storage?.onChanged?.removeListener(onChanged);
      } catch {
        // ignore
      }
    };
  }, []);

  // Track Alt key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(false);
        setDraggedTab(null);
        setDropTarget(null);
      }
    };

    const handleBlur = () => {
      setIsAltPressed(false);
      setDraggedTab(null);
      setDropTarget(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handleEditTitle = (session: Session) => {
    setEditingSession(session);
    setEditDialogOpen(true);
  };

  const handleRegenerateSummary = async (sessionId: string, currentSummary: string) => {
    console.log("WhereWasI: Regenerating summary for session:", sessionId);
    try {
      let newSummary = currentSummary;

      try {
        const response = await new Promise<any>((resolve, reject) => {
          const timeout = setTimeout(() => resolve(null), 5000);
          try {
            chrome.runtime.sendMessage(
              { action: 'regenerateSummary', data: { sessionId, currentSummary } },
              (resp) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(resp);
                }
              }
            );
          } catch (err) {
            clearTimeout(timeout);
            reject(err);
          }
        });

        if (response && typeof response.summary === 'string') {
          newSummary = response.summary;
          console.log('WhereWasI: Received regenerated summary', newSummary);
        } else {
          console.warn('WhereWasI: No summary returned from background; keeping existing.');
        }
      } catch (err) {
        console.error('WhereWasI: Error communicating with background:', err);
      }

      const updatedSessions = await updateSessionSummary(sessionId, newSummary);
      await setStoredSessions(updatedSessions);
    } catch (error) {
      console.error('WhereWasI: Failed to regenerate summary:', error);
      throw error;
    }
  };

  const handleSaveTitle = async (sessionId: string, newTitle: string) => {
    try {
      const updatedSessions = await updateSessionTitle(sessionId, newTitle);
      await setStoredSessions(updatedSessions);
    } catch (error) {
      console.error('WhereWasI: Failed to update session title:', error);
      throw error;
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const updatedSessions = await deleteSession(sessionId);
      await setStoredSessions(updatedSessions);
    } catch (error) {
      console.error('WhereWasI: Failed to delete session:', error);
      throw error;
    }
  };

  const toggleTabSelection = (sessionId: string, tabIndex: number) => {
    setSelectedTabs(prev => {
      const sessionTabs = new Set(prev[sessionId] || []);
      if (sessionTabs.has(tabIndex)) {
        sessionTabs.delete(tabIndex);
      } else {
        sessionTabs.add(tabIndex);
      }
      return { ...prev, [sessionId]: sessionTabs };
    });
  };

  const selectAllTabs = (sessionId: string, tabCount: number) => {
    setSelectedTabs(prev => ({
      ...prev,
      [sessionId]: new Set(Array.from({ length: tabCount }, (_, i) => i)),
    }));
  };

  const deselectAllTabs = (sessionId: string) => {
    setSelectedTabs(prev => {
      const updated = { ...prev };
      delete updated[sessionId];
      return updated;
    });
  };

  const enterRemovalMode = (sessionId: string) => {
    setRemovalMode(prev => ({ ...prev, [sessionId]: true }));
    setExpanded(prev => ({ ...prev, [sessionId]: true }));
    deselectAllTabs(sessionId);
  };

  const cancelRemovalMode = (sessionId: string) => {
    setRemovalMode(prev => {
      const updated = { ...prev };
      delete updated[sessionId];
      return updated;
    });
    deselectAllTabs(sessionId);
  };

  const handleRemoveSelectedTabs = async (sessionId: string) => {
    const tabsToRemove = Array.from(selectedTabs[sessionId] || []);
    if (tabsToRemove.length === 0) return;

    try {
      const updatedSessions = await removeTabsFromSession(
        sessionId,
        tabsToRemove
      );
      await setStoredSessions(updatedSessions);
      cancelRemovalMode(sessionId);
    } catch (error) {
      console.error('WhereWasI: Failed to remove tabs:', error);
      throw error;
    }
  };

  const getSelectedCount = (sessionId: string) => {
    return selectedTabs[sessionId]?.size || 0;
  };

  const handleMoveTab = async (
    sourceSessionId: string,
    targetSessionId: string,
    tabIndex: number
  ) => {
    if (sourceSessionId === targetSessionId) return;

    try {
      const updatedSessions = await moveTabBetweenSessions(
        sourceSessionId,
        targetSessionId,
        tabIndex
      );
      await setStoredSessions(updatedSessions);
    } catch (error) {
      console.error('WhereWasI: Failed to move tab:', error);
      throw error;
    }
  };

  const handleTabDragStart = (sessionId: string, tabIndex: number) => {
    if (!isAltPressed) return;
    setDraggedTab({ sessionId, tabIndex });
  };

  const handleSessionDragOver = (e: React.DragEvent, sessionId: string) => {
    if (!draggedTab || draggedTab.sessionId === sessionId) return;
    e.preventDefault();
    setDropTarget(sessionId);
  };

  const handleSessionDragLeave = () => {
    setDropTarget(null);
  };

  const handleSessionDrop = async (
    e: React.DragEvent,
    targetSessionId: string
  ) => {
    e.preventDefault();
    if (!draggedTab || draggedTab.sessionId === targetSessionId) {
      setDropTarget(null);
      return;
    }

    await handleMoveTab(
      draggedTab.sessionId,
      targetSessionId,
      draggedTab.tabIndex
    );
    setDraggedTab(null);
    setDropTarget(null);
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
    <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
      {dayKeys.map((k, idx) => {
        const ts = Number(k);
        const items = groups[k];
        return (
          <section key={k} className={cn(idx > 0 && 'mt-8')}>
            <DaySeparator ts={ts} count={items.length} />
            <div className="mt-3 overflow-hidden rounded-lg border bg-card/60 mb-12">
              <div className="hidden lg:grid items-center gap-3 border-b px-4 py-2 text-xs text-muted-foreground lg:grid-cols-[minmax(16rem,2fr)_minmax(12rem,3fr)_96px_140px_64px]">
                <div>Title</div>
                <div>Summary</div>
                <div className="text-right">Tabs</div>
                <div className="text-right">Time</div>
                <div className="text-right">Details</div>
              </div>
              <ul className="divide-y divide-border/60">
                {items.map(s => {
                  const accent = tinyAccentForSeed(s.id);
                  const isRemovalMode = removalMode[s.id];
                  return (
                    <li
                      key={s.id}
                      className={cn(
                        'group',
                        dropTarget === s.id &&
                        'bg-green-50/30 dark:bg-green-950/10 ring-1 ring-green-400/20 ring-inset rounded-lg'
                      )}
                      draggable={isAltPressed}
                      onDragOver={e => handleSessionDragOver(e, s.id)}
                      onDragLeave={handleSessionDragLeave}
                      onDrop={e => handleSessionDrop(e, s.id)}
                    >
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <div>
                            <article className="grid grid-cols-1 gap-2 px-3 py-3 sm:px-4 lg:hidden">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex items-center gap-2 flex-1">
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full mt-1"
                                    style={{ backgroundColor: accent }}
                                  />
                                  <h4
                                    className="min-w-0 text-sm font-medium text-foreground break-words"
                                    title={s.title}
                                  >
                                    {s.title || 'Untitled session'}
                                  </h4>
                                </div>
                                <button
                                  aria-expanded={!!expanded[s.id]}
                                  onClick={() => toggle(s.id)}
                                  className="opacity-60 hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted/60 shrink-0"
                                  title={expanded[s.id] ? 'Collapse' : 'Expand'}
                                >
                                  <IoMdExpand
                                    className={cn(
                                      'h-4 w-4 text-muted-foreground transition-transform',
                                      expanded[s.id] && 'rotate-180'
                                    )}
                                  />
                                </button>
                              </div>

                              <p className="text-xs text-muted-foreground pl-4">
                                {expanded[s.id]
                                  ? s.summary
                                  : s.summary && s.summary.length > 100
                                    ? s.summary.substring(0, 100) + '...'
                                    : s.summary || 'No summary'}
                              </p>

                              <div className="flex items-center gap-3 pl-4 text-[11px] text-muted-foreground flex-wrap">
                                {typeof s.tabsCount === 'number' && (
                                  <span className="rounded-full bg-muted/60 px-2 py-0.5 font-medium">
                                    {s.tabsCount} tabs
                                  </span>
                                )}
                                <span>
                                  {formatTime(s._ts)} • {formatRelative(s._ts)}
                                </span>
                              </div>
                            </article>

                            <article className="hidden lg:grid items-center gap-3 px-4 py-3 lg:grid-cols-[minmax(16rem,2fr)_minmax(12rem,3fr)_96px_140px_64px]">
                              <div className="min-w-0 flex items-center gap-2">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: accent }}
                                />
                                <h4
                                  className="min-w-0 truncate text-sm font-medium text-foreground"
                                  title={s.title}
                                >
                                  {s.title || 'Untitled session'}
                                </h4>
                              </div>
                              <p
                                className={cn(
                                  'min-w-0 text-xs text-muted-foreground',
                                  {
                                    'pb-4': expanded[s.id],
                                  }
                                )}
                                title={s.summary}
                              >
                                {expanded[s.id]
                                  ? s.summary
                                  : s.summary && s.summary.length > 150
                                    ? s.summary.substring(0, 150) + '...'
                                    : s.summary || 'No summary'}
                              </p>
                              <div className="flex items-center justify-end whitespace-nowrap">
                                {typeof s.tabsCount === 'number' && (
                                  <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    {s.tabsCount} tabs
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground text-right whitespace-nowrap">
                                {formatTime(s._ts)} • {formatRelative(s._ts)}
                              </div>
                              <div className="flex justify-end">
                                <button
                                  aria-expanded={!!expanded[s.id]}
                                  onClick={() => toggle(s.id)}
                                  className="opacity-60 hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted/60"
                                  title={expanded[s.id] ? 'Collapse' : 'Expand'}
                                >
                                  <IoMdExpand
                                    className={cn(
                                      'h-4 w-4 text-muted-foreground transition-transform',
                                      expanded[s.id] && 'rotate-180'
                                    )}
                                  />
                                </button>
                              </div>
                            </article>
                          </div>
                        </ContextMenuTrigger>
                        {isDisabled ? (
                          <ContextMenuContent className="p-2 px-4">
                            Context menu is disabled temporarily.
                            <br />
                            <span className="text-blue-400 hover:cursor-pointer hover:underline-offset-4 hover:underline">
                              Learn more
                            </span>
                          </ContextMenuContent>
                        ) : (
                          <ContextMenuContent>
                            <ContextMenuItem onSelect={() => handleEditTitle(s)}>
                              <MdEdit className="mr-2 h-4 w-4" />
                              Edit Title
                            </ContextMenuItem>
                            <ContextMenuItem onSelect={() => { handleRegenerateSummary(s.id, s.summary) }}>
                              <MdAutorenew className="mr-2 h-4 w-4" />
                              Regenerate Summary
                            </ContextMenuItem>
                            <ContextMenuItem onSelect={() => enterRemovalMode(s.id)}>
                              <FiMinus className="mr-2 h-4 w-4" />
                              Remove Tabs
                            </ContextMenuItem>
                            <ContextMenuItem
                              onSelect={() => handleDeleteSession(s.id)}
                              className="text-destructive"
                            >
                              <MdDelete className="mr-2 h-4 w-4" />
                              Delete Session
                            </ContextMenuItem>
                          </ContextMenuContent>
                        )}
                      </ContextMenu>

                      {expanded[s.id] && (
                        <div className="px-3 sm:px-4 pb-4 -mt-2">
                          <div className="rounded-md border bg-background/60 p-3">
                            <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                              <div>
                                <span className="opacity-70">Session ID:</span>{' '}
                                <span className="break-all text-foreground/90">
                                  {s.id}
                                </span>
                              </div>
                              <div>
                                <span className="opacity-70">Created:</span>{' '}
                                <span>
                                  {formatTime(s.createdAt)} •{' '}
                                  {formatRelative(s.createdAt)}
                                </span>
                              </div>
                              <div>
                                <span className="opacity-70">Updated:</span>{' '}
                                <span>
                                  {formatTime(s.updatedAt)} •{' '}
                                  {formatRelative(s.updatedAt)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 overflow-x-auto">
                              <table className="min-w-full text-left">
                                <thead className="text-[11px] text-muted-foreground">
                                  <tr className="border-b">
                                    {isRemovalMode && (
                                      <th className="py-1 pr-3 font-medium">
                                        <Checkbox
                                          checked={Boolean(
                                            getSelectedCount(s.id) ===
                                            (s.tabs?.length || 0)
                                          )}
                                          onCheckedChange={(checked: any) =>
                                            checked
                                              ? selectAllTabs(
                                                s.id,
                                                s.tabs?.length || 0
                                              )
                                              : deselectAllTabs(s.id)
                                          }
                                        />
                                      </th>
                                    )}
                                    <th className="py-1 pr-3 font-medium">
                                      Tab
                                    </th>
                                    <th className="py-1 pr-3 font-medium hidden sm:table-cell">
                                      URL
                                    </th>
                                    <th className="py-1 pr-3 font-medium hidden md:table-cell">
                                      Closed
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="text-xs">
                                  {(Array.isArray(s.tabs)
                                    ? (s.tabs as any[])
                                    : []
                                  ).map((t, idx) => {
                                    const fav = (t as any)?.favIconUrl as
                                      | string
                                      | undefined;
                                    const title = (t as any)?.title as
                                      | string
                                      | undefined;
                                    const url = (t as any)?.url as
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
                                        className={cn(
                                          'border-b last:border-b-0 align-top transition-all',
                                          isRemovalMode &&
                                          selectedTabs[s.id]?.has(idx) &&
                                          'bg-destructive/10',
                                          isAltPressed &&
                                          'cursor-move hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-l-2 hover:border-l-blue-500'
                                        )}
                                        draggable={isAltPressed}
                                        onDragStart={() =>
                                          handleTabDragStart(s.id, idx)
                                        }
                                      >
                                        {isRemovalMode && (
                                          <td className="py-2 pr-3">
                                            <Checkbox
                                              checked={Boolean(
                                                selectedTabs[s.id]?.has(idx)
                                              )}
                                              onCheckedChange={() =>
                                                toggleTabSelection(s.id, idx)
                                              }
                                            />
                                          </td>
                                        )}
                                        <td className="py-2 pr-3">
                                          <div className="flex flex-col gap-1 min-w-0">
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
                                                className="text-foreground break-words"
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
                                          </div>
                                        </td>
                                        <td className="py-2 pr-3 max-w-[28rem] hidden sm:table-cell">
                                          {url ? (
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="truncate text-blue-600 hover:underline dark:text-blue-400"
                                              title={url}
                                            >
                                              <span
                                                className="truncate block"
                                                title={url}
                                              >
                                                {url}
                                              </span>
                                            </a>
                                          ) : (
                                            <span className="opacity-60">
                                              —
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground hidden md:table-cell">
                                          {closedMs ? (
                                            `${formatTime(closedMs)} • ${formatRelative(closedMs)}`
                                          ) : (
                                            <span className="opacity-60">
                                              —
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            {isRemovalMode && (
                              <div className="mt-3 flex justify-end gap-2">
                                <button
                                  onClick={() => cancelRemovalMode(s.id)}
                                  className="text-sm text-muted-foreground hover:underline"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleRemoveSelectedTabs(s.id)}
                                  className="text-sm text-destructive hover:underline"
                                >
                                  Remove Selected Tabs
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
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

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(ts: number) {
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
