import React from 'react';
import { Event } from '@/types';

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !event) return null;

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts * 1000);
    return date.toLocaleString();
  };

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-panel-2 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-panel-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text">Event Details</h2>
            <p className="text-sm text-muted mt-1">
              Trace ID: <span className="font-mono text-accentB">{event.trace_id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-panel-2 transition-colors text-muted hover:text-text"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overview Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
              <div className="text-xs text-muted mb-1">Timestamp</div>
              <div className="text-sm text-text font-medium">{formatTimestamp(event.ts)}</div>
            </div>

            <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
              <div className="text-xs text-muted mb-1">Source</div>
              <div className="text-sm text-accentB font-mono font-medium">{event.source}</div>
            </div>

            <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
              <div className="text-xs text-muted mb-1">Host</div>
              <div className="text-sm text-text font-medium">{event.host}</div>
            </div>

            <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
              <div className="text-xs text-muted mb-1">Fingerprint</div>
              <div className="text-sm text-accentC font-mono break-all">{event.fingerprint}</div>
            </div>
          </div>

          {/* Incident Link */}
          {event.incident_id && (
            <div className="bg-accentC/10 border border-accentC/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-accentC" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                <span className="text-xs text-muted">Correlated Incident</span>
              </div>
              <div className="text-sm text-accentC font-mono">{event.incident_id}</div>
            </div>
          )}

          {/* Cluster ID */}
          {event.cluster_id && (
            <div className="bg-accentB/10 border border-accentB/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-accentB" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-xs text-muted">Cluster ID</span>
              </div>
              <div className="text-sm text-accentB font-mono">{event.cluster_id}</div>
            </div>
          )}

          {/* Event Features */}
          <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-semibold text-text">Extracted Features</span>
            </div>
            
            {Object.keys(event.features).length === 0 ? (
              <div className="text-xs text-muted italic">No features extracted</div>
            ) : (
              <pre className="text-xs font-mono text-text bg-bg rounded p-3 overflow-x-auto border border-panel">
                {formatJSON(event.features)}
              </pre>
            )}
          </div>

          {/* Raw Event Log */}
          <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-sm font-semibold text-text">Raw Event Data</span>
            </div>
            
            <pre className="text-xs font-mono text-text bg-bg rounded p-3 overflow-x-auto border border-panel">
              {formatJSON({
                trace_id: event.trace_id,
                timestamp: event.ts,
                timestamp_iso: formatTimestamp(event.ts),
                source: event.source,
                host: event.host,
                fingerprint: event.fingerprint,
                cluster_id: event.cluster_id || null,
                incident_id: event.incident_id || null,
                features: event.features,
              })}
            </pre>
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-panel-2 rounded-lg p-3 border border-panel-2">
              <div className="text-muted mb-1">Processing Status</div>
              <div className="text-text font-medium">
                {event.incident_id ? 'Correlated' : event.cluster_id ? 'Clustered' : 'Normalized'}
              </div>
            </div>

            <div className="bg-panel-2 rounded-lg p-3 border border-panel-2">
              <div className="text-muted mb-1">Feature Count</div>
              <div className="text-text font-medium">{Object.keys(event.features).length}</div>
            </div>

            <div className="bg-panel-2 rounded-lg p-3 border border-panel-2">
              <div className="text-muted mb-1">Source Type</div>
              <div className="text-text font-medium">
                {event.source === 'fw' && 'Firewall'}
                {event.source === 'ids' && 'IDS/IPS'}
                {event.source === 'app' && 'Application'}
                {event.source === 'endpoint' && 'Endpoint'}
                {event.source === 'auth' && 'Authentication'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-panel-2 flex items-center justify-between">
          <div className="text-xs text-muted">
            Event captured at {formatTimestamp(event.ts)}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-accentB/10 text-accentB hover:bg-accentB/20 transition-all text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

