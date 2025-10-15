import { FaSort } from "react-icons/fa";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiSortAscendingThin, PiSortDescendingThin } from "react-icons/pi";
import { useMemo } from "react";
import type { SortOption } from "@/types";
import { useAtom } from "jotai";
import { sortOptionAtom } from "../../../atoms";

export default function Sort({
  value,
  onChange,
}: {
  value?: SortOption;
  onChange?: (v: SortOption) => void;
}) {
  const [sortOption, setSortOption] = useAtom(sortOptionAtom);
  const selected = value ?? sortOption;

  const label = useMemo(() => {
    switch (selected) {
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
    else setSortOption(next);
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
          <DropdownMenuRadioItem value="date-asc">
            <PiSortDescendingThin className="mr-2" aria-hidden /> Date (oldest
            first)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date-desc">
            <PiSortAscendingThin className="mr-2" aria-hidden /> Date (newest
            first)
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
