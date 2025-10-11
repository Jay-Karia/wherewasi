/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";

type UseStorageReturn<T> = [
    T,
    (newValue: T) => Promise<void>,
    boolean,
    unknown,
];

export function useStorage<T>({
    key,
    initialValue,
}: {
    key: string;
    initialValue: T;
}): UseStorageReturn<T> {
    const [value, setValue] = useState<T>(initialValue);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null);
    const valueJsonRef = useRef<string>(JSON.stringify(initialValue));

    const hasChrome = () => {
        const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
        return !!c?.storage?.local;
    };

    // Stable JSON compare to avoid unnecessary setState thrash
    const setIfChanged = (next: T) => {
        const nextJson = JSON.stringify(next);
        if (nextJson !== valueJsonRef.current) {
            valueJsonRef.current = nextJson;
            setValue(next);
        }
    };

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                if (hasChrome()) {
                    const c = (globalThis as unknown as { chrome: typeof chrome }).chrome;
                    await new Promise<void>((resolve) => {
                        c.storage.local.get([key], (res: Record<string, unknown>) => {
                            const raw = res[key];
                            const next = (raw === undefined ? initialValue : (raw as T)) as T;
                            if (!cancelled) setIfChanged(next);
                            resolve();
                        });
                    });
                } else {
                    try {
                        const raw = globalThis.localStorage?.getItem(key);
                        const parsed = raw ? (JSON.parse(raw) as T) : initialValue;
                        if (!cancelled) setIfChanged(parsed);
                    } catch {
                        if (!cancelled) setIfChanged(initialValue);
                    }
                }
            } catch (e) {
                if (!cancelled) setError(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();

        // Subscribe to changes in extension context
        const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
        const listener = (
            changes: Record<string, { newValue?: unknown }>,
            area: string,
        ) => {
            if (area === "local" && Object.prototype.hasOwnProperty.call(changes, key)) {
                const next = (changes[key]?.newValue ?? initialValue) as T;
                setIfChanged(next);
            }
        };

        c?.storage?.onChanged?.addListener(listener);

        return () => {
            cancelled = true;
            c?.storage?.onChanged?.removeListener(listener);
        };
        // Depend only on key; initialValue is used as fallback but not a trigger
    }, [key]);

    const updateValue = useMemo(
        () =>
            async (newValue: T) => {
                try {
                    if (hasChrome()) {
                        const c = (globalThis as unknown as { chrome: typeof chrome }).chrome;
                        await new Promise<void>((resolve, reject) => {
                            c.storage.local.set({ [key]: newValue }, () => {
                                const err = c.runtime?.lastError;
                                if (err) return reject(err);
                                resolve();
                            });
                        });
                    } else {
                        globalThis.localStorage?.setItem(key, JSON.stringify(newValue));
                        // Also update local state immediately in fallback mode
                        setIfChanged(newValue);
                    }
                } catch (e) {
                    setError(e);
                }
            },
        [key],
    );

    return [value, updateValue, loading, error];
}