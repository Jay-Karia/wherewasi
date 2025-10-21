import { useAtomValue } from "jotai";
import { currentViewAtom, isSettingsOpenAtom, queryAtom, sortOptionAtom } from "../../atoms";
import SessionsView from "./views/sessions";
import TimelineView from "./views/timeline";
import ListView from "./views/list";
import { useStorage } from "@/hooks/useStorage";
import SearchResults from "./search-results";
import Settings from "./settings";

export default function Main() {
  const query = useAtomValue(queryAtom);
  let [sessions, , loading, error] = useStorage({
    key: "sessions",
    initialValue: [],
  });

  const currentView = useAtomValue(currentViewAtom);
  const sortOption = useAtomValue(sortOptionAtom);
  const isSettingsOpen = useAtomValue(isSettingsOpenAtom);

  if (query) return <SearchResults />;
  if (isSettingsOpen) return <Settings />

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  if (currentView === "sessions") {
    return (
      <div>
        <SessionsView sessions={sessions} sortOption={sortOption} />
      </div>
    );
  }

  if (currentView === "timeline") {
    return (
      <div>
        <TimelineView sessions={sessions} sortOption={sortOption} />
      </div>
    );
  }

  if (currentView === "list") {
    return (
      <div>
        <ListView sessions={sessions} sortOption={sortOption} />
      </div>
    );
  }
}
