import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FiSave, FiRefreshCw, FiUpload, FiDownload, FiSettings, FiEye, FiEyeOff } from "react-icons/fi";
import { PiSparkleFill } from "react-icons/pi";
import { useState } from "react";

export default function Settings() {
    const [showApiKey, setShowApiKey] = useState(false);

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8 -mt-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2">
                                    <FiSettings className="w-5 h-5 tex-primary" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                            </div>
                            <p className="text-muted-foreground ml-12">
                                Configure and customize the extension according to your preferences
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <FiUpload className="w-4 h-4" />
                                Import
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <FiDownload className="w-4 h-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </header>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* API Configuration Section */}
                    <section className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                <PiSparkleFill className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-1">AI Configuration</h3>
                                <p className="text-sm text-muted-foreground">
                                    Manage your API key and model settings
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 ml-14">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Gemini AI API Key
                                    <span className="text-destructive ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showApiKey ? "text" : "password"}
                                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        className="pr-10"
                                    />
                                    <button
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showApiKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Your API key is stored locally and never shared
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button size="default" className="gap-2 shadow-sm">
                                <FiSave className="w-4 h-4" />
                                Save Settings
                            </Button>
                            <Button variant="outline" size="default" className="gap-2">
                                <FiRefreshCw className="w-4 h-4" />
                                Reset to Default
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}