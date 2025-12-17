import React, { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/perf';

interface TotalDevicesProps {
  total: number;
}

export const TotalDevices: React.FC<TotalDevicesProps> = ({ total }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayValue(total);
      return;
    }

    const duration = 300;
    const start = displayValue;
    const change = total - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + change * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [total]);

  return (
    <div className="bg-panel rounded-card p-4 shadow-panel h-[120px] flex flex-col items-center justify-center">
      <div className="flex items-center gap-3 mb-2">
        <svg className="w-12 h-12 text-accentB" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6h.01"
          />
        </svg>
        <div className="text-[44px] font-semibold text-text tabular-nums leading-none">
          {formatNumber(displayValue)}
        </div>
      </div>
      <div className="text-sm text-muted">Total Devices</div>
    </div>
  );
};

