/*
  Some features should be disabled during some background tasks
*/

export async function setDisabledTrue() {
  await new Promise((resolve, reject) => {
    chrome.storage.local.set({ disabled: true }, () => {
      const err = chrome.runtime && chrome.runtime.lastError;
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function setDisabledFalse() {
  await new Promise((resolve, reject) => {
    chrome.storage.local.set({ disabled: false }, () => {
      const err = chrome.runtime && chrome.runtime.lastError;
      if (err) reject(err);
      else resolve();
    });
  });
}
