import ai from '../ai/gemini.js';
import { prompts } from '../ai/prompts.js';
import { GEMINI_AI_MODEL } from '../constants.js';
import { StorageService } from '../utils/storage.js';

export async function searchSessions(tab) {
  try {
    // Get all the sessions
    const sessions = await StorageService.getAllSessions();

    const sessionTitles = sessions.map(session => session.title);
    const sessionIds = sessions.map(session => session.id);

    // Prompt values
    const promptValues = `\nThe tab title: ${tab.title}\nThe tab url: ${tab.url}\nSession Titles: ${sessionTitles}\nSession Ids: ${sessionIds}\nHere's the scrapped content from the website: ${tab.content ? tab.content.summary : 'N/A'}`;
    const prompt = `${prompts.searchSessions} ${promptValues}`;

    const response = await ai.models.generateContent({
      model: GEMINI_AI_MODEL,
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
  } catch (error) {
    console.error(
      'WhereWasI: Unexpected error occurred while searching for a suitable session.',
      error
    );
  }
}
