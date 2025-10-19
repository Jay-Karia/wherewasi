import { CiImport } from "react-icons/ci";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "@/components/ui/input";
import { Label } from "./label";
import { useRef, useState } from "react";
import { normalizeImportedSessions, writeSessionsToStorage } from "@/lib/utils";

export default function Import() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "parsing" }
    | { state: "success"; count: number }
    | { state: "error"; message: string }
  >({ state: "idle" });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : "");
    setStatus({ state: "idle" });
  };

  const onImport = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setStatus({ state: "error", message: "Please select a JSON file first" });
      return;
    }
    setStatus({ state: "parsing" });
    try {
      const text = await file.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("File is not valid JSON");
      }
      const sessions = normalizeImportedSessions(json);
      await writeSessionsToStorage(sessions);
      setStatus({ state: "success", count: sessions.length });
    } catch (e) {
      setStatus({ state: "error", message: (e as Error).message });
    }
  };

  const reset = () => {
    if (inputRef.current) inputRef.current.value = "";
    setFileName("");
    setStatus({ state: "idle" });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="px-3 py-1" variant={"secondary"} size={"sm"}>
          <CiImport className="mr-1" /> Import
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Import your data from a JSON file to restore or update your
            sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">Select JSON file</Label>
            <Input
              id="file"
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              onChange={onFileChange}
            />
            {fileName && (
              <p className="text-xs text-neutral-400">Selected: {fileName}</p>
            )}
          </div>
          {status.state === "parsing" && (
            <p className="text-sm text-indigo-300 animate-pulse">
              Parsing file…
            </p>
          )}
          {status.state === "error" && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded p-2 flex justify-between items-start gap-4">
              <span>{status.message}</span>
              <button
                onClick={reset}
                className="text-xs px-2 py-0.5 rounded bg-red-700/40 hover:bg-red-700/60"
              >
                Reset
              </button>
            </div>
          )}
          {status.state === "success" && (
            <div className="text-sm text-emerald-300 bg-emerald-900/30 border border-emerald-700/40 rounded p-2">
              Imported {status.count} sessions successfully.
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={onImport}>Import</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
