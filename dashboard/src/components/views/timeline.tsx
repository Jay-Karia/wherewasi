import type { Session } from "@/types";
import { cn } from "@/lib/utils";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

type Props = {
    sessions: Session[];
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

export default function TimelineView({ sessions, className }: Props) {
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
        <div className={cn("mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8 mb-12", className)}>
            {dayKeys.map((dayKey, idx) => {
                const dayTs = Number(dayKey);
                const items = groups[dayKey];
                return (
                    <section key={dayKey} className={cn("relative", idx > 0 && "mt-10")}>
                        <DayHeader ts={dayTs} count={items.length} />
                        <div className="pointer-events-none absolute left-1/2 top-16 bottom-2 -translate-x-1/2 hidden w-px bg-border/60 md:block" />
                        <ul className="mt-4 space-y-6">
                            {items.map((s, i) => {
                                const accent = tinyAccentForSeed(s.id);
                                const side: "left" | "right" = i % 2 === 0 ? "left" : "right";
                                return (
                                    <li key={s.id}>
                                        <div className="md:grid md:grid-cols-[1fr_16px_1fr] md:items-center md:gap-0">
                                            {side === "left" ? (
                                                <>
                                                    <div className="md:pr-6">
                                                        <article className="relative rounded-lg border bg-card/60 p-2 sm:p-3 shadow-sm transition hover:shadow-md">
                                                            <div className="pointer-events-none absolute left-2 w-px bg-border/60 md:hidden" style={{ top: -14, bottom: -14 }} />
                                                            <header className="flex items-center justify-between gap-2">
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                                                                    <h4 className="line-clamp-1 text-[13px] font-semibold text-foreground">{s.title || "Untitled session"}</h4>
                                                                </div>
                                                                {typeof s.tabsCount === "number" && (
                                                                    <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                                        {s.tabsCount} tabs
                                                                    </span>
                                                                )}
                                                                <div className="ml-auto flex cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent/50 hover:text-accent-foreground">
                                                                    <MdOutlineKeyboardArrowDown className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            </header>
                                                            {s.summary && (
                                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.summary}</p>
                                                            )}
                                                            <footer className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                                                <time dateTime={toISO(s._ts)}>{formatTime(s._ts)}</time>
                                                                <span className="opacity-80">{formatRelative(s._ts)}</span>
                                                            </footer>
                                                        </article>
                                                    </div>
                                                    <div className="relative hidden items-center justify-center md:flex">
                                                        <span className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-transparent" />
                                                        <span className="absolute left-0 right-1/2 top-1/2 h-px -translate-y-1/2 bg-border/60" />
                                                        <span className="relative z-10 h-3 w-3 rounded-full ring-2 ring-background" style={{ backgroundColor: accent }} />
                                                    </div>
                                                    <div className="hidden md:block" />
                                                </>
                                            ) : (
                                                <>
                                                    <div className="hidden md:block" />
                                                    <div className="relative hidden items-center justify-center md:flex">
                                                        <span className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-transparent" />
                                                        <span className="absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-border/60" />
                                                        <span className="relative z-10 h-3 w-3 rounded-full ring-2 ring-background" style={{ backgroundColor: accent }} />
                                                    </div>
                                                    <div className="md:pl-6">
                                                        <article className="relative rounded-lg border bg-card/60 p-2 sm:p-3 shadow-sm transition hover:shadow-md">
                                                            <div className="pointer-events-none absolute left-2 w-px bg-border/60 md:hidden" style={{ top: -14, bottom: -14 }} />
                                                            <header className="flex items-center justify-between gap-2">
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                                                                    <h4 className="line-clamp-1 text-[13px] font-semibold text-foreground">{s.title || "Untitled session"}</h4>
                                                                </div>
                                                                {typeof s.tabsCount === "number" && (
                                                                    <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                                        {s.tabsCount} tabs
                                                                    </span>
                                                                )}
                                                                <div className="ml-auto flex cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent/50 hover:text-accent-foreground">
                                                                    <MdOutlineKeyboardArrowDown className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            </header>
                                                            {s.summary && (
                                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.summary}</p>
                                                            )}
                                                            <footer className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                                                <time dateTime={toISO(s._ts)}>{formatTime(s._ts)}</time>
                                                                <span className="opacity-80">{formatRelative(s._ts)}</span>
                                                            </footer>
                                                        </article>
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
                <span className="bg-background px-3 py-1 text-xs font-medium text-foreground rounded-full border border-gray-600 shadow-sm">
                    {label}
                    <span className="ml-2 text-muted-foreground">• {count} {count === 1 ? "entry" : "entries"}</span>
                </span>
            </div>
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
