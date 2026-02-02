import React from 'react';
import { useAppStore } from '@/store/state';
import { Severity, IncidentStatus, Event, Incident } from '@/types';
import { formatTimestamp, formatNumber } from '@/lib/format';
import { ErrorBanner } from '@/components/ErrorBanner';
import { SystemControls } from '@/components/SystemControls';
import { EventDetailsModal } from '@/components/EventDetailsModal';
import { IncidentDetailsModal } from '@/components/IncidentDetailsModal';

const SEVERITY_COLORS: Record<Severity, string> = {
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  open: 'bg-red-500/10 text-red-400',
  ack: 'bg-yellow-500/10 text-yellow-400',
  closed: 'bg-green-500/10 text-green-400',
};

interface IncidentDashboardProps {
  onBackToHome?: () => void;
}

export const IncidentDashboard: React.FC<IncidentDashboardProps> = ({ onBackToHome }) => {
  const {
    incidents,
    recentEvents,
    stats,
    loading,
    error,
    live,
    toggleLive,
    loadData,
    setError,
    selectIncident,
  } = useAppStore();

  const [showControls, setShowControls] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between bg-panel border-b border-panel-2">
        <div className="flex items-center gap-4">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-panel-2 rounded-lg transition-colors"
              title="Back to Home"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Home</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <h1 className="text-[28px] font-semibold text-text">AegisMind SIEM</h1>
          </div>
          <span className="text-sm text-muted">Incident Management</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowControls(!showControls)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-panel-2 text-text hover:bg-panel transition-all"
            title="System Controls"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Controls</span>
          </button>

          <button
            onClick={toggleLive}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${live ? 'bg-accentC text-white' : 'bg-panel-2 text-muted hover:bg-panel hover:text-text'}
            `}
          >
            <div className={`w-2 h-2 rounded-full ${live ? 'bg-white animate-pulse' : 'bg-muted'}`} />
            <span>{live ? 'Live' : 'Paused'}</span>
          </button>
        </div>
      </header>

      {error && (
        <ErrorBanner message={error} onRetry={loadData} onDismiss={() => setError(null)} />
      )}

      <main className="p-6 max-w-[1800px] mx-auto">
        {/* System Controls Panel */}
        {showControls && (
          <div className="mb-6 animate-in slide-in-from-top duration-200">
            <SystemControls />
          </div>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-panel rounded-lg p-4 border border-panel-2">
              <div className="text-sm text-muted mb-1">Total Incidents</div>
              <div className="text-3xl font-semibold text-text tabular-nums">
                {stats.total_incidents}
              </div>
            </div>

            <div className="bg-panel rounded-lg p-4 border border-panel-2">
              <div className="text-sm text-muted mb-1">Open Incidents</div>
              <div className="text-3xl font-semibold text-warn tabular-nums">
                {stats.open_incidents}
              </div>
            </div>

            <div className="bg-panel rounded-lg p-4 border border-panel-2">
              <div className="text-sm text-muted mb-1">Critical</div>
              <div className="text-3xl font-semibold text-error tabular-nums">
                {stats.critical_incidents}
              </div>
            </div>

            <div className="bg-panel rounded-lg p-4 border border-panel-2">
              <div className="text-sm text-muted mb-1">Events/Hour</div>
              <div className="text-3xl font-semibold text-accentB tabular-nums">
                {formatNumber(stats.events_last_hour)}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Incidents List */}
          <div className="xl:col-span-2">
            <div className="bg-panel rounded-lg border border-panel-2">
              <div className="px-6 py-4 border-b border-panel-2">
                <h2 className="text-lg font-semibold text-text">Recent Incidents</h2>
              </div>
              
              <div className="divide-y divide-panel-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {loading && incidents.length === 0 ? (
                  <div className="p-12 text-center text-muted">
                    <div className="inline-block w-8 h-8 border-4 border-accentB border-t-transparent rounded-full animate-spin" />
                    <div className="mt-4">Loading incidents...</div>
                  </div>
                ) : incidents.length === 0 ? (
                  <div className="p-12 text-center text-muted">
                    <svg className="w-16 h-16 mx-auto mb-4 text-accentC" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>No incidents found</div>
                  </div>
                ) : (
                  incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="p-4 hover:bg-panel-2 cursor-pointer transition-colors group"
                      onClick={() => setSelectedIncident(incident)}
                      title="Click to view incident details"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`
                                px-2 py-0.5 rounded text-xs font-medium uppercase border
                                ${SEVERITY_COLORS[incident.severity]}
                              `}
                            >
                              {incident.severity}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${STATUS_COLORS[incident.status]}`}
                            >
                              {incident.status}
                            </span>
                            <span className="text-xs text-muted font-mono">
                              {incident.id.slice(0, 12)}...
                            </span>
                          </div>

                          <h3 className="text-text font-medium mb-1 truncate group-hover:text-accentB transition-colors">
                            {incident.title}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span>Host: {incident.entity.host || 'unknown'}</span>
                            <span>Events: {incident.event_count || incident.cluster_ids.length}</span>
                            <span>Confidence: {(incident.scores.confidence * 100).toFixed(0)}%</span>
                          </div>

                          <div className="mt-2 text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View details</span>
                          </div>
                        </div>

                        <div className="text-right text-xs text-muted whitespace-nowrap">
                          {formatTimestamp(incident.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Event Stream - Coming Soon */}
          <div>
            <div className="bg-panel rounded-lg border border-panel-2">
              <div className="px-6 py-4 border-b border-panel-2">
                <h2 className="text-lg font-semibold text-text">Event Stream</h2>
              </div>
              
              <div className="divide-y divide-panel-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {recentEvents.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div className="text-sm text-muted mb-2">Event Stream</div>
                    <div className="text-xs text-muted">
                      Add <span className="text-accentB font-mono">GET /events</span> endpoint to your backend to see live events here
                    </div>
                  </div>
                ) : (
                  recentEvents.map((event, idx) => (
                    <div 
                      key={`${event.trace_id}-${idx}`} 
                      className="p-3 hover:bg-panel-2 transition-colors cursor-pointer group"
                      onClick={() => setSelectedEvent(event)}
                      title="Click to view event details"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-mono text-accentB group-hover:text-accentB/80">
                          {event.source}
                        </span>
                        <span className="text-xs text-muted">
                          {formatTimestamp(event.ts)}
                        </span>
                      </div>

                      <div className="text-sm text-text mb-1 group-hover:text-accentB transition-colors">
                        {event.host}
                      </div>

                      <div className="text-xs text-muted font-mono">
                        {event.fingerprint.slice(0, 16)}...
                      </div>

                      {event.incident_id && (
                        <div className="mt-1 text-xs text-accentC">
                          → Incident {event.incident_id.slice(0, 8)}...
                        </div>
                      )}

                      <div className="mt-2 text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View details</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Incident Details Modal */}
      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={selectedIncident !== null}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
};

