import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClipboardList } from './components/ClipboardList';
import { BookMarked } from 'lucide-react';

export const Popup = () => {
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src="/icons/icon-48.png" alt="CopyHub Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-800">CopyHub</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openOptionsPage} title="Manage Snippets" className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <BookMarked size={20} />
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <ClipboardList />
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);