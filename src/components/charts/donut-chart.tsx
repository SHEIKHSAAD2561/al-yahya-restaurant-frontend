'use client';

const COLORS = ['#0f4d3f', '#3d8c74', '#7dbba3', '#b6862c', '#d4b06a', '#a1a1aa'];

interface DonutChartProps {
  slices: { label: string; value: number }[];
  size?: number;
}

/** A dependency-free SVG donut built from `stroke-dasharray` arcs on a
 * circle — simpler than true pie-slice paths and looks identical for a
 * ring chart. Legend is rendered separately by the caller (see
 * `dashboard-page.tsx`) since its layout differs per screen. */
export function DonutChart({ slices, size = 180 }: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  if (total === 0) {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f4f4f5" strokeWidth="24" />
      </svg>
    );
  }

  // Dash lengths and cumulative start-offsets computed as two pure passes
  // (no loop variable mutated during the JSX map below) — the React
  // Compiler's immutability lint flags reassigning a captured variable
  // across a render-time `.map()`.
  const dashLengths = slices.map((slice) => (slice.value / total) * circumference);
  const cumulativeOffsets = dashLengths.map((_, index) =>
    dashLengths.slice(0, index).reduce((sum, length) => sum + length, 0),
  );

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }} className="-rotate-90">
      {slices.map((slice, index) => (
        <circle
          key={index}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={COLORS[index % COLORS.length]}
          strokeWidth="24"
          strokeDasharray={`${dashLengths[index]} ${circumference - dashLengths[index]}`}
          strokeDashoffset={-cumulativeOffsets[index]}
        >
          <title>
            {slice.label}: {slice.value.toFixed(2)}
          </title>
        </circle>
      ))}
    </svg>
  );
}

export { COLORS as DONUT_COLORS };
