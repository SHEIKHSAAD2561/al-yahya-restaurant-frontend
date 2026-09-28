'use client';

interface BarSeries {
  label: string;
  color: string;
}

interface BarChartProps {
  points: { label: string; values: number[] }[];
  series: BarSeries[];
  height?: number;
  formatValue?: (value: number) => string;
}

/** A grouped vertical bar chart — same dependency-free SVG approach as
 * `LineAreaChart`. Each point's `values` array must line up 1:1 with
 * `series`. */
export function BarChart({ points, series, height = 260, formatValue }: BarChartProps) {
  const width = 800;
  const padding = { top: 10, right: 10, bottom: 24, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const fmt = formatValue ?? ((value: number) => value.toString());

  if (points.length === 0) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-zinc-400">No data</div>;
  }

  const maxValue = Math.max(...points.flatMap((p) => p.values), 1);
  const groupWidth = innerWidth / points.length;
  const barGap = 2;
  const barWidth = Math.max(2, (groupWidth - barGap * (series.length + 1)) / series.length);
  const labelEvery = Math.max(1, Math.ceil(points.length / 12));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" preserveAspectRatio="none">
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
      {points.map((point, pointIndex) => {
        const groupX = padding.left + pointIndex * groupWidth;
        return (
          <g key={pointIndex}>
            {point.values.map((value, seriesIndex) => {
              const barHeight = (value / maxValue) * innerHeight;
              const x = groupX + barGap + seriesIndex * (barWidth + barGap);
              const y = padding.top + innerHeight - barHeight;
              return (
                <rect
                  key={seriesIndex}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={series[seriesIndex].color}
                  rx="1.5"
                >
                  <title>
                    {point.label} · {series[seriesIndex].label}: {fmt(value)}
                  </title>
                </rect>
              );
            })}
            {pointIndex % labelEvery === 0 && (
              <text x={groupX + groupWidth / 2} y={height - 4} textAnchor="middle" fontSize="11" fill="#a1a1aa">
                {point.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
