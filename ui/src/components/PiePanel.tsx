import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { KPIKey } from '@/types';
import { KPI_COLORS } from '@/lib/colors';
import { formatNumber, formatPercent } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/perf';

interface PiePanelProps {
  totals: Record<KPIKey, number>;
}

const LABELS: Record<KPIKey, string> = {
  emp_office: 'Employees In Office',
  emp_remote: 'Employees Remote',
  cont_office: 'Contingents In Office',
  cont_remote: 'Contingents Remote',
};

export const PiePanel: React.FC<PiePanelProps> = ({ totals }) => {
  const chartData = (Object.entries(totals) as Array<[KPIKey, number]>)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      key,
      name: LABELS[key],
      value,
      color: KPI_COLORS[key],
    }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if segment is large enough
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#E9ECF1"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        {formatPercent(percent, 1)}
      </text>
    );
  };

  return (
    <div className="bg-panel rounded-card p-4 shadow-panel h-[220px]">
      <h3 className="text-[18px] font-medium text-text mb-4">Device Connections</h3>

      <div className="flex items-center h-[calc(100%-40px)]">
        {/* Chart */}
        <div className="flex-1 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={60}
                dataKey="value"
                isAnimationActive={!prefersReducedMotion()}
                animationDuration={300}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 ml-4">
          {chartData.map((entry) => {
            const percent = entry.value / total;
            return (
              <div key={entry.key} className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted">{entry.name}</span>
                </div>
                <div className="ml-5">
                  <span className="text-sm font-semibold text-text tabular-nums">
                    {formatNumber(entry.value)}
                  </span>
                  <span className="text-xs text-muted ml-1">
                    ({formatPercent(percent, 0)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        Device connections breakdown:
        {chartData.map((entry) => {
          const percent = entry.value / total;
          return (
            <span key={entry.key}>
              {' '}
              {entry.name}: {formatNumber(entry.value)} ({formatPercent(percent, 0)}).
            </span>
          );
        })}
      </div>
    </div>
  );
};

