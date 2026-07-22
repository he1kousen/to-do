'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useIdeas, type Idea } from '@/lib/hooks/use-ideas';

type Filter = 'all' | 'realized' | 'not_realized';

export default function IdeasPage() {
  const { ideas, createIdea, updateIdea, deleteIdea, toggleRealized } = useIdeas();
  const [filter, setFilter] = useState<Filter>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredIdeas = ideas.filter((idea) => {
    if (filter === 'realized') return idea.is_realized;
    if (filter === 'not_realized') return !idea.is_realized;
    return true;
  });

  const handleCreate = () => {
    if (newTitle.trim()) {
      createIdea({ title: newTitle.trim(), description: newDescription.trim() });
      setNewTitle('');
      setNewDescription('');
      setShowCreateForm(false);
    }
  };

  const handleStartEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setEditTitle(idea.title);
    setEditDescription(idea.description);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateIdea(editingId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setEditingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">💡 Ideas</h1>
          <p className="text-sm text-slate-500">Capture ideas to work on later</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          + New Idea
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1">
        {([
          { key: 'all', label: 'All' },
          { key: 'not_realized', label: '💭 Belum Terwujud' },
          { key: 'realized', label: '✅ Sudah Terwujud' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            autoFocus
            placeholder="Idea title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={2}
            className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => {
                setNewTitle('');
                setNewDescription('');
                setShowCreateForm(false);
              }}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ideas list */}
      <div className="space-y-3">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
              idea.is_realized
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-slate-200'
            }`}
          >
            {editingId === idea.id ? (
              /* Edit mode */
              <div>
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div className="flex items-start gap-3">
                {/* Toggle realized */}
                <button
                  onClick={() => toggleRealized(idea.id)}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    idea.is_realized
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {idea.is_realized && (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${idea.is_realized ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {idea.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        idea.is_realized
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {idea.is_realized ? 'Sudah Terwujud' : 'Belum Terwujud'}
                    </span>
                  </div>
                  {idea.description && (
                    <p className="mt-1 text-sm text-slate-500">{idea.description}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(idea.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(idea)}
                    className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    title="Edit"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(idea.id)}
                    className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                    title="Delete"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredIdeas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="mb-3 text-4xl">💡</span>
          <h3 className="mb-1 text-sm font-semibold text-slate-700">
            {filter === 'all' ? 'No ideas yet' : filter === 'realized' ? 'No realized ideas' : 'All ideas realized!'}
          </h3>
          <p className="text-sm text-slate-500">
            {filter === 'all' ? 'Capture your first idea above.' : 'Try a different filter.'}
          </p>
        </div>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) deleteIdea(confirmDelete);
        }}
        title="Delete idea"
        message={`Are you sure you want to delete "${ideas.find((i) => i.id === confirmDelete)?.title}"?`}
      />
    </div>
  );
}
