import type { Session, SortOption } from "@/types";
import { cn } from "@/lib/utils";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useMemo, useState } from "react";
import { tinyAccentForSeed } from "./timeline";

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
  const toggle = (id: string) => setExpanded((m) => ({ ...m, [id]: !m[id] }));

  const variants = [
    "w-full sm:w-[14rem] lg:w-[18rem]",
    "w-full sm:w-[18rem] lg:w-[24rem]",
    "w-full sm:w-[22rem] lg:w-[30rem]",
    "w-full sm:w-[26rem] lg:w-[36rem]",
    "w-full sm:w-[30rem] lg:w-[42rem]",
  ] as const;

  let prevIdx = -1;
  return (
    <div
      className={cn(
        "mx-auto max-w-7xl flex flex-row justify-center items-center gap-6 mt-8 flex-wrap",
        className,
      )}
    >
      {sessions.map((s, idx) => {
        const pick = pickWidthVariant(s.id, idx, prevIdx, variants.length);
        const accent = tinyAccentForSeed(s.id);
        const isExpanded = !!expanded[s.id];
        const widthClass = isExpanded
          ? "w-full sm:w-[42rem] lg:w-[64rem]"
          : variants[pick];
        prevIdx = pick;
        return (
          <article
            key={s.id}
            className={cn(
              "group relative shrink-0 overflow-hidden rounded-xl border bg-card/60 p-4 px-8 shadow-sm transition hover:shadow-md",
              widthClass,
            )}
          >
            <header className="mb-2 flex items-center justify-between gap-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <h3
                className="line-clamp-1 text-base font-semibold text-foreground"
                title={s.title || "Untitled session"}
              >
                {s.title || "Untitled session"}
              </h3>
              {typeof s.tabsCount === "number" && (
                <span className="shrink-0 rounded-full py-0.5 text-xs font-medium border border-black/5 opacity-70 bg-muted/60 px-2 text-[11px] text-muted-foreground">
                  {s.tabsCount} tabs
                </span>
              )}
              <button
                aria-expanded={!!expanded[s.id]}
                onClick={() => toggle(s.id)}
                className="ml-auto flex items-center justify-center rounded-full transition-colors hover:bg-accent/50 hover:text-accent-foreground"
                title={expanded[s.id] ? "Collapse" : "Expand"}
              >
                <MdOutlineKeyboardArrowDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    expanded[s.id] && "rotate-180",
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
              <div className="opacity-70">
                {Array.isArray(s.tabs) ? `${s.tabs.length} items` : null}
              </div>
            </footer>

            {/* Expanded details */}
            {expanded[s.id] && (
              <div className="mt-3 rounded-lg border bg-background/60 p-3">
                <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground sm:grid-cols-3">
                  <div>
                    <span className="opacity-70">Session ID:</span>{" "}
                    <span className="break-all text-foreground/90">{s.id}</span>
                  </div>
                  <div>
                    <span className="opacity-70">Created:</span>{" "}
                    <span>
                      {formatTimeSafe(s.createdAt)} •{" "}
                      {formatRelativeDate(s.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-70">Updated:</span>{" "}
                    <span>
                      {formatTimeSafe(s.updatedAt)} •{" "}
                      {formatRelativeDate(s.updatedAt)}
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
                            typeof closedAt === "string"
                              ? Date.parse(closedAt)
                              : typeof closedAt === "number"
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
                                      className="h-4 w-4 rounded-sm"
                                    />
                                  ) : (
                                    <span className="h-4 w-4 rounded-sm bg-muted/60 inline-block" />
                                  )}
                                  <span
                                    className="truncate text-foreground"
                                    title={title || "Untitled tab"}
                                  >
                                    {title
                                      ? title.length > 50
                                        ? `${title.slice(0, 50)}...`
                                        : title
                                      : "Untitled tab"}
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
                                  `${formatTimeSafe(closedMs)} • ${formatRelativeDate(closedMs)}`
                                ) : (
                                  <span className="opacity-60">—</span>
                                )}
                              </td>
                              <td className="py-2 pr-3 text-muted-foreground">
                                {tabId ?? <span className="opacity-60">—</span>}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-transparent via-transparent to-foreground/5 group-hover:block" />
          </article>
        );
      })}
    </div>
  );
}

function toDateTimeAttr(ts?: number) {
  if (!ts) return "";
  try {
    return new Date(ts).toISOString();
  } catch {
    return "";
  }
}

function formatRelativeDate(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

function formatTimeSafe(ts?: number) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function pickWidthVariant(
  id: string,
  index: number,
  prevIdx: number,
  len: number,
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
