import { create } from 'zustand';
import { AppState, Incident, Event, WSMessage, Severity, IncidentStatus } from '@/types';
import { fetchIncidents, fetchRecentEvents, fetchDashboardStats } from '@/lib/api';
import { getWSClient } from '@/lib/ws';

interface AppStore extends AppState {
  setFilters: (filters: Partial<AppState['filters']>) => void;
  toggleLive: () => void;
  loadData: () => Promise<void>;
  handleWSMessage: (message: WSMessage) => void;
  setError: (error: string | null) => void;
  selectIncident: (incident: Incident | null) => void;
}

const initialState: AppState = {
  range: { earliest: '-24h', latest: 'now' },
  filters: { severity: [], status: [], source: [], host: [] },
  incidents: [],
  recentEvents: [],
  stats: null,
  selectedIncident: null,
  live: false,
  loading: false,
  error: null,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    get().loadData();
  },

  toggleLive: () => {
    const { live } = get();
    if (!live) {
      const wsClient = getWSClient();
      wsClient.connect();
      wsClient.subscribe(get().handleWSMessage);
      set({ live: true });
    } else {
      const wsClient = getWSClient();
      wsClient.disconnect();
      set({ live: false });
    }
  },

  loadData: async () => {
    set({ loading: true, error: null });

    try {
      const { filters } = get();

      // Fetch incidents and events
      const [incidentsData, eventsData] = await Promise.all([
        fetchIncidents({
          severity: filters.severity.length > 0 ? filters.severity : undefined,
          status: filters.status.length > 0 ? filters.status : undefined,
          limit: 100,
        }),
        fetchRecentEvents(50).catch(() => ({ events: [], total: 0 })), // Gracefully fail if not available
      ]);

      // Compute stats from incidents on client side
      const incidents = incidentsData.incidents;
      const stats = {
        total_incidents: incidents.length,
        open_incidents: incidents.filter(i => i.status === 'open').length,
        critical_incidents: incidents.filter(i => i.severity === 'critical').length,
        events_last_hour: eventsData.events.length,
        events_by_severity: {
          low: incidents.filter(i => i.severity === 'low').length,
          medium: incidents.filter(i => i.severity === 'medium').length,
          high: incidents.filter(i => i.severity === 'high').length,
          critical: incidents.filter(i => i.severity === 'critical').length,
        },
        incidents_by_status: {
          open: incidents.filter(i => i.status === 'open').length,
          ack: incidents.filter(i => i.status === 'ack').length,
          closed: incidents.filter(i => i.status === 'closed').length,
        },
        top_hosts: [],
        event_sources: [],
      };

      set({
        incidents: incidentsData.incidents,
        recentEvents: eventsData.events,
        stats,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      });
    }
  },

  handleWSMessage: (message: WSMessage) => {
    const { type, incident, event } = message;

    switch (type) {
      case 'incident.created':
        if (incident) {
          set((state) => ({
            incidents: [incident, ...state.incidents],
          }));
          console.log('✨ New incident:', incident.title);
        }
        break;

      case 'incident.updated':
      case 'incident.status_changed':
        if (incident) {
          set((state) => {
            const index = state.incidents.findIndex((i) => i.id === incident.id);
            if (index >= 0) {
              const newIncidents = [...state.incidents];
              newIncidents[index] = incident;
              return { incidents: newIncidents };
            }
            return state;
          });
        }
        break;

      case 'event.ingested':
        if (event) {
          set((state) => ({
            recentEvents: [event, ...state.recentEvents].slice(0, 50),
          }));
        }
        break;

      default:
        console.warn('Unknown WebSocket message type:', type);
    }
  },

  setError: (error) => {
    set({ error });
  },

  selectIncident: (incident) => {
    set({ selectedIncident: incident });
  },
}));
