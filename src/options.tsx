import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnippetEditor } from './components/SnippetEditor';

export const Options = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl px-4 py-5 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/icons/icon-48.png" alt="CopyHub Logo" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-900">CopyHub Snippet Manager</h1>
          </div>
        </div>
      </header>
      <main className="max-w-5xl p-4 mx-auto sm:p-6 lg:p-8">
        <SnippetEditor />
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);