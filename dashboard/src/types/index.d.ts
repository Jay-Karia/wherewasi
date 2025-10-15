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

export type SortOption = "date-asc" | "date-desc";

export type FilterDateRange = "all" | "today" | "week" | "month";
export type FilterTabCount = "all" | "few" | "moderate" | "many";

export type FilterOption = {
  dateRange: FilterDateRange;
  tabCount: FilterTabCount;
};