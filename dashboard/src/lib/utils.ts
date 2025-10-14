import type { Session } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadDataJSON(sessions: Session[]) {
  const dataStr = JSON.stringify(sessions, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sessions_data.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function coerceImportedSession(raw: Session): Session | null {
  if (!raw || typeof raw !== "object") return null;
  if (!raw.id || typeof raw.id !== "string") return null;
  if (!Array.isArray(raw.tabs)) raw.tabs = [];
  const tabs = raw.tabs.filter(Boolean).map((t: any) => ({
    id: t.id,
    title: t.title ?? "",
    url: t.url ?? "",
    favIconUrl: t.favIconUrl,
    closedAt: t.closedAt,
  }));
  return {
    id: raw.id,
    title: raw.title ?? "",
    summary: raw.summary ?? "",
    createdAt:
      typeof raw.createdAt === "string"
        ? Date.parse(raw.createdAt)
        : raw.createdAt,
    updatedAt:
      typeof raw.updatedAt === "string"
        ? Date.parse(raw.updatedAt)
        : raw.updatedAt,
    tabs,
    tabsCount: tabs.length,
  };
}

export function normalizeImportedSessions(json: unknown): Session[] {
  if (!Array.isArray(json))
    throw new Error("Root must be an array of sessions");
  const sessions: Session[] = [];
  for (const item of json) {
    const s = coerceImportedSession(item as Session);
    if (s) sessions.push(s);
  }
  if (!sessions.length) throw new Error("No valid sessions found in file");
  sessions.sort(
    (a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0),
  );
  return sessions;
}

// NOTE: Only temporily used in dev environment to write to ../dummy/data.json
export function writeSessionsToDummyFile(sessions: Session[]) {
  // This function is only available in Node.js environment
  if (typeof window !== 'undefined') {
    console.warn('writeSessionsToDummyFile cannot run in browser environment');
    return;
  }
  
  const filePath = "../../../dummy/data.json";
  
  const fs = require('fs');
  const dataStr = JSON.stringify(sessions, null, 2);
  fs.writeFileSync(filePath, dataStr, "utf8");
}
