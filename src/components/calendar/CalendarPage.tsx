'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useCalendar, type CalendarEvent } from '@/lib/hooks/use-calendar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type ViewMode = 'month' | 'week' | 'day';

// Format date as YYYY-MM-DD in local timezone (not UTC)
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Format date as YYYY-MM-DDTHH:MM in local timezone
function toLocalDatetimeStr(date: Date): string {
  const datePart = toLocalDateStr(date);
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${datePart}T${h}:${min}`;
}

export default function CalendarPage() {
  const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formDate, setFormDate] = useState<string>('');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');

  // Calculate date range for fetching
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'month') {
      start.setDate(1);
      start.setMonth(start.getMonth() - 1);
      end.setMonth(end.getMonth() + 2);
      end.setDate(0);
    } else if (viewMode === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      end.setDate(start.getDate() + 6);
    }

    return {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
    };
  }, [currentDate, viewMode]);

  useEffect(() => {
    fetchEvents(dateRange.timeMin, dateRange.timeMax);
  }, [dateRange, fetchEvents]);

  const navigate = (direction: -1 | 1) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'month') next.setMonth(next.getMonth() + direction);
      else if (viewMode === 'week') next.setDate(next.getDate() + direction * 7);
      else next.setDate(next.getDate() + direction);
      return next;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const openCreateForm = (date?: string) => {
    setEditingEvent(null);
    setFormTitle('');
    setFormDescription('');
    setFormLocation('');
    if (date) {
      setFormStart(`${date}T09:00`);
      setFormEnd(`${date}T10:00`);
    } else {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      const end = new Date(now);
      end.setHours(end.getHours() + 1);
      setFormStart(toLocalDatetimeStr(now));
      setFormEnd(toLocalDatetimeStr(end));
    }
    setShowEventForm(true);
  };

  const openEditForm = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description);
    setFormLocation(event.location);
    setFormStart(event.start.slice(0, 16));
    setFormEnd(event.end.slice(0, 16));
    setShowEventForm(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formStart || !formEnd) return;

    if (editingEvent) {
      await updateEvent(editingEvent.id, {
        title: formTitle.trim(),
        start: new Date(formStart).toISOString(),
        end: new Date(formEnd).toISOString(),
        description: formDescription.trim(),
        location: formLocation.trim(),
      });
    } else {
      await createEvent({
        title: formTitle.trim(),
        start: new Date(formStart).toISOString(),
        end: new Date(formEnd).toISOString(),
        description: formDescription.trim(),
        location: formLocation.trim(),
      });
    }

    setShowEventForm(false);
    fetchEvents(dateRange.timeMin, dateRange.timeMax);
  };

  const handleDelete = async (eventId: string) => {
    await deleteEvent(eventId);
    setConfirmDelete(null);
    fetchEvents(dateRange.timeMin, dateRange.timeMax);
  };

  const formatHeader = () => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    if (viewMode === 'month') return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.getDate()} - ${end.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${days[currentDate.getDay()]}, ${currentDate.getDate()} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = toLocalDateStr(date);
    return events.filter((e) => e.start.slice(0, 10) === dateStr);
  };

  // Generate month grid
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Upcoming events (from today, next 7 days)
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

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'month', label: 'Bulan' },
    { key: 'week', label: 'Minggu' },
    { key: 'day', label: 'Hari' },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b border-cloud bg-white px-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-signal-teal" strokeWidth={1.5} />
          <h2 className="text-display-sm text-graphite">Kalender</h2>
        </div>
        <button
          onClick={() => openCreateForm()}
          className="flex items-center gap-1.5 rounded-sm bg-signal-teal px-3 py-1.5 text-body-sm font-medium text-white transition-colors hover:bg-signal-teal-hover"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Tambah Event
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-cloud bg-white px-6 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded-sm p-1 text-[#6B7280] hover:bg-mist hover:text-graphite">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button onClick={() => navigate(1)} className="rounded-sm p-1 text-[#6B7280] hover:bg-mist hover:text-graphite">
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button onClick={goToToday} className="rounded-sm border border-cloud px-2 py-1 text-body-sm text-[#6B7280] hover:bg-mist hover:text-graphite">
            Hari ini
          </button>
          <h3 className="ml-2 text-display-sm text-graphite">{formatHeader()}</h3>
        </div>

        <div className="flex gap-1 rounded-sm border border-cloud p-0.5">
          {viewModes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`rounded-sm px-2 py-1 text-body-sm font-medium transition-colors ${
                viewMode === key ? 'bg-signal-teal text-white' : 'text-[#6B7280] hover:text-graphite'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar main area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Error state */}
        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-danger" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-body-md font-medium text-danger">{error}</p>
              <p className="text-body-sm text-[#6B7280]">Data kalender tidak tersedia. Periksa koneksi atau login ulang.</p>
            </div>
            <button
              onClick={() => fetchEvents(dateRange.timeMin, dateRange.timeMax)}
              className="flex items-center gap-1 rounded-sm border border-red-200 px-2 py-1 text-body-sm text-danger hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
              Coba lagi
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-signal-teal" strokeWidth={2} />
          </div>
        )}

        {/* Month view */}
        {!loading && viewMode === 'month' && (
          <div className="rounded-lg border border-cloud bg-white">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-cloud">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <div key={day} className="px-2 py-2 text-center text-mono-sm font-medium text-[#8B929A]">
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {monthDays.map((date, i) => {
                if (!date) {
                  return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-cloud bg-mist/30" />;
                }

                const dayEvents = getEventsForDate(date);
                const today = isToday(date);

                return (
                  <div
                    key={toLocalDateStr(date)}
                    className="min-h-[100px] cursor-pointer border-b border-r border-cloud transition-colors hover:bg-mist/50"
                    onClick={() => openCreateForm(toLocalDateStr(date))}
                  >
                    <div className="p-1.5">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-body-sm ${
                          today
                            ? 'bg-signal-teal font-medium text-white'
                            : 'text-graphite'
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-0.5 px-1 pb-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditForm(event);
                          }}
                          className="w-full truncate rounded-sm bg-signal-teal/10 px-1.5 py-0.5 text-left text-body-sm text-signal-teal transition-colors hover:bg-signal-teal/20"
                        >
                          {event.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="px-1.5 text-mono-sm text-[#8B929A]">+{dayEvents.length - 3} lagi</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week/Day view — simple list */}
        {!loading && (viewMode === 'week' || viewMode === 'day') && (
          <div className="space-y-2">
            {events.length === 0 ? (
              <div className="flex flex-col items-center py-16">
                <CalendarIcon className="mb-3 h-10 w-10 text-[#C4C9CE]" strokeWidth={1.5} />
                <h3 className="text-display-sm text-graphite">Tidak ada event</h3>
                <p className="mt-1 text-body-md text-[#6B7280]">Tekan &quot;Tambah Event&quot; untuk menambahkan.</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="group flex items-start gap-3 rounded-lg border border-cloud bg-white p-4 transition-colors hover:border-[#C4C9CE]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-signal-teal/10">
                    <CalendarIcon className="h-5 w-5 text-signal-teal" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-body-md font-medium text-graphite">{event.title}</h4>
                    <div className="mt-1 flex items-center gap-3 text-body-sm text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {formatEventTime(event)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-1 truncate text-body-sm text-[#8B929A]">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEditForm(event)}
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-mist hover:text-graphite"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(event.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-red-50 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        </div>

        {/* Upcoming Events sidebar */}
        <div className="hidden w-72 shrink-0 border-l border-cloud bg-white p-4 lg:block">
          <h3 className="mb-4 text-display-sm text-graphite">Mendatang</h3>

          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CalendarIcon className="mb-2 h-8 w-8 text-[#C4C9CE]" strokeWidth={1.5} />
              <p className="text-body-sm text-[#8B929A]">Tidak ada event dalam 7 hari ke depan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const startDate = new Date(event.start);
                const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

                return (
                  <button
                    key={event.id}
                    onClick={() => openEditForm(event)}
                    className="group flex w-full items-start gap-3 rounded-sm p-2 text-left transition-colors hover:bg-mist"
                  >
                    {/* Date badge */}
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-sm border border-cloud">
                      <span className="text-mono-sm font-medium text-[#8B929A]">{dayNames[startDate.getDay()]}</span>
                      <span className="text-body-lg font-semibold text-graphite leading-none">{startDate.getDate()}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-graphite group-hover:text-signal-teal">
                        {event.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-mono-sm text-[#8B929A]">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        <span>{formatEventTime(event)}</span>
                      </div>
                      {event.location && (
                        <div className="mt-0.5 flex items-center gap-2 text-mono-sm text-[#8B929A]">
                          <MapPin className="h-3 w-3" strokeWidth={1.5} />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Event form modal */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-cloud bg-white p-6 shadow-modal">
            <h2 className="text-display-sm mb-4 text-graphite">
              {editingEvent ? 'Edit Event' : 'Tambah Event'}
            </h2>

            <div className="space-y-3">
              <input
                autoFocus
                placeholder="Judul event"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal placeholder:text-[#8B929A]"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-body-sm text-[#6B7280]">Mulai</label>
                  <input
                    type="datetime-local"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-body-sm text-[#6B7280]">Selesai</label>
                  <input
                    type="datetime-local"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal"
                  />
                </div>
              </div>

              <textarea
                placeholder="Deskripsi (opsional)"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                className="w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal placeholder:text-[#8B929A]"
              />

              <input
                placeholder="Lokasi (opsional)"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full rounded-sm border border-cloud px-3 py-2 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal placeholder:text-[#8B929A]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowEventForm(false)}
                className="rounded-sm border border-cloud px-4 py-2 text-body-md font-medium text-[#6B7280] transition-colors hover:bg-mist"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formTitle.trim() || !formStart || !formEnd}
                className="rounded-sm bg-signal-teal px-4 py-2 text-body-md font-medium text-white transition-colors hover:bg-signal-teal-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingEvent ? 'Simpan' : 'Buat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Hapus event"
        message={`Yakin ingin menghapus "${events.find((e) => e.id === confirmDelete)?.title}" dari Google Calendar?`}
      />
    </div>
  );
}

function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return 'Sepanjang hari';
  const start = new Date(event.start);
  const end = new Date(event.end);
  const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${formatTime(start)} - ${formatTime(end)}`;
}
