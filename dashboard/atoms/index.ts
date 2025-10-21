import type {
  FilterOption,
  Session,
  SessionViews,
  SortOption,
  Settings,
} from "@/types";
import { atomWithStorage } from "jotai/utils";

export const currentViewAtom = atomWithStorage<SessionViews>(
  "currentView",
  "sessions",
);
export const sessionsAtom = atomWithStorage<Session[]>("sessions", []);
export const sortOptionAtom = atomWithStorage<SortOption>(
  "sortOption",
  "date-desc",
);
export const filtersAtom = atomWithStorage<FilterOption>("filters", {
  dateRange: "all",
  tabCount: "all",
});
export const queryAtom = atomWithStorage<string>("query", "");
export const searchFocusAtom = atomWithStorage<boolean>("searchFocus", false);
export const isSettingsOpenAtom = atomWithStorage<boolean>(
  "isSettingsOpen",
  false,
);
export const geminiApiKeyAtom = atomWithStorage<string | null>(
  "geminiApiKey",
  null,
);

export const settingsAtom = atomWithStorage<Settings>("settings", {
  geminiApiKey: null,
  geminiModel: "gemini-2.5-flash",
});
