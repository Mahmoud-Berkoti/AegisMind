import React from 'react';

interface HeaderProps {
  activeView: 'executive' | 'network';
  onViewChange: (view: 'executive' | 'network') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onViewChange }) => {
  return (
    <header className="h-16 px-6 flex items-center justify-between bg-panel border-b border-panel-2">
      <h1 className="text-[28px] font-semibold text-text">Employee Device Security</h1>
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => onViewChange('executive')}
          aria-pressed={activeView === 'executive'}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-150
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accentB
            ${
              activeView === 'executive'
                ? 'bg-accentA text-white'
                : 'bg-panel-2 text-muted hover:bg-panel hover:text-text'
            }
          `}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="opacity-80">
            <path
              d="M3 4h14M3 10h14M3 16h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Executive View</span>
        </button>

        <button
          onClick={() => onViewChange('network')}
          aria-pressed={activeView === 'network'}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-150
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accentB
            ${
              activeView === 'network'
                ? 'bg-accentB text-white'
                : 'bg-panel-2 text-muted hover:bg-panel hover:text-text'
            }
          `}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="opacity-80">
            <circle cx="10" cy="4" r="2" fill="currentColor" />
            <circle cx="4" cy="16" r="2" fill="currentColor" />
            <circle cx="16" cy="16" r="2" fill="currentColor" />
            <path
              d="M10 6v4M10 10l-5 4M10 10l5 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Network Access</span>
        </button>
      </div>
    </header>
  );
};

