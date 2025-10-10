import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { Input } from "./input";

export default function Search() {
    const [query, setQuery] = useState("");

    return <div className="flex-1 flex justify-center w-150">
        <div className="w-full max-w-3xl">
            <Input
                type="text"
                placeholder="Search sessions, tags, or sites..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon={<CiSearch size={18} />}
            />
        </div>
    </div>
}