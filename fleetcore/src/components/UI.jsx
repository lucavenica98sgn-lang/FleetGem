import { urgencyColor, urgencyLabel } from "../constants";

// ── BUTTONS ──────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, disabled, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: "#3B82F6", border: "none", color: "#fff",
      padding: small ? "7px 14px" : "10px 20px",
      borderRadius: 8, fontSize: small ? 13 : 14, fontWeight: 600,
      opacity: disabled ? 0.4 : 1, transition: "opacity .15s, transform .1s",
    }}>{children}</button>
  );
}

export function SecondaryBtn({ children, onClick, small }) {
  return (
    <button onClick={onClick} style={{
      background: "#1a2538", border: "1px solid #243044", color: "#94a3b8",
      padding: small ? "6px 12px" : "9px 18px",
      borderRadius: 8, fontSize: small ? 12 : 14, transition: "all .15s",
    }}>{children}</button>
  );
}

export function DangerBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "#EF444418", border: "1px solid #EF444440", color: "#EF4444",
      padding: "9px 16px", borderRadius: 8, fontSize: 13, transition: "all .15s",
    }}>{children}</button>
  );
}

// ── TAGS ─────────────────────────────────────────────────────
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
      background: color ? color + "22" : "#1a2538",
      color: color || "#94a3b8",
      border: `1px solid ${color ? color + "44" : "#243044"}`,
      padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
    }}>{children}</span>
  );
}

export function PlateTag({ plate, large }) {
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace", fontWeight: 700,
      fontSize: large ? 18 : 13, color: "#3B82F6",
      background: "#1a253844", padding: large ? "4px 14px" : "2px 8px",
      borderRadius: 6, letterSpacing: "0.05em",
    }}>{plate}</span>
  );
}

// ── FORM HELPERS ─────────────────────────────────────────────
export function Field({ label, children, span2 }) {
  return (
    <div style={{ gridColumn: span2 ? "1 / -1" : undefined }}>
      <label style={{ display: "block", fontSize: 12, color: "#475569", marginBottom: 6, fontWeight: 500 }}>
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

// ── MODAL ────────────────────────────────────────────────────
export function Modal({ title, onClose, children, wide }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: 16,
      }}
    >
      <div className="fade-in" style={{
        background: "#0d1424", border: "1px solid #1a2538",
        borderRadius: 16, width: "100%",
        maxWidth: wide ? 720 : 580, maxHeight: "92vh", overflowY: "auto",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 24px", borderBottom: "1px solid #1a2538", position: "sticky", top: 0,
          background: "#0d1424", zIndex: 1,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ── EMPTY STATE ──────────────────────────────────────────────
export function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", color: "#334155" }}>
      <span style={{ fontSize: 44, marginBottom: 12 }}>{icon}</span>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#475569" }}>{title}</p>
      {sub && <p style={{ fontSize: 13, marginTop: 6, color: "#334155" }}>{sub}</p>}
    </div>
  );
}

// ── SECTION TITLE ────────────────────────────────────────────
export function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: 11, fontWeight: 700, color: "#334155",
      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14,
    }}>{children}</h2>
  );
}

// ── TOAST ────────────────────────────────────────────────────
export function Toast({ msg, type }) {
  return (
    <div className="fade-in" style={{
      position: "fixed", bottom: 24, right: 24,
      background: type === "error" ? "#EF4444" : "#10B981",
      color: "#fff", fontWeight: 600, fontSize: 14,
      padding: "12px 20px", borderRadius: 10, zIndex: 999,
      boxShadow: "0 4px 24px rgba(0,0,0,.4)",
    }}>{msg}</div>
  );
}

// ── DETAIL FIELD ─────────────────────────────────────────────
export function DetailField({ label, value, mono, highlight }) {
  return (
    <div style={{ background: "#080d16", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontSize: 11, color: "#475569", marginBottom: 3 }}>{label}</p>
      <p style={{
        fontSize: 15, fontWeight: 600,
        color: highlight || "#f1f5f9",
        fontFamily: mono ? "'DM Mono', monospace" : undefined,
      }}>{value || "–"}</p>
    </div>
  );
}

// ── STAT CARD ────────────────────────────────────────────────
export function StatCard({ icon, count, label }) {
  return (
    <div style={{
      background: "#0d1424", border: "1px solid #1a2538", borderRadius: 12,
      padding: "16px 12px", display: "flex", flexDirection: "column",
      alignItems: "center", gap: 4,
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", fontFamily: "'DM Mono', monospace" }}>{count}</span>
      <span style={{ fontSize: 11, color: "#475569", textAlign: "center" }}>{label}</span>
    </div>
  );
}
