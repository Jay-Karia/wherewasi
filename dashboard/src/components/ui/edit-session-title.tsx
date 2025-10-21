import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Session } from "@/types";

type EditSessionTitleProps = {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (sessionId: string, newTitle: string) => Promise<void>;
};

export function EditSessionTitle({
  session,
  open,
  onOpenChange,
  onSave,
}: EditSessionTitleProps) {
  const [title, setTitle] = useState(session.title || "");
  const [saving, setSaving] = useState(false);

  // Update title when session changes
  useEffect(() => {
    setTitle(session.title || "");
  }, [session]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave(session.id, title.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("WhereWasI: Failed to update session title:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Session Title</DialogTitle>
          <DialogDescription>
            Update the title for this browsing session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter session title"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
