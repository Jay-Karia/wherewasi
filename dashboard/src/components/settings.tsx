import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FiSave, FiRefreshCw, FiUpload, FiDownload } from "react-icons/fi";

export default function Settings() {

    return (
        <div className="w-full min-h-screen bg-background/60 p-8">

            {/* Header */}
            <header className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold mb-0">Settings</h2>
                    <p className="text-sm text-muted-foreground">Configure and customize the extension according to your preferences.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm"><FiUpload className="mr-2" />Import</Button>
                    <Button variant="outline" size="sm"><FiDownload className="mr-2" />Export</Button>
                </div>
            </header>

            {/* Gemini API Key */}
            <div className="w-1/2 my-8 mb-12">
                <section className="lg:col-span-2">
                    <label className="block text-sm text-muted-foreground mb-2">Gemini AI API Key</label>
                    <div className="relative">
                        <Input
                            placeholder="Enter Gemini API key"
                        />
                    </div>
                </section>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="default" size="sm">
                        <FiSave className="mr-2" /> Save Settings
                    </Button>
                    <Button variant="outline" size="sm">
                        <FiRefreshCw className="mr-2" /> Reset
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    {status && <div className="text-sm text-muted-foreground">{status}</div>}
                </div>
            </div>
        </div>
    );
}