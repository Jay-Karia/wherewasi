/*
  Chrome's built-in AI services
*/

//======================IMPORTS================================//

import { searchSessions } from '../helpers/grouping.js';
import { generateSummary } from '../helpers/summary.js';
import { updateSessionTitle } from '../helpers/title.js';
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
      const session = await StorageService.createEmptySession(tab);
      console.log('No existing sessions found, created a new empty session.');

      // Generate summary for the new session
      try {
        const summary = await generateSummary(session);
        await StorageService.updateSession(session.id, { summary });
      } catch (error) {
        console.error('Error generating summary for new session:', error);
      }

      return session;
    }

    console.log('Existing sessions found, searching for a suitable one...');
    let foundSession = null;

    try {
      foundSession = await searchSessions(tab);
    } catch (error) {
      console.error(
        'Unexpected error occurred while searching for a suitable session.',
        error
      );
    }

    // If not appropriate session found, create a new one
    if (!foundSession) {
      const session = await StorageService.createEmptySession(tab);
      console.log('No suitable session found, created a new one.');

      // Generate summary for the new session
      try {
        const summary = await generateSummary(session);
        await StorageService.updateSession(session.id, { summary });
      } catch (error) {
        console.error('Error generating summary for new session:', error);
      }

      return session;
    }

    console.log('Found a suitable session, adding the closed tab to it.');

    // Add the closed tab to the found session
    foundSession.tabs.push(tab);
    foundSession.tabsCount = foundSession.tabs.length;
    foundSession.updatedAt = Date.now();

    // Update session with new summary
    // try {
    //   const summary = await generateSummary(foundSession);
    //   foundSession.summary = summary;
    // } catch (error) {
    //   console.error('Error generating summary for updated session:', error);
    // }

    await StorageService.updateSession(foundSession.id, foundSession);

    try {
      const updatedTitle = await updateSessionTitle(foundSession);
      foundSession.title = updatedTitle;
      await StorageService.updateSession(foundSession.id, {
        title: updatedTitle,
      });
    } catch (error) {
      console.error('Error updating session title:', error);
    }

    return foundSession;
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
