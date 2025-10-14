import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAtom } from "jotai";
import { currentViewAtom } from "../../atoms";
import { Button } from "./ui/button";
import { CiFilter } from "react-icons/ci";
import { Clock } from "lucide-react";
import { FaList } from "react-icons/fa";
import { FaLayerGroup } from "react-icons/fa";
import type { SessionViews } from "@/types";
import Export from "./ui/export";
import Import from "./ui/import";
import Sort from "./ui/sort";

export default function Toolbar() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);

  return (
    <div className="flex items-center justify-center">
      <div>
        <div className="flex items-center gap-2 mr-4">
          <Import />
          <Export />
        </div>
      </div>
      <Tabs
        defaultValue="account"
        className="w-full"
        value={currentView}
        onValueChange={(value) => setCurrentView(value as SessionViews)}
      >
        <TabsList>
          <TabsTrigger value="sessions" className="px-12">
            <FaLayerGroup className="mr-2" size={13} />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="timeline" className="px-12">
            <Clock className="mr-2" size={15} />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="list" className="px-12">
            <FaList className="mr-2" size={14} />
            List
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div>
        <div className="flex items-center gap-2 ml-4">
          <Sort />
          <Button className="px-3 py-1" variant={"secondary"} size={"sm"}>
            <CiFilter className="mr" /> Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
