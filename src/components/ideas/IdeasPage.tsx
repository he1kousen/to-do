'use client';

import { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Pencil,
  Trash2,
  Check,
  Circle,
  Filter,
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { usePagination } from '@/lib/hooks/use-pagination';
import { useIdeas, type Idea } from '@/lib/hooks/use-ideas';

type FilterKey = 'all' | 'realized' | 'not_realized';

export default function IdeasPage() {
  const { ideas, createIdea, updateIdea, deleteIdea, toggleRealized } = useIdeas();
  const [filter, setFilter] = useState<FilterKey>('all');
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

  const pagination = usePagination({ items: filteredIdeas, pageSize: 10 });

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

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'not_realized', label: 'Belum Terwujud' },
    { key: 'realized', label: 'Sudah Terwujud' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-marigold" strokeWidth={1.5} />
            <div>
              <h1 className="text-display-md text-graphite">Ideas</h1>
              <p className="text-body-sm text-[#6B7280]">
                {ideas.length === 0
                  ? 'Kumpulkan ide untuk dikerjakan nanti'
                  : `${ideas.filter((i) => !i.is_realized).length} belum terwujud`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 rounded-sm bg-signal-teal px-4 py-2 text-body-md font-medium text-white transition-colors hover:bg-signal-teal-hover"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Tambah Ide
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-cloud bg-mist p-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-body-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-white text-graphite shadow-float'
                  : 'text-[#6B7280] hover:text-graphite'
              }`}
            >
              {key === 'not_realized' && <Circle className="h-3 w-3" strokeWidth={2} />}
              {key === 'realized' && <Check className="h-3 w-3 text-moss" strokeWidth={2} />}
              {label}
            </button>
          ))}
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="mb-6 rounded-lg border border-cloud bg-white p-4">
            <input
              autoFocus
              placeholder="Judul ide"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setNewTitle('');
                  setNewDescription('');
                  setShowCreateForm(false);
                }
              }}
              className="mb-3 w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal placeholder:text-[#8B929A]"
            />
            <textarea
              placeholder="Deskripsi (opsional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="mb-3 w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal placeholder:text-[#8B929A]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="rounded-sm bg-signal-teal px-4 py-2 text-body-md font-medium text-white transition-colors hover:bg-signal-teal-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Simpan
              </button>
              <button
                onClick={() => {
                  setNewTitle('');
                  setNewDescription('');
                  setShowCreateForm(false);
                }}
                className="rounded-sm border border-cloud bg-white px-4 py-2 text-body-md font-medium text-[#6B7280] transition-colors hover:bg-mist"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Ideas list */}
        <div className="space-y-2">
          {(pagination.paginatedItems as Idea[]).map((idea) => (
            <div
              key={idea.id}
              className={`rounded-lg border bg-white p-4 transition-colors ${
                idea.is_realized ? 'border-moss/30' : 'border-cloud'
              }`}
            >
              {editingId === idea.id ? (
                /* Edit mode */
                <div>
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="mb-2 w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="mb-3 w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="rounded-sm bg-signal-teal px-3 py-1.5 text-body-sm font-medium text-white transition-colors hover:bg-signal-teal-hover"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-sm border border-cloud bg-white px-3 py-1.5 text-body-sm font-medium text-[#6B7280] transition-colors hover:bg-mist"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-start gap-3">
                  {/* Toggle realized */}
                  <button
                    onClick={() => toggleRealized(idea.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      idea.is_realized
                        ? 'border-moss bg-moss text-white'
                        : 'border-cloud hover:border-signal-teal'
                    }`}
                    title={idea.is_realized ? 'Tandai belum terwujud' : 'Tandai sudah terwujud'}
                  >
                    {idea.is_realized && <Check className="h-3 w-3" strokeWidth={3} />}
                  </button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-body-lg font-medium ${
                          idea.is_realized ? 'text-moss' : 'text-graphite'
                        }`}
                      >
                        {idea.title}
                      </h3>
                      <span
                        className={`rounded-sm px-1.5 py-0.5 text-mono-sm font-medium ${
                          idea.is_realized
                            ? 'bg-moss/10 text-moss'
                            : 'bg-marigold/10 text-marigold'
                        }`}
                      >
                        {idea.is_realized ? 'Sudah Terwujud' : 'Belum Terwujud'}
                      </span>
                    </div>
                    {idea.description && (
                      <p className="mt-1 text-body-md text-[#6B7280]">{idea.description}</p>
                    )}
                    <p className="mt-2 text-mono-sm text-[#8B929A]">
                      {new Date(idea.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleStartEdit(idea)}
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-mist hover:text-graphite"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(idea.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-red-50 hover:text-danger"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
            />
          </div>
        )}

        {/* Empty state */}
        {filteredIdeas.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <Lightbulb className="mb-3 h-10 w-10 text-[#C4C9CE]" strokeWidth={1.5} />
            <h3 className="text-display-sm text-graphite">
              {filter === 'all'
                ? 'Belum ada ide'
                : filter === 'realized'
                  ? 'Belum ada yang terwujud'
                  : 'Semua ide sudah terwujud'}
            </h3>
            <p className="mt-1 text-body-md text-[#6B7280]">
              {filter === 'all'
                ? 'Tekan "Tambah Ide" untuk mulai mengumpulkan.'
                : filter === 'realized'
                  ? 'Tandai ide yang sudah terwujud dengan ikon centang.'
                  : 'Kerja bagus! Semua ide sudah jadi kenyataan.'}
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
          title="Hapus ide"
          message={`Yakin ingin menghapus "${ideas.find((i) => i.id === confirmDelete)?.title}"?`}
        />
      </div>
    </div>
  );
}
