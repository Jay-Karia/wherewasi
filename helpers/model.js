import { DEFAULT_GEMINI_AI_MODEL } from '../constants';

export async function getModel() {
  try {
    const result = await chrome.storage.sync.get(['geminiModel']);
    const model = result.geminiModel || DEFAULT_GEMINI_AI_MODEL;
    return model;
  } catch (error) {
    console.error(
      'Error getting model from storage, using default one.',
      error
    );
    return DEFAULT_GEMINI_AI_MODEL;
  }
}
