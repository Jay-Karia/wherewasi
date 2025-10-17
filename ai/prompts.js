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
  `
};
