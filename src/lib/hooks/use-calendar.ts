'use client';

import { useState, useCallback } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink?: string;
}

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  fetchEvents: (timeMin: string, timeMax: string) => Promise<void>;
  createEvent: (input: {
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
  }) => Promise<CalendarEvent | null>;
  updateEvent: (eventId: string, updates: Partial<{
    title: string;
    start: string;
    end: string;
    description: string;
    location: string;
  }>) => Promise<CalendarEvent | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;
}

export function useCalendar(): UseCalendarReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (timeMin: string, timeMax: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ timeMin, timeMax });
      const response = await fetch(`/api/calendar/events?${params}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Gagal mengambil data kalender');
      }

      const data = await response.json();
      setEvents(data.events ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (input: {
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
  }) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Gagal membuat event');
      }

      const data = await response.json();
      const newEvent = data.event as CalendarEvent;
      setEvents((prev) => [...prev, newEvent].sort((a, b) => a.start.localeCompare(b.start)));
      return newEvent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return null;
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<{
    title: string;
    start: string;
    end: string;
    description: string;
    location: string;
  }>) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ...updates }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Gagal mengupdate event');
      }

      const data = await response.json();
      const updated = data.event as CalendarEvent;
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return null;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/events?eventId=${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.message ?? 'Gagal menghapus event');
      }

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return false;
    }
  }, []);

  return { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent };
}
