export type Session = {
  id: string;
  tabsCount: number;
  title: string;
  summary: string;
  tabs: unknown[];
  createdAt: number;
  updatedAt: number;
};

export type SessionViews = "sessions" | "timeline" | "list";

export type SortOption = "tabs-asc" | "tabs-desc" | "date-asc" | "date-desc";