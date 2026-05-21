import Link from "next/link";

export default function IntakeComplete() {
  return (
    <div
      className="tw-pad-mobile"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
      }}
    >
      <div className="tw-slide" style={{ maxWidth: 560 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
            marginBottom: 14,
          }}
        >
          Submitted
        </div>
        <h1
          className="serif tw-h1-mobile"
          style={{
            fontSize: 30,
            fontWeight: 400,
            letterSpacing: "-0.015em",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Thank you. Your clinician has your form.
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            marginTop: 16,
            lineHeight: 1.7,
          }}
        >
          Your answers have been added to the brief your clinician reads before
          your appointment.
        </p>
        <Link
          href="/home"
          style={{
            display: "inline-block",
            marginTop: 28,
            padding: "10px 22px",
            background: "var(--text)",
            color: "white",
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 4,
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
