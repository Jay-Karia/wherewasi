import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAtom, useAtomValue } from "jotai";
import { currentViewAtom, isSettingsOpenAtom, queryAtom } from "../../atoms";
import { Clock } from "lucide-react";
import { FaList } from "react-icons/fa";
import { FaLayerGroup } from "react-icons/fa";
import type { SessionViews } from "@/types";
import Export from "./ui/export";
import Import from "./ui/import";
import Sort from "./ui/sort";
import Filter from "./ui/filter";

export default function Toolbar() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const query = useAtomValue(queryAtom);
  const isSettingsOpen = useAtomValue(isSettingsOpenAtom);

  if (query) return null;
  if (isSettingsOpen) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0 w-full px-2 md:px-0 max-w-4xl">
      <div className="w-full md:w-auto">
        <div className="flex items-center justify-center md:justify-start gap-2 md:mr-4">
          <Import />
          <Export />
        </div>
      </div>
      <Tabs
        defaultValue="sessions"
        className="w-full flex-1 max-w-xl"
        value={currentView}
        onValueChange={(value) => setCurrentView(value as SessionViews)}
      >
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="sessions">
            <FaLayerGroup className="mr-2" size={13} />
            <span className="hidden sm:inline">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="mr-2" size={15} />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="list">
            <FaList className="mr-2" size={14} />
            <span className="hidden sm:inline">List</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="w-full md:w-auto">
        <div className="flex items-center justify-center md:justify-end gap-2 md:ml-4">
          <Sort />
          <Filter />
        </div>
      </div>
    </div>
  );
}
