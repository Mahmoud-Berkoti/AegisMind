import { mockIncidents, mockEvents, mockStats, generateMockIncidents } from './data';
import { Incident } from '@/types';

const MOCK_DELAY = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockFetch(url: string, options?: RequestInit): Promise<Response> {
  await delay(MOCK_DELAY);

  const urlObj = new URL(url, window.location.origin);
  const pathname = urlObj.pathname;

  console.log('🎭 Mock fetch:', pathname);

  // Health check
  if (pathname.includes('/health')) {
    return new Response(
      JSON.stringify({ status: 'ok', timestamp: Date.now() }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get all incidents - check both /incidents and /mock/incidents
  if (pathname === '/incidents' || pathname === '/mock/incidents' || pathname.includes('incidents')) {
    const severity = urlObj.searchParams.getAll('severity');
    const status = urlObj.searchParams.getAll('status');
    let filtered = [...mockIncidents];

    if (severity.length > 0) {
      filtered = filtered.filter(i => severity.includes(i.severity));
    }
    if (status.length > 0) {
      filtered = filtered.filter(i => status.includes(i.status));
    }

    console.log('🎭 Returning', filtered.length, 'mock incidents');

    return new Response(
      JSON.stringify({ incidents: filtered, total: filtered.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get single incident
  if (pathname.match(/\/incidents\/[a-zA-Z0-9_]+$/)) {
    const id = pathname.split('/').pop();
    const incident = mockIncidents.find(i => i.id === id);
    
    if (incident) {
      return new Response(
        JSON.stringify(incident),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Incident not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get events
  if (pathname.includes('/events')) {
    return new Response(
      JSON.stringify({ events: mockEvents, total: mockEvents.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get stats
  if (pathname.includes('/stats')) {
    return new Response(
      JSON.stringify(mockStats),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Ingest events
  if (pathname.includes('/ingest') && options?.method === 'POST') {
    return new Response(
      JSON.stringify({ accepted: 1 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Default 404
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}

export function initMockServer() {
  if (import.meta.env.VITE_MOCK !== 'true') {
    console.log('🔌 Mock server disabled (VITE_MOCK !== true)');
    return;
  }

  console.log('🎭 Mock SIEM server enabled (VITE_MOCK=true)');
  console.log('🎭 Mock incidents available:', mockIncidents.length);

  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Always mock these endpoints in mock mode
    if (url.includes('/health') || 
        url.includes('/incidents') || 
        url.includes('/events') || 
        url.includes('/stats') || 
        url.includes('/ingest')) {
      console.log('📡 Intercepting API call:', url);
      return mockFetch(url, init);
    }

    // Pass through other requests
    return originalFetch(input, init);
  };
}

// Mock WebSocket for incident updates
export class MockWebSocket {
  private handlers: Array<(event: MessageEvent) => void> = [];
  private interval: number | null = null;

  constructor(url: string) {
    console.log('🔌 Mock WebSocket connected:', url);

    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
      this.startUpdates();
    }, 100);
  }

  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  readyState: number = 1; // OPEN

  private startUpdates() {
    this.interval = window.setInterval(() => {
      if (!this.onmessage) return;

      // Random incident update
      if (Math.random() > 0.6) {
        const incident = mockIncidents[Math.floor(Math.random() * mockIncidents.length)];
        const message = {
          type: 'incident.updated',
          incident: {
            ...incident,
            updated_at: Date.now(),
          },
        };

        this.onmessage(
          new MessageEvent('message', { data: JSON.stringify(message) })
        );
      }

      // New incident (less frequent)
      if (Math.random() > 0.95) {
        const newIncidents = generateMockIncidents(1);
        const message = {
          type: 'incident.created',
          incident: newIncidents[0],
        };

        this.onmessage(
          new MessageEvent('message', { data: JSON.stringify(message) })
        );
      }
    }, 5000);
  }

  send(data: string) {
    console.log('📤 Mock WebSocket send:', data);
  }

  close() {
    console.log('🔌 Mock WebSocket closed');
    if (this.interval !== null) {
      clearInterval(this.interval);
    }
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

if (import.meta.env.VITE_MOCK === 'true') {
  (window as any).WebSocket = MockWebSocket;
}
