export type Session = {
    id: string;
    tabsCount: number;
    title: string;
    summary: string;
    tabs: unknown[];
    createdAt: number;
    updatedAt: number;
}