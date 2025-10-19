export const prompts = {
  searchSessions: `
  Given the list of array session titles, find a suitable session for the tab given.

  Scrapped content from the website will also be provided.
  Use the content to make a better decision.

  If session is found, then return the id of session.
  If no sessions are suitable then return null.

  Only return the text id nothing else.
  `,
  emptySessionTitle: `
  Given a tab with title and URL, generate a concise and relevant session title that encapsulates the main theme or purpose of the tab.

  Scrapped content from the website will also be provided.
  Use the content to make even generic title.

  Try to make a general title as we have to add more tabs inside the session.

  Only give the session title.
  `,
};
