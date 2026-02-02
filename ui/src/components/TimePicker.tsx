import React, { useState } from 'react';
import { TimeRange } from '@/types';

interface TimePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const PRESETS = [
  { label: 'Last 15 minutes', earliest: '-15m', latest: 'now' },
  { label: 'Last hour', earliest: '-1h', latest: 'now' },
  { label: 'Last 4 hours', earliest: '-4h', latest: 'now' },
  { label: 'Last 24 hours', earliest: '-24h', latest: 'now' },
  { label: 'Last 7 days', earliest: '-7d', latest: 'now' },
  { label: 'Last 30 days', earliest: '-30d', latest: 'now' },
];

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel =
    PRESETS.find((p) => p.earliest === value.earliest && p.latest === value.latest)?.label ||
    'Custom range';

  const handleSelect = (preset: typeof PRESETS[0]) => {
    onChange({ earliest: preset.earliest, latest: preset.latest });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-panel hover:bg-panel-2 text-text rounded-lg text-sm font-medium transition-colors border border-panel-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>{currentLabel}</span>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div
            className="absolute top-full mt-2 right-0 bg-panel-2 border border-panel rounded-lg shadow-panel z-20 min-w-[200px] overflow-hidden"
            role="listbox"
          >
            {PRESETS.map((preset) => {
              const isSelected =
                preset.earliest === value.earliest && preset.latest === value.latest;
              return (
                <button
                  key={preset.label}
                  onClick={() => handleSelect(preset)}
                  className={`
                    w-full px-4 py-2 text-left text-sm hover:bg-panel transition-colors
                    ${isSelected ? 'bg-accentA text-white' : 'text-text'}
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

