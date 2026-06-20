"use client";

/** Tiny dependency-free SVG sparkline for a numeric series. */
export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "#6366f1",
  strokeWidth = 2,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  if (!data || data.length === 0) {
    return <div style={{ width, height }} className="rounded bg-slate-50" />;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = strokeWidth;
  const innerH = height - pad * 2;

  const pts = data.map((v, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * width;
    const y = pad + (innerH - ((v - min) / range) * innerH);
    return [x, y] as const;
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <path d={area} fill={color} opacity={0.1} />
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {pts.length > 0 && (
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={strokeWidth + 0.5} fill={color} />
      )}
    </svg>
  );
}
