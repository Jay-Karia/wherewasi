// import { StorageService } from "../utils/storage";
// import { AIService } from "../utils/ai-service";

console.log("WhereWasI: Service worker loaded");

// Tabs in each window
let windowTabs = {};

// Track all current tabs
chrome.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => {
    if (!windowTabs[tab.windowId]) {
      windowTabs[tab.windowId] = [];
    }
    windowTabs[tab.windowId].push({
      id: tab.id,
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
    });
  });
  console.log("Current tabs tracked:", windowTabs);
});

// Track new tabs
chrome.tabs.onCreated.addListener((tab) => {
  if (!windowTabs[tab.windowId]) {
    windowTabs[tab.windowId] = [];
  }
  windowTabs[tab.windowId].push({
    id: tab.id,
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl,
  });

  console.log("Tab created:", tab);
});

// Update tab info when it changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.title) {
    const windowId = tab.windowId;
    const tabIndex = windowTabs[windowId]?.findIndex((t) => t.id === tabId);

    if (tabIndex !== -1) {
      windowTabs[windowId][tabIndex] = {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        favIconUrl: tab.favIconUrl,
      };
    }
  }
});

// Save when window is closed
chrome.windows.onRemoved.addListener(async (windowId) => {
  console.log("Window closed:", windowId);

  const tabs = windowTabs[windowId];

  // Only save if there were tabs (ignore empty windows)
  if (!tabs || tabs.length === 0) {
    console.log("No tabs to save");
    delete windowTabs[windowId];
    return;
  }

  // Filter out chrome:// and extension pages
  const validTabs = tabs.filter(
    (tab) =>
      tab.url &&
      !tab.url.startsWith("chrome://") &&
      !tab.url.startsWith("chrome-extension://")
  );

  if (validTabs.length === 0) {
    console.log("No valid tabs to save");
    delete windowTabs[windowId];
    return;
  }

  console.log(`Saving session with ${validTabs.length} tabs`);

  try {
    // Generate AI summary
    const summary = "AI summary placeholder";
    // const summary = await AIService.generateSummary(validTabs);

    // Create session object
    const session = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      tabs: validTabs,
      tabCount: validTabs.length,
      summary: summary,
      tags: [],
    };

    // Save to storage
    // await StorageService.saveSession(session);
    console.log("Session saved successfully:", session.id);
  } catch (error) {
    console.error("Error saving session:", error);
  }

  // Cleanup
  delete windowTabs[windowId];
});

// Keyboard Shortcut to open dashboard
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-dashboard") {
    chrome.tabs.create({ url: "dashboard/dashboard.html" });
  }
});
