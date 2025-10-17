/*
  Chrome's built-in AI services
*/

import ai from '../ai/gemini.js';

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
      const session = await StorageService.saveSession({
        id: new Date().toISOString(),
        tabsCount: 1,
        title: '', // generate from AI
        summary: '', // generate from AI
        tabs: [tab],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      console.log('No existing sessions found, created a new empty session.');

      return session;
    }

    console.log('Existing sessions found, searching for a suitable one.');
    const foundSession = null;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          type: 'text',
          text: `Find a suitable session to add the following closed tab:\nTitle: ${tab.title}\nURL: ${tab.url}\nDescription: ${tab.description || 'N/A'}`,
        },
      ]
    })

    console.log(response.text);

    // If not appropriate session found, create a new one
    if (!foundSession) {
      const session = await StorageService.saveSession({
        id: new Date().toISOString(),
        tabsCount: 1,
        title: '', // generate from AI
        summary: '', // generate from AI
        tabs: [tab],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      console.log('No suitable session found, created a new one.');

      return session;
    }

    console.log('Found a suitable session, adding the closed tab to it.');

    // Add the closed tab to the found session
    foundSession.tabs.push(tab);
    foundSession.tabsCount = foundSession.tabs.length;
    foundSession.updatedAt = Date.now();

    await StorageService.updateSession(foundSession.id, foundSession);

    // TODO: Update the session if required with AI-generated title and summary

    return foundSession;
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
