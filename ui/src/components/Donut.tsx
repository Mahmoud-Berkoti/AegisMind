import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Compliance } from '@/types';
import { formatPercent } from '@/lib/format';
import { COMPLIANCE_COLORS } from '@/lib/colors';
import { prefersReducedMotion } from '@/lib/perf';

interface DonutProps {
  data: Compliance;
}

export const Donut: React.FC<DonutProps> = ({ data }) => {
  const chartData = [
    { name: 'Compliant', value: data.compliant, color: COMPLIANCE_COLORS.compliant },
    { name: 'Exceptions', value: data.exceptions, color: COMPLIANCE_COLORS.exceptions },
    { name: 'Non-Compliant', value: data.non_compliant, color: COMPLIANCE_COLORS.non_compliant },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-panel rounded-card p-4 shadow-panel h-[220px]">
      <h3 className="text-[18px] font-medium text-text mb-4">Device Compliance</h3>
      
      <div className="flex items-center gap-4 h-[calc(100%-40px)]">
        {/* Chart */}
        <div className="flex-shrink-0 w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
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
        <div className="flex flex-col gap-3 flex-1">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true"
                />
                <span className="text-sm text-text">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-text tabular-nums">
                {formatPercent(entry.value, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        Device compliance breakdown: {formatPercent(data.compliant, 0)} compliant,{' '}
        {formatPercent(data.exceptions, 0)} exceptions,{' '}
        {formatPercent(data.non_compliant, 0)} non-compliant
      </div>
    </div>
  );
};

