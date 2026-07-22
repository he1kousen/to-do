'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Calendar,
  Clock,
  CheckSquare,
  LayoutGrid,
  Trash2,
} from 'lucide-react';
import type { Task } from '@/lib/hooks/use-tasks';

interface Comment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
}

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => void;
}

export default function TaskDetail({ task, onClose, onUpdate }: TaskDetailProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState(task.description);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/tasks/${task.id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [task.id]);

  // Scroll to bottom when new comment added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment('');
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      // ignore
    }
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    if (editDesc !== task.description) {
      onUpdate(task.id, { description: editDesc.trim() });
    }
    setIsEditingDesc(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-lg flex-col rounded-lg border border-cloud bg-white shadow-modal">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cloud p-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setEditTitle(task.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full text-display-sm text-graphite outline-none"
              />
            ) : (
              <h2
                onClick={() => {
                  setEditTitle(task.title);
                  setIsEditingTitle(true);
                }}
                className="cursor-text text-display-sm text-graphite"
              >
                {task.title}
              </h2>
            )}

            <div className="mt-2 flex items-center gap-3">
              <span className={`flex items-center gap-1 text-mono-sm ${
                task.status === 'done' ? 'text-moss' : task.status === 'in_progress' ? 'text-marigold' : 'text-[#8B929A]'
              }`}>
                {task.status === 'done' ? (
                  <CheckSquare className="h-3 w-3" strokeWidth={1.5} />
                ) : task.status === 'in_progress' ? (
                  <Clock className="h-3 w-3" strokeWidth={1.5} />
                ) : (
                  <LayoutGrid className="h-3 w-3" strokeWidth={1.5} />
                )}
                {task.status === 'done' ? 'Selesai' : task.status === 'in_progress' ? 'Sedang Dikerjakan' : 'To Do'}
              </span>

              {task.due_date && (
                <span className="flex items-center gap-1 text-mono-sm text-[#8B929A]">
                  <Calendar className="h-3 w-3" strokeWidth={1.5} />
                  {new Date(task.due_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-mist hover:text-graphite"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Description */}
        <div className="border-b border-cloud px-4 py-3">
          <h3 className="mb-2 text-body-sm font-medium text-[#6B7280]">Deskripsi</h3>
          {isEditingDesc ? (
            <textarea
              autoFocus
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              onBlur={handleSaveDesc}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditDesc(task.description);
                  setIsEditingDesc(false);
                }
              }}
              rows={3}
              className="w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none focus:border-signal-teal"
            />
          ) : (
            <p
              onClick={() => {
                setEditDesc(task.description);
                setIsEditingDesc(true);
              }}
              className="cursor-text whitespace-pre-wrap text-body-md text-graphite"
            >
              {task.description || 'Klik untuk menambahkan deskripsi...'}
            </p>
          )}
        </div>

        {/* Comments */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-cloud px-4 py-3">
            <MessageSquare className="h-4 w-4 text-[#8B929A]" strokeWidth={1.5} />
            <h3 className="text-body-sm font-medium text-[#6B7280]">
              Catatan ({comments.length})
            </h3>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {loading ? (
              <p className="text-center text-body-sm text-[#8B929A]">Memuat...</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-body-sm text-[#8B929A]">Belum ada catatan.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="group flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal-teal/10">
                      <MessageSquare className="h-3 w-3 text-signal-teal" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-body-md text-graphite">{comment.content}</p>
                      <p className="text-mono-sm text-[#8B929A]">{formatTime(comment.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex h-5 w-5 items-center justify-center rounded-sm text-[#C4C9CE] opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>

          {/* Add comment input */}
          <div className="border-t border-cloud p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah catatan..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment();
                }}
                className="flex-1 rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal placeholder:text-[#8B929A]"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-sm bg-signal-teal text-white transition-colors hover:bg-signal-teal-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
