export const prompts = {
  searchSessions: `
    Your goal is to determine if a newly closed tab BELONGS IN an existing session by understanding the user's task.

    **Guiding Principle:**
    - Focus on the user's intent and main task, not just keywords or topics.
    - The session title is very important. If the session contains related topics but the title does not match the user's task, it is NOT a match.
    - Avoid false positives: Only match if the user's task is clearly the same.

    **Inputs:**
    - Existing Sessions (ID and Title)
    - Newly Closed Tab Data (Title, URL, and Scraped Content)

    **TASK:**
    1. Infer the user's likely task from the "Newly Closed Tab Data" (title, url, content).
    2. Compare this task to the purpose of each session in "Existing Sessions".
    3. Do NOT generalize or overfit. Only match if the user's task is clearly the same as the session's purpose.
    4. If no sessions are a suitable match for the user's task, return the word "null".

    **Example Reasoning:**
    - If an existing session is "Code Editor Research" and the new tab is about "VS Code," the user's task is the same. This is a strong match. You MUST return the existing session's id.
    - If an existing session is "Japan Trip Planning" and the new tab is about "VS Code," the tasks are unrelated. This is not a match. You MUST return "null".
    - If the session is "React Tutorials" and the new tab is about "React Router documentation," this is a match. Return the session id.
    - If the session is "Shopping" and the new tab is about "JavaScript array methods," this is NOT a match. Return "null".

    **Edge Cases:**
    - If the tab is a generic homepage, search engine, or blank page, return "null".
    - If the session title is vague or missing, be conservative and return "null" unless the match is obvious.

    **Response:** Respond ONLY with the session "id" text or the word "null". Do not add any other text or explanations.
  `,
  newSessionTitle: `
    You are a session title generator. Given data from a single browser tab, create a concise and relevant session title.

    **Guiding Principle:**
    - The title should describe the user's likely *task* or *research goal*, not just the specific topic of the page.
    - Avoid using the exact page title or URL unless it truly represents the user's intent.
    - Prefer generic, reusable titles that summarize the purpose (e.g., "Job Search" instead of "Indeed.com").

    **Tab Data (Title, URL, and Scraped Content):**
    ---
    {TAB_JSON}
    ---

    **TASK:** Generate a single, descriptive title for a new session based on this tab. Be specific about the user's likely goal.

    **Examples:**
    - Tab: "Leetcode - Two Sum Problem" → Title: "Coding Interview Practice"
    - Tab: "Amazon.com: Laptops" → Title: "Laptop Shopping"
    - Tab: "React Docs - useEffect" → Title: "React Learning"

    **Response:** Respond ONLY with the text of the new session title.
  `,
  regenerateTitle: `
    You are a session title generator. Given a list of all tabs from a single session, create one concise, overarching title that summarizes the common theme or user's task.

    **Guiding Principle:**
    - The title should capture the main purpose or activity that connects all tabs.
    - Avoid copying a single tab's title unless it truly represents the whole session.
    - Prefer a generic, reusable title that summarizes the session's purpose.

    **Tabs in this Session (Title and Scraped Content):**
    ---
    {TABS_IN_SESSION_JSON}
    ---

    **TASK:** Generate a single, descriptive, and generic title for the entire session. Be specific about the user's likely goal.

    **Examples:**
    - Tabs: ["Leetcode - Two Sum", "GeeksforGeeks - Arrays"] → Title: "Coding Interview Practice"
    - Tabs: ["Amazon.com: Laptops", "Best Buy: Laptops"] → Title: "Laptop Shopping"
    - Tabs: ["React Docs - useEffect", "React Router Guide"] → Title: "React Learning"

    **Response:** Respond ONLY with the text of the new title.
  `,
};
