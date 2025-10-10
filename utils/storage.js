/*
  Storage service class to manage saving and retrieving sessions and closed tabs.
*/

//======================CONSTANTS==============================//

const MAX_SESSIONS = 200;
const CLOSED_TABS_LIMIT = 1000;

//======================STORAGE SERVICE=======================//

export const StorageService = {
  /*
    Saves a session object to Chrome's local storage.
    @param {Object} session - The session object to save. Must contain an 'id' property.
    @returns {Promise<Object>} - Resolves to the saved session object.
  */
  /**
   * Saves a session object to Chrome's local storage.
   * @param {import('../types/index.js').Session} session - The session object to save. Must contain an 'id' property.
   * @returns {Promise<import('../types/index.js').Session>} - Resolves to the saved session object.
   */
  async saveSession(session) {
    // Check for session object
    if (!session || !session.id) {
      throw new Error('Invalid session object');
    }

    // Get sessions from storage
    const getStorage = keys =>
      new Promise(resolve => {
        chrome.storage.local.get(keys, res => resolve(res));
      });

    // Save sessions to storage
    const setStorage = obj =>
      new Promise((resolve, reject) => {
        chrome.storage.local.set(obj, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      });

    try {
      const data = await getStorage(['sessions']);
      const sessions = Array.isArray(data.sessions) ? data.sessions : [];

      // Add new session to start
      sessions.unshift(session);

      // Trim sessions based on limit
      if (sessions.length > MAX_SESSIONS) {
        sessions.length = MAX_SESSIONS;
      }

      await setStorage({ sessions: sessions });
      console.log('Session saved successfully:', session.id);
      return session;
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  },

  /*
    Retrieves all saved sessions from Chrome's local storage.
    @returns {Promise<Array>} - Resolves to an array of session objects.
  */
  async getAllSessions() {
    // Get sessions from storage
    const getStorage = keys =>
      new Promise(resolve => {
        chrome.storage.local.get(keys, res => resolve(res));
      });

    try {
      const data = await getStorage(['sessions']);
      return Array.isArray(data.sessions) ? data.sessions : [];
    } catch (error) {
      console.error('Error retrieving sessions:', error);
      throw error;
    }
  },

  /*
    Deletes a session by its ID from Chrome's local storage.
    @param {string} sessionId - The ID of the session to delete.
    @returns {Promise<boolean>} - Resolves to true if deletion was successful.
  */
  async deleteSession(sessionId) {
    // Check for session id
    if (!sessionId) {
      throw new Error('Session ID is required for deletion');
    }

    // Get sessions from storage
    const getStorage = keys =>
      new Promise(resolve => {
        chrome.storage.local.get(keys, res => resolve(res));
      });

    // Save sessions to storage
    const setStorage = obj =>
      new Promise((resolve, reject) => {
        chrome.storage.local.set(obj, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      });

    try {
      const data = await getStorage(['sessions']);
      const sessions = Array.isArray(data.sessions) ? data.sessions : [];

      // Filter out the session to delete
      const filtered = sessions.filter(s => s.id !== sessionId);

      await setStorage({ sessions: filtered });
      console.log('Session deleted successfully:', sessionId);
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  /*
    Clears all sessions from Chrome's local storage.
    @returns {Promise<boolean>} - Resolves to true if clearing was successful.
  */
  async clearAllSessions() {
    // Clear all sessions from storage
    const clearStorage = () =>
      new Promise((resolve, reject) => {
        chrome.storage.local.remove(['sessions'], () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      });
    try {
      await clearStorage();
      console.log('All sessions cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing sessions:', error);
      throw error;
    }
  },

  /*
    Saves a closed tab record to Chrome's local storage.
    @param {Object} tab - The tab object to save. Must contain a 'url' property.
    @returns {Promise<Object>} - Resolves to the saved tab object.
  */
  async saveClosedTab(tab) {
    // Check for tab
    if (!tab || !tab.url) {
      throw new Error('Invalid tab record');
    }

    // Get the tabs from storage
    const getStorage = keys =>
      new Promise(resolve => {
        chrome.storage.local.get(keys, res => resolve(res));
      });

    // Update the tabs in storage
    const setStorage = obj =>
      new Promise((resolve, reject) => {
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

  /*
    Retrieves all closed tabs from Chrome's local storage.
    @returns {Promise<Array>} - Resolves to an array of closed tab objects.
  */
  async getClosedTabs() {
    // Get tabs from storage
    const getStorage = keys =>
      new Promise(resolve => {
        chrome.storage.local.get(keys, res => resolve(res));
      });

    const data = await getStorage(['tabs']);
    return Array.isArray(data.tabs) ? data.tabs : [];
  },

  /*
    Clears all closed tabs from Chrome's local storage.
    @returns {Promise<void>} - Resolves when clearing is complete.
  */
  async clearClosedTabs() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(['tabs'], () => {
        if (chrome.runtime && chrome.runtime.lastError)
          return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  },

  /*
    Updates a session by its ID with new data.
    @param {string} sessionId - The ID of the session to update.
    @param {Partial<import('../types/index.js').Session>} sessionData - The partial session data to update.
    @returns {Promise<import('../types/index.js').Session>} - Resolves to the updated session object.
  */
  async updateSession(sessionId, sessionData) {
    if (!sessionId || !sessionData) {
      throw new Error('Session ID and data are required for update');
    }

    const getStorage = keys =>
      new Promise(resolve => {
        chrome.storage.local.get(keys, res => resolve(res));
      });

    const setStorage = obj =>
      new Promise((resolve, reject) => {
        chrome.storage.local.set(obj, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      });

    try {
      const data = await getStorage(['sessions']);
      const sessions = Array.isArray(data.sessions) ? data.sessions : [];

      const index = sessions.findIndex(s => s.id === sessionId);
      if (index === -1) {
        throw new Error('Session not found for update');
      }

      // Update the session data
      sessions[index] = { ...sessions[index], ...sessionData };

      await setStorage({ sessions: sessions });
      console.log('Session updated successfully:', sessionId);
      return sessions[index];
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  /*
    Counts the number of saved sessions.
    @returns {Promise<number>} - Resolves to the count of sessions.
  */
  async countSessions() {
    const getStorage = keys =>
      new Promise(resolve => {
        chrome.storage.local.get(keys, res => resolve(res));
      });

    try {
      const data = await getStorage(['sessions']);
      const sessions = Array.isArray(data.sessions) ? data.sessions : [];
      return sessions.length;
    } catch (error) {
      console.error('Error counting sessions:', error);
      throw error;
    }
  },
};

//***********************************************************//
