import ai from '../ai/gemini';
import { prompts } from '../ai/prompts';
import { GEMINI_AI_MODEL } from '../constants';

export async function generateTitle(tab) {
  const prompt = `${prompts.emptySessionTitle}\nThe tab URL: ${tab.url}\nTab title: ${tab.title}\nHere's some scrapped content from the website: ${tab.content ? tab.content.summary : 'N/A'}`;

  console.log(prompt);

  const response = await ai.models.generateContent({
    model: GEMINI_AI_MODEL,
    contents: [
      {
        type: 'text',
        text: prompt,
      },
    ],
  });

  return response.text;
}
