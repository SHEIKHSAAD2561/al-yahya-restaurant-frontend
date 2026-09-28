'use client';

import { useId } from 'react';

interface LineAreaChartProps {
  points: { label: string; value: number }[];
  height?: number;
  formatValue?: (value: number) => string;
}

/**
 * A small, dependency-free SVG line+area chart (no charting library added —
 * matches this codebase's existing "hand-roll it" convention for CSV/dates
 * rather than pulling in recharts/chart.js for one chart shape). `viewBox`
 * makes it scale to its container; y-axis labels are the min/max/mid value.
 */
export function LineAreaChart({ points, height = 220, formatValue }: LineAreaChartProps) {
  const width = 800;
  const padding = { top: 10, right: 10, bottom: 24, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const gradientId = useId();

  if (points.length === 0) {
    return <div className="flex h-[220px] items-center justify-center text-sm text-zinc-400">No data</div>;
  }

  const maxValue = Math.max(...points.map((p) => p.value), 1);
  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const fmt = formatValue ?? ((value: number) => value.toString());

  const coords = points.map((point, index) => ({
    x: padding.left + index * stepX,
    y: padding.top + innerHeight - (point.value / maxValue) * innerHeight,
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${padding.top + innerHeight} L${coords[0].x},${padding.top + innerHeight} Z`;

  // Thin out x-axis labels so they don't overlap on a wide date range.
  const labelEvery = Math.max(1, Math.ceil(points.length / 10));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((fraction) => {
        const y = padding.top + innerHeight * fraction;
        return (
          <g key={fraction}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e4e4e7" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#a1a1aa">
              {fmt(maxValue * (1 - fraction))}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke="var(--brand)" strokeWidth="2.5" />
      {coords.map((c, i) => (
        <g key={i}>
          {i % labelEvery === 0 && (
            <text x={c.x} y={height - 4} textAnchor="middle" fontSize="11" fill="#a1a1aa">
              {points[i].label}
            </text>
          )}
          <circle cx={c.x} cy={c.y} r="2.5" fill="var(--brand)">
            <title>
              {points[i].label}: {fmt(points[i].value)}
            </title>
          </circle>
        </g>
      ))}
    </svg>
  );
}
