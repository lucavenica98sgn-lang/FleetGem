import { useState } from "react";
import { EVENT_TYPES, daysUntil, urgencyColor, formatDate } from "../constants";
import { SectionTitle, DaysTag, StatCard, EmptyState } from "./UI";
import FleetStatusGrid from "./FleetStatusGrid";

function getNextDeadline(vehicleId, type, events) {
  const evs = events.filter(e => e.vehicleId === vehicleId && e.type === type && e.nextDate);
  if (!evs.length) return null;
  return evs.sort((a, b) => b.date.localeCompare(a.date))[0].nextDate;
}

function DeadlineSection({ title, icon, color, type, vehicles, events }) {
  const items = vehicles
    .map(v => {
      const nd = getNextDeadline(v.id, type, events);
      return nd ? { vehicle: v, nextDate: nd, days: daysUntil(nd) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999));

  return (
    <div style={{ background: "#F5F0E8", border: "1px solid " + color + "44", borderTop: "3px solid " + color, borderRadius: 12, padding: 20, flex: 1, minWidth: 280 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1C1A17" }}>{title}</h3>
      </div>
      {items.length === 0 ? (
        <p style={{ color: "#C4BAA8", fontSize: 13 }}>Nessuna scadenza registrata</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(({ vehicle, nextDate, days }) => (
            <div key={vehicle.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAF7F2", borderRadius: 8, padding: "8px 12px", borderLeft: "3px solid " + urgencyColor(days) }}>
              <div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#2563EB", fontSize: 13 }}>{vehicle.plate}</span>
                <p style={{ fontSize: 11, color: "#7A7268", marginTop: 2 }}>{vehicle.brand} {vehicle.model}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <DaysTag days={days} />
                <p style={{ fontSize: 10, color: "#C4BAA8", marginTop: 3 }}>{formatDate(nextDate)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ vehicles, events, kmReadings, onVehicleClick, onAddVehicle }) {
  const [search, setSearch] = useState("");

  const totalEvents = events.length;

  const allDeadlines = [];
  vehicles.forEach(v => {
    Object.entries(EVENT_TYPES).forEach(([type, meta]) => {
      if (!meta.tracked) return;
      const nd = getNextDeadline(v.id, type, events);
      if (nd) allDeadlines.push({ vehicle: v, type, meta, nextDate: nd, days: daysUntil(nd) });
    });
  });
  allDeadlines.sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999));

  const alertCount   = allDeadlines.filter(d => d.days !== null && d.days <= 30).length;
  const expiredCount = allDeadlines.filter(d => d.days !== null && d.days < 0).length;
  const recentEvents = [...events].slice(0, 6);

  // Search logic
  const q = search.trim().toLowerCase();
  const searchResults = q.length >= 2 ? (() => {
    const results = [];
    // Veicoli per targa
    vehicles.forEach(v => {
      if (v.plate.toLowerCase().includes(q) || (v.brand + " " + v.model).toLowerCase().includes(q) || (v.driver || "").toLowerCase().includes(q)) {
        results.push({ kind: "vehicle", icon: "🚗", label: v.plate, sub: v.brand + " " + v.model + (v.driver ? " · " + v.driver : ""), vehicleId: v.id });
      }
    });
    // Eventi per tipo
    Object.entries(EVENT_TYPES).forEach(([type, meta]) => {
      if (meta.label.toLowerCase().includes(q) || type.toLowerCase().includes(q)) {
        events.filter(e => e.type === type).forEach(e => {
          const v = vehicles.find(vv => vv.id === e.vehicleId);
          if (v) results.push({ kind: "event", icon: meta.icon, label: meta.label + " — " + v.plate, sub: e.date ? e.date.split("-").reverse().join("/") : "", vehicleId: v.id });
        });
      }
    });
    // Eventi per data
    events.forEach(e => {
      const dateIt = e.date ? e.date.split("-").reverse().join("/") : "";
      if (e.date?.includes(q) || dateIt.includes(q)) {
        const v = vehicles.find(vv => vv.id === e.vehicleId);
        if (!v) return;
        const meta = EVENT_TYPES[e.type] || EVENT_TYPES.altro;
        const lbl = meta.label + " — " + v.plate;
        if (!results.find(r => r.label === lbl && r.sub === dateIt)) {
          results.push({ kind: "event", icon: meta.icon, label: lbl, sub: dateIt, vehicleId: v.id });
        }
      }
    });
    return results.slice(0, 10);
  })() : [];

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1C1A17", letterSpacing: "-0.5px" }}>Dashboard</h1>
          <p style={{ color: "#7A7268", fontSize: 14, marginTop: 4 }}>{vehicles.length} veicoli · {totalEvents} eventi</p>
        </div>
        {vehicles.length === 0 && (
          <button onClick={onAddVehicle} style={{ background: "#2563EB", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>+ Aggiungi Veicolo</button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none", color: "#C4BAA8" }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per targa, tipo evento (tagliando, lavaggio…), data (15/05/2024)…"
          style={{
            width: "100%", background: "#F5F0E8", border: "1px solid #243044",
            borderRadius: 12, color: "#1C1A17", padding: "13px 44px 13px 44px",
            fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
            transition: "border-color .15s", boxSizing: "border-box",
          }}
          onFocus={e => e.target.style.borderColor = "#2563EB"}
          onBlur={e => e.target.style.borderColor = "#C4BAA8"}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "#D6CFC2", border: "none", color: "#7A7268", borderRadius: 6, cursor: "pointer", fontSize: 13, padding: "3px 8px" }}>✕ Cancella</button>
        )}

        {/* RESULTS */}
        {q.length >= 2 && (
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 100, background: "#F5F0E8", border: "1px solid #243044", borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,.6)", overflow: "hidden" }}>
            {searchResults.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <p style={{ color: "#7A7268", fontSize: 14 }}>Nessun risultato per "<strong style={{ color: "#7A7268" }}>{search}</strong>"</p>
              </div>
            ) : (
              <>
                <div style={{ padding: "10px 16px 6px", borderBottom: "1px solid #1a2538" }}>
                  <p style={{ fontSize: 11, color: "#C4BAA8", fontWeight: 700, letterSpacing: "0.08em" }}>
                    {searchResults.length} RISULTAT{searchResults.length === 1 ? "O" : "I"}
                  </p>
                </div>
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { onVehicleClick(r.vehicleId); setSearch(""); }}
                    onMouseEnter={e => e.currentTarget.style.background = "#D6CFC2"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", background: "transparent", border: "none", borderBottom: i < searchResults.length - 1 ? "1px solid #1a2538" : "none", cursor: "pointer", textAlign: "left" }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0, width: 32, height: 32, background: "#D6CFC2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13, color: "#2563EB", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</p>
                      <p style={{ fontSize: 12, color: "#7A7268", margin: 0, marginTop: 2 }}>{r.sub}</p>
                    </div>
                    <span style={{ color: "#C4BAA8", fontSize: 16, flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ALERTS */}
      {(alertCount > 0 || expiredCount > 0) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {expiredCount > 0 && (
            <div style={{ background: "#EF444420", border: "1px solid #EF444440", borderRadius: 10, padding: "10px 18px", display: "flex", gap: 8, alignItems: "center" }}>
              <span>🔴</span>
              <span style={{ color: "#EF4444", fontWeight: 600, fontSize: 14 }}>{expiredCount} scadenza{expiredCount > 1 ? "e" : ""} già scadut{expiredCount > 1 ? "e" : "a"}</span>
            </div>
          )}
          {alertCount > 0 && (
            <div style={{ background: "#F59E0B20", border: "1px solid #F59E0B40", borderRadius: 10, padding: "10px 18px", display: "flex", gap: 8, alignItems: "center" }}>
              <span>⚡</span>
              <span style={{ color: "#F59E0B", fontWeight: 600, fontSize: 14 }}>{alertCount} scadenza{alertCount > 1 ? "e" : ""} entro 30 giorni</span>
            </div>
          )}
        </div>
      )}

      {/* FLEET STATUS */}
      {vehicles.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionTitle>Stato Flotta</SectionTitle>
          <FleetStatusGrid vehicles={vehicles} events={events} kmReadings={kmReadings} onVehicleClick={onVehicleClick} />
        </section>
      )}

      {/* LAVAGGI + GOMME */}
      {vehicles.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionTitle>Scadenze Prioritarie</SectionTitle>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <DeadlineSection title="Lavaggi" icon="💧" color="#06B6D4" type="lavaggio" vehicles={vehicles} events={events} />
            <DeadlineSection title="Cambio Gomme" icon="⚙️" color="#8B5CF6" type="gomme" vehicles={vehicles} events={events} />
          </div>
        </section>
      )}

      {/* ALL DEADLINES */}
      {allDeadlines.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionTitle>Tutte le Scadenze</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
            {allDeadlines.map((d, i) => (
              <div key={i} onClick={() => onVehicleClick(d.vehicle.id)} style={{ background: "#F5F0E8", border: "1px solid #1a2538", borderLeft: "3px solid " + urgencyColor(d.days), borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "transform .15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#2563EB", fontSize: 14 }}>{d.vehicle.plate}</span>
                    <p style={{ fontSize: 11, color: "#7A7268", marginTop: 2 }}>{d.vehicle.brand} {d.vehicle.model}</p>
                  </div>
                  <DaysTag days={d.days} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{d.meta.icon}</span>
                  <span style={{ fontSize: 13, color: "#4A4540", fontWeight: 500 }}>{d.meta.label}</span>
                </div>
                <p style={{ fontSize: 11, color: "#C4BAA8", marginTop: 6 }}>Scad.: {formatDate(d.nextDate)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STATS */}
      <section style={{ marginBottom: 36 }}>
        <SectionTitle>Riepilogo per Tipo</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
          {Object.entries(EVENT_TYPES).map(([type, meta]) => (
            <StatCard key={type} icon={meta.icon} count={events.filter(e => e.type === type).length} label={meta.label} />
          ))}
        </div>
      </section>

      {/* RECENT EVENTS */}
      {recentEvents.length > 0 && (
        <section>
          <SectionTitle>Ultimi Eventi</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentEvents.map(ev => {
              const meta = EVENT_TYPES[ev.type] || EVENT_TYPES.altro;
              const vehicle = vehicles.find(v => v.id === ev.vehicleId);
              return (
                <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "#F5F0E8", border: "1px solid #1a2538", borderRadius: 10, padding: "12px 16px" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: meta.color + "22", color: meta.color, flexShrink: 0 }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#1C1A17" }}>{meta.label}</span>
                      {vehicle && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#7A7268" }}>{vehicle.plate}</span>}
                    </div>
                    {ev.notes && <p style={{ color: "#7A7268", fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.notes}</p>}
                  </div>
                  <span style={{ color: "#C4BAA8", fontSize: 12, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>{formatDate(ev.date)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {vehicles.length === 0 && <EmptyState icon="🚗" title="Nessun veicolo registrato" sub="Aggiungi il primo veicolo per iniziare" />}
    </div>
  );
}
