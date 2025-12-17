import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/state';
import { Incident } from '@/types';
import { fetchIncidents } from '@/lib/api';
import { formatTimestamp } from '@/lib/format';
import { Header } from '@/components/Header';
import { ErrorBanner } from '@/components/ErrorBanner';

const SEVERITY_COLORS = {
  low: 'text-accentC',
  medium: 'text-warn',
  high: 'text-error',
  critical: 'text-error',
};

const SEVERITY_BG = {
  low: 'bg-accentC/10',
  medium: 'bg-warn/10',
  high: 'bg-error/10',
  critical: 'bg-error/20',
};

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { range, filters } = useAppStore();

  useEffect(() => {
    loadIncidents();
  }, [range, filters]);

  const loadIncidents = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchIncidents(range, filters);
      setIncidents(data.incidents);
    } catch (err) {
      console.error('Failed to load incidents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header activeView="executive" onViewChange={() => {}} />

      {error && (
        <ErrorBanner
          message={error}
          onRetry={loadIncidents}
          onDismiss={() => setError(null)}
        />
      )}

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                to="/device-security"
                className="text-sm text-accentB hover:text-accentC transition-colors mb-2 inline-flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-semibold text-text">Incidents</h1>
            </div>
          </div>

          {/* Table */}
          <div className="bg-panel rounded-card shadow-panel overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-muted">
                <div className="inline-block w-8 h-8 border-4 border-accentB border-t-transparent rounded-full animate-spin" />
                <div className="mt-4">Loading incidents...</div>
              </div>
            ) : incidents.length === 0 ? (
              <div className="p-12 text-center text-muted">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-muted opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-lg">No incidents found</div>
                <div className="text-sm mt-2">All systems are operating normally</div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-panel-2 border-b border-panel">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Events
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Last Update
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-panel-2">
                  {incidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="hover:bg-panel-2 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text">
                        {incident.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-text">
                        <div className="font-medium">{incident.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${SEVERITY_BG[incident.severity]} ${SEVERITY_COLORS[incident.severity]}
                          `}
                        >
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                        {incident.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text tabular-nums">
                        {incident.event_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                        {formatTimestamp(incident.last_update)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

