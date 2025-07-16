console.log("Content script loaded on a page.");

// Example: Change the page background color based on stored value
chrome.storage.sync.get("color", ({ color }) => {
  document.body.style.backgroundColor = color;
});
