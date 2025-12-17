import React from 'react';
import { Incident } from '@/types';

interface IncidentDetailsModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incident,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !incident) return null;

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts * 1000);
    return date.toLocaleString();
  };

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-muted bg-panel-2 border-panel-2';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-500/10';
      case 'ack': return 'text-yellow-400 bg-yellow-500/10';
      case 'closed': return 'text-green-400 bg-green-500/10';
      default: return 'text-muted bg-panel-2';
    }
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
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-text">Incident Details</h2>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                {incident.severity.toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                {incident.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted">
              ID: <span className="font-mono text-accentB">{incident.id}</span>
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
          {/* Title */}
          <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
            <div className="text-xs text-muted mb-2">Incident Title</div>
            <div className="text-lg font-semibold text-text">{incident.title}</div>
          </div>

          {/* Overview Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
              <div className="text-xs text-muted mb-1">Event Count</div>
              <div className="text-2xl font-bold text-accentB">{incident.event_count || incident.cluster_ids.length}</div>
            </div>

            <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
              <div className="text-xs text-muted mb-1">Clusters Involved</div>
              <div className="text-2xl font-bold text-accentC">{incident.cluster_ids.length}</div>
            </div>

            <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
              <div className="text-xs text-muted mb-1">Confidence Score</div>
              <div className="text-2xl font-bold text-accentD">
                {incident.scores.confidence ? (incident.scores.confidence * 100).toFixed(0) : 'N/A'}%
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-panel-2 rounded-lg p-3 border border-panel-2">
              <div className="text-xs text-muted mb-1">Created At</div>
              <div className="text-sm text-text">{formatTimestamp(incident.created_at)}</div>
            </div>

            <div className="bg-panel-2 rounded-lg p-3 border border-panel-2">
              <div className="text-xs text-muted mb-1">Last Updated</div>
              <div className="text-sm text-text">{formatTimestamp(incident.updated_at)}</div>
            </div>

            <div className="bg-panel-2 rounded-lg p-3 border border-panel-2">
              <div className="text-xs text-muted mb-1">Last Event</div>
              <div className="text-sm text-text">{formatTimestamp(incident.last_event_ts)}</div>
            </div>
          </div>

          {/* Entity Information */}
          <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span className="text-sm font-semibold text-text">Affected Entity</span>
            </div>
            
            {Object.keys(incident.entity).length === 0 ? (
              <div className="text-xs text-muted italic">No entity information</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(incident.entity).map(([key, value]) => (
                  <div key={key} className="bg-bg rounded p-2 border border-panel">
                    <div className="text-xs text-muted mb-1">{key}</div>
                    <div className="text-sm text-text font-mono">{String(value)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cluster IDs */}
          <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-accentC" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-semibold text-text">Event Clusters</span>
              <span className="text-xs text-muted">({incident.cluster_ids.length} clusters)</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {incident.cluster_ids.map((clusterId, idx) => (
                <div 
                  key={idx}
                  className="px-3 py-1.5 bg-accentC/10 border border-accentC/20 rounded text-xs font-mono text-accentC"
                >
                  {clusterId}
                </div>
              ))}
            </div>
          </div>

          {/* Scores */}
          <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-semibold text-text">Analysis Scores</span>
            </div>
            
            {Object.keys(incident.scores).length === 0 ? (
              <div className="text-xs text-muted italic">No scores available</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(incident.scores).map(([key, value]) => (
                  <div key={key} className="bg-bg rounded p-3 border border-panel">
                    <div className="text-xs text-muted mb-1 capitalize">{key.replace('_', ' ')}</div>
                    <div className="text-lg font-bold text-accentD">
                      {typeof value === 'number' ? value.toFixed(3) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Incident Data */}
          <div className="bg-panel-2 rounded-lg p-4 border border-panel-2">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-sm font-semibold text-text">Raw Incident Data</span>
            </div>
            
            <pre className="text-xs font-mono text-text bg-bg rounded p-3 overflow-x-auto border border-panel">
              {formatJSON({
                id: incident.id,
                status: incident.status,
                title: incident.title,
                severity: incident.severity,
                entity: incident.entity,
                cluster_ids: incident.cluster_ids,
                scores: incident.scores,
                created_at: incident.created_at,
                created_at_iso: formatTimestamp(incident.created_at),
                updated_at: incident.updated_at,
                updated_at_iso: formatTimestamp(incident.updated_at),
                last_event_ts: incident.last_event_ts,
                last_event_iso: formatTimestamp(incident.last_event_ts),
                event_count: incident.event_count,
              })}
            </pre>
          </div>

          {/* Timeline Summary */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-panel-2 rounded-lg p-3 border border-panel-2">
              <div className="text-muted mb-1">Duration</div>
              <div className="text-text font-medium">
                {Math.floor((incident.last_event_ts - incident.created_at) / 60)} minutes
              </div>
            </div>

            <div className="bg-panel-2 rounded-lg p-3 border border-panel-2">
              <div className="text-muted mb-1">Events per Cluster</div>
              <div className="text-text font-medium">
                {incident.cluster_ids.length > 0 
                  ? ((incident.event_count || incident.cluster_ids.length) / incident.cluster_ids.length).toFixed(1)
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-panel-2 flex items-center justify-between">
          <div className="text-xs text-muted">
            Incident created {formatTimestamp(incident.created_at)}
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

