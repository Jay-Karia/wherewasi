/*
  The background service worker for the extension
*/

//======================IMPORTS================================//

import { scrapTabContent } from '../helpers/scraper.js';
import { AIService } from '../utils/ai-service.js';
import { StorageService } from '../utils/storage.js';

//=============================================================//

console.log('WhereWasI: Service worker loaded');
const contentCache = new Map();

//======================TAB UPDATES=========================//

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Inject script when the page is loaded
  if (changeInfo.status === 'complete' && tab.url) {
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

  const isTrackAllSites = await StorageService.getSetting('trackAllSites');
  if (!isTrackAllSites) return;

  if (changeInfo.status === 'complete' && tab && tab.url) {
    // Filter out chrome:// and extension pages
    if (
      tab.url.startsWith('chrome://') ||
      tab.url.startsWith('chrome-extension://')
    ) {
      return;
    }

    const scrappedContent = contentCache.get(tabId) || null;

    const tabRecord = {
      id: tab.id,
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
      closedAt: new Date().toISOString(),
      content: scrappedContent,
    };

    try {
      await AIService.groupClosedTab(tabRecord);
    } catch (aiErr) {
      console.error('WhereWasI: AI grouping error on tab update:', aiErr);

      console.log('WhereWasI: Creating a new session as fallback...');
      await StorageService.createEmptySession(tabRecord);
    }
  }
});

//===================MESSAGE LISTENER=======================//

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Update the cache with scraped tab content
  if (message.action === 'cacheTabContent' && sender.tab) {
    contentCache.set(sender.tab.id, message.data);
    console.log(`WhereWasI: Cached content for tabId: ${sender.tab.id}`);
  }

  // Regenerate session summary
  if (message.action === 'regenerateSummary') {
    console.log(
      'WhereWasI: Regenerate summary request received:',
      message.data?.sessionId
    );
    (async () => {
      try {
        const sessionId = message.data?.sessionId;

        try {
          const result = await AIService.regenerateSessionSummary(sessionId);
          sendResponse({ success: true, ...(result || {}) });
        } catch (error) {
          console.error(
            'WhereWasI: Could not regenerate session summary:',
            error
          );
        }

        // Fallback: use existing summary
        const placeholder =
          message.data.currentSummary ||
          `Regenerated summary for ${sessionId || 'unknown session'}`;
        sendResponse({ success: true, summary: placeholder });
      } catch (err) {
        console.error('WhereWasI: Error regenerating summary in worker:', err);
        sendResponse({ success: false, error: String(err) });
      }
    })();

    return true;
  }
});

//======================TAB REMOVALS========================//

chrome.tabs.onRemoved.addListener(async tabId => {
  try {
    // Do not track when a tab is closed if "trackAllSites" is enabled as already tracks when tabs are updated
    const isTrackAllSites = await StorageService.getSetting('trackAllSites');
    if (isTrackAllSites) return;
    
    const sessions = await chrome.sessions.getRecentlyClosed({ maxResults: 5 });
    if (!sessions || sessions.length === 0) {
      console.log('WhereWasI: Could not retrieve recently closed sessions.');
      return;
    }

    // Find the exact tab entry among recent sessions.
    let foundTab = null;
    for (const s of sessions) {
      if (s.tab && s.tab.id === tabId) {
        foundTab = s.tab;
        break;
      }
      if (s.window && Array.isArray(s.window.tabs)) {
        const t = s.window.tabs.find(t => t.id === tabId);
        if (t) {
          foundTab = t;
          break;
        }
      }
    }

    // Fallback to the most recent entry if we couldn't find an exact match.
    if (!foundTab) {
      if (sessions[0].tab) {
        foundTab = sessions[0].tab;
      } else if (
        sessions[0].window &&
        Array.isArray(sessions[0].window.tabs) &&
        sessions[0].window.tabs.length > 0
      ) {
        foundTab = sessions[0].window.tabs[0];
      }
    }

    if (!foundTab) {
      console.log('WhereWasI: Could not retrieve recently closed tab info.');
      return;
    }

    const tab = foundTab;

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
