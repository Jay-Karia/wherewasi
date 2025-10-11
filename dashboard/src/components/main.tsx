import type { Session } from "@/types";
// import { useSessions } from "../hooks/useSessions";

export default function Main() {
    // const { sessions, loading, error } = useSessions();

    // console.log(sessions);

    // if (loading) {
    //     return (
    //         <div className="flex items-center justify-center py-10 text-sm text-gray-500">
    //             Loading sessions...
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <div className="flex items-center justify-center py-10 text-sm text-red-600">
    //             {error}
    //         </div>
    //     );
    // }

    // if (!sessions.length) {
    //     return (
    //         <div className="flex items-center justify-center py-10 text-sm text-gray-500">
    //             No sessions found.
    //         </div>
    //     );
    // }

    return (
        <div className="max-w-5xl mx-auto px-4 py-4">
            {/* <ul className="space-y-3">
                {sessions.map((s: Session) => (
                    <li key={s.id} className="border rounded-md p-4 bg-white shadow-sm">
                        <div className="font-medium">{s.title || s.id}</div>
                    </li>
                ))}
            </ul> */}
        </div>
    );
}