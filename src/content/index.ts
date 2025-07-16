console.log("CopyHub content script loaded.");

document.addEventListener("input", handleInput, true);

async function handleInput(event: Event) {
  const target = event.target as HTMLElement;

  // Check if the event target is a text input, textarea, or contenteditable element
  const isEditable = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
  if (!isEditable) {
    return;
  }

  const text = (target as HTMLInputElement).value || target.textContent || "";

  // Regex to find a shortcut like :word at the end of the text, triggered by a space
  const match = text.match(/(:[a-zA-Z0-9_]+)\s$/);

  if (match) {
    const shortcut = match[1];

    try {
      const response = await chrome.runtime.sendMessage({ type: "get-snippet", shortcut });

      if (response && response.found) {
        replaceShortcut(target, shortcut, response.snippet);
      }
    } catch {
      // This can happen if the background script is not ready.
      // It's usually safe to ignore in this context.
    }
  }
}

function replaceShortcut(element: HTMLElement, shortcut: string, snippet: string) {
  // For contenteditable elements
  if (element.isContentEditable) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    // Move the range to cover the shortcut text plus the trailing space
    range.setStart(range.endContainer, range.endOffset - (shortcut.length + 1));
    range.deleteContents();

    // Create a temporary div to hold the HTML snippet
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = snippet;

    // Insert the nodes from the snippet
    const fragment = document.createDocumentFragment();
    let lastNode;
    while ((lastNode = tempDiv.firstChild)) {
      fragment.appendChild(lastNode);
    }
    range.insertNode(fragment);

    // Move cursor to the end of the inserted content
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  // For input and textarea elements (plain text replacement)
  else {
    const inputElement = element as HTMLInputElement | HTMLTextAreaElement;
    const currentValue = inputElement.value;
    const plainTextSnippet = new DOMParser().parseFromString(snippet, "text/html").body.textContent || "";
    inputElement.value = currentValue.replace(shortcut + " ", plainTextSnippet);
  }
}
