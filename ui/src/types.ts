// Match C++ backend schemas exactly

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'ack' | 'closed';
export type AlertAction = 'block' | 'notify' | 'isolate';

/**
 * Normalized security event from backend
 */
export interface Event {
  ts: number;
  source: string; // fw, ids, app
  host: string;
  trace_id: string;
  fingerprint: string;
  features: Record<string, any>; // proto, dport, bytes, etc.
  cluster_id?: string;
  incident_id?: string;
}

/**
 * Incident representing clustered events
 */
export interface Incident {
  id: string;
  status: IncidentStatus;
  title: string;
  severity: Severity;
  entity: Record<string, any>; // host, ip, user
  cluster_ids: string[];
  scores: Record<string, number>; // anomaly, confidence
  created_at: number;
  updated_at: number;
  last_event_ts: number;
  event_count?: number; // Computed field
}

/**
 * Alert triggered by incident
 */
export interface Alert {
  incident_id: string;
  ts: number;
  action: AlertAction;
  reason: string;
  result: string; // success, failed
}

/**
 * Audit trail entry
 */
export interface AuditEntry {
  ts: number;
  actor: string;
  action: string;
  incident_id: string;
  before: Record<string, any>;
  after: Record<string, any>;
}

/**
 * Metric data point
 */
export interface MetricPoint {
  ts: number;
  name: string;
  value: number;
  labels: Record<string, any>;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  total_incidents: number;
  open_incidents: number;
  critical_incidents: number;
  events_last_hour: number;
  events_by_severity: Record<Severity, number>;
  incidents_by_status: Record<IncidentStatus, number>;
  top_hosts: Array<{ host: string; count: number }>;
  event_sources: Array<{ source: string; count: number }>;
}

export interface TimeRange {
  earliest: string;
  latest: string;
}

export interface Filters {
  severity: Severity[];
  status: IncidentStatus[];
  source: string[];
  host: string[];
}

export interface AppState {
  range: TimeRange;
  filters: Filters;
  incidents: Incident[];
  recentEvents: Event[];
  stats: DashboardStats | null;
  selectedIncident: Incident | null;
  live: boolean;
  loading: boolean;
  error: string | null;
}

export interface WSMessage {
  type: 'incident.created' | 'incident.updated' | 'incident.status_changed' | 'event.ingested';
  incident?: Incident;
  event?: Event;
}

