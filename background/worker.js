/*
  The background service worker for the extension
*/

//======================IMPORTS================================//

import { scrapTabContent } from '../helpers/scraper.js';
import { AIService } from '../utils/ai-service.js';

//=============================================================//

console.log('WhereWasI: Service worker loaded');
const contentCache = new Map();

//======================TAB UPDATES=========================//

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Inject script when the page is loaded
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    tab.url.startsWith('http')
  ) {
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        func: scrapTabContent,
      })
      .catch(err => console.log('WhereWasI: Failed to inject script:', err))
      .then(() => {
        console.log('WhereWasI: Scrapping script injected into tabId:', tabId);
      });
  }
});

//===================MESSAGE LISTENER=======================//

chrome.runtime.onMessage.addListener((message, sender) => {
  // Update the cache with scraped tab content
  if (message.action === 'cacheTabContent' && sender.tab) {
    contentCache.set(sender.tab.id, message.data);
    console.log(`WhereWasI: Cached content for tabId: ${sender.tab.id}`);
  }
});

//======================TAB REMOVALS========================//

chrome.tabs.onRemoved.addListener(async tabId => {
  try {
    const sessions = await chrome.sessions.getRecentlyClosed({ maxResults: 1 });
    if (!sessions || sessions.length === 0 || !sessions[0].tab) {
      console.log('WhereWasI: Could not retrieve recently closed tab info.');
      return;
    }

    const tab = sessions[0].tab;

    // Filter out chrome:// and extension pages
    if (
      !tab.url ||
      tab.url.startsWith('chrome://') ||
      tab.url.startsWith('chrome-extension://')
    ) {
      console.log('WhereWasI: Closed tab ignored (internal):', tab.url);
      return;
    }

    const scrappedContent = contentCache.get(tabId) || null;

    // Prepare a compact record
    const tabRecord = {
      id: tab.id,
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
      closedAt: new Date().toISOString(),
      content: scrappedContent,
    };

    contentCache.delete(tabId);

    try {
      await AIService.groupClosedTab(tabRecord);
    } catch (aiErr) {
      console.error('WhereWasI: AI grouping error:', aiErr);

      console.log('WhereWasI: Creating a new session as fallback...');
      await StorageService.createEmptySession(tabRecord);
    }
  } catch (err) {
    console.error('WhereWasI: Error handling tab removal:', err);
  }
});

//==================DASHBOARD SHORTCUT========================//

chrome.commands.onCommand.addListener(command => {
  if (command === 'open-dashboard') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard/dist/index.html'),
    });
  }
});

//***********************************************************//
