import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { TimeseriesData, TimeRange } from '@/types';
import { TIMESERIES_COLORS } from '@/lib/colors';
import { formatTimeAxis, formatTimeShort, formatNumber } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/perf';

interface TimeseriesProps {
  series: TimeseriesData[];
  range: TimeRange;
}

export const Timeseries: React.FC<TimeseriesProps> = ({ series, range }) => {
  // Merge all series into a single array of data points
  const mergedData: Array<{
    ts: number;
    security_incidents?: number;
    office_access?: number;
    remote_access?: number;
  }> = [];

  // Get all unique timestamps
  const timestamps = new Set<number>();
  series.forEach((s) => {
    s.points.forEach(([ts]) => timestamps.add(ts));
  });

  // Sort timestamps
  const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);

  // Build merged data
  sortedTimestamps.forEach((ts) => {
    const dataPoint: any = { ts };
    series.forEach((s) => {
      const point = s.points.find(([t]) => t === ts);
      if (point) {
        dataPoint[s.name] = point[1];
      }
    });
    mergedData.push(dataPoint);
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    return (
      <div className="bg-panel-2 border border-panel text-text rounded-lg p-3 shadow-panel">
        <div className="font-semibold mb-2 text-sm">{formatTimeAxis(label)}</div>
        <div className="space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted capitalize">
                  {entry.dataKey.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="tabular-nums font-semibold">{formatNumber(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-panel rounded-card p-4 shadow-panel h-[220px]">
      <h3 className="text-[18px] font-medium text-text mb-4">
        Remote Workers and Security Incidents
      </h3>

      <div className="h-[calc(100%-40px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3E" vertical={false} />
            <XAxis
              dataKey="ts"
              tickFormatter={formatTimeShort}
              stroke="#8A90A2"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <YAxis
              stroke="#8A90A2"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            <Brush
              dataKey="ts"
              height={20}
              stroke="#7C5CFF"
              fill="#1A1F2B"
              tickFormatter={formatTimeShort}
              travellerWidth={8}
            />

            {series.map((s) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={TIMESERIES_COLORS[s.name]}
                strokeWidth={1}
                dot={false}
                isAnimationActive={!prefersReducedMotion()}
                animationDuration={300}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        <h4>Time series data:</h4>
        <ul>
          {series.map((s) => {
            const total = s.points.reduce((sum, [, val]) => sum + val, 0);
            const avg = s.points.length > 0 ? total / s.points.length : 0;
            return (
              <li key={s.name}>
                {s.name.replace(/_/g, ' ')}: average {formatNumber(Math.round(avg))}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

