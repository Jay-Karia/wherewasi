export const prompts = {
  searchSessions: `
  Given the list of array session titles, find a suitable session for the tab given.
  If session is found, then return the id of session.
  If no sessions are suitable then return null.

  Only return the text id nothing else.
  `,
  emptySessionTitle: `
  Given a tab with title and URL, generate a concise and relevant session title that encapsulates the main theme or purpose of the tab.
  Try to make a general title as we have to add more tabs inside the session.

  Only give the session title.
  `,
  sessionSummary: `
  Given a browsing session with multiple tabs, generate a concise summary that captures the main themes, topics, and purpose of the session.
  Focus on identifying the key activities, websites visited, and overall context.
  Keep the summary brief (2-3 sentences) but informative enough to help the user recall what they were working on.

  Only provide the summary text, nothing else.
  `,
  updateTitle: `
  Given the current session title and the tabs inside, we can update the session title to better reflect the overall theme. It is not required to update the title if the current title is already relevant.

  Only provide the updated title text, nothing else.
  `,
};
