/*
  Handles the popup UI interactions for the WhereWasI Chrome extension.
  Provides quick access to the dashboard and displays basic statistics about saved sessions and tabs.
*/

//============================================================//

/*
  Opens the dashboard in a new tab when the "Open Dashboard" button is clicked.
*/
document.getElementById("openDashboard").addEventListener("click", () => {
  const builtUrl = chrome.runtime.getURL("dashboard/dist/index.html");

  const url = builtUrl;
  chrome.tabs.create({ url });
  window.close();
});

/*
  Displays quick statistics about the number of saved sessions and total tabs captured.
*/
chrome.storage.local.get("sessions", (data) => {
  const sessions = data.sessions || [];
  const totalTabs = sessions.reduce((sum, s) => sum + s.tabCount, 0);

  document.getElementById("stats").innerHTML = `
    <strong>${sessions.length}</strong> sessions saved<br>
    <strong>${totalTabs}</strong> total tabs captured
  `;
});

//***********************************************************//