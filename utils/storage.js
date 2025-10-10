import { MAX_SESSIONS } from "../constants";

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
  async deleteSession(sessionId) {},
  async clearAllSessions() {},
};
