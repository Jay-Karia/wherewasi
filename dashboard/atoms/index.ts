import type { Session, SessionViews, SortOption } from "@/types";
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
