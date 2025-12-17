import { Incident, Event, DashboardStats, Severity, IncidentStatus } from '@/types';

// Realistic security incident types
const INCIDENT_TITLES = [
  'Multiple failed SSH login attempts from {ip}',
  'Suspicious outbound traffic detected on {host}',
  'Malware signature detected on {host}',
  'Port scan activity from {ip}',
  'SQL injection attempt detected',
  'Unusual privilege escalation on {host}',
  'DDoS attack detected from multiple sources',
  'Brute force attack on web application',
  'Data exfiltration attempt blocked',
  'Unauthorized access to sensitive files on {host}',
  'Ransomware behavior detected on {host}',
  'C2 communication attempt blocked',
];

const HOSTS = ['srv-web-01', 'srv-db-02', 'srv-api-03', 'wks-dev-15', 'wks-admin-07', 'fw-edge-01'];
const SOURCES = ['fw', 'ids', 'app', 'endpoint', 'auth'];
const IPS = ['192.168.1.100', '10.0.2.45', '172.16.5.89', '203.0.113.42', '198.51.100.78'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIncidentTitle(): string {
  const template = randomElement(INCIDENT_TITLES);
  return template
    .replace('{host}', randomElement(HOSTS))
    .replace('{ip}', randomElement(IPS));
}

function generateEvents(count: number, incidentId?: string): Event[] {
  const events: Event[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const ts = now - (count - i) * 60000; // 1 minute apart
    events.push({
      ts,
      source: randomElement(SOURCES),
      host: randomElement(HOSTS),
      trace_id: `trace_${Math.random().toString(36).substr(2, 9)}`,
      fingerprint: `fp_${Math.random().toString(36).substr(2, 12)}`,
      features: {
        proto: Math.random() > 0.5 ? 'tcp' : 'udp',
        dport: Math.floor(Math.random() * 65535),
        bytes: Math.floor(Math.random() * 10000),
        packets: Math.floor(Math.random() * 100),
      },
      cluster_id: incidentId ? `cluster_${incidentId}` : undefined,
      incident_id: incidentId,
    });
  }

  return events;
}

export function generateMockIncidents(count: number = 20): Incident[] {
  const incidents: Incident[] = [];
  const now = Date.now();
  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];
  const statuses: IncidentStatus[] = ['open', 'ack', 'closed'];

  for (let i = 0; i < count; i++) {
    const id = `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const created_at = now - (count - i) * 600000; // 10 minutes apart
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    incidents.push({
      id,
      status,
      title: generateIncidentTitle(),
      severity,
      entity: {
        host: randomElement(HOSTS),
        ip: randomElement(IPS),
      },
      cluster_ids: [`cluster_${id}`],
      scores: {
        anomaly: Math.random(),
        confidence: 0.7 + Math.random() * 0.3,
      },
      created_at,
      updated_at: created_at + Math.floor(Math.random() * 300000),
      last_event_ts: created_at + Math.floor(Math.random() * 600000),
      event_count: Math.floor(Math.random() * 50) + 5,
    });
  }

  return incidents.sort((a, b) => b.created_at - a.created_at);
}

export function generateMockStats(incidents: Incident[]): DashboardStats {
  const stats: DashboardStats = {
    total_incidents: incidents.length,
    open_incidents: incidents.filter(i => i.status === 'open').length,
    critical_incidents: incidents.filter(i => i.severity === 'critical').length,
    events_last_hour: Math.floor(Math.random() * 1000) + 500,
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
    top_hosts: HOSTS.slice(0, 5).map(host => ({
      host,
      count: Math.floor(Math.random() * 20) + 5,
    })),
    event_sources: SOURCES.map(source => ({
      source,
      count: Math.floor(Math.random() * 100) + 50,
    })),
  };

  return stats;
}

// Generate initial mock data
export const mockIncidents = generateMockIncidents(25);
export const mockEvents = generateEvents(100);
export const mockStats = generateMockStats(mockIncidents);
