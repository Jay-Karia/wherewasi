import ai from "../ai/gemini";
import {prompts} from "../ai/prompts";
import {GEMINI_AI_MODEL} from "../constants";

export async function generateTitle(tab) {
  const prompt = `${prompts.emptySessionTitle}\nThe tab URL: ${tab.url}\nTab title: ${tab.title}`

  const response = await ai.models.generateContent({
    model: GEMINI_AI_MODEL,
    contents: [
      {
        type: 'text',
        text: prompt,
      },
    ],
  });

  return response.text
}

export async function updateSessionTitle(session) {
  const prompt = `${prompts.updateTitle}\nCurrent session title: ${session.title}\nTabs inside the session titles: ${session.tabs.map(tab => tab.title).join(', ')}`

  const response = await ai.models.generateContent({
    model: GEMINI_AI_MODEL,
    contents: [
      {
        type: 'text',
        text: prompt,
      },
    ],
  });

  console.log("Session title updated to: ", response.text);

  return response.text
}
