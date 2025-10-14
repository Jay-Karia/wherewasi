import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadDataJSON } from "@/lib/utils";
import { CiExport } from "react-icons/ci";
import sessions from "../../../../dummy/data.json";

export default function Export() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="px-3 py-1" variant={"secondary"} size={"sm"}>
          <CiExport className="mr" /> Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Download your data as a JSON file for backup or analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">File Format</label>
            <Select defaultValue="json">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Range</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                {/* <SelectItem value="last30">Last 30 Days</SelectItem>
                                <SelectItem value="last90">Last 90 Days</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => downloadDataJSON(sessions)}>Download</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
