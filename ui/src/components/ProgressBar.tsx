import React, { useEffect, useRef, useState } from 'react';
import { Training } from '@/types';
import { formatPercent, clamp } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/perf';

interface ProgressBarProps {
  data: Training;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ data }) => {
  const [displayPercent, setDisplayPercent] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayPercent(data.percent);
      return;
    }

    const duration = 300;
    const start = displayPercent;
    const change = data.percent - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPercent(start + change * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [data.percent]);

  const percentValue = clamp(displayPercent * 100, 0, 100);
  const markerPosition = clamp(percentValue, 0, 100);

  return (
    <div className="bg-panel rounded-card p-4 shadow-panel h-[120px]">
      <h3 className="text-[18px] font-medium text-text mb-4">Security Training Completion</h3>
      
      <div className="relative pt-6">
        {/* Progress bar background */}
        <div className="w-full h-3 bg-panel-2 rounded-md overflow-hidden">
          {/* Filled portion */}
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-accentA to-accentB rounded-md transition-all duration-300"
            style={{ width: `${percentValue}%` }}
            role="progressbar"
            aria-valuenow={Math.round(percentValue)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Security training completion: ${Math.round(percentValue)}%`}
          />
        </div>

        {/* Marker and label */}
        <div
          className="absolute top-0 flex flex-col items-center transition-all duration-300"
          style={{ left: `${markerPosition}%`, transform: 'translateX(-50%)' }}
        >
          <span className="text-[18px] font-semibold text-text tabular-nums mb-1">
            {Math.round(percentValue)}%
          </span>
          <div className="w-0.5 h-2 bg-text rounded-full" />
        </div>
      </div>

      {/* Additional context */}
      <div className="mt-4 text-xs text-muted">
        {percentValue >= 80 ? (
          <span className="text-accentC">✓ Target achieved</span>
        ) : percentValue >= 60 ? (
          <span className="text-warn">⚠ Approaching target</span>
        ) : (
          <span className="text-error">⚠ Below target</span>
        )}
      </div>
    </div>
  );
};

