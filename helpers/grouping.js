import { StorageService } from '../utils/storage.js';
import ai from '../ai/gemini.js';
import { prompts } from '../ai/prompts.js';
import { GEMINI_AI_MODEL } from '../constants.js';

/**
 * Calculates the Jaccard similarity between two sets.
 * @param {Set<string>} setA - The first set of keywords.
 * @param {Set<string>} setB - The second set of keywords.
 * @returns {number} The Jaccard similarity score.
 */
function jaccardSimilarity(setA, setB) {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Extracts keywords from a tab's title and content.
 * @param {object} tab - The tab object.
 * @returns {Set<string>} A set of keywords.
 */
function getKeywords(tab) {
  const title = tab.title || '';
  const content = tab.content?.summary || '';
  const text = `${title} ${content}`.toLowerCase();
  // Simple keyword extraction: split by non-alphanumeric characters
  const keywords = text.split(/[^a-z0-9]+/).filter(Boolean);
  return new Set(keywords);
}

/**
 * Scores a session based on the time since its last update.
 * Newer sessions get higher scores.
 * @param {object} session - The session object.
 * @param {number} now - The current timestamp.
 * @returns {number} The time-based score (0-1).
 */
function timeScore(session, now) {
  const minutesSinceUpdate = (now - session.updatedAt) / (1000 * 60);
  // Score decreases as time passes, but never reaches zero.
  return 1 / (1 + Math.log1p(minutesSinceUpdate));
}

/**
 * Scores a session based on domain similarity with the new tab.
 * @param {object} session - The session object.
 * @param {object} tab - The new tab object.
 * @returns {number} The domain-based score (0 or 1).
 */
function domainScore(session, tab) {
  try {
    const tabDomain = new URL(tab.url).hostname;
    const sessionDomains = new Set(
      session.tabs.map(t => {
        try {
          return new URL(t.url).hostname;
        } catch {
          return null;
        }
      })
    );
    return sessionDomains.has(tabDomain) ? 1 : 0;
  } catch {
    return 0;
  }
}

/**
 * Scores a session based on keyword similarity with the new tab.
 * @param {object} session - The session object.
 * @param {Set<string>} tabKeywords - The keywords of the new tab.
 * @returns {number} The keyword-based score (Jaccard similarity).
 */
function keywordScore(session, tabKeywords) {
  const sessionKeywords = new Set(
    session.tabs.flatMap(t => [...getKeywords(t)])
  );
  return jaccardSimilarity(sessionKeywords, tabKeywords);
}

/**
 * Calculates a total score for a session based on multiple heuristics.
 * @param {object} session - The session to score.
 * @param {object} tab - The new tab being added.
 * @param {Set<string>} tabKeywords - Keywords from the new tab.
 * @param {number} now - The current timestamp.
 * @returns {number} The total calculated score for the session.
 */
function scoreSession(session, tab, tabKeywords, now) {
  const weights = {
    time: 0.2,
    domain: 0.5,
    keyword: 0.3,
  };

  const tScore = timeScore(session, now);
  const dScore = domainScore(session, tab);
  const kScore = keywordScore(session, tabKeywords);

  return (
    weights.time * tScore + weights.domain * dScore + weights.keyword * kScore
  );
}

/**
 * Searches for the best session to group a new tab into using a heuristic scoring model.
 * Falls back to an AI model as a tie-breaker for high-scoring sessions.
 * @param {object} tab - The tab to be grouped.
 * @returns {Promise<object|null>} The best matching session or null.
 */
export async function searchSessions(tab) {
  const sessions = await StorageService.getAllSessions();
  if (sessions.length === 0) {
    return null;
  }

  const now = Date.now();
  const tabKeywords = getKeywords(tab);

  const scoredSessions = sessions.map(session => ({
    session,
    score: scoreSession(session, tab, tabKeywords, now),
  }));

  scoredSessions.sort((a, b) => b.score - a.score);

  const topScore = scoredSessions[0].score;
  // If the top score is very low, it's better to create a new session.
  if (topScore < 0.2) {
    return null;
  }

  // Get all sessions with a score close to the top score (within a 10% tolerance).
  const potentialMatches = scoredSessions.filter(
    s => s.score >= topScore * 0.9
  );

  // If there's a clear winner, return it.
  if (potentialMatches.length === 1) {
    return potentialMatches[0].session;
  }

  // If multiple sessions are good candidates, use AI as a tie-breaker.
  console.log(
    `Heuristic tie between ${potentialMatches.length} sessions. Using AI to break the tie.`
  );

  const sessionTitles = potentialMatches.map(s => s.session.title);
  const sessionIds = potentialMatches.map(s => s.session.id);

  const promptValues = `\nThe tab: ${tab.title}\nPotential Session Titles: ${sessionTitles}\nPotential Session Ids: ${sessionIds}\nHere's the scrapped content from the website: ${tab.content ? tab.content.summary : 'N/A'}`;
  const prompt = `${prompts.searchSessions} ${promptValues}`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_AI_MODEL,
      contents: [{ type: 'text', text: prompt }],
    });

    const chosenId = response.text;
    if (chosenId && chosenId !== 'null') {
      const chosenSession = await StorageService.getSession(chosenId);
      // Ensure the AI's choice is one of the potential matches
      if (
        chosenSession &&
        potentialMatches.some(s => s.session.id === chosenSession.id)
      ) {
        return chosenSession;
      }
    }
  } catch (error) {
    console.error('AI tie-breaker failed:', error);
  }

  // If AI fails or returns an invalid choice, fall back to the highest-scored session.
  return scoredSessions[0].session;
}
