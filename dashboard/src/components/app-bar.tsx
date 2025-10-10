import Logo from "./logo";
// import Search from "./ui/search";
import { ThemeToggle } from "./ui/theme-toggle";

export default function AppBar() {

  return (
    <div className="h-16 bg-base-100 px-4 flex items-center justify-around border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Logo />
        <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Where Was I
        </h4>
      </div>
      <div></div>
      <div>
        <ThemeToggle />
      </div>
    </div>
  );
}
