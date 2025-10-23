/*
  Chrome's built-in AI services
*/

//======================IMPORTS================================//

import { searchSessions } from '../helpers/grouping.js';
import { StorageService } from './storage.js';
import { generateSummary } from '../helpers/summary.js';
import { setDisabledFalse, setDisabledTrue } from '../helpers/disabled.js';

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
      const session = await StorageService.createEmptySession(tab);
      console.log(
        'WhereWasI: No existing sessions found, created a new empty session.'
      );
      return session;
    }

    console.log(
      'WhereWasI: Existing sessions found, searching for a suitable one...'
    );
    let foundSession = null;

    try {
      foundSession = await searchSessions(tab);
    } catch (error) {
      console.error(
        'WhereWasI: Unexpected error occurred while searching for a suitable session.',
        error
      );
    }

    // If not appropriate session found, create a new one
    if (!foundSession) {
      const session = await StorageService.createEmptySession(tab);
      console.log('WhereWasI: No suitable session found, created a new one.');

      return session;
    }

    console.log(
      'WhereWasI: Found a suitable session, adding the closed tab to it.'
    );

    // Add the closed tab to the found session
    foundSession.tabs.push(tab);
    foundSession.tabsCount = foundSession.tabs.length;
    foundSession.updatedAt = Date.now();

    // Update session with new summary and title
    try {
      const summary = await generateSummary(foundSession);
      foundSession.summary = summary;
    } catch (error) {
      console.error(
        'WhereWasI: Error generating summary for updated session:',
        error
      );
    }

    await StorageService.updateSession(foundSession.id, foundSession);

    return foundSession;
  },

  async regenerateSessionSummary(sessionId) {
    try {
      setDisabledTrue();
      const session = await StorageService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found for summary regeneration');
      }

      const newSummary = await generateSummary(session);
      session.summary = newSummary;
      session.updatedAt = Date.now();

      await StorageService.updateSession(session.id, session);

      return { summary: newSummary };
    } catch (error) {
      console.error('WhereWasI: Error regenerating session summary:', error);
      setDisabledFalse();
    }
  },
};

//***********************************************************//
