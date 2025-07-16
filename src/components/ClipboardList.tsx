import React, { useState, useEffect } from 'react';
import { Clipboard, Trash2, Copy } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface ClipboardItem {
  id: number;
  text: string;
}

export const ClipboardList = () => {
  const [history, setHistory] = useState<ClipboardItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const result = await chrome.storage.local.get('clipboardHistory');
      setHistory(result.clipboardHistory || []);
    };

    fetchHistory();

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.clipboardHistory) {
        setHistory(changes.clipboardHistory.newValue || []);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handlePaste = (text: string) => {
    chrome.runtime.sendMessage({ type: 'paste-from-clipboard', text });
    toast.success('Pasting content!');
  };

  const clearHistory = () => {
    chrome.storage.local.set({ clipboardHistory: [] });
    toast.success('Clipboard history cleared.');
  };

  return (
    <div className="p-4 space-y-4">
      <Toaster richColors position="top-center" />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Clipboard History</h2>
        <button onClick={clearHistory} className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500">
          <Trash2 size={14} />
          Clear All
        </button>
      </div>
      {history.length > 0 ? (
        <ul className="space-y-2">
          {history.map((item) => (
            <li key={item.id} className="p-3 transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
              <p className="mb-2 text-sm text-gray-600 break-words line-clamp-3">
                {item.text}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => handleCopy(item.text)} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
                  <Copy size={12} /> Copy
                </button>
                <button onClick={() => handlePaste(item.text)} className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">
                  <Clipboard size={12} /> Paste
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-10 text-center">
          <Clipboard size={48} className="mx-auto text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">Your clipboard is empty.</p>
          <p className="text-xs text-gray-400">Items you copy will appear here.</p>
        </div>
      )}
    </div>
  );
};