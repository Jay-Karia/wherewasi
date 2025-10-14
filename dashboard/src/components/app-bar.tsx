import Logo from "./logo";
import { Button } from "./ui/button";
import Search from "./ui/search";
import { ThemeToggle } from "./ui/theme-toggle";
import { IoSettingsOutline } from "react-icons/io5";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AppBar() {
  return (
    <div className="h-16 bg-base-100 px-4 flex items-center justify-around border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Logo />
        <h4 className="scroll-m-20 text-2xl font-medium tracking-tight text-gray-600 dark:text-gray-400">
          Where Was I
        </h4>
      </div>
      <div>
        <Search />
      </div>
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon">
                <IoSettingsOutline size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Comming Soon!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
