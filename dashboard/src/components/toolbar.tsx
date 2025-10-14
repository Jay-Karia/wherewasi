import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAtom } from "jotai";
import { currentViewAtom } from "../../atoms";
import { Button } from "./ui/button";
import { CiImport } from "react-icons/ci";
import { CiExport } from "react-icons/ci";
import { CiFilter } from "react-icons/ci";
import { Clock } from "lucide-react";
import { FaSort } from "react-icons/fa";
import { FaList } from "react-icons/fa";
import { FaLayerGroup } from "react-icons/fa";
import type { SessionViews } from "@/types";

export default function Toolbar() {
    const [currentView, setCurrentView] = useAtom(currentViewAtom);

    return (
        <div className="flex items-center justify-center">
            <div>
                <div className="flex items-center gap-2 mr-4">
                    <Button className="px-3 py-1" variant={"secondary"} size={"sm"}>
                        <CiImport className="mr" /> Import
                    </Button>
                    <Button className="px-3 py-1" size={"sm"} variant={"secondary"}>
                        <CiExport className="mr" /> Export
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="account" className="w-full" value={currentView} onValueChange={(value) => setCurrentView(value as SessionViews)}>
                <TabsList>
                    <TabsTrigger value="sessions" className="px-12">
                        <FaLayerGroup className="mr-2" size={13} />
                        Sessions
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="px-12">
                        <Clock className="mr-2" size={15} />
                        Timeline
                    </TabsTrigger>
                    <TabsTrigger value="List" className="px-12">
                        <FaList className="mr-2" size={14} />
                        List
                    </TabsTrigger>
                </TabsList>
            </Tabs>
            <div>
                <div className="flex items-center gap-2 ml-4">
                    <Button className="px-3 py-1" variant={"secondary"} size={"sm"}>
                        <CiFilter className="mr" /> Filter
                    </Button>
                    <Button className="px-3 py-1" size={"sm"} variant={"secondary"}>
                        <FaSort className="mr" /> Sort
                    </Button>
                </div>
            </div>
        </div>
    );
}