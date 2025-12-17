import React, { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/perf';

interface DrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ title, open, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const animationClass = prefersReducedMotion() ? '' : 'transition-transform duration-180';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-panel-2 shadow-panel z-50
          ${animationClass}
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-panel">
          <h2 id="drawer-title" className="text-xl font-semibold text-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-panel rounded-lg transition-colors text-muted hover:text-text"
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-64px)]">{children}</div>
      </div>
    </>
  );
};

