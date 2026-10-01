type SparklineProps = {
  values: number[];
  color: string;
  width?: number;
  height?: number;
};

/** Tiny trend line for a list row. Decorative; the number next to it is the data. */
export function Sparkline({
  values,
  color,
  width = 110,
  height = 28,
}: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - 2 - ((value - min) / span) * (height - 4);
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path
        d={d}
        fill="none"
        stroke={max === min ? '#c3cdca' : color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}
