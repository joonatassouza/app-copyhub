console.log("Background service worker has started.");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
  chrome.storage.sync.set({ color: "#3aa757" }, () => {
    console.log("Default background color set to green.");
  });
});
