document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: 'dashboard/dashboard.html' });
  window.close();
});

// Show quick stats
chrome.storage.local.get('sessions', (data) => {
  const sessions = data.sessions || [];
  const totalTabs = sessions.reduce((sum, s) => sum + s.tabCount, 0);
  
  document.getElementById('stats').innerHTML = `
    <strong>${sessions.length}</strong> sessions saved<br>
    <strong>${totalTabs}</strong> total tabs captured
  `;
});