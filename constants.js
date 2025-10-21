export const GEMINI_AI_MODEL = 'gemini-2.5-flash';

export const SUMMARIZER_OPTIONS = {
  sharedContext: 'WhereWasI is a project that helps users summarize and track information efficiently. Summarize a session containing related browser tabs.',
  type: 'tldr',
  format: 'plain-text',
  length: 'short',
  monitor(m) {
    m.addEventListener('downloadprogress', e => {
      console.log(`WhereWasI: Downloaded ${e.loaded * 100}%`);
    });
  },
};
