import { FaSort } from "react-icons/fa";
import { Button } from "./button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiSortAscendingThin, PiSortDescendingThin } from "react-icons/pi";
import { useMemo, useState } from "react";

type SortOption = "tabs-asc" | "tabs-desc" | "date-asc" | "date-desc";

export default function Sort({
    value,
    onChange,
}: {
    value?: SortOption;
    onChange?: (v: SortOption) => void;
}) {
    const [internal, setInternal] = useState<SortOption>(value ?? "date-desc");
    const selected = value ?? internal;

    const label = useMemo(() => {
        switch (selected) {
            case "tabs-asc":
                return "Tabs ↑";
            case "tabs-desc":
                return "Tabs ↓";
            case "date-asc":
                return "Date ↑";
            case "date-desc":
            default:
                return "Date ↓";
        }
    }, [selected]);

    const handleChange = (v: string) => {
        const next = v as SortOption;
        if (onChange) onChange(next);
        else setInternal(next);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className="px-3 py-1 gap-2"
                    size="sm"
                    variant="secondary"
                    aria-label="Open sort options"
                >
                    <FaSort className="mr-1" aria-hidden />
                    <span className="sr-only sm:not-sr-only">Sort:</span>
                    <span className="hidden sm:inline text-neutral-200">{label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-52">
                <DropdownMenuLabel className="text-xs text-neutral-400">
                    Sort by
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={selected} onValueChange={handleChange}>
                    <DropdownMenuRadioItem value="tabs-asc">
                        <PiSortAscendingThin className="mr-2" aria-hidden /> Tabs (fewest first)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="tabs-desc">
                        <PiSortDescendingThin className="mr-2" aria-hidden /> Tabs (most first)
                    </DropdownMenuRadioItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioItem value="date-asc">
                        <PiSortAscendingThin className="mr-2" aria-hidden /> Date (oldest first)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date-desc">
                        <PiSortDescendingThin className="mr-2" aria-hidden /> Date (newest first)
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}