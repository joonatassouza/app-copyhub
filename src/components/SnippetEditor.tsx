import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Plus, Trash2, Edit, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface Snippet {
  id: string;
  shortcut: string;
  snippet: string;
}

export const SnippetEditor = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [shortcut, setShortcut] = useState('');
  const [snippetContent, setSnippetContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchSnippets = async () => {
      const result = await chrome.storage.local.get('snippets');
      setSnippets(result.snippets || []);
    };
    fetchSnippets();

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.snippets) {
        setSnippets(changes.snippets.newValue || []);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const resetForm = () => {
    setCurrentId(null);
    setShortcut('');
    setSnippetContent('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!shortcut.startsWith(':') || shortcut.length < 2) {
      toast.error('Shortcut must start with ":" and be at least 2 characters long.');
      return;
    }
    if (!snippetContent || snippetContent === '<p><br></p>') {
      toast.error('Snippet content cannot be empty.');
      return;
    }

    const newSnippets = [...snippets];
    const newSnippet: Snippet = {
      id: currentId || `snippet-${Date.now()}`,
      shortcut,
      snippet: snippetContent,
    };

    if (isEditing && currentId) {
      const index = snippets.findIndex(s => s.id === currentId);
      newSnippets[index] = newSnippet;
      toast.success('Snippet updated successfully!');
    } else {
      if (snippets.some(s => s.shortcut === shortcut)) {
        toast.error('This shortcut already exists.');
        return;
      }
      newSnippets.push(newSnippet);
      toast.success('Snippet created successfully!');
    }

    await chrome.storage.local.set({ snippets: newSnippets });
    resetForm();
  };

  const handleEdit = (snippet: Snippet) => {
    setIsEditing(true);
    setCurrentId(snippet.id);
    setShortcut(snippet.shortcut);
    setSnippetContent(snippet.snippet);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      const newSnippets = snippets.filter(s => s.id !== id);
      await chrome.storage.local.set({ snippets: newSnippets });
      toast.success('Snippet deleted.');
      if (id === currentId) resetForm();
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-8">
      <Toaster richColors position="bottom-right" />
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800">
          {isEditing ? <Edit size={22} /> : <Plus size={22} />}
          {isEditing ? 'Edit Snippet' : 'Create New Snippet'}
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="shortcut" className="block mb-1 text-sm font-medium text-gray-700">Shortcut</label>
            <input
              type="text"
              id="shortcut"
              value={shortcut}
              onChange={(e) => setShortcut(e.target.value)}
              placeholder="e.g., :hello"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Snippet Content</label>
            <ReactQuill
              theme="snow"
              value={snippetContent}
              onChange={setSnippetContent}
              modules={quillModules}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            {isEditing && (
              <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                <X size={16} /> Cancel
              </button>
            )}
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Save size={16} /> {isEditing ? 'Save Changes' : 'Create Snippet'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Saved Snippets</h2>
        <div className="space-y-3">
          {snippets.length > 0 ? snippets.map(s => (
            <div key={s.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-lg font-semibold text-blue-600">{s.shortcut}</p>
                  <div className="mt-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.snippet }} />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(s)} className="p-2 text-gray-500 rounded-md hover:bg-gray-100"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 rounded-md hover:bg-red-100"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-gray-500">You haven't created any snippets yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};