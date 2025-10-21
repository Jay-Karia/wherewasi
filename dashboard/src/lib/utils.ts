import type { FilterOption, Session, Settings } from "@/types";
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

export async function writeSessionsToStorage(sessions: Session[]) {
  if (
    !(globalThis as unknown as { chrome?: typeof chrome }).chrome?.storage
      ?.local
  ) {
    throw new Error("Chrome storage API not available");
  }
  const c = (globalThis as unknown as { chrome: typeof chrome }).chrome;
  return new Promise<void>((resolve, reject) => {
    c.storage.local.set({ sessions }, () => {
      const err = c.runtime.lastError;
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function filterSessions(
  sessions: Session[],
  filters: FilterOption,
): Session[] {
  const now = Date.now();
  return sessions.filter((s) => {
    // Filter dates
    let dateMatch = true;
    if (filters.dateRange === "today") {
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      const sessionDate = s.updatedAt || s.createdAt || 0;
      dateMatch = sessionDate >= startOfToday;
    } else if (filters.dateRange === "week") {
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const sessionDate = s.updatedAt || s.createdAt || 0;
      dateMatch = sessionDate >= oneWeekAgo;
    } else if (filters.dateRange === "month") {
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      const sessionDate = s.updatedAt || s.createdAt || 0;
      dateMatch = sessionDate >= oneMonthAgo;
    }

    // Filter tab counts
    let tabCountMatch = true;
    if (filters.tabCount === "few") {
      tabCountMatch = (s.tabsCount || 0) <= 5;
    } else if (filters.tabCount === "moderate") {
      tabCountMatch = (s.tabsCount || 0) > 5 && (s.tabsCount || 0) <= 15;
    } else if (filters.tabCount === "many") {
      tabCountMatch = (s.tabsCount || 0) > 15;
    }

    return dateMatch && tabCountMatch;
  });
}

/**
 * Updates a session title in Chrome storage and returns the updated sessions array
 */
export async function updateSessionTitle(
  sessionId: string,
  newTitle: string,
): Promise<Session[]> {
  if (typeof chrome !== "undefined" && chrome.storage) {
    const data = await new Promise<{ sessions: Session[] }>((resolve) => {
      chrome.storage.local.get(["sessions"], (res) => {
        resolve(res as { sessions: Session[] });
      });
    });

    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const updatedSessions = sessions.map((s) =>
      s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s,
    );

    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ sessions: updatedSessions }, () => {
        if (chrome.runtime?.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });

    return updatedSessions;
  } else {
    throw new Error("Chrome storage API not available");
  }
}

/**
 * Deletes a session from Chrome storage and returns the updated sessions array
 */
export async function deleteSession(sessionId: string): Promise<Session[]> {
  if (typeof chrome !== "undefined" && chrome.storage) {
    const data = await new Promise<{ sessions: Session[] }>((resolve) => {
      chrome.storage.local.get(["sessions"], (res) => {
        resolve(res as { sessions: Session[] });
      });
    });

    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);

    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ sessions: updatedSessions }, () => {
        if (chrome.runtime?.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });

    return updatedSessions;
  } else {
    throw new Error("Chrome storage API not available");
  }
}

/**
 * Removes specific tabs from a session in Chrome storage and returns the updated sessions array
 */
export async function removeTabsFromSession(
  sessionId: string,
  tabIndicesToRemove: number[],
): Promise<Session[]> {
  if (typeof chrome !== "undefined" && chrome.storage) {
    const data = await new Promise<{ sessions: Session[] }>((resolve) => {
      chrome.storage.local.get(["sessions"], (res) => {
        resolve(res as { sessions: Session[] });
      });
    });

    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const updatedSessions = sessions.map((s) => {
      if (s.id === sessionId) {
        const newTabs = s.tabs.filter(
          (_, idx) => !tabIndicesToRemove.includes(idx),
        );
        return {
          ...s,
          tabs: newTabs,
          tabsCount: newTabs.length,
          updatedAt: Date.now(),
        };
      }
      return s;
    });

    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ sessions: updatedSessions }, () => {
        if (chrome.runtime?.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });

    return updatedSessions;
  } else {
    throw new Error("Chrome storage API not available");
  }
}

/**
 * Moves a tab from one session to another in Chrome storage and returns the updated sessions array
 */
export async function moveTabBetweenSessions(
  sourceSessionId: string,
  targetSessionId: string,
  tabIndex: number,
): Promise<Session[]> {
  if (typeof chrome !== "undefined" && chrome.storage) {
    const data = await new Promise<{ sessions: Session[] }>((resolve) => {
      chrome.storage.local.get(["sessions"], (res) => {
        resolve(res as { sessions: Session[] });
      });
    });

    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const sourceSession = sessions.find((s) => s.id === sourceSessionId);
    const targetSession = sessions.find((s) => s.id === targetSessionId);

    if (!sourceSession || !targetSession) {
      throw new Error("Source or target session not found");
    }

    if (tabIndex < 0 || tabIndex >= sourceSession.tabs.length) {
      throw new Error("Invalid tab index");
    }

    // Get the tab to move
    const tabToMove = sourceSession.tabs[tabIndex];

    // Update sessions
    const updatedSessions = sessions.map((s) => {
      if (s.id === sourceSessionId) {
        // Remove tab from source
        const newTabs = s.tabs.filter((_, idx) => idx !== tabIndex);
        return {
          ...s,
          tabs: newTabs,
          tabsCount: newTabs.length,
          updatedAt: Date.now(),
        };
      } else if (s.id === targetSessionId) {
        // Add tab to target
        const newTabs = [...s.tabs, tabToMove];
        return {
          ...s,
          tabs: newTabs,
          tabsCount: newTabs.length,
          updatedAt: Date.now(),
        };
      }
      return s;
    });

    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ sessions: updatedSessions }, () => {
        if (chrome.runtime?.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });

    return updatedSessions;
  } else {
    throw new Error("Chrome storage API not available");
  }
}

export async function getSettings(): Promise<Settings> {
  if (typeof chrome !== "undefined" && chrome.storage) {
    const data = await new Promise<{ settings: Settings }>((resolve) => {
      chrome.storage.local.get(["settings"], (res) => {
        resolve(res as { settings: Settings });
      });
    });

    return data.settings || {};
  } else {
    throw new Error("Chrome storage API not available");
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.storage) {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ settings }, () => {
        if (chrome.runtime?.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  } else {
    throw new Error("Chrome storage API not available");
  }
}

export async function clearSettings(): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.storage) {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.remove(["settings"], () => {
        if (chrome.runtime?.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  } else {
    throw new Error("Chrome storage API not available");
  }
}
