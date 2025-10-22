import type { Session, SortOption } from '@/types';
import {
  cn,
  filterSessions,
  updateSessionTitle,
  deleteSession,
  removeTabsFromSession,
  moveTabBetweenSessions,
} from '@/lib/utils';
import { MdDelete, MdEdit, MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { FiMinus } from 'react-icons/fi';
import { useMemo, useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';

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
  const filters = useAtomValue(filtersAtom);
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

  useEffect(() => {
    if (!isDisabled) return;
    const storage = (window as any).chrome?.storage?.local;
    const timeout = setTimeout(() => {
      setIsDisabled(false);
      try {
        storage?.set?.({ disabled: false });
      } catch {
        // ignore
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isDisabled]);

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
                                'relative rounded-lg border bg-card/60 p-2 sm:p-4 shadow-sm transition md:p-5 hover:shadow-md ring-1 ring-border/60',
                                dropTarget === s.id &&
                                  'bg-green-50/30 dark:bg-green-950/10 ring-1 ring-green-400/20 ring-inset'
                              )}
                              draggable={isAltPressed}
                              onDragOver={e => handleSessionDragOver(e, s.id)}
                              onDragLeave={handleSessionDragLeave}
                              onDrop={e => handleSessionDrop(e, s.id)}
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
                              <ExpandedDetails
                                session={s}
                                removalMode={removalMode[s.id]}
                                selectedTabs={selectedTabs[s.id]}
                                onToggleTab={toggleTabSelection}
                                onSelectAll={selectAllTabs}
                                onDeselectAll={deselectAllTabs}
                                onRemove={handleRemoveSelectedTabs}
                                onCancel={cancelRemovalMode}
                                getSelectedCount={getSelectedCount}
                                isAltPressed={isAltPressed}
                                onTabDragStart={handleTabDragStart}
                              />
                            </article>
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
                              <ContextMenuItem
                                onSelect={() => handleEditTitle(s)}
                              >
                                <MdEdit className="mr-2 h-4 w-4" />
                                Edit Title
                              </ContextMenuItem>
                              <ContextMenuItem
                                onSelect={() => enterRemovalMode(s.id)}
                              >
                                <FiMinus className="mr-2 h-4 w-4" />
                                Remove Tabs
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="text-destructive"
                                onSelect={() => handleDeleteSession(s.id)}
                              >
                                <MdDelete className="mr-2 h-4 w-4" />
                                Delete Session
                              </ContextMenuItem>
                            </ContextMenuContent>
                          )}
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
                                    isExpanded && 'ring-1 ring-border/60',
                                    dropTarget === s.id &&
                                      'bg-green-50/30 dark:bg-green-950/10 ring-1 ring-green-400/20 ring-inset'
                                  )}
                                  draggable={isAltPressed}
                                  onDragOver={e =>
                                    handleSessionDragOver(e, s.id)
                                  }
                                  onDragLeave={handleSessionDragLeave}
                                  onDrop={e => handleSessionDrop(e, s.id)}
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
                                  <ContextMenuItem
                                    onSelect={() => handleEditTitle(s)}
                                  >
                                    <MdEdit className="mr-2 h-4 w-4" />
                                    Edit Title
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    onSelect={() => enterRemovalMode(s.id)}
                                  >
                                    <FiMinus className="mr-2 h-4 w-4" />
                                    Remove Tabs
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    className="text-destructive"
                                    onSelect={() => handleDeleteSession(s.id)}
                                  >
                                    <MdDelete className="mr-2 h-4 w-4" />
                                    Delete Session
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              )}
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
                                    isExpanded && 'ring-1 ring-border/60',
                                    dropTarget === s.id &&
                                      'bg-green-50/30 dark:bg-green-950/10 ring-1 ring-green-400/20 ring-inset'
                                  )}
                                  draggable={isAltPressed}
                                  onDragOver={e =>
                                    handleSessionDragOver(e, s.id)
                                  }
                                  onDragLeave={handleSessionDragLeave}
                                  onDrop={e => handleSessionDrop(e, s.id)}
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
                                <ContextMenuItem
                                  onSelect={() => handleEditTitle(s)}
                                >
                                  <MdEdit className="mr-2 h-4 w-4" />
                                  Edit Title
                                </ContextMenuItem>
                                <ContextMenuItem
                                  onSelect={() => enterRemovalMode(s.id)}
                                >
                                  <FiMinus className="mr-2 h-4 w-4" />
                                  Remove Tabs
                                </ContextMenuItem>
                                <ContextMenuItem
                                  className="text-destructive"
                                  onSelect={() => handleDeleteSession(s.id)}
                                >
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

interface ExpandedDetailsProps {
  session: Session & { _ts?: number };
  removalMode?: boolean;
  selectedTabs?: Set<number>;
  onToggleTab?: (sessionId: string, tabIndex: number) => void;
  onSelectAll?: (sessionId: string, tabCount: number) => void;
  onDeselectAll?: (sessionId: string) => void;
  onRemove?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  getSelectedCount?: (sessionId: string) => number;
  isAltPressed?: boolean;
  onTabDragStart?: (sessionId: string, tabIndex: number) => void;
}

function ExpandedDetails({
  session,
  removalMode,
  selectedTabs,
  onToggleTab,
  onSelectAll,
  onDeselectAll,
  onRemove,
  onCancel,
  getSelectedCount,
  isAltPressed,
  onTabDragStart,
}: ExpandedDetailsProps) {
  const tabs = Array.isArray((session as any).tabs)
    ? ((session as any).tabs as any[])
    : [];

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
              {removalMode && (
                <th className="py-1 pr-3 font-medium w-8">
                  <Checkbox
                    className="cursor-pointer"
                    onCheckedChange={(checked: any) =>
                      checked
                        ? onSelectAll?.(session.id, tabs.length)
                        : onDeselectAll?.(session.id)
                    }
                    checked={
                      getSelectedCount?.(session.id) === tabs.length &&
                      tabs.length > 0
                    }
                    title="Select all tabs"
                  />
                </th>
              )}
              <th className="py-1 pl-2 pr-3 sm:pl-0 font-medium">Tab</th>
              <th className="py-1 pr-3 font-medium hidden sm:table-cell">
                URL
              </th>
              <th className="py-1 pr-3 font-medium hidden md:table-cell">
                Closed
              </th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {tabs.map((t, i) => {
              const fav = (t as any)?.favIconUrl as string | undefined;
              const title = (t as any)?.title as string | undefined;
              const url = (t as any)?.url as string | undefined;
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
                  className={cn(
                    'border-b last:border-b-0 align-top transition-all',
                    removalMode && selectedTabs?.has(i) && 'bg-destructive/10',
                    isAltPressed &&
                      'cursor-move hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-l-2 hover:border-l-blue-500'
                  )}
                  draggable={isAltPressed}
                  onDragStart={() => onTabDragStart?.(session.id, i)}
                >
                  {removalMode && (
                    <td className="py-2 pr-3">
                      <Checkbox
                        className="cursor-pointer"
                        onCheckedChange={() => onToggleTab?.(session.id, i)}
                        checked={selectedTabs?.has(i) || false}
                      />
                    </td>
                  )}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {removalMode && (
        <div className="mt-3 flex items-center justify-between gap-3 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => onCancel?.(session.id)}
              className="px-3 py-1.5 text-sm rounded border border-border bg-background hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onRemove?.(session.id)}
              disabled={!getSelectedCount?.(session.id)}
              className="px-3 py-1.5 bg-destructive/20 text-destructive text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-destructive/30"
            >
              Remove Selected ({getSelectedCount?.(session.id) || 0})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
