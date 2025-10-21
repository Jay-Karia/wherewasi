export const GEMINI_AI_MODEL = 'gemini-2.5-flash';

export const SUMMARIZER_OPTIONS = {
  sharedContext:
    'Summarize the browsing session in an informative tone. Begin with a short overview and describe the types of tabs, main topic(s), and the session purpose. Keep it concise and focused.',
  type: 'tldr',
  format: 'plain-text',
  length: 'short',
  monitor(m) {
    m.addEventListener('downloadprogress', e => {
      console.log(`WhereWasI: Summarizer API Downloaded ${e.loaded * 100}%`);
    });
  },
};
