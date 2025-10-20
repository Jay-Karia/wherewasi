export const prompts = {
  searchSessions: `
    Your goal is to determine if a newly closed tab BELONGS IN an existing session by understanding the user's task.

    **Guiding Principle:** Be liberal with matching. Different tools (e.g., Neovim, VS Code), products (e.g., Sony, Bose headphones), or topics (e.g., React Hooks, React State) often belong to the SAME research task. If the new tab is a clear continuation of or comparison related to an existing session's topic, it IS a match.

    Existing Sessions (ID and Title),
    Newly Closed Tab Data (Title, URL, and Scraped Content),
    Will be provided.

    **TASK:**
    1.  Infer the user's likely task from the "Newly Closed Tab Data".
    2.  Compare this task to the purpose of each session in "Existing Sessions".
    3.  If you find a strong match based on the shared task, return that session's "id". A strong match is one where the new tab is clearly part of the same overall goal.
    4.  If no sessions are a suitable match for the user's task, return the word "null".

    **Example Reasoning:**
    - If an existing session is "Code Editor Research" and the new tab is about "VS Code," the user's task is the same. This is a strong match. You MUST return the existing session's id.
    - If an existing session is "Japan Trip Planning" and the new tab is about "VS Code," the tasks are unrelated. This is not a match. You MUST return "null".

    **Response:** Respond ONLY with the session "id" text or the word "null". Do not add any other text or explanations.
  `,
  newSessionTitle: `
    You are a session title generator. Given data from a single browser tab, create a concise and relevant session title.

    **Guiding Principle:** The title should describe the user's likely *task* or *research goal*, not just the specific topic of the page. For example, for a tab about "Neovim," a better title is "Code Editor Research" rather than just "Neovim."

    **Tab Data (Title, URL, and Scraped Content):**
    ---
    {TAB_JSON}
    ---

    **TASK:** Generate a single, descriptive title for a new session based on this tab.

    **Response:** Respond ONLY with the text of the new session title.
  `,
  regenerateTitle: `
    You are a session title generator. Given a list of all tabs from a single session, create one concise, overarching title that summarizes the common theme or user's task.

    **Tabs in this Session (Title and Scraped Content):**
    ---
    {TABS_IN_SESSION_JSON}
    ---

    **TASK:** Generate a single, descriptive, and generic title for the entire session.

    **Response:** Respond ONLY with the text of the new title.
  `,
};
