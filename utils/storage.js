const MAX_SESSIONS = 200;
const CLOSED_TABS_LIMIT = 1000;

export const StorageService = {
  async saveSession(session) {
    // Check for session object
    if (!session || !session.id) {
      throw new Error("Invalid session object");
    }

    // Get sessions from storage
    const getStorage = (keys) =>
      new Promise((resolve) => {
        chrome.storage.local.get(keys, (res) => resolve(res));
      });

    // Save sessions to storage
    const setStorage = (obj) =>
      new Promise((resolve, reject) => {
        chrome.storage.local.set(obj, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      });

    try {
      const data = await getStorage(["sessions"]);
      const sessions = Array.isArray(data.sessions) ? data.sessions : [];

      // Add new session to start
      filtered.unshift(session);

      // Trim sessions based on limit
      if (filtered.length > MAX_SESSIONS) {
        filtered.length = MAX_SESSIONS;
      }

      await setStorage({ sessions: filtered });
      console.log("Session saved successfully:", session.id);
      return session;
    } catch (error) {
      console.error("Error saving session:", error);
      throw error;
    }
  },
  async getAllSessions() {
    // Get sessions from storage
    const getStorage = (keys) =>
      new Promise((resolve) => {
        chrome.storage.local.get(keys, (res) => resolve(res));
      });

    try {
      const data = await getStorage(["sessions"]);
      return Array.isArray(data.sessions) ? data.sessions : [];
    } catch (error) {
      console.error("Error retrieving sessions:", error);
      throw error;
    }
  },
  async deleteSession(sessionId) {
    // Check for session id
    if (!sessionId) {
      throw new Error("Session ID is required for deletion");
    }

    // Get sessions from storage
    const getStorage = (keys) =>
      new Promise((resolve) => {
        chrome.storage.local.get(keys, (res) => resolve(res));
      });

    // Save sessions to storage
    const setStorage = (obj) =>
      new Promise((resolve, reject) => {
        chrome.storage.local.set(obj, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      });

    try {
      const data = await getStorage(["sessions"]);
      const sessions = Array.isArray(data.sessions) ? data.sessions : [];

      // Filter out the session to delete
      const filtered = sessions.filter((s) => s.id !== sessionId);

      await setStorage({ sessions: filtered });
      console.log("Session deleted successfully:", sessionId);
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  },
  async clearAllSessions() {
    // Clear all sessions from storage
    const clearStorage = () =>
      new Promise((resolve, reject) => {
        chrome.storage.local.remove(["sessions"], () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      });
    try {
      await clearStorage();
      console.log("All sessions cleared successfully");
      return true;
    } catch (error) {
      console.error("Error clearing sessions:", error);
      throw error;
    }
  },
  async saveClosedTab(tab) {
    // Check for tab
    if (!tab || !tab.url) {
      throw new Error('Invalid tab record');
    }

    // Get the tabs from storage
    const getStorage = (keys) => new Promise((resolve) => {
      chrome.storage.local.get(keys, (res) => resolve(res));
    });

    // Update the tabs in storage
    const setStorage = (obj) => new Promise((resolve, reject) => {
      chrome.storage.local.set(obj, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });

    try {
      const data = await getStorage(['tabs']);
      const closed = Array.isArray(data.tabs) ? data.tabs : [];

      closed.unshift(tab);

      if (closed.length > CLOSED_TABS_LIMIT) closed.length = CLOSED_TABS_LIMIT;

      await setStorage({ tabs: closed });
      console.log('Closed tab saved:', tab.url);
      return tab;
    } catch (error) {
      console.error('Error saving closed tab:', error);
      throw error;
    }
  },
  async getClosedTabs() {
    // Get tabs from storage
    const getStorage = (keys) => new Promise((resolve) => {
      chrome.storage.local.get(keys, (res) => resolve(res));
    });
    
    const data = await getStorage(['tabs']);
    return Array.isArray(data.tabs) ? data.tabs : [];
  },
  async clearClosedTabs() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(['tabs'], () => {
        if (chrome.runtime && chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  },
};
