import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-panel rounded-card p-4 shadow-panel h-[120px]">
    <div className="h-4 w-32 bg-panel-2 skeleton rounded mb-3" />
    <div className="h-10 w-24 bg-panel-2 skeleton rounded mb-2" />
    <div className="h-12 bg-panel-2 skeleton rounded" />
  </div>
);

export const SkeletonDonut: React.FC = () => (
  <div className="bg-panel rounded-card p-4 shadow-panel h-[220px]">
    <div className="h-5 w-40 bg-panel-2 skeleton rounded mb-4" />
    <div className="flex items-center gap-4">
      <div className="w-32 h-32 bg-panel-2 skeleton rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-panel-2 skeleton rounded" />
        <div className="h-4 bg-panel-2 skeleton rounded" />
        <div className="h-4 bg-panel-2 skeleton rounded w-3/4" />
      </div>
    </div>
  </div>
);

export const SkeletonMap: React.FC = () => (
  <div className="bg-panel rounded-card shadow-panel h-full min-h-[420px] relative overflow-hidden">
    <div className="absolute inset-0 bg-panel-2 skeleton" />
    <div className="absolute inset-0 flex items-center justify-center gap-8">
      <div className="w-16 h-16 bg-panel skeleton rounded-full" />
      <div className="w-20 h-20 bg-panel skeleton rounded-full" />
      <div className="w-12 h-12 bg-panel skeleton rounded-full" />
    </div>
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="bg-panel rounded-card p-4 shadow-panel h-[220px]">
    <div className="h-5 w-48 bg-panel-2 skeleton rounded mb-4" />
    <div className="h-[calc(100%-40px)] bg-panel-2 skeleton rounded" />
  </div>
);

export const SkeletonProgress: React.FC = () => (
  <div className="bg-panel rounded-card p-4 shadow-panel h-[120px]">
    <div className="h-5 w-56 bg-panel-2 skeleton rounded mb-4" />
    <div className="h-3 bg-panel-2 skeleton rounded mb-2" />
    <div className="h-3 w-20 bg-panel-2 skeleton rounded" />
  </div>
);

