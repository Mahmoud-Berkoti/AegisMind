import { Incident, Event, DashboardStats, Filters, Severity, IncidentStatus } from '@/types';

// Use real backend when not in mock mode
const BASE_URL = import.meta.env.VITE_MOCK === 'true' ? '/mock' : '';

export interface IncidentsResponse {
  incidents: Incident[];
  total: number;
}

export interface EventsResponse {
  events: Event[];
  total: number;
}

/**
 * Health check
 */
export async function fetchHealth(): Promise<{ status: string; timestamp: number }> {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all incidents with optional filters
 */
export async function fetchIncidents(
  filters?: {
    severity?: Severity[];
    status?: IncidentStatus[];
    limit?: number;
    offset?: number;
  }
): Promise<IncidentsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.severity) {
    filters.severity.forEach(s => params.append('severity', s));
  }
  if (filters?.status) {
    filters.status.forEach(s => params.append('status', s));
  }
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));

  const query = params.toString();
  const url = `${BASE_URL}/incidents${query ? `?${query}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch incidents: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch a single incident by ID
 */
export async function fetchIncident(id: string): Promise<Incident> {
  const response = await fetch(`${BASE_URL}/incidents/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch incident: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch recent events
 */
export async function fetchRecentEvents(limit: number = 100): Promise<EventsResponse> {
  const response = await fetch(`${BASE_URL}/events?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Ingest new events (for testing)
 */
export async function ingestEvents(events: Partial<Event>[]): Promise<{ accepted: number }> {
  const response = await fetch(`${BASE_URL}/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ events }),
  });

  if (!response.ok) {
    throw new Error(`Failed to ingest events: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Update incident status
 */
export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus
): Promise<Incident> {
  const response = await fetch(`${BASE_URL}/incidents/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update incident: ${response.statusText}`);
  }
  return response.json();
}

