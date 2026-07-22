import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, badRequestResponse } from '@/lib/auth';
import { getAccessToken } from '@/lib/google-tokens';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

// ============================================================
// GET /api/calendar/events?timeMin=...&timeMax=...
// List events in a date range
// ============================================================
export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const timeMin = searchParams.get('timeMin');
  const timeMax = searchParams.get('timeMax');

  if (!timeMin || !timeMax) {
    return badRequestResponse('timeMin and timeMax query params are required');
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(user.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'NO_REFRESH_TOKEN') {
      return NextResponse.json(
        { error: 'NO_TOKEN', message: 'Silakan login ulang untuk mengakses kalender.' },
        { status: 401 }
      );
    }
    if (message === 'TOKEN_REVOKED') {
      return NextResponse.json(
        { error: 'TOKEN_REVOKED', message: 'Akses kalender dicabut. Silakan login ulang.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'TOKEN_ERROR', message: 'Gagal mendapatkan akses kalender.' },
      { status: 500 }
    );
  }

  const url = new URL(GOOGLE_CALENDAR_API);
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[calendar] Google API error:', response.status, errorBody);
    return NextResponse.json(
      { error: 'GOOGLE_API_ERROR', message: 'Gagal mengambil data dari Google Calendar.' },
      { status: response.status }
    );
  }

  const data = await response.json();

  // Map Google Calendar events to our format
  const events = (data.items ?? []).map(mapGoogleEvent);

  return NextResponse.json({ events });
}

// ============================================================
// POST /api/calendar/events
// Create an event
// Body: { title, start, end, description?, location? }
// ============================================================
export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const body = await request.json();
  const { title, start, end, description, location } = body;

  if (!title || !start || !end) {
    return badRequestResponse('title, start, and end are required');
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(user.id);
  } catch (err) {
    return handleTokenError(err);
  }

  const googleEvent: Record<string, unknown> = {
    summary: title,
    start: { dateTime: start },
    end: { dateTime: end },
  };
  if (description) googleEvent.description = description;
  if (location) googleEvent.location = location;

  const response = await fetch(GOOGLE_CALENDAR_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(googleEvent),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[calendar] Google API create error:', response.status, errorBody);
    return NextResponse.json(
      { error: 'GOOGLE_API_ERROR', message: 'Gagal membuat event di Google Calendar.' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json({ event: mapGoogleEvent(data) }, { status: 201 });
}

// ============================================================
// PATCH /api/calendar/events/[eventId]
// Update an event
// ============================================================
export async function PATCH(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const body = await request.json();
  const { eventId, title, start, end, description, location } = body;

  if (!eventId) {
    return badRequestResponse('eventId is required');
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(user.id);
  } catch (err) {
    return handleTokenError(err);
  }

  const googleEvent: Record<string, unknown> = {};
  if (title !== undefined) googleEvent.summary = title;
  if (start !== undefined) googleEvent.start = { dateTime: start };
  if (end !== undefined) googleEvent.end = { dateTime: end };
  if (description !== undefined) googleEvent.description = description;
  if (location !== undefined) googleEvent.location = location;

  const response = await fetch(`${GOOGLE_CALENDAR_API}/${eventId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(googleEvent),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[calendar] Google API update error:', response.status, errorBody);
    return NextResponse.json(
      { error: 'GOOGLE_API_ERROR', message: 'Gagal mengupdate event di Google Calendar.' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json({ event: mapGoogleEvent(data) });
}

// ============================================================
// DELETE /api/calendar/events?eventId=...
// Delete an event
// ============================================================
export async function DELETE(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return badRequestResponse('eventId query param is required');
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(user.id);
  } catch (err) {
    return handleTokenError(err);
  }

  const response = await fetch(`${GOOGLE_CALENDAR_API}/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok && response.status !== 404) {
    const errorBody = await response.text();
    console.error('[calendar] Google API delete error:', response.status, errorBody);
    return NextResponse.json(
      { error: 'GOOGLE_API_ERROR', message: 'Gagal menghapus event di Google Calendar.' },
      { status: response.status }
    );
  }

  return new NextResponse(null, { status: 204 });
}

// ============================================================
// Helpers
// ============================================================

function mapGoogleEvent(item: Record<string, unknown>) {
  const start = item.start as Record<string, string> | undefined;
  const end = item.end as Record<string, string> | undefined;

  return {
    id: item.id as string,
    title: (item.summary as string) ?? '(Tanpa judul)',
    description: (item.description as string) ?? '',
    location: (item.location as string) ?? '',
    start: start?.dateTime ?? start?.date ?? '',
    end: end?.dateTime ?? end?.date ?? '',
    allDay: !!start?.date,
    htmlLink: item.htmlLink as string | undefined,
  };
}

function handleTokenError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  if (message === 'NO_REFRESH_TOKEN') {
    return NextResponse.json(
      { error: 'NO_TOKEN', message: 'Silakan login ulang untuk mengakses kalender.' },
      { status: 401 }
    );
  }
  if (message === 'TOKEN_REVOKED') {
    return NextResponse.json(
      { error: 'TOKEN_REVOKED', message: 'Akses kalender dicabut. Silakan login ulang.' },
      { status: 401 }
    );
  }
  return NextResponse.json(
    { error: 'TOKEN_ERROR', message: 'Gagal mendapatkan akses kalender.' },
    { status: 500 }
  );
}
