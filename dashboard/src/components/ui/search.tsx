import { useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function Search() {
    const [query, setQuery] = useState("");

    return <div className="flex-1 flex justify-center">
        <div className="w-full max-w-xl">
            <label htmlFor="session-search" className="sr-only">
                Search sessions
            </label>
            <div className="relative">
                <input
                    id="session-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search sessions, tags or sites"
                    className="input input-bordered w-full pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-5">
                    <CiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
            </div>
        </div>
    </div>
}