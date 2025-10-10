/*
  The background service worker for the extension
*/

//======================IMPORTS================================//

import { StorageService } from '../utils/storage.js';
import { AIService } from '../utils/ai-service.js';

//=============================================================//

console.log('WhereWasI: Service worker loaded');
let windowTabs = {};

//=======================CURRENT TABS==========================//

chrome.tabs.query({}, tabs => {
  tabs.forEach(tab => {
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
  console.log('Current tabs tracked:', windowTabs);
});

//=======================NEW TABS=============================//

chrome.tabs.onCreated.addListener(tab => {
  if (!windowTabs[tab.windowId]) {
    windowTabs[tab.windowId] = [];
  }
  windowTabs[tab.windowId].push({
    id: tab.id,
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl,
  });

  console.log('Tab created:', tab);
});

///======================TAB UPDATES=========================//

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.title) {
    const windowId = tab.windowId;
    const tabIndex = windowTabs[windowId]
      ? windowTabs[windowId].findIndex(t => t.id === tabId)
      : -1;

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

//======================TAB REMOVALS========================//

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    const windowId = removeInfo.windowId;
    const tabs = windowTabs[windowId] || [];

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) {
      console.log('Closed tab not found in tracking map:', tabId);
      return;
    }

    const tab = tabs[tabIndex];

    // Remove from tracking
    tabs.splice(tabIndex, 1);
    if (tabs.length === 0) delete windowTabs[windowId];

    // Filter out chrome:// and extension pages
    if (
      !tab.url ||
      tab.url.startsWith('chrome://') ||
      tab.url.startsWith('chrome-extension://')
    ) {
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

    // Group the closed tab into a session
    try {
      const session = await AIService.groupClosedTab(tabRecord);
      if (session) console.log('AI grouped closed tabs into session:', session.id);
    } catch (aiErr) {
      console.error('AI grouping error:', aiErr);
    }
  } catch (err) {
    console.error('Error handling tab removal:', err);
  }
});

//=====================WINDOW REMOVALS========================//

chrome.windows.onRemoved.addListener(windowId => {
  console.log('Window removed, cleaning tracking for:', windowId);
  delete windowTabs[windowId];
});

//==================DASHBOARD SHORTCUT========================//

chrome.commands.onCommand.addListener(command => {
  if (command === 'open-dashboard') {
    chrome.tabs.create({ url: 'dashboard/dist/index.html' });
  }
});

//***********************************************************//
