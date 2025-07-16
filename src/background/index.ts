const CLIPBOARD_CHECK_INTERVAL = 2000; // 2 seconds
const MAX_CLIPBOARD_HISTORY = 50;
let clipboardCheckInterval: NodeJS.Timeout | null = null;

// --- Clipboard Management ---
async function readClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      await addToClipboardHistory(text);
    }
  } catch {
    // This can happen if the clipboard is empty or contains non-text data.
    // console.error('Failed to read clipboard:', err);
  }
}

async function addToClipboardHistory(text: string) {
  const { clipboardHistory = [] } = await chrome.storage.local.get("clipboardHistory");

  // Avoid adding duplicates
  if (clipboardHistory.length > 0 && clipboardHistory[0].text === text) {
    return;
  }

  const newItem = { id: Date.now(), text };
  const newHistory = [newItem, ...clipboardHistory].slice(0, MAX_CLIPBOARD_HISTORY);

  await chrome.storage.local.set({ clipboardHistory: newHistory });
}

function startClipboardListener() {
  if (clipboardCheckInterval) {
    clearInterval(clipboardCheckInterval);
  }
  clipboardCheckInterval = setInterval(readClipboard, CLIPBOARD_CHECK_INTERVAL);
}

// --- Context Menu Management ---
function setupContextMenus() {
  chrome.contextMenus.create({
    id: "copyhub-parent",
    title: "CopyHub",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "paste-from-clipboard",
    parentId: "copyhub-parent",
    title: "Paste from Clipboard",
    contexts: ["editable"],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("CopyHub extension installed.");
  chrome.storage.local.set({ snippets: [], clipboardHistory: [] });
  startClipboardListener();
  setupContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  startClipboardListener();
});

// --- Event Listeners ---
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "paste-from-clipboard" && tab?.id) {
    // This could be extended to show recent items in the context menu itself,
    // but that's more complex. For now, it could open the popup.
    // Or we can just use the message passing as below
    chrome.runtime.sendMessage({ type: "show-clipboard-popup" });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Snippet expansion request from content script
  if (message.type === "get-snippet") {
    (async () => {
      const { snippets = [] } = await chrome.storage.local.get("snippets");
      const found = snippets.find((s: { shortcut: string }) => s.shortcut === message.shortcut);
      if (found) {
        sendResponse({ found: true, snippet: found.snippet });
      } else {
        sendResponse({ found: false });
      }
    })();
    return true; // Indicates async response
  }

  // Paste request from popup
  if (message.type === "paste-from-clipboard") {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          func: pasteTextToActiveElement,
          args: [message.text, false], // Paste as plain text
        });
      }
    })();
  }
});

// This function is injected into the web page
function pasteTextToActiveElement(text: string, isHtml: boolean) {
  const activeEl = document.activeElement as HTMLElement;

  if (activeEl && (activeEl.isContentEditable || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "INPUT")) {
    if (isHtml && activeEl.isContentEditable) {
      // Use insertHTML for rich text content
      document.execCommand("insertHTML", false, text);
    } else {
      // For plain text or simple inputs, use insertText
      document.execCommand("insertText", false, text);
    }
  }
}
