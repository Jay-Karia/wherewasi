export function scrapTabContent() {
  chrome.runtime.sendMessage({
    action: "cacheTabContent",
    data: {
      text: document.body.innerText,
      html: document.documentElement.outerHTML,
    }
  })
}
