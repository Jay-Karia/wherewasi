/*
  Chrome's built-in AI services
*/

//======================IMPORTS================================//

import { StorageService } from './storage.js';

//=============================================================//

export const AIService = {

  /*
    Handle a closed tab by grouping it into a session.
    @param {Object} tab - The closed tab object.
    @returns {Promise<void>}
  */
  async groupClosedTab(tab) {
    // Check for existing sessions
    const sessionsCount = await StorageService.countSessions();

    // Create a new empty session if none exist
    if (sessionsCount === 0) { 
      console.log("No existing sessions, creating a new one.");
    }

    // Search for a session to add the closed tab
    else {
      console.log("Existing sessions found, searching for a suitable one.");

      // If not appropriate sesion found, create a new one
    }
    
    // Add the tab to the appropriate session
    console.log("Adding closed tab to session:", tab);

    // Update the session if required with AI-generated title and summary

  },

  /*
    Generate a summary for a session.
    @returns {Promise<string>} - The generated summary.
  */
  async generateSummary() {
    return 'Placeholder summary';
  },

  /*
    Generate a title for a session.
    @returns {Promise<string>} - The generated title.
  */
  async generateSessionTitle() {
    return 'Session from closed tabs';
  },
};

//***********************************************************//