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
    <div style={{
      background: "#0d1424", border: `1px solid ${color}44`,
      borderTop: `3px solid ${color}`,
      borderRadius: 12, padding: 20, flex: 1, minWidth: 280,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{title}</h3>
      </div>

      {items.length === 0 ? (
        <p style={{ color: "#334155", fontSize: 13 }}>Nessuna scadenza registrata</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(({ vehicle, nextDate, days }) => (
            <div key={vehicle.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "#080d16", borderRadius: 8, padding: "8px 12px",
              borderLeft: `3px solid ${urgencyColor(days)}`,
            }}>
              <div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#3B82F6", fontSize: 13 }}>
                  {vehicle.plate}
                </span>
                <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{vehicle.brand} {vehicle.model}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <DaysTag days={days} />
                <p style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>{formatDate(nextDate)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ vehicles, events, kmReadings, onVehicleClick, onAddVehicle }) {
  const totalEvents = events.length;

  // All tracked deadlines
  const allDeadlines = [];
  vehicles.forEach(v => {
    Object.entries(EVENT_TYPES).forEach(([type, meta]) => {
      if (!meta.tracked) return;
      const nd = getNextDeadline(v.id, type, events);
      if (nd) allDeadlines.push({ vehicle: v, type, meta, nextDate: nd, days: daysUntil(nd) });
    });
  });
  allDeadlines.sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999));

  const alertCount = allDeadlines.filter(d => d.days !== null && d.days <= 30).length;
  const expiredCount = allDeadlines.filter(d => d.days !== null && d.days < 0).length;

  const recentEvents = [...events].slice(0, 6);

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px" }}>Dashboard</h1>
          <p style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>
            {vehicles.length} veicoli · {totalEvents} eventi
          </p>
        </div>
        {vehicles.length === 0 && (
          <button onClick={onAddVehicle} style={{
            background: "#3B82F6", border: "none", color: "#fff",
            padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
          }}>+ Aggiungi Veicolo</button>
        )}
      </div>

      {/* ALERTS */}
      {(alertCount > 0 || expiredCount > 0) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {expiredCount > 0 && (
            <div style={{ background: "#EF444420", border: "1px solid #EF444440", borderRadius: 10, padding: "10px 18px", display: "flex", gap: 8, alignItems: "center" }}>
              <span>🔴</span>
              <span style={{ color: "#EF4444", fontWeight: 600, fontSize: 14 }}>
                {expiredCount} scadenza{expiredCount > 1 ? "e" : ""} già scadut{expiredCount > 1 ? "e" : "a"}
              </span>
            </div>
          )}
          {alertCount > 0 && (
            <div style={{ background: "#F59E0B20", border: "1px solid #F59E0B40", borderRadius: 10, padding: "10px 18px", display: "flex", gap: 8, alignItems: "center" }}>
              <span>⚡</span>
              <span style={{ color: "#F59E0B", fontWeight: 600, fontSize: 14 }}>
                {alertCount} scadenza{alertCount > 1 ? "e" : ""} entro 30 giorni
              </span>
            </div>
          )}
        </div>
      )}

      {/* FLEET STATUS GRID */}
      {vehicles.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionTitle>Stato Flotta</SectionTitle>
          <FleetStatusGrid
            vehicles={vehicles}
            events={events}
            kmReadings={kmReadings}
            onVehicleClick={onVehicleClick}
          />
        </section>
      )}

      {/* LAVAGGI + GOMME priority sections */}
      {vehicles.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionTitle>Scadenze Prioritarie</SectionTitle>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <DeadlineSection
              title="Lavaggi"
              icon="💧"
              color="#06B6D4"
              type="lavaggio"
              vehicles={vehicles}
              events={events}
            />
            <DeadlineSection
              title="Cambio Gomme"
              icon="⚙️"
              color="#8B5CF6"
              type="gomme"
              vehicles={vehicles}
              events={events}
            />
          </div>
        </section>
      )}

      {/* ALL DEADLINES */}
      {allDeadlines.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionTitle>Tutte le Scadenze</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
            {allDeadlines.map((d, i) => (
              <div
                key={i}
                onClick={() => onVehicleClick(d.vehicle.id)}
                style={{
                  background: "#0d1424", border: "1px solid #1a2538",
                  borderLeft: `3px solid ${urgencyColor(d.days)}`,
                  borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                  transition: "transform .15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#3B82F6", fontSize: 14 }}>
                      {d.vehicle.plate}
                    </span>
                    <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{d.vehicle.brand} {d.vehicle.model}</p>
                  </div>
                  <DaysTag days={d.days} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{d.meta.icon}</span>
                  <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>{d.meta.label}</span>
                </div>
                <p style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>Scad.: {formatDate(d.nextDate)}</p>
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
            <StatCard
              key={type}
              icon={meta.icon}
              count={events.filter(e => e.type === type).length}
              label={meta.label}
            />
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
                <div key={ev.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "#0d1424", border: "1px solid #1a2538",
                  borderRadius: 10, padding: "12px 16px",
                }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: 8, display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 16,
                    background: meta.color + "22", color: meta.color, flexShrink: 0,
                  }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{meta.label}</span>
                      {vehicle && (
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569" }}>
                          {vehicle.plate}
                        </span>
                      )}
                    </div>
                    {ev.notes && <p style={{ color: "#475569", fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.notes}</p>}
                  </div>
                  <span style={{ color: "#334155", fontSize: 12, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                    {formatDate(ev.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {vehicles.length === 0 && (
        <EmptyState icon="🚗" title="Nessun veicolo registrato" sub="Aggiungi il primo veicolo per iniziare" />
      )}
    </div>
  );
}
