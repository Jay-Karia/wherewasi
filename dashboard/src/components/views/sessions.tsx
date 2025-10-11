import type { Session } from "@/types";
import { cn } from "@/lib/utils";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useState } from "react";

type Props = {
    sessions: Session[];
    className?: string;
};

export default function SessionsView({ sessions, className }: Props) {
    const [expandedSessionId, setExpandedSessionId] = useState<string[] | null>([]);
    
    if (!sessions || sessions.length === 0) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/20 p-10 text-center text-muted-foreground",
                    className,
                )}
            >
                <div className="text-lg font-medium text-foreground">No sessions yet</div>
                <p className="text-sm opacity-80">
                    Start browsing and your sessions will appear here automatically.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
            {sessions.map((s) => (
                <article
                    key={s.id}
                    className="group relative overflow-hidden rounded-xl border bg-card/60 p-4 px-8 shadow-sm transition hover:shadow-md"
                >
                    <header className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 text-base font-semibold text-foreground">
                            {s.title || "Untitled session"}
                        </h3>
                        {typeof s.tabsCount === "number" && (
                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                {s.tabsCount} tabs
                            </span>
                        )}
                        <div className="ml-auto flex cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent/50 hover:text-accent-foreground">
                            <MdOutlineKeyboardArrowDown className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </header>

                    {s.summary && (
                        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
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
            ))}
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