import React from 'react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, onDismiss }) => {
  return (
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-error/90 backdrop-blur-sm text-white rounded-lg p-4 shadow-panel flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium">{message}</p>
        </div>

        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

