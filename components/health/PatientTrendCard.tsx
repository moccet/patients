import { Sparkline } from "../primitives/Sparkline";

type Point = { day: number; value: number };

export function PatientTrendCard({
  label,
  value,
  unit,
  change,
  data,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  change: string;
  data: Point[];
  color: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-3)",
          letterSpacing: "0.04em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <div
          className="serif"
          style={{ fontSize: 28, fontWeight: 400, lineHeight: 1 }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>{unit}</div>
      </div>
      <div style={{ fontSize: 11, color: "var(--red)", marginBottom: 12 }}>
        {change}
      </div>
      <div style={{ height: 40, marginLeft: -4 }}>
        <Sparkline data={data} color={color} />
      </div>
    </div>
  );
}
