import { EVENT_TYPES, daysUntil, urgencyColor, formatDate } from "../constants";
import { PlateTag, Chip, DaysTag, SectionTitle, EmptyState, PrimaryBtn } from "./UI";

function getWorstDeadline(vehicleId, events) {
  let worst = null, worstDays = Infinity;
  Object.entries(EVENT_TYPES).forEach(([type, meta]) => {
    if (!meta.tracked) return;
    const evs = events.filter(e => e.vehicleId === vehicleId && e.type === type && e.nextDate)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (evs[0]) {
      const days = daysUntil(evs[0].nextDate);
      if (days !== null && days < worstDays) { worstDays = days; worst = { meta, days }; }
    }
  });
  return worst;
}

export default function VehiclesList({ vehicles, events, kmReadings, onVehicleClick, onAddVehicle }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px" }}>Parco Veicoli</h1>
          <p style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>{vehicles.length} veicoli registrati</p>
        </div>
        <PrimaryBtn onClick={onAddVehicle}>+ Aggiungi Veicolo</PrimaryBtn>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState icon="🚗" title="Nessun veicolo registrato" sub="Aggiungi il primo veicolo per iniziare" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {vehicles.map(v => {
            const evCount = events.filter(e => e.vehicleId === v.id).length;
            const worst = getWorstDeadline(v.id, events);
            const latestKm = kmReadings.filter(k => k.vehicleId === v.id).sort((a, b) => b.date.localeCompare(a.date))[0];

            return (
              <div
                key={v.id}
                onClick={() => onVehicleClick(v.id)}
                style={{
                  background: "#0d1424", border: "1px solid #1a2538",
                  borderRadius: 14, padding: 20, cursor: "pointer",
                  transition: "border-color .15s, transform .15s",
                  position: "relative", overflow: "hidden",
                }}
              >
                {worst && worst.days <= 30 && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    background: urgencyColor(worst.days), padding: "5px 16px",
                    fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "center",
                  }}>
                    {worst.meta.icon} {worst.meta.label}: {worst.days < 0 ? `scaduto ${Math.abs(worst.days)}g fa` : `${worst.days}g`}
                  </div>
                )}

                <div style={{ marginTop: worst && worst.days <= 30 ? 26 : 0 }}>
                  <PlateTag plate={v.plate} large />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: "10px 0 8px" }}>
                    {v.brand} {v.model}
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {v.year && <Chip>{v.year}</Chip>}
                    {v.fuel && <Chip>{v.fuel}</Chip>}
                    {v.color && <Chip>{v.color}</Chip>}
                  </div>
                  {v.driver && <p style={{ color: "#475569", fontSize: 13, marginBottom: 10 }}>👤 {v.driver}</p>}
                  {latestKm && (
                    <p style={{ color: "#475569", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                      📍 {Number(latestKm.km).toLocaleString("it-IT")} km · {formatDate(latestKm.date)}
                    </p>
                  )}
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: 16, paddingTop: 12, borderTop: "1px solid #1a2538",
                }}>
                  <span style={{ background: "#1a2538", padding: "3px 10px", borderRadius: 20, fontSize: 12, color: "#475569" }}>
                    {evCount} eventi
                  </span>
                  <span style={{ color: "#3B82F6", fontSize: 18 }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
