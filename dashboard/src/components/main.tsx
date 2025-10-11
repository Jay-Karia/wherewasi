import { useStorage } from "@/hooks/useStorage";

export default function Main() {
    const [sessions, , loading, error] = useStorage({
        key: "sessions",
        initialValue: [],
    });

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {JSON.stringify(error)}</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-4">
            {JSON.stringify(sessions)}
        </div>
    );
}