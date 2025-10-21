import { GoogleGenAI } from '@google/genai';
let _realAi = null;
let _initPromise = null;

async function init() {
  if (_realAi) return _realAi;
  if (!_initPromise) {
    _initPromise = (async () => {
      const { StorageService } = await import('../utils/storage.js');
      const apiKey = await StorageService.getSetting('geminiApiKey');
      _realAi = new GoogleGenAI({ apiKey });
      return _realAi;
    })();
  }
  return _initPromise;
}

const ai = {
  models: {
    async generateContent(...args) {
      const real = await init();
      // Forward the call to the real instance
      if (!real?.models?.generateContent) {
        throw new Error(
          'AI provider not initialized or missing generateContent'
        );
      }
      return real.models.generateContent(...args);
    },
  },
  // Expose a helper to get the real instance if needed
  _getReal: async () => await init(),
};

export default ai;
