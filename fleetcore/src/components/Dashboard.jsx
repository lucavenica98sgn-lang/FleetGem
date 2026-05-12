import { useState, useEffect } from "react";
import { EVENT_TYPES, daysUntil, urgencyColor, formatDate } from "../constants";
import { SectionTitle } from "./UI";

function getNextDeadline(vehicleId, type, events) {
  const evs = events.filter(e => e.vehicleId === vehicleId && e.type === type && e.nextDate);
  if (!evs.length) return null;
  return evs.sort((a, b) => b.date.localeCompare(a.date))[0].nextDate;
}

// Countdown che pulsa per scadenze <= 10 giorni
function Countdown({ days }) {
  const [tick, setTick] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setTick(p => !p), 1000);
    return () => clearInterval(t);
  }, []);

  if (days === null) return null;
  const color = urgencyColor(days);

  if (days < 0) {
    return (
      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: 13, color: "#DC2626", background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 8, padding: "3px 10px" }}>
        SCADUTO {Math.abs(days)}g fa
      </span>
    );
  }

  if (days <= 10) {
    return (
      <span style={{
        fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: 14,
        color: "#fff", background: color,
        borderRadius: 8, padding: "4px 12px",
        boxShadow: tick ? `0 0 0 4px ${color}44` : "0 0 0 0px transparent",
        transition: "box-shadow .5s ease",
        display: "inline-block",
      }}>
        ⏱ {days === 0 ? "OGGI" : `${days}g`}
      </span>
    );
  }

  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 12, color, background: color + "18", border: `1px solid ${color}44`, borderRadius: 8, padding: "3px 10px" }}>
      {days}g
    </span>
  );
}

// Riga semaforo
function DeadlineRow({ vehicle, type, meta, nextDate, days }) {
  const color = urgencyColor(days);
  let dotColor = "#16A34A";
  if (days === null) dotColor = "#C4BAA8";
  else if (days < 0)   dotColor = "#DC2626";
  else if (days <= 14) dotColor = "#EA580C";
  else if (days <= 30) dotColor = "#CA8A04";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      background: "#F5F0E8", border: `1px solid ${color}33`,
      borderLeft: `4px solid ${dotColor}`,
      borderRadius: 10, padding: "12px 16px",
    }}>
      {/* Semaforo dot */}
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: dotColor, flexShrink: 0, boxShadow: `0 0 6px ${dotColor}88` }} />

      {/* Tipo */}
      <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#4A4540", minWidth: 140 }}>{meta.label}</span>

      {/* Targa */}
      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13, color: "#2563EB", background: "#DBEAFE", border: "1px solid #BFDBFE", borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>
        {vehicle.plate}
      </span>
      {vehicle.driver && <span style={{ fontSize: 12, color: "#7A7268", flexShrink: 0 }}>👤 {vehicle.driver}</span>}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, color: "#C4BAA8" }}>{formatDate(nextDate)}</span>
        <Countdown days={days} />
      </div>
    </div>
  );
}

export default function Dashboard({ vehicles, events, kmReadings, onVehicleClick }) {
  // Sostitutive attive
  const today = new Date().toISOString().slice(0, 10);
  const activeSostitutive = events.filter(e =>
    e.type === "sostitutiva" &&
    e.substituteVehicle &&
    e.fromDate <= today &&
    (!e.toDate || e.toDate >= today)
  );

  // Tutte le scadenze tracked
  const allDeadlines = [];
  vehicles.forEach(v => {
    Object.entries(EVENT_TYPES).forEach(([type, meta]) => {
      if (!meta.tracked) return;
      const nd = getNextDeadline(v.id, type, events);
      if (nd) allDeadlines.push({ vehicle: v, type, meta, nextDate: nd, days: daysUntil(nd) });
    });
  });
  allDeadlines.sort((a, b) => {
    const da = a.days === null ? 9999 : a.days < 0 ? a.days : a.days;
    const db = b.days === null ? 9999 : b.days < 0 ? b.days : b.days;
    return da - db;
  });

  // Raggruppa per colore semaforo
  const expired  = allDeadlines.filter(d => d.days !== null && d.days < 0);
  const urgent   = allDeadlines.filter(d => d.days !== null && d.days >= 0 && d.days <= 14);
  const warning  = allDeadlines.filter(d => d.days !== null && d.days > 14 && d.days <= 30);
  const ok       = allDeadlines.filter(d => d.days !== null && d.days > 30);

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1C1A17", letterSpacing: "-0.5px" }}>Dashboard</h1>
        <p style={{ color: "#7A7268", fontSize: 14, marginTop: 4 }}>{vehicles.length} veicoli · {events.length} eventi</p>
      </div>

      {/* VETTURE SOSTITUTIVE */}
      <section style={{ marginBottom: 36 }}>
        <SectionTitle>Vetture Sostitutive Attive</SectionTitle>
        {activeSostitutive.length === 0 ? (
          <div style={{ background: "#F5F0E8", border: "1px solid #D6CFC2", borderRadius: 12, padding: "20px 24px", color: "#C4BAA8", fontSize: 14, textAlign: "center" }}>
            Nessuna vettura sostitutiva attiva
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {activeSostitutive.map((ev, i) => {
              const originalVehicle = vehicles.find(v => v.id === ev.vehicleId);
              return (
                <div
                  key={i}
                  onClick={() => originalVehicle && onVehicleClick(originalVehicle.id)}
                  style={{
                    background: "#EFF6FF", border: "2px solid #BFDBFE", borderRadius: 14,
                    padding: "18px 24px", cursor: "pointer", minWidth: 200,
                    transition: "transform .15s, box-shadow .15s",
                    boxShadow: "0 2px 8px rgba(37,99,235,.1)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,.1)"; }}
                >
                  {/* Targa sostitutiva — grande */}
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: 22, color: "#2563EB", letterSpacing: "0.05em", marginBottom: 6 }}>
                    🚗 {ev.substituteVehicle}
                  </div>
                  {/* Targa originale — piccola */}
                  {originalVehicle && (
                    <div style={{ fontSize: 12, color: "#7A7268" }}>
                      sostitutiva di{" "}
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#4A4540" }}>
                        {originalVehicle.plate}
                      </span>
                      {" "}· {originalVehicle.brand} {originalVehicle.model}
                    </div>
                  )}
                  {ev.toDate && (
                    <div style={{ fontSize: 11, color: "#93C5FD", marginTop: 6 }}>
                      fino al {ev.toDate.split("-").reverse().join("/")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* LEGENDA SEMAFORO */}
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>Scadenze Flotta</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, background: "#F5F0E8", border: "1px solid #D6CFC2", borderRadius: 10, padding: "12px 16px", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#7A7268", fontWeight: 600, marginRight: 4 }}>LEGENDA:</span>
          {[
            { color: "#DC2626", label: "Scaduto" },
            { color: "#EA580C", label: "Entro 14 giorni" },
            { color: "#CA8A04", label: "Entro 30 giorni" },
            { color: "#16A34A", label: "Oltre 30 giorni" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}88`, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#4A4540" }}>{label}</span>
            </div>
          ))}
          <span style={{ fontSize: 11, color: "#C4BAA8", marginLeft: "auto" }}>⏱ countdown attivo sotto i 10 giorni</span>
        </div>

        {allDeadlines.length === 0 ? (
          <div style={{ background: "#F5F0E8", border: "1px solid #D6CFC2", borderRadius: 12, padding: "32px", color: "#C4BAA8", fontSize: 14, textAlign: "center" }}>
            Nessuna scadenza programmata — registra un evento con data di prossima scadenza
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* SCADUTI */}
            {expired.length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: "#DC2626", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, marginTop: 4 }}>🔴 SCADUTI ({expired.length})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {expired.map((d, i) => <DeadlineRow key={i} {...d} onClick={() => onVehicleClick(d.vehicle.id)} />)}
                </div>
              </div>
            )}
            {/* URGENTI */}
            {urgent.length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: "#EA580C", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, marginTop: 12 }}>🟠 ENTRO 14 GIORNI ({urgent.length})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {urgent.map((d, i) => <DeadlineRow key={i} {...d} onClick={() => onVehicleClick(d.vehicle.id)} />)}
                </div>
              </div>
            )}
            {/* WARNING */}
            {warning.length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: "#CA8A04", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, marginTop: 12 }}>🟡 ENTRO 30 GIORNI ({warning.length})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {warning.map((d, i) => <DeadlineRow key={i} {...d} onClick={() => onVehicleClick(d.vehicle.id)} />)}
                </div>
              </div>
            )}
            {/* OK */}
            {ok.length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: "#16A34A", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, marginTop: 12 }}>🟢 IN REGOLA ({ok.length})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {ok.map((d, i) => <DeadlineRow key={i} {...d} onClick={() => onVehicleClick(d.vehicle.id)} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
