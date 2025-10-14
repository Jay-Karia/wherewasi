import type { Session } from "@/types";
import { cn } from "@/lib/utils";
import { tinyAccentForSeed } from "./timeline";

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
            <div className={cn("rounded-xl border border-dashed border-muted-foreground/20 p-8 text-center text-muted-foreground")}>No sessions</div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
            {dayKeys.map((k, idx) => {
                const ts = Number(k);
                const items = groups[k];
                return (
                    <section key={k} className={cn(idx > 0 && "mt-8")}>
                        <DaySeparator ts={ts} count={items.length} />
                        <div className="mt-3 overflow-hidden rounded-lg border bg-card/60 mb-12">
                            <div className="hidden grid-cols-[1.5fr_1fr_auto_auto] items-center gap-3 border-b px-3 py-2 text-xs text-muted-foreground sm:grid sm:px-4">
                                <div>Title</div>
                                <div>Summary</div>
                                <div className="text-right">Tabs</div>
                                <div className="text-right">Time</div>
                            </div>
                            <ul className="divide-y divide-border/60">
                                {items.map((s) => {
                                    const accent = tinyAccentForSeed(s.id);
                                    return (
                                        <li key={s.id} className="group">
                                            <article className="grid grid-cols-1 items-start gap-2 px-3 py-3 sm:grid-cols-[1.5fr_1fr_auto_auto] sm:gap-3 sm:px-4">
                                                <div className="min-w-0 flex items-center gap-2">
                                                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                                                    <h4 className="min-w-0 truncate text-sm font-medium text-foreground">{s.title || "Untitled session"}</h4>
                                                </div>
                                                <p className="min-w-0 text-xs text-muted-foreground sm:line-clamp-2">
                                                    {s.summary}
                                                </p>
                                                <div className="flex items-center justify-between sm:justify-end sm:gap-2">
                                                    {typeof s.tabsCount === "number" && (
                                                        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                            {s.tabsCount} tabs
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground sm:text-right">
                                                    <span className="sm:hidden">{formatTime(s._ts)} • {formatRelative(s._ts)}</span>
                                                    <span className="hidden sm:inline">{formatTime(s._ts)} • {formatRelative(s._ts)}</span>
                                                </div>
                                            </article>
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
                <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-background px-3 py-1 text-xs font-medium text-foreground rounded-full border border-border/60 shadow-sm">
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