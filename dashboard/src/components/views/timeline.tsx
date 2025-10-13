import type { Session } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
    sessions: Session[];
    className?: string;
};

export default function TimelineView({ sessions, className }: Props) {
    // Normalize and sort sessions (newest first)
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
                    className,
                )}
            >
                No activity yet
            </div>
        );
    }

    return (
        <div className={cn("mx-auto max-w-5xl px-2 sm:px-4 md:px-6 lg:px-8", className)}>
            {dayKeys.map((dayKey, idx) => {
                const dayTs = Number(dayKey);
                const items = groups[dayKey];
                return (
                    <section key={dayKey} className={cn(idx > 0 && "mt-10")}>
                        <DayHeader ts={dayTs} count={items.length} />
                        <ol className="relative ml-4 mt-4 border-l border-border/60 pl-6">
                            {items.map((s, i) => {
                                const accent = tinyAccentForSeed(s.id);
                                return (
                                    <li key={s.id} className={cn(i > 0 && "mt-6")}> 
                                        <div className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full ring-2 ring-background" style={{ backgroundColor: accent }} />
                                        <article className="rounded-lg border bg-card/60 p-3 shadow-sm transition hover:shadow-md">
                                            <header className="flex items-center justify-between gap-3">
                                                <h4 className="line-clamp-1 text-sm font-semibold text-foreground">{s.title || "Untitled session"}</h4>
                                                {typeof s.tabsCount === "number" && (
                                                    <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                        {s.tabsCount} tabs
                                                    </span>
                                                )}
                                            </header>
                                            {s.summary && (
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.summary}</p>
                                            )}
                                            <footer className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                                <time dateTime={toISO(s._ts)}>{formatTime(s._ts)}</time>
                                                <span className="opacity-80">{formatRelative(s._ts)}</span>
                                            </footer>
                                        </article>
                                    </li>
                                );
                            })}
                        </ol>
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

function DayHeader({ ts, count }: { ts: number; count: number }) {
    const label = formatDay(ts);
    return (
        <div className="flex items-baseline justify-between">
            <h3 className="text-base font-semibold text-foreground">{label}</h3>
            <span className="text-xs text-muted-foreground">{count} {count === 1 ? "entry" : "entries"}</span>
        </div>
    );
}

function formatDay(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const startOf = (T: Date) => new Date(T.getFullYear(), T.getMonth(), T.getDate()).getTime();
    const diffDays = Math.floor((startOf(now) - startOf(d)) / dayMs);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(ts: number) {
    const d = new Date(ts);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
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

function toISO(ts: number) {
    try {
        return new Date(ts).toISOString();
    } catch {
        return "";
    }
}

function tinyAccentForSeed(seed: string) {
    // deterministic small accent around teal/green/blue to avoid loud colors
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