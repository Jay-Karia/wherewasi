import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { Input } from "./input";

export default function Search() {
  const [query, setQuery] = useState("");

  const searchInput = document.getElementById("search-input");
  document.onkeydown = (e) => {
    if (e.shiftKey && e.altKey && e.key.toLowerCase() === "k") {
      searchInput?.focus();
    }
  };

  return (
    <div className="flex-1 flex justify-center w-150">
      <div className="w-full max-w-3xl">
        <Input
          type="text"
          placeholder="Search sessions, keywords, or sites..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<CiSearch size={18} />}
          shortcut="Shift+Alt+K"
          id="search-input"
        />
      </div>
    </div>
  );
}
