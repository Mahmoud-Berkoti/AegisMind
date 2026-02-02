import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GeoPoint, KPIKey, Filters } from '@/types';
import { KPI_COLORS } from '@/lib/colors';
import { formatNumber, formatPercent } from '@/lib/format';
import { rafThrottle } from '@/lib/perf';

interface WorldMapProps {
  points: GeoPoint[];
  filters: Filters;
  onPointClick?: (point: GeoPoint) => void;
}

interface PieMarker {
  point: GeoPoint;
  x: number;
  y: number;
  radius: number;
  bounds: { x1: number; y1: number; x2: number; y2: number };
}

export const WorldMap: React.FC<WorldMapProps> = ({ points, filters, onPointClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const markers = useRef<PieMarker[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<GeoPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap',
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#1A1F2B',
            },
          },
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 22,
            paint: {
              'raster-opacity': 0.3,
            },
          },
        ],
      },
      center: [20, 30],
      zoom: 1.5,
      minZoom: 1,
      maxZoom: 6,
    });

    // Add custom canvas layer for markers
    map.current.on('load', () => {
      if (!map.current) return;

      const canvas = document.createElement('canvas');
      canvasRef.current = canvas;

      const customLayer: maplibregl.CustomLayerInterface = {
        id: 'pie-markers',
        type: 'custom',
        onAdd: function () {
          // Initialization
        },
        render: function () {
          if (!map.current || !canvasRef.current) return;
          drawMarkers();
        },
      };

      map.current.addLayer(customLayer);
    });

    // Mouse move handler
    const handleMouseMove = rafThrottle((e: maplibregl.MapMouseEvent) => {
      const point = findPointAtPosition(e.point.x, e.point.y);
      setHoveredPoint(point);
      if (point) {
        setTooltipPos({ x: e.point.x, y: e.point.y });
      }
      if (map.current) {
        map.current.getCanvas().style.cursor = point ? 'pointer' : '';
      }
    });

    map.current.on('mousemove', handleMouseMove);

    // Click handler
    map.current.on('click', (e) => {
      const point = findPointAtPosition(e.point.x, e.point.y);
      if (point && onPointClick) {
        onPointClick(point);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    if (!map.current) return;
    map.current.triggerRepaint();
  }, [points]);

  const drawMarkers = () => {
    if (!map.current || !mapContainer.current) return;

    const canvas = map.current.getCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);

    markers.current = [];

    points.forEach((point) => {
      const { x, y } = map.current!.project([point.lon, point.lat]);
      
      // Calculate total and radius
      const total = Object.values(point.segments).reduce((sum, val) => sum + val, 0);
      if (total === 0) return;

      const radius = Math.sqrt(total) * 0.8;
      const clampedRadius = Math.max(8, Math.min(radius, 28));

      // Store marker for hit testing
      markers.current.push({
        point,
        x,
        y,
        radius: clampedRadius,
        bounds: {
          x1: x - clampedRadius,
          y1: y - clampedRadius,
          x2: x + clampedRadius,
          y2: y + clampedRadius,
        },
      });

      // Draw pie segments
      const segments: Array<{ key: KPIKey; value: number; color: string }> = [];
      (Object.entries(point.segments) as Array<[KPIKey, number]>).forEach(([key, value]) => {
        if (value > 0) {
          segments.push({ key, value, color: KPI_COLORS[key] });
        }
      });

      let startAngle = -Math.PI / 2; // Start at top

      segments.forEach((segment) => {
        const angle = (segment.value / total) * 2 * Math.PI;
        const endAngle = startAngle + angle;

        ctx.beginPath();
        ctx.arc(x, y, clampedRadius, startAngle, endAngle);
        ctx.lineTo(x, y);
        ctx.fillStyle = segment.color;
        ctx.fill();

        // Add stroke for separation
        ctx.strokeStyle = '#1A1F2B';
        ctx.lineWidth = 1;
        ctx.stroke();

        startAngle = endAngle;
      });

      // Outer border
      ctx.beginPath();
      ctx.arc(x, y, clampedRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();
  };

  const findPointAtPosition = (x: number, y: number): GeoPoint | null => {
    for (const marker of markers.current) {
      const dx = x - marker.x;
      const dy = y - marker.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= marker.radius) {
        return marker.point;
      }
    }
    return null;
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-panel rounded-card shadow-panel overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-10 bg-panel-2 border border-panel text-text rounded-lg p-3 shadow-panel pointer-events-none"
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y + 10,
            transform: 'translate(0, -50%)',
          }}
        >
          <div className="font-semibold mb-2">{hoveredPoint.name}</div>
          <div className="space-y-1 text-sm">
            {(Object.entries(hoveredPoint.segments) as Array<[KPIKey, number]>).map(
              ([key, value]) => {
                if (value === 0) return null;
                const total = Object.values(hoveredPoint.segments).reduce(
                  (sum, val) => sum + val,
                  0
                );
                const percent = value / total;
                return (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: KPI_COLORS[key] }}
                      />
                      <span className="text-muted capitalize">
                        {key.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums">{formatNumber(value)}</span>
                      <span className="text-muted text-xs">
                        ({formatPercent(percent, 0)})
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => map.current?.zoomIn()}
          className="w-8 h-8 bg-panel hover:bg-panel-2 text-text rounded flex items-center justify-center shadow-panel transition-colors"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => map.current?.zoomOut()}
          className="w-8 h-8 bg-panel hover:bg-panel-2 text-text rounded flex items-center justify-center shadow-panel transition-colors"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      {/* Accessibility: Hidden list of locations */}
      <div className="sr-only">
        <h4>Device locations:</h4>
        <ul>
          {points.map((point) => {
            const total = Object.values(point.segments).reduce((sum, val) => sum + val, 0);
            return (
              <li key={point.name}>
                {point.name}: {formatNumber(total)} devices
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

