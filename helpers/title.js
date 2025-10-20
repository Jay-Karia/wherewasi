import ai from '../ai/gemini';
import { prompts } from '../ai/prompts';
import { GEMINI_AI_MODEL } from '../constants';

export async function generateTitle(tab) {
  // Fallback: always provide at least title and URL if summary is missing
  const summary = tab.content && tab.content.summary ? tab.content.summary : '';
  const fallbackSummary =
    summary || `Title: ${tab.title || ''}\nURL: ${tab.url || ''}`;
  const prompt = `${prompts.newSessionTitle}\nThe tab URL: ${tab.url}\nTab title: ${tab.title}\nHere's some scrapped content from the website: ${fallbackSummary}`;

  const response = await ai.models.generateContent({
    model: GEMINI_AI_MODEL,
    contents: [
      {
        type: 'text',
        text: prompt,
      },
    ],
  });

  // Fallback: never return empty or undefined
  const title = (response.text || '').trim();
  if (!title || title.toLowerCase().includes('undefined')) {
    // Use a simple fallback
    return tab.title || tab.url || 'Untitled Session';
  }
  return title;
}
