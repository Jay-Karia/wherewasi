import ai from '../ai/gemini.js';
import { prompts } from '../ai/prompts.js';
import { StorageService } from '../utils/storage.js';

export async function searchSessions(tab) {
  // Get all the sessions
  const sessions = await StorageService.getAllSessions();

  const sessionTitles = sessions.map(session => session.title);
  const sessionIds = sessions.map(session => session.id);

  // Prompt values
  const promptValues = `\nThe tab: ${tab.title}\nSession Titles: ${sessionTitles}\nSession Ids: ${sessionIds}`;
  const prompt = `${prompts.searchSessions} ${promptValues}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        type: 'text',
        text: prompt,
      },
    ],
  });

  if (response.text === 'null') return null;

  // Get the session object
  const session = await StorageService.getSession(response.text);

  return session;
}
