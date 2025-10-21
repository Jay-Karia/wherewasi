import Logo from "./logo";
import { Button } from "./ui/button";
import Search from "./ui/search";
import { ThemeToggle } from "./ui/theme-toggle";
import { IoSettingsOutline } from "react-icons/io5";
import { useAtom, useAtomValue } from "jotai";
import { isSettingsOpenAtom, searchFocusAtom } from "../../atoms";
import { cn } from "@/lib/utils";

export default function AppBar() {
  const searchFocus = useAtomValue(searchFocusAtom);
  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsOpenAtom);

  return (
    <div className="h-16 bg-base-100 px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-700">
      <div
        className={cn("flex items-center gap-2 flex-shrink-0", {
          "sm:flex hidden": searchFocus,
        })}
      >
        <Logo />
        <h4 className="hidden sm:block scroll-m-20 text-xl sm:text-2xl font-medium tracking-tight text-gray-600 dark:text-gray-400 whitespace-nowrap">
          Where Was I
        </h4>
      </div>
      <div className="flex-1 max-w-3xl mx-2 sm:mx-4">
        <Search />
      </div>
      <div
        className={cn("flex items-center gap-1 sm:gap-2 flex-shrink-0", {
          "sm:flex hidden": searchFocus,
        })}
      >
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const toggle = !isSettingsOpen;
            setIsSettingsOpen(toggle);
          }}
        >
          <IoSettingsOutline size={20} />
        </Button>
      </div>
    </div>
  );
}
