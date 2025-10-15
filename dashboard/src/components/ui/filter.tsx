import { CiFilter } from "react-icons/ci";
import { Button } from "./button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { IoCalendarOutline } from "react-icons/io5";
import { MdTitle } from "react-icons/md";

export default function Filter() {
    const [isOpen, setIsOpen] = useState(false);
    const [dateRange, setDateRange] = useState<string>("all");
    const [tabCount, setTabCount] = useState<string>("all");
    const [hasTitle, setHasTitle] = useState<boolean | null>(null);

    const hasActiveFilters = dateRange !== "all" || tabCount !== "all" || hasTitle !== null;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger>
                <Button
                    className="px-3 py-1 gap-2 relative"
                    size="sm"
                    variant="secondary"
                    aria-label="Open filter options"
                >
                    <CiFilter className="mr-1" aria-hidden />
                    <span className="sr-only sm:not-sr-only">Filter</span>
                    {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-64 p-3">
                <DropdownMenuLabel className="text-xs text-neutral-400 px-0 pb-2">
                    Filter sessions
                </DropdownMenuLabel>

                {/* Date Range Filter */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <IoCalendarOutline className="text-muted-foreground" />
                        <span>Date Range</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setDateRange("all")}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${dateRange === "all"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-accent border-border"
                                }`}
                        >
                            All time
                        </button>
                        <button
                            onClick={() => setDateRange("today")}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${dateRange === "today"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-accent border-border"
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setDateRange("week")}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${dateRange === "week"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-accent border-border"
                                }`}
                        >
                            This week
                        </button>
                        <button
                            onClick={() => setDateRange("month")}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${dateRange === "month"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-accent border-border"
                                }`}
                        >
                            This month
                        </button>
                    </div>
                </div>

                <DropdownMenuSeparator />

                {/* Tab Count Filter */}
                <div className="my-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        {/* <IoTabsOutline className="text-muted-foreground" /> */}
                        <span>Tab Count</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setTabCount("all")}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${tabCount === "all"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-accent border-border"
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setTabCount("few")}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${tabCount === "few"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-accent border-border"
                                }`}
                        >
                            {"< 5 tabs"}
                        </button>
                        <button
                            onClick={() => setTabCount("moderate")}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${tabCount === "moderate"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-accent border-border"
                                }`}
                        >
                            5-20 tabs
                        </button>
                        <button
                            onClick={() => setTabCount("many")}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${tabCount === "many"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-accent border-border"
                                }`}
                        >
                            {"> 20 tabs"}
                        </button>
                    </div>
                </div>

                <DropdownMenuSeparator className="my-3" />

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={() => {
                            setDateRange("all");
                            setTabCount("all");
                            setHasTitle(null);
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-md bg-accent hover:bg-accent/80 text-accent-foreground transition-colors"
                    >
                        Clear all filters
                    </button>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}