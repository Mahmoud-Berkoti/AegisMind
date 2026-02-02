import React, { useState, useEffect } from 'react';

interface SystemStatus {
  mongodb: 'running' | 'stopped' | 'unknown';
  backend: 'running' | 'stopped' | 'unknown';
  mockMode: boolean;
}

export const SystemControls: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    mongodb: 'unknown',
    backend: 'unknown',
    mockMode: import.meta.env.VITE_MOCK === 'true',
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      // Check backend
      const backendResponse = await fetch('/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      }).catch(() => null);
      
      setStatus(prev => ({
        ...prev,
        backend: backendResponse?.ok ? 'running' : 'stopped',
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, backend: 'stopped' }));
    }
  };

  const handleDockerCommand = async (command: 'start' | 'stop' | 'restart') => {
    setLoading(command);
    setMessage(null);

    try {
      const response = await fetch(`/api/docker/${command}`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`${data.message || 'Command executed successfully'}`);
        setTimeout(checkStatus, 2000);
      } else {
        setMessage(`Error: ${data.error || 'Command failed'}`);
      }
    } catch (error) {
      // Docker control not available in browser, show manual instructions
      showManualInstructions(command);
    } finally {
      setLoading(null);
    }
  };

  const showManualInstructions = (command: string) => {
    const commands: Record<string, string> = {
      start: 'docker start siem-mongodb',
      stop: 'docker stop siem-mongodb',
      restart: 'docker restart siem-mongodb',
    };

    const cmd = commands[command];
    setMessage(`Run this command in PowerShell:\n${cmd}`);
    
    // Copy to clipboard
    navigator.clipboard.writeText(cmd);
  };

  const StatusBadge: React.FC<{ status: string; label: string }> = ({ status, label }) => {
    const colors = {
      running: 'bg-green-500/20 text-green-400 border-green-500/30',
      stopped: 'bg-red-500/20 text-red-400 border-red-500/30',
      unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors[status as keyof typeof colors]}`}>
        <div className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs opacity-75 capitalize">{status}</span>
      </div>
    );
  };

  return (
    <div className="bg-panel rounded-lg border border-panel-2 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">System Controls</h3>
        <button
          onClick={checkStatus}
          className="text-xs text-accentB hover:text-accentC transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatusBadge status={status.backend} label="C++ Backend" />
        <StatusBadge 
          status={status.mockMode ? 'running' : 'stopped'} 
          label="Mock Mode" 
        />
      </div>

      {/* Docker Controls */}
      <div className="space-y-3">
        <div className="text-sm text-muted mb-2">MongoDB Container:</div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleDockerCommand('start')}
            disabled={loading !== null}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1
              ${loading === 'start' ? 'bg-accentC/20 text-accentC' : 'bg-accentC/10 text-accentC hover:bg-accentC/20'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading === 'start' ? (
              <span className="inline-block w-4 h-4 border-2 border-accentC border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            Start
          </button>

          <button
            onClick={() => handleDockerCommand('stop')}
            disabled={loading !== null}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1
              ${loading === 'stop' ? 'bg-error/20 text-error' : 'bg-error/10 text-error hover:bg-error/20'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading === 'stop' ? (
              <span className="inline-block w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
            )}
            Stop
          </button>

          <button
            onClick={() => handleDockerCommand('restart')}
            disabled={loading !== null}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1
              ${loading === 'restart' ? 'bg-warn/20 text-warn' : 'bg-warn/10 text-warn hover:bg-warn/20'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading === 'restart' ? (
              <span className="inline-block w-4 h-4 border-2 border-warn border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Restart
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`
            p-3 rounded-lg text-sm whitespace-pre-line
            ${message.includes('successfully') || message.includes('started') || message.includes('stopped') || message.includes('restarted') 
              ? 'bg-accentC/10 text-accentC border border-accentC/20' : 
              message.includes('failed') || message.includes('error')
              ? 'bg-error/10 text-error border border-error/20' : 
              'bg-accentB/10 text-accentB border border-accentB/20'}
          `}>
            {message.replace('✅ ', '').replace('❌ ', '').replace('💡 ', '')}
            {message.includes('Run this command') && (
              <div className="mt-2 text-xs opacity-75">
                Command copied to clipboard
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-3 border-t border-panel-2">
          <div className="text-xs text-muted mb-2">Quick Actions:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText('docker ps');
                setMessage('💡 Copied: docker ps');
              }}
              className="px-2 py-1 bg-panel-2 hover:bg-panel text-xs text-muted hover:text-text rounded transition-colors"
            >
              Check Status
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText('docker logs siem-mongodb --tail 50');
                setMessage('💡 Copied: docker logs siem-mongodb --tail 50');
              }}
              className="px-2 py-1 bg-panel-2 hover:bg-panel text-xs text-muted hover:text-text rounded transition-colors"
            >
              View Logs
            </button>
            <button
              onClick={() => {
                window.open('http://localhost:27017', '_blank');
              }}
              className="px-2 py-1 bg-panel-2 hover:bg-panel text-xs text-muted hover:text-text rounded transition-colors"
            >
              Open MongoDB
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="pt-3 border-t border-panel-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Current Mode:</span>
            <span className={`text-sm font-medium ${status.mockMode ? 'text-warn' : 'text-accentC'}`}>
              {status.mockMode ? 'Mock Data' : 'Live Backend'}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted">
            {status.mockMode ? (
              <>To use real backend: Set <code className="text-accentB">VITE_MOCK=false</code> in .env and restart</>
            ) : (
              <>Using live backend at <code className="text-accentB">localhost:8080</code></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

