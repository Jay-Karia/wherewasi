/*
  Storage service class to manage saving and retrieving sessions and closed tabs.
*/

import { generateTitle } from '../helpers/title.js';
import { generateSummary } from '../helpers/summary';

//======================CONSTANTS==============================//

const MAX_SESSIONS = 200;

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
      return session;
    } catch (error) {
      console.error('WhereWasI: Error saving session:', error);

      // TODO: implement retry or cache logic
    }
  },

  /*
    Creates and returns an empty session object.
    @returns {Promise<import('../types/index.js').Session>} - Resolves to a new empty session object.
  */
  async createEmptySession(tab) {
    try {
      const emptySessionTitle = await generateTitle(tab);
      const summary = await generateSummary();
      const session = await StorageService.saveSession({
        id: new Date().toISOString(),
        tabsCount: 1,
        title: emptySessionTitle,
        summary: summary,
        tabs: [tab],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return session;
    } catch (error) {
      console.error('WhereWasI: Error creating empty session:', error);

      // TODO: implement retry or cache logic
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
      console.error('WhereWasI: Error retrieving sessions:', error);
    }
  },

  /*
    Retrieves a specific session from the given session id
  */
  async getSession(sessionId) {
    try {
      const sessions = await this.getAllSessions();
      const session = sessions.find(s => s.id === sessionId);

      if (!session) throw new Error('Session not found');

      return session;
    } catch (error) {
      console.error('WhereWasI: Error retrieving session:', error);
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
      console.log('WhereWasi: Session deleted successfully:', sessionId);
      return true;
    } catch (error) {
      console.error('WhereWasI: Error deleting session:', error);

      // TODO: implement retry or cache logic
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
      console.log('WhereWasi: All sessions cleared successfully');
      return true;
    } catch (error) {
      console.error('WhereWasI: Error clearing sessions:', error);

      // TODO: implement retry or cache logic
    }
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
      console.log('WhereWasi: Session updated successfully:', sessionId);
      return sessions[index];
    } catch (error) {
      console.error('WhereWasI: Error updating session:', error);

      // TODO: implement retry or cache logic
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
      console.error('WhereWasI: Error counting sessions:', error);
    }
  },
};

//***********************************************************//
