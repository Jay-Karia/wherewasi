import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  FiSave,
  FiRefreshCw,
  FiUpload,
  FiDownload,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiSliders,
} from "react-icons/fi";
import { PiSparkleFill } from "react-icons/pi";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { getSettings, saveSettings, clearSettings } from "@/lib/utils";
import { isSettingsOpenAtom } from "../../atoms";
import type { Settings } from "@/types";
import { DEFAULT_SETTINGS } from "../../constants";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<string | null>(null);
  const [, setIsSettingsOpen] = useAtom(isSettingsOpenAtom);

  useEffect(() => {
    async function fetchSettings() {
      const fetchedSettings = await getSettings();
      setSettings(fetchedSettings);
    }

    void fetchSettings();
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-background via-background to-muted/20 p-8 -mt-8">
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
                Configure and customize the extension according to your
                preferences
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setIsSettingsOpen(false)}
              >
                ← Back
              </Button>
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
          {/* Behaviour */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mt-1">
                <FiSliders className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">General Settings</h3>
                <p className="text-sm text-muted-foreground">
                  General preferences and behavior for the extension
                </p>
              </div>
            </div>

            <div className="space-y-4 ml-14">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Track all sites
                  </label>
                  <p className="text-xs text-muted-foreground">
                    When enabled, the extension will track every opened site.
                    When disabled (default), it will track only closed tabs.
                  </p>
                </div>
                <div className="ml-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <Switch
                      checked={!!settings.trackAllSites}
                      onCheckedChange={(checked: boolean) =>
                        setSettings({ ...settings, trackAllSites: checked })
                      }
                      aria-label="Track all sites"
                      className="peer"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* AI Configuration Section */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mt-1">
                <PiSparkleFill className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">AI Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your AI settings
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
                    value={settings.geminiApiKey || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, geminiApiKey: e.target.value })
                    }
                    type={showApiKey ? "text" : "password"}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="pr-10"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your API key is stored locally.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: After changing the API key you should refresh the
                  extension to use the new key.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="default"
                className="gap-2 shadow-sm"
                onClick={async () => {
                  setStatus("Saving...");
                  try {
                    await saveSettings(settings);
                    setStatus("Saved");
                    setTimeout(() => setStatus(null), 1200);
                  } catch (err: any) {
                    setStatus(`Save failed: ${String(err)}`);
                  }
                }}
              >
                <FiSave className="w-4 h-4" />
                Save
              </Button>
              <Button
                variant="outline"
                size="default"
                className="gap-2"
                onClick={async () => {
                  setStatus("Resetting...");
                  try {
                    await clearSettings();
                    setSettings(DEFAULT_SETTINGS);
                    setStatus("Reset");
                    setTimeout(() => setStatus(null), 1200);
                  } catch (err: any) {
                    setStatus(`Reset failed: ${String(err)}`);
                  }
                }}
              >
                <FiRefreshCw className="w-4 h-4" />
                Reset
              </Button>
              {status && (
                <div className="ml-4 text-sm text-muted-foreground">
                  {status}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
