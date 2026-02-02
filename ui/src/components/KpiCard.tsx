import React, { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { KPI } from '@/types';
import { formatNumber, formatDelta } from '@/lib/format';
import { hexToRgba } from '@/lib/colors';
import { prefersReducedMotion } from '@/lib/perf';

interface KpiCardProps {
  kpi: KPI;
  color: string;
  onClick?: (key: KPI['key']) => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({ kpi, color, onClick }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Animated counter
  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayValue(kpi.value);
      return;
    }

    const duration = 200;
    const start = displayValue;
    const change = kpi.value - start;
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
  }, [kpi.value]);

  const chartData = kpi.series.map(([ts, val]) => ({ ts, val }));
  const isDeltaPositive = kpi.delta > 0;
  const isDeltaNegative = kpi.delta < 0;

  const handleClick = () => {
    if (onClick) {
      onClick(kpi.key);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      ref={cardRef}
      className={`
        bg-panel rounded-card p-4 shadow-panel
        transition-all duration-150
        ${onClick ? 'cursor-pointer hover:bg-panel-2' : ''}
      `}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={`${kpi.title}: ${formatNumber(kpi.value)}, ${formatDelta(kpi.delta)}`}
    >
      <div className="flex flex-col h-full">
        {/* Title */}
        <h3 className="text-sm text-muted font-medium mb-2">{kpi.title}</h3>

        {/* Value and Delta */}
        <div className="flex items-baseline gap-3 mb-3">
          <span
            className="text-[44px] font-semibold text-text tabular-nums leading-none"
            style={{ color }}
          >
            {formatNumber(displayValue)}
          </span>
          
          {kpi.delta !== 0 && (
            <div className="flex items-center gap-1">
              <span className={`text-sm ${isDeltaPositive ? 'text-accentC' : isDeltaNegative ? 'text-error' : 'text-muted'}`}>
                {isDeltaPositive ? '▲' : isDeltaNegative ? '▼' : ''}
              </span>
              <span className={`text-sm tabular-nums ${isDeltaPositive ? 'text-accentC' : isDeltaNegative ? 'text-error' : 'text-muted'}`}>
                {formatDelta(kpi.delta)}
              </span>
            </div>
          )}
        </div>

        {/* Sparkline */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke={color}
                fill={`url(#gradient-${kpi.key})`}
                strokeWidth={1.5}
                isAnimationActive={!prefersReducedMotion()}
                animationDuration={150}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

