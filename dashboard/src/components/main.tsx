import sessions from "../../../dummy/data.json"
import { useAtomValue } from "jotai";
import { currentViewAtom } from "../../atoms";
import SessionsView from "./views/sessions";

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
}