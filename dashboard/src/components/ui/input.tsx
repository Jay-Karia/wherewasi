import * as React from "react";
import { RxCross2 } from "react-icons/rx";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  shortcut?: string;
  showClear?: boolean;
  setQuery?: (query: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, shortcut, showClear, setQuery, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent pl-4 pr-8 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:placeholder:opacity-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <div className="hidden md:block absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
          {shortcut}
        </div>
        {showClear && setQuery && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer z-10">
            {
              <RxCross2
                className="hover:opacity-70"
                size={19}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery("");
                }}
              />
            }
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
