export function SmallStat({
  label,
  value,
  sub,
  status,
}: {
  label: string;
  value: string;
  sub: string;
  status: "flagged" | "pending" | "ok";
}) {
  const color =
    status === "flagged"
      ? "var(--red)"
      : status === "pending"
      ? "var(--text-3)"
      : "var(--text)";
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-3)",
          letterSpacing: "0.04em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        className="serif tw-mono"
        style={{ fontSize: 22, fontWeight: 400, color }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
        {sub}
      </div>
    </div>
  );
}
