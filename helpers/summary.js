/*
  Helper functions for generating session summaries using Chrome's built-in AI
*/

import {SUMMARIZER_OPTIONS} from "../constants";

export async function generateSummary(session) {
  try {
    // Check if the Summarizer API is available
    if (!('Summarizer' in self.ai)) {
      console.warn('Chrome Summarizer API not available');
      return null;
    }

    // Check if summarizer is available
    const availability = await Summarizer.availability();
    if (availability.available === 'unavailable') {
      console.warn('Summarizer is not available');
      return null;
    }

    // Check for user activation
    if (!navigator.userActivation.isActive) {
      console.warn('User activation is required to use the Summarizer API');
      return null;
    }

    // Create summarizer instance
    const summarizer = await Summarizer.create(SUMMARIZER_OPTIONS);

    // Prepare the session context for summarization
    const sessionContext = prepareSessionContext(session);

    // Generate the summary
    const summary = await summarizer.summarize(sessionContext);

    // Clean up
    summarizer.destroy();

    return summary || null;
  } catch (error) {
    console.error('Error generating summary with Chrome AI:', error);
    return null;
  }
}

/*
  Prepare session context for summarization.
  @param {Object} session - The session object.
  @returns {string} - Formatted context string.
*/
function prepareSessionContext(session) {
  const tabs = session.tabs || [];
  const tabsSummary = tabs
    .map((tab, idx) => {
      const title = tab.title || 'Untitled';
      const url = tab.url || '';
      return `Tab ${idx + 1}: ${title} (${url})`;
    })
    .join('\n');

  return `Session Title: ${session.title}\n\nTabs in this session:\n${tabsSummary}\n\nPlease provide a brief summary of what the user was working on based on these tabs.`;
}
