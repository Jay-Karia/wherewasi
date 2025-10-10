import { StorageService } from "../utils/storage.js";
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
    const tabIndex = windowTabs[windowId] ? windowTabs[windowId].findIndex((t) => t.id === tabId) : -1;

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

// Save individual tabs when they are closed (user prefers single-window workflows)
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    const windowId = removeInfo.windowId;
    const tabs = windowTabs[windowId] || [];

    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) {
      console.log('Closed tab not found in tracking map:', tabId);
      return;
    }

    const tab = tabs[tabIndex];

    // Remove from tracking
    tabs.splice(tabIndex, 1);
    if (tabs.length === 0) delete windowTabs[windowId];

    // Filter out chrome:// and extension pages
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      console.log('Closed tab ignored (internal):', tab.url);
      return;
    }

    // Prepare a compact record
    const tabRecord = {
      id: tab.id,
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
      closedAt: new Date().toISOString(),
    };

    await StorageService.saveClosedTab(tabRecord);
  } catch (err) {
    console.error('Error handling tab removal:', err);
  }
});

// When a window is removed, just cleanup tracking. Individual tabs are saved on removal.
chrome.windows.onRemoved.addListener((windowId) => {
  console.log('Window removed, cleaning tracking for:', windowId);
  delete windowTabs[windowId];
});

// Keyboard Shortcut to open dashboard
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-dashboard") {
    chrome.tabs.create({ url: "dashboard/dist/index.html" });
  }
});
