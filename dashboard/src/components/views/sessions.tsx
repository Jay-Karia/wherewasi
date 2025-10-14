import type { Session } from "@/types";
import { cn } from "@/lib/utils";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { tinyAccentForSeed } from "./timeline";

type Props = {
  sessions: Session[];
  className?: string;
};

export default function SessionsView({ sessions, className }: Props) {
  if (!sessions || sessions.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/20 p-10 text-center text-muted-foreground",
          className,
        )}
      >
        <div className="text-lg font-medium text-foreground">
          No sessions yet
        </div>
        <p className="text-sm opacity-80">
          Start browsing and your sessions will appear here automatically.
        </p>
      </div>
    );
  }

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
        "flex flex-row justify-center items-center gap-6 mt-8 flex-wrap",
        className,
      )}
    >
      {sessions.map((s, idx) => {
        const pick = pickWidthVariant(s.id, idx, prevIdx, variants.length);
        const accent = tinyAccentForSeed(s.id);
        prevIdx = pick;
        return (
          <article
            key={s.id}
            className={cn(
              "group relative shrink-0 overflow-hidden rounded-xl border bg-card/60 p-4 px-8 shadow-sm transition hover:shadow-md",
              variants[pick],
            )}
          >
            <header className="mb-2 flex items-center justify-between gap-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <h3 className="line-clamp-1 text-base font-semibold text-foreground" title={s.title || "Untitled session"}>
                {s.title || "Untitled session"}
              </h3>
              {typeof s.tabsCount === "number" && (
                <span className="shrink-0 rounded-full py-0.5 text-xs font-medium border border-black/5 opacity-70 bg-muted/60 px-2 text-[11px] text-muted-foreground">
                  {s.tabsCount} tabs
                </span>
              )}
              <div className="ml-auto flex cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent/50 hover:text-accent-foreground">
                <MdOutlineKeyboardArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>
            </header>

            {s.summary && (
              <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground" title={s.summary}>
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
