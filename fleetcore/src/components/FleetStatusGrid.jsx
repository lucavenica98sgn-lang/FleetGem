import { EVENT_TYPES, daysUntil, urgencyColor } from "../constants";
import { PlateTag, DaysTag } from "./UI";

function getVehicleStatus(vehicle, events, kmReadings) {
  const vEvents = events.filter(e => e.vehicleId === vehicle.id);

  // Check if in manutenzione
  const inRepair = vEvents.some(e => e.type === "manutenzione" && e.inRepair);

  // Check if has active sostitutiva
  const today = new Date().toISOString().slice(0, 10);
  const activeSostitutiva = vEvents.find(e =>
    e.type === "sostitutiva" && e.fromDate <= today && (!e.toDate || e.toDate >= today)
  );

  // Get worst upcoming deadline
  let worstDeadline = null;
  let worstDays = Infinity;
  Object.entries(EVENT_TYPES).forEach(([type, meta]) => {
    if (!meta.tracked) return;
    const tracked = vEvents.filter(e => e.type === type && e.nextDate)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (tracked) {
      const days = daysUntil(tracked.nextDate);
      if (days !== null && days < worstDays) {
        worstDays = days;
        worstDeadline = { type, meta, days, nextDate: tracked.nextDate };
      }
    }
  });

  return { inRepair, activeSostitutiva, worstDeadline };
}

export default function FleetStatusGrid({ vehicles, events, kmReadings, onVehicleClick }) {
  if (!vehicles.length) return null;

  // Group: in repair with sostitutiva
  const pairs = [];
  const standalone = [];

  vehicles.forEach(v => {
    const status = getVehicleStatus(v, events, kmReadings);
    if (status.activeSostitutiva) {
      pairs.push({ vehicle: v, status });
    } else {
      standalone.push({ vehicle: v, status });
    }
  });

  const getCardBg = (status) => {
    if (status.inRepair || status.activeSostitutiva) return "#EF444410";
    if (status.worstDeadline && status.worstDeadline.days <= 14) return "#F9731610";
    if (status.worstDeadline && status.worstDeadline.days <= 30) return "#F59E0B10";
    return "#F5F0E8";
  };

  const getCardBorder = (status) => {
    if (status.inRepair || status.activeSostitutiva) return "#EF444440";
    if (status.worstDeadline && status.worstDeadline.days <= 14) return "#F9731640";
    if (status.worstDeadline && status.worstDeadline.days <= 30) return "#F59E0B40";
    return "#D6CFC2";
  };

  const StatusDot = ({ status }) => {
    let color = "#10B981";
    if (status.inRepair || status.activeSostitutiva) color = "#EF4444";
    else if (status.worstDeadline && status.worstDeadline.days <= 14) color = "#F97316";
    else if (status.worstDeadline && status.worstDeadline.days <= 30) color = "#F59E0B";
    return <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
  };

  const VehicleStatusCard = ({ vehicle, status }) => (
    <div
      onClick={() => onVehicleClick(vehicle.id)}
      style={{
        background: getCardBg(status),
        border: `1px solid ${getCardBorder(status)}`,
        borderRadius: 12, padding: "14px 16px", cursor: "pointer",
        transition: "transform .15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <PlateTag plate={vehicle.plate} />
        <StatusDot status={status} />
      </div>
      <p style={{ fontSize: 12, color: "#7A7268", marginBottom: 6 }}>
        {vehicle.brand} {vehicle.model}
      </p>
      {vehicle.driver && (
        <p style={{ fontSize: 11, color: "#7A7268", marginBottom: 8 }}>👤 {vehicle.driver}</p>
      )}

      {status.inRepair && !status.activeSostitutiva && (
        <div style={{ background: "#EF444420", borderRadius: 6, padding: "4px 8px", fontSize: 11, color: "#EF4444", fontWeight: 600 }}>
          🛠️ In manutenzione
        </div>
      )}

      {status.worstDeadline && !status.inRepair && !status.activeSostitutiva && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#7A7268" }}>{status.worstDeadline.meta.icon} {status.worstDeadline.meta.label}</span>
          <DaysTag days={status.worstDeadline.days} />
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* PAIRS: fermo + sostitutiva */}
      {pairs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            ⚠️ Veicoli fermi con sostitutiva
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pairs.map(({ vehicle, status }) => {
              const sub = status.activeSostitutiva;
              return (
                <div key={vehicle.id} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <VehicleStatusCard vehicle={vehicle} status={status} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 18, color: "#7A7268" }}>⇄</span>
                    <span style={{ fontSize: 10, color: "#7A7268" }}>sostitutiva</span>
                  </div>
                  <div style={{
                    flex: 1, minWidth: 200, background: "#6366F110", border: "1px solid #6366F140",
                    borderRadius: 12, padding: "14px 16px",
                  }}>
                    <PlateTag plate={sub.substituteVehicle || "N/D"} />
                    <p style={{ fontSize: 11, color: "#6366F1", marginTop: 8, fontWeight: 600 }}>
                      🚗 Vettura sostitutiva attiva
                    </p>
                    {sub.toDate && (
                      <p style={{ fontSize: 11, color: "#7A7268", marginTop: 4 }}>
                        Fino al {sub.toDate.split("-").reverse().join("/")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GRID: all vehicles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {[...pairs.map(p => p), ...standalone.map(s => s)].map(({ vehicle, status }) => (
          <VehicleStatusCard key={vehicle.id} vehicle={vehicle} status={status} />
        ))}
      </div>
    </div>
  );
}
