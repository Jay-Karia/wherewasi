export const GEMINI_AI_MODEL = 'gemini-2.5-flash';

export const SUMMARIZER_OPTIONS = {
  sharedContext: '',
  type: 'tl;dr',
  format: 'Plain text',
  length: 'Short',
  monitor(m) {
    m.addEventListener('downloadprogress', e => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
};
