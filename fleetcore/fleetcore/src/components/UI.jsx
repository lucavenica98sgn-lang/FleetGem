import { urgencyColor, urgencyLabel } from "../constants";

export function PrimaryBtn({ children, onClick, disabled, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: "#2563EB", border: "none", color: "#fff",
      padding: small ? "7px 14px" : "10px 20px",
      borderRadius: 8, fontSize: small ? 13 : 14, fontWeight: 600,
      opacity: disabled ? 0.4 : 1, transition: "opacity .15s",
    }}>{children}</button>
  );
}

export function SecondaryBtn({ children, onClick, small }) {
  return (
    <button onClick={onClick} style={{
      background: "#EDE8DE", border: "1px solid #C4BAA8", color: "#4A4540",
      padding: small ? "6px 12px" : "9px 18px",
      borderRadius: 8, fontSize: small ? 12 : 14, transition: "all .15s",
    }}>{children}</button>
  );
}

export function DangerBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "#FEE2E2", border: "1px solid #FECACA", color: "#DC2626",
      padding: "9px 16px", borderRadius: 8, fontSize: 13, transition: "all .15s",
    }}>{children}</button>
  );
}

export function DaysTag({ days, large }) {
  const color = urgencyColor(days);
  return (
    <span style={{
      background: color, color: "#fff", fontWeight: 700,
      padding: large ? "4px 12px" : "3px 9px",
      borderRadius: 20, fontSize: large ? 13 : 11,
      fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
    }}>{urgencyLabel(days)}</span>
  );
}

export function Chip({ children, color }) {
  return (
    <span style={{
      background: color ? color + "18" : "#EDE8DE",
      color: color || "#4A4540",
      border: `1px solid ${color ? color + "33" : "#C4BAA8"}`,
      padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
    }}>{children}</span>
  );
}

export function PlateTag({ plate, large }) {
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace", fontWeight: 700,
      fontSize: large ? 18 : 13, color: "#2563EB",
      background: "#DBEAFE", padding: large ? "4px 14px" : "2px 8px",
      borderRadius: 6, letterSpacing: "0.05em", border: "1px solid #BFDBFE",
    }}>{plate}</span>
  );
}

export function Field({ label, children, span2 }) {
  return (
    <div style={{ gridColumn: span2 ? "1 / -1" : undefined }}>
      <label style={{ display: "block", fontSize: 12, color: "#7A7268", marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function FormGrid({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {children}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: 16,
      }}
    >
      <div className="fade-in" style={{
        background: "#FAF7F2", border: "1px solid #D6CFC2",
        borderRadius: 16, width: "100%",
        maxWidth: wide ? 720 : 580, maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,.15)",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 24px", borderBottom: "1px solid #D6CFC2",
          position: "sticky", top: 0, background: "#FAF7F2", zIndex: 1,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1C1A17" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#7A7268", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", color: "#C4BAA8" }}>
      <span style={{ fontSize: 44, marginBottom: 12 }}>{icon}</span>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#7A7268" }}>{title}</p>
      {sub && <p style={{ fontSize: 13, marginTop: 6, color: "#C4BAA8" }}>{sub}</p>}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: 11, fontWeight: 700, color: "#7A7268",
      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14,
    }}>{children}</h2>
  );
}

export function Toast({ msg, type }) {
  return (
    <div className="fade-in" style={{
      position: "fixed", bottom: 24, right: 24,
      background: type === "error" ? "#DC2626" : "#16A34A",
      color: "#fff", fontWeight: 600, fontSize: 14,
      padding: "12px 20px", borderRadius: 10, zIndex: 999,
      boxShadow: "0 4px 24px rgba(0,0,0,.2)",
    }}>{msg}</div>
  );
}

export function DetailField({ label, value, mono, highlight }) {
  return (
    <div style={{ background: "#F5F0E8", border: "1px solid #D6CFC2", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontSize: 11, color: "#7A7268", marginBottom: 3 }}>{label}</p>
      <p style={{
        fontSize: 15, fontWeight: 600,
        color: highlight || "#1C1A17",
        fontFamily: mono ? "'DM Mono', monospace" : undefined,
      }}>{value || "–"}</p>
    </div>
  );
}

export function StatCard({ icon, count, label }) {
  return (
    <div style={{
      background: "#F5F0E8", border: "1px solid #D6CFC2", borderRadius: 12,
      padding: "16px 12px", display: "flex", flexDirection: "column",
      alignItems: "center", gap: 4,
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: "#1C1A17", fontFamily: "'DM Mono', monospace" }}>{count}</span>
      <span style={{ fontSize: 11, color: "#7A7268", textAlign: "center" }}>{label}</span>
    </div>
  );
}
