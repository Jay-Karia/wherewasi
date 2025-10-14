import sessions from "../../../dummy/data.json"
import { useAtomValue } from "jotai";
import { currentViewAtom } from "../../atoms";
import SessionsView from "./views/sessions";
import TimelineView from "./views/timeline";
import ListView from "./views/list";

export default function Main() {
    // const [sessions, , loading, error] = useStorage({
    //     key: "sessions",
    //     initialValue: [],
    // });

    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {JSON.stringify(error)}</div>;

    const currentView = useAtomValue(currentViewAtom);

    if (currentView === "sessions") {
        return (
            <div>
                <SessionsView sessions={sessions} />
            </div>
        )
    }

    if (currentView === "timeline") {
        return (
            <div>
                <TimelineView sessions={sessions} />
            </div>
        )
    }

    if (currentView === "list") {
        return (
            <div>
                <ListView sessions={sessions} />
            </div>
        )
    }
}