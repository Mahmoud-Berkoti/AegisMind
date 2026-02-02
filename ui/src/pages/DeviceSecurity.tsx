import React, { useState } from 'react';
import { useAppStore } from '@/store/state';
import { Header } from '@/components/Header';
import { KpiCard } from '@/components/KpiCard';
import { Donut } from '@/components/Donut';
import { ProgressBar } from '@/components/ProgressBar';
import { TotalDevices } from '@/components/TotalDevices';
import { WorldMap } from '@/components/WorldMap';
import { Timeseries } from '@/components/Timeseries';
import { PiePanel } from '@/components/PiePanel';
import { TimePicker } from '@/components/TimePicker';
import { Filters } from '@/components/Filters';
import { Drawer } from '@/components/Drawer';
import { ErrorBanner } from '@/components/ErrorBanner';
import {
  SkeletonCard,
  SkeletonDonut,
  SkeletonProgress,
  SkeletonMap,
  SkeletonChart,
} from '@/components/Skeleton';
import { getColorForKPI } from '@/lib/colors';
import { GeoPoint, KPIKey } from '@/types';
import { formatNumber } from '@/lib/format';

export const DeviceSecurity: React.FC = () => {
  const [activeView, setActiveView] = useState<'executive' | 'network'>('executive');
  const [drawerPoint, setDrawerPoint] = useState<GeoPoint | null>(null);

  const {
    kpis,
    compliance,
    training,
    totalDevices,
    timeseries,
    geo,
    range,
    filters,
    loading,
    error,
    setRange,
    setFilters,
    loadData,
    setError,
  } = useAppStore();

  const timeseriesData = [
    { name: 'security_incidents' as const, points: timeseries.security_incidents || [] },
    { name: 'office_access' as const, points: timeseries.office_access || [] },
    { name: 'remote_access' as const, points: timeseries.remote_access || [] },
  ];

  const kpiTotals: Record<KPIKey, number> = {
    emp_office: kpis.emp_office?.value || 0,
    cont_office: kpis.cont_office?.value || 0,
    emp_remote: kpis.emp_remote?.value || 0,
    cont_remote: kpis.cont_remote?.value || 0,
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header activeView={activeView} onViewChange={setActiveView} />

      {error && (
        <ErrorBanner
          message={error}
          onRetry={loadData}
          onDismiss={() => setError(null)}
        />
      )}

      <main className="p-4">
        {/* Controls */}
        <div className="flex items-center justify-end gap-3 mb-4">
          <TimePicker value={range} onChange={(r) => setRange(r.earliest, r.latest)} />
          <Filters value={filters} onChange={setFilters} />
          
          <button
            className="flex items-center gap-2 px-4 py-2 bg-panel hover:bg-panel-2 text-text rounded-lg text-sm font-medium transition-colors border border-panel-2"
            aria-label="Live updates toggle"
          >
            <div className="w-2 h-2 rounded-full bg-accentC animate-pulse" />
            <span>Live</span>
          </button>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-grid mb-grid">
          {loading && !kpis.emp_office ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {kpis.emp_office && (
                <KpiCard kpi={kpis.emp_office} color={getColorForKPI('emp_office')} />
              )}
              {kpis.cont_office && (
                <KpiCard kpi={kpis.cont_office} color={getColorForKPI('cont_office')} />
              )}
              {kpis.emp_remote && (
                <KpiCard kpi={kpis.emp_remote} color={getColorForKPI('emp_remote')} />
              )}
              {kpis.cont_remote && (
                <KpiCard kpi={kpis.cont_remote} color={getColorForKPI('cont_remote')} />
              )}
            </>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-grid">
          {/* Left Sidebar */}
          <div className="xl:col-span-3 space-y-grid">
            {loading && !compliance.compliant ? (
              <>
                <SkeletonDonut />
                <SkeletonProgress />
                <SkeletonCard />
              </>
            ) : (
              <>
                <Donut data={compliance} />
                <ProgressBar data={training} />
                <TotalDevices total={totalDevices} />
              </>
            )}
          </div>

          {/* Map */}
          <div className="xl:col-span-9">
            {loading && geo.length === 0 ? (
              <SkeletonMap />
            ) : (
              <WorldMap
                points={geo}
                filters={filters}
                onPointClick={setDrawerPoint}
              />
            )}
          </div>
        </div>

        {/* Bottom Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-grid mt-grid">
          <div className="xl:col-span-8">
            {loading && timeseriesData[0].points.length === 0 ? (
              <SkeletonChart />
            ) : (
              <Timeseries series={timeseriesData} range={range} />
            )}
          </div>

          <div className="xl:col-span-4">
            {loading && totalDevices === 0 ? (
              <SkeletonChart />
            ) : (
              <PiePanel totals={kpiTotals} />
            )}
          </div>
        </div>
      </main>

      {/* Drawer for location details */}
      <Drawer
        title={drawerPoint?.name || 'Location Details'}
        open={!!drawerPoint}
        onClose={() => setDrawerPoint(null)}
      >
        {drawerPoint && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Device Breakdown</h3>
              <div className="space-y-3">
                {(Object.entries(drawerPoint.segments) as Array<[KPIKey, number]>).map(
                  ([key, value]) => {
                    const total = Object.values(drawerPoint.segments).reduce(
                      (sum, val) => sum + val,
                      0
                    );
                    const percent = total > 0 ? (value / total) * 100 : 0;
                    return (
                      <div key={key} className="bg-panel rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted capitalize">
                            {key.replace('_', ' ')}
                          </span>
                          <span className="text-lg font-semibold text-text tabular-nums">
                            {formatNumber(value)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-panel-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: getColorForKPI(key),
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Recent Incidents</h3>
              <div className="text-sm text-muted text-center py-8 bg-panel rounded-lg">
                No recent incidents for this location
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

