import type { Session } from "@/types";
import { cn } from "@/lib/utils";
import { tinyAccentForSeed } from "./timeline";
import { IoMdExpand } from "react-icons/io";
import { useState } from "react";

export default function ListView({ sessions }: { sessions: Session[] }) {
  const normalized = (sessions || [])
    .map((s) => ({
      ...s,
      _ts: (s.updatedAt ?? s.createdAt ?? 0) as number,
    }))
    .filter((s) => Number.isFinite(s._ts) && s._ts > 0)
    .sort((a, b) => b._ts - a._ts);

  const groups = groupByDay(normalized);
  const dayKeys = Object.keys(groups).sort((a, b) => Number(b) - Number(a));

  if (dayKeys.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-muted-foreground/20 p-8 text-center text-muted-foreground",
        )}
      >
        No sessions
      </div>
    );
  }

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((m) => ({ ...m, [id]: !m[id] }));

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
      {dayKeys.map((k, idx) => {
        const ts = Number(k);
        const items = groups[k];
        return (
          <section key={k} className={cn(idx > 0 && "mt-8")}>
            <DaySeparator ts={ts} count={items.length} />
            <div className="mt-3 overflow-hidden rounded-lg border bg-card/60 mb-12">
              <div className="hidden items-center gap-3 border-b px-3 py-2 text-xs text-muted-foreground sm:grid sm:grid-cols-[minmax(16rem,2fr)_minmax(12rem,3fr)_96px_140px_64px] sm:px-4">
                <div>Title</div>
                <div>Summary</div>
                <div className="text-right">Tabs</div>
                <div className="text-right">Time</div>
                <div className="text-right">Details</div>
              </div>
              <ul className="divide-y divide-border/60">
                {items.map((s) => {
                  const accent = tinyAccentForSeed(s.id);
                  return (
                    <li key={s.id} className="group">
                      <article className="grid grid-cols-1 items-center gap-2 px-3 py-3 sm:grid-cols-[minmax(16rem,2fr)_minmax(12rem,3fr)_96px_140px_64px] sm:gap-3 sm:px-4">
                        <div className="min-w-0 flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                          <h4
                            className="min-w-0 truncate text-sm font-medium text-foreground"
                            title={s.title}
                          >
                            {s.title || "Untitled session"}
                          </h4>
                        </div>
                        <p
                          className="min-w-0 text-xs text-muted-foreground sm:line-clamp-2"
                          title={s.summary}
                        >
                          {s.summary}
                        </p>
                        <div className="flex items-center justify-between sm:justify-end sm:whitespace-nowrap">
                          {typeof s.tabsCount === "number" && (
                            <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {s.tabsCount} tabs
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground sm:text-right sm:whitespace-nowrap">
                          <span className="sm:hidden">
                            {formatTime(s._ts)} • {formatRelative(s._ts)}
                          </span>
                          <span className="hidden sm:inline">
                            {formatTime(s._ts)} • {formatRelative(s._ts)}
                          </span>
                        </div>
                        <div className="flex justify-end sm:justify-end">
                          <button
                            aria-expanded={!!expanded[s.id]}
                            onClick={() => toggle(s.id)}
                            className="opacity-60 hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted/60"
                            title={expanded[s.id] ? "Collapse" : "Expand"}
                          >
                            <IoMdExpand
                              className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform",
                                expanded[s.id] && "rotate-180",
                              )}
                            />
                          </button>
                        </div>
                      </article>
                      {expanded[s.id] && (
                        <div className="px-3 sm:px-4 pb-4 -mt-2">
                          <div className="rounded-md border bg-background/60 p-3">
                            <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground sm:grid-cols-3">
                              <div>
                                <span className="opacity-70">Session ID:</span>{" "}
                                <span className="break-all text-foreground/90">
                                  {s.id}
                                </span>
                              </div>
                              <div>
                                <span className="opacity-70">Created:</span>{" "}
                                <span>
                                  {formatTime(s.createdAt)} •{" "}
                                  {formatRelative(s.createdAt)}
                                </span>
                              </div>
                              <div>
                                <span className="opacity-70">Updated:</span>{" "}
                                <span>
                                  {formatTime(s.updatedAt)} •{" "}
                                  {formatRelative(s.updatedAt)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 overflow-x-auto">
                              <table className="min-w-full text-left">
                                <thead className="text-[11px] text-muted-foreground">
                                  <tr className="border-b">
                                    <th className="py-1 pr-3 font-medium">
                                      Tab
                                    </th>
                                    <th className="py-1 pr-3 font-medium">
                                      URL
                                    </th>
                                    <th className="py-1 pr-3 font-medium">
                                      Closed
                                    </th>
                                    <th className="py-1 pr-3 font-medium">
                                      Tab ID
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
                                    const tabId = (t as any)?.id as
                                      | number
                                      | string
                                      | undefined;
                                    const closedAt = (t as any)?.closedAt as
                                      | string
                                      | number
                                      | undefined;
                                    const closedMs =
                                      typeof closedAt === "string"
                                        ? Date.parse(closedAt)
                                        : typeof closedAt === "number"
                                          ? closedAt
                                          : undefined;
                                    return (
                                      <tr
                                        key={idx}
                                        className="border-b last:border-b-0 align-top"
                                      >
                                        <td className="py-2 pr-3">
                                          <div className="flex items-center gap-2 min-w-0">
                                            {fav ? (
                                              <img
                                                src={fav}
                                                alt=""
                                                className="h-4 w-4 rounded-sm"
                                              />
                                            ) : (
                                              <span className="h-4 w-4 rounded-sm bg-muted/60 inline-block" />
                                            )}
                                            <span
                                              className="truncate text-foreground block"
                                              title={title || "Untitled tab"}
                                            >
                                              {(title || "Untitled tab")
                                                .length > 50
                                                ? (
                                                    title || "Untitled tab"
                                                  ).substring(0, 50) + "..."
                                                : title || "Untitled tab"}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-2 pr-3 max-w-[28rem]">
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
                                        <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                                          {closedMs ? (
                                            `${formatTime(closedMs)} • ${formatRelative(closedMs)}`
                                          ) : (
                                            <span className="opacity-60">
                                              —
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 pr-3 text-muted-foreground">
                                          {tabId ?? (
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
            • {count} {count === 1 ? "entry" : "entries"}
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
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}
