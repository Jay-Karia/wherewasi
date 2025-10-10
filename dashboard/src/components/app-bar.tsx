import { useTheme } from "./useTheme";
import { FiSun } from "react-icons/fi";
import { GoMoon } from "react-icons/go";
import Logo from "./logo";
import Search from "./ui/search";

export default function AppBar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="navbar bg-base-100 shadow-sm px-4 items-center">
      <div className="flex items-center gap-4">
        <Logo />
        <span className="text-2xl">Where Was I</span>
      </div>

      <Search />

      <div className="flex-none flex items-center gap-2">
        <button
          className=""
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <FiSun className="h-5 w-5" />
          ) : (
            <GoMoon className="h-5 w-5" />
          )}
        </button>
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
