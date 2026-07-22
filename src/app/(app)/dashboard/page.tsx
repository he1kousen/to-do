'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Lightbulb,
  Calendar,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useCalendar } from '@/lib/hooks/use-calendar';

interface ProjectSummary {
  id: string;
  name: string;
  view_type: string;
  todo: number;
  in_progress: number;
  done: number;
  total: number;
}

interface IdeasSummary {
  total: number;
  realized: number;
  not_realized: number;
}

interface DashboardData {
  tasks: ProjectSummary[];
  ideas: IdeasSummary;
}

export default function DashboardPage() {
  const router = useRouter();
  const { events, fetchEvents } = useCalendar();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // Avoid stale cached dashboard after soft-deletes
        const res = await fetch('/api/dashboard', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setData(json);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const weekLater = new Date(now);
    weekLater.setDate(weekLater.getDate() + 7);
    fetchEvents(now.toISOString(), weekLater.toISOString());
  }, [fetchEvents]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const weekLater = new Date(now);
    weekLater.setDate(weekLater.getDate() + 7);

    return events
      .filter((e) => {
        const start = new Date(e.start);
        return start >= now && start <= weekLater;
      })
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 5);
  }, [events]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <RefreshCw className="h-5 w-5 animate-spin text-signal-teal" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-signal-teal" strokeWidth={1.5} />
          <div>
            <h1 className="text-display-md text-graphite">Dashboard</h1>
            <p className="text-body-sm text-[#6B7280]">Ringkasan dari semua module</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Tasks Card */}
          <div className="rounded-lg border border-cloud bg-white">
            <div className="flex items-center justify-between border-b border-cloud px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-signal-teal" strokeWidth={1.5} />
                <h2 className="text-body-md font-medium text-graphite">Tasks</h2>
              </div>
              <button
                onClick={() => router.push('/tasks')}
                className="flex items-center gap-1 text-body-sm text-signal-teal transition-colors hover:text-signal-teal-hover"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            <div className="p-4">
              {!data || data.tasks.length === 0 ? (
                <p className="text-center text-body-sm text-[#8B929A]">Belum ada project.</p>
              ) : (
                <div className="space-y-3">
                  {data.tasks.map((project) => {
                    const progress = project.total > 0 ? Math.round((project.done / project.total) * 100) : 0;

                    return (
                      <button
                        key={project.id}
                        onClick={() => router.push(`/tasks?project=${project.id}`)}
                        className="group w-full rounded-sm p-2 text-left transition-colors hover:bg-mist"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-body-sm font-medium text-graphite group-hover:text-signal-teal">
                            {project.name}
                          </span>
                          <span className="text-mono-sm text-[#8B929A]">{progress}%</span>
                        </div>

                        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-mist">
                          <div
                            className="h-full rounded-full bg-moss transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex gap-3 text-mono-sm text-[#8B929A]">
                          <span>{project.todo} todo</span>
                          {project.view_type === 'kanban' && <span>{project.in_progress} proses</span>}
                          <span>{project.done} selesai</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Ideas Card */}
          <div className="rounded-lg border border-cloud bg-white">
            <div className="flex items-center justify-between border-b border-cloud px-4 py-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-marigold" strokeWidth={1.5} />
                <h2 className="text-body-md font-medium text-graphite">Ideas</h2>
              </div>
              <button
                onClick={() => router.push('/ideas')}
                className="flex items-center gap-1 text-body-sm text-signal-teal transition-colors hover:text-signal-teal-hover"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            <div className="p-4">
              {!data || data.ideas.total === 0 ? (
                <p className="text-center text-body-sm text-[#8B929A]">Belum ada ide.</p>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-display-lg text-graphite">{data.ideas.total}</span>
                    <p className="text-body-sm text-[#6B7280]">Total ide</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-sm border border-cloud p-3 text-center">
                      <span className="text-display-sm text-marigold">{data.ideas.not_realized}</span>
                      <p className="text-mono-sm text-[#8B929A]">Belum Terwujud</p>
                    </div>
                    <div className="rounded-sm border border-cloud p-3 text-center">
                      <span className="text-display-sm text-moss">{data.ideas.realized}</span>
                      <p className="text-mono-sm text-[#8B929A]">Sudah Terwujud</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Card */}
          <div className="rounded-lg border border-cloud bg-white">
            <div className="flex items-center justify-between border-b border-cloud px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-signal-teal" strokeWidth={1.5} />
                <h2 className="text-body-md font-medium text-graphite">Kalender</h2>
              </div>
              <button
                onClick={() => router.push('/calendar')}
                className="flex items-center gap-1 text-body-sm text-signal-teal transition-colors hover:text-signal-teal-hover"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            <div className="p-4">
              <h3 className="mb-3 text-body-sm font-medium text-[#6B7280]">7 hari ke depan</h3>

              {upcomingEvents.length === 0 ? (
                <p className="text-center text-body-sm text-[#8B929A]">Tidak ada event mendatang.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((event) => {
                    const startDate = new Date(event.start);
                    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

                    return (
                      <button
                        key={event.id}
                        onClick={() => router.push('/calendar')}
                        className="group flex w-full items-start gap-2 rounded-sm p-1.5 text-left transition-colors hover:bg-mist"
                      >
                        <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-sm border border-cloud">
                          <span className="text-mono-sm font-medium text-[#8B929A]">{dayNames[startDate.getDay()]}</span>
                          <span className="text-body-sm font-semibold text-graphite leading-none">{startDate.getDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-sm text-graphite group-hover:text-signal-teal">{event.title}</p>
                          <p className="text-mono-sm text-[#8B929A]">
                            {event.allDay
                              ? 'Sepanjang hari'
                              : new Date(event.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
