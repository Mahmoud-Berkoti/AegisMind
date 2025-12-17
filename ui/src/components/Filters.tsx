import React, { useState } from 'react';
import { Filters as FiltersType } from '@/types';

interface FiltersProps {
  value: FiltersType;
  onChange: (filters: FiltersType) => void;
}

export const Filters: React.FC<FiltersProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = [
    ...value.group,
    ...value.country,
    ...value.deviceType,
    ...value.compliance,
  ].length;

  const handleClear = () => {
    onChange({ group: [], country: [], deviceType: [], compliance: [] });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-panel hover:bg-panel-2 text-text rounded-lg text-sm font-medium transition-colors border border-panel-2"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-accentA text-white text-xs rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Filters panel */}
          <div
            className="absolute top-full mt-2 right-0 bg-panel-2 border border-panel rounded-lg shadow-panel z-20 w-80 overflow-hidden"
            role="dialog"
            aria-label="Filter options"
          >
            <div className="p-4 border-b border-panel flex items-center justify-between">
              <h3 className="font-semibold text-text">Filters</h3>
              {activeCount > 0 && (
                <button
                  onClick={handleClear}
                  className="text-sm text-accentB hover:text-accentC transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="text-sm text-muted text-center py-8">
                Filter controls coming soon
                <div className="mt-2 text-xs">
                  Host group, country, device type, compliance state
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

