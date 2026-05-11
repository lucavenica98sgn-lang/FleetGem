import { useState } from "react";
import { EVENT_TYPES, daysUntil, urgencyColor, formatDate } from "../constants";
import { PlateTag, Chip, DaysTag, SectionTitle, EmptyState, DangerBtn, PrimaryBtn, SecondaryBtn, Modal, DetailField } from "./UI";
import EventForm from "./EventForm";
import KmForm from "./KmForm";

function getNextDeadline(vehicleId, type, events) {
  const evs = events.filter(e => e.vehicleId === vehicleId && e.type === type && e.nextDate);
  if (!evs.length) return null;
  return evs.sort((a, b) => b.date.localeCompare(a.date))[0].nextDate;
}

function EventDetailModal({ ev, vehicles, onDelete, onClose }) {
  const meta = EVENT_TYPES[ev.type] || EVENT_TYPES.altro;
  const vehicle = vehicles.find(v => v.id === ev.vehicleId);
  const nd = ev.nextDate ? daysUntil(ev.nextDate) : null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <span style={{ fontSize: 40 }}>{meta.icon}</span>
        <div>
          <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 20 }}>{meta.label}</h3>
          {vehicle && <p style={{ color: "#475569", fontSize: 13, marginTop: 2 }}>{vehicle.brand} {vehicle.model} · {vehicle.plate}</p>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <DetailField label="Data" value={formatDate(ev.date)} />
        {ev.km && <DetailField label="Km" value={Number(ev.km).toLocaleString("it-IT") + " km"} mono />}
        {ev.cost && <DetailField label="Costo" value={"€ " + Number(ev.cost).toFixed(2)} />}
        {ev.supplier && <DetailField label="Fornitore / Officina" value={ev.supplier} />}
        {ev.nextDate && <DetailField label="Prossima scadenza" value={formatDate(ev.nextDate)} highlight={urgencyColor(nd)} />}

        {/* Gomme */}
        {ev.tireType && <DetailField label="Tipo gomme" value={ev.tireType} />}
        {ev.tireBrand && <DetailField label="Marca" value={ev.tireBrand} />}
        {ev.tireSize && <DetailField label="Misura" value={ev.tireSize} mono />}
        {ev.isNewTires && <DetailField label="Stato gomme" value={ev.isNewTires} />}
        {ev.tireDeposit && <DetailField label="Deposito gomme smontate" value={ev.tireDeposit} span2 />}

        {/* Ispezione pneumatici */}
        {ev.frontLeftMm && <DetailField label="Battistrada Ant. Sin." value={ev.frontLeftMm + " mm"} />}
        {ev.frontRightMm && <DetailField label="Battistrada Ant. Dx." value={ev.frontRightMm + " mm"} />}
        {ev.rearLeftMm && <DetailField label="Battistrada Post. Sin." value={ev.rearLeftMm + " mm"} />}
        {ev.rearRightMm && <DetailField label="Battistrada Post. Dx." value={ev.rearRightMm + " mm"} />}
        {ev.tireCondition && <DetailField label="Stato generale" value={ev.tireCondition} />}

        {/* Sostitutiva */}
        {ev.fromDate && <DetailField label="Dal" value={formatDate(ev.fromDate)} />}
        {ev.toDate && <DetailField label="Al" value={formatDate(ev.toDate)} />}
        {ev.substituteVehicle && <DetailField label="Targa sostitutiva" value={ev.substituteVehicle} mono />}

        {/* Sinistro */}
        {ev.damageType && <DetailField label="Tipo danno" value={ev.damageType} />}
        {ev.insuranceClaim && <DetailField label="N° pratica" value={ev.insuranceClaim} mono />}
        {ev.counterpart && <DetailField label="Controparte" value={ev.counterpart} />}
        {ev.workshop && <DetailField label="Carrozzeria" value={ev.workshop} />}

        {/* Manutenzione */}
        {ev.maintenanceType && <DetailField label="Tipo intervento" value={ev.maintenanceType} />}
        {ev.inRepair && <DetailField label="Stato" value="🛠️ Veicolo in officina" highlight="#F97316" />}
      </div>

      {ev.notes && (
        <div style={{ background: "#080d16", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>NOTE</p>
          <p style={{ color: "#cbd5e1", lineHeight: 1.6, fontSize: 14 }}>{ev.notes}</p>
        </div>
      )}

      {ev.inspectionNotes && (
        <div style={{ background: "#080d16", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>NOTE ISPEZIONE</p>
          <p style={{ color: "#cbd5e1", lineHeight: 1.6, fontSize: 14 }}>{ev.inspectionNotes}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <DangerBtn onClick={() => onDelete(ev.id)}>🗑 Elimina evento</DangerBtn>
        <SecondaryBtn onClick={onClose} small={false}>Chiudi</SecondaryBtn>
      </div>
    </div>
  );
}

export default function VehicleDetail({ vehicle, vehicles, events, kmReadings, onBack, onDelete, onAddEvent, onAddKm, onDeleteEvent, onDeleteKm }) {
  const [modal, setModal] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("tutti");

  const vEvents = events.filter(e => e.vehicleId === vehicle.id).sort((a, b) => b.date.localeCompare(a.date));
  const vKm = kmReadings.filter(k => k.vehicleId === vehicle.id).sort((a, b) => b.date.localeCompare(a.date));

  const filteredEvents = filter === "tutti" ? vEvents : vEvents.filter(e => e.type === filter);

  // Latest km
  const latestKm = vKm[0];
  const prevKm = vKm[1];
  let avgKmMonth = null;
  if (latestKm && prevKm) {
    const days = (new Date(latestKm.date) - new Date(prevKm.date)) / 86400000;
    if (days > 0) avgKmMonth = Math.round(((latestKm.km - prevKm.km) / days) * 30);
  }

  // Deadlines for this vehicle
  const deadlines = Object.entries(EVENT_TYPES)
    .filter(([, m]) => m.tracked)
    .map(([type, meta]) => {
      const nd = getNextDeadline(vehicle.id, type, events);
      return nd ? { type, meta, nextDate: nd, days: daysUntil(nd) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999));

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{
            background: "#1a2538", border: "none", color: "#94a3b8",
            width: 36, height: 36, borderRadius: 8, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>←</button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px" }}>
              {vehicle.brand} {vehicle.model}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
              <PlateTag plate={vehicle.plate} large />
              {vehicle.year && <Chip>{vehicle.year}</Chip>}
              {vehicle.fuel && <Chip>{vehicle.fuel}</Chip>}
              {vehicle.color && <Chip>{vehicle.color}</Chip>}
              {vehicle.driver && <Chip>👤 {vehicle.driver}</Chip>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <DangerBtn onClick={() => onDelete(vehicle.id)}>Elimina</DangerBtn>
          <SecondaryBtn onClick={() => setModal("km")}>📍 Aggiorna Km</SecondaryBtn>
          <PrimaryBtn onClick={() => setModal("event")}>+ Nuovo Evento</PrimaryBtn>
        </div>
      </div>

      {/* KM + INSURANCE INFO */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {latestKm && (
          <div style={{ background: "#0d1424", border: "1px solid #1a2538", borderRadius: 12, padding: "14px 20px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 11, color: "#475569", marginBottom: 2 }}>KM ATTUALI</p>
              <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#f1f5f9" }}>
                {Number(latestKm.km).toLocaleString("it-IT")}
              </p>
              <p style={{ fontSize: 11, color: "#334155" }}>al {formatDate(latestKm.date)}</p>
            </div>
            {avgKmMonth && (
              <div>
                <p style={{ fontSize: 11, color: "#475569", marginBottom: 2 }}>MEDIA MENSILE</p>
                <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#94a3b8" }}>
                  ~{Number(avgKmMonth).toLocaleString("it-IT")} km/mese
                </p>
              </div>
            )}
          </div>
        )}
        {vehicle.insurance && (
          <div style={{ background: "#0d1424", border: "1px solid #1a2538", borderRadius: 12, padding: "14px 20px" }}>
            <p style={{ fontSize: 11, color: "#475569", marginBottom: 2 }}>ASSICURAZIONE</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{vehicle.insurance}</p>
            {vehicle.insuranceExpiry && (
              <p style={{ fontSize: 12, color: urgencyColor(daysUntil(vehicle.insuranceExpiry)), marginTop: 2, fontWeight: 600 }}>
                Scad. {formatDate(vehicle.insuranceExpiry)} · {urgencyColor(daysUntil(vehicle.insuranceExpiry)) === "#10B981" ? "✅" : "⚠️"}
                {" "}{Math.abs(daysUntil(vehicle.insuranceExpiry))}g
              </p>
            )}
          </div>
        )}
      </div>

      {/* DEADLINES STRIP */}
      {deadlines.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionTitle>Scadenze Programmate</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {deadlines.map((d, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#0d1424", border: `1px solid ${urgencyColor(d.days)}44`,
                borderRadius: 8, padding: "8px 14px",
              }}>
                <span>{d.meta.icon}</span>
                <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{d.meta.label}</span>
                <DaysTag days={d.days} />
                <span style={{ fontSize: 11, color: "#334155" }}>{formatDate(d.nextDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KM HISTORY */}
      {vKm.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionTitle>Registro Chilometri</SectionTitle>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {vKm.slice(0, 12).map((k, i) => (
              <div key={k.id} style={{
                background: i === 0 ? "#3B82F620" : "#0d1424",
                border: `1px solid ${i === 0 ? "#3B82F640" : "#1a2538"}`,
                borderRadius: 8, padding: "8px 14px", position: "relative",
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: i === 0 ? "#3B82F6" : "#94a3b8" }}>
                  {Number(k.km).toLocaleString("it-IT")} km
                </p>
                <p style={{ fontSize: 11, color: "#334155" }}>{formatDate(k.date)}</p>
                {k.notes && <p style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>{k.notes}</p>}
                <button onClick={() => onDeleteKm(k.id)} style={{
                  position: "absolute", top: 4, right: 4, background: "none", border: "none",
                  color: "#334155", fontSize: 12, cursor: "pointer", padding: "2px 4px",
                }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENT FILTERS */}
      <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
        <SectionTitle>Storico Eventi ({vEvents.length})</SectionTitle>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {[["tutti", "Tutti", vEvents.length], ...Object.entries(EVENT_TYPES).map(([t, m]) => [t, m.label, vEvents.filter(e => e.type === t).length]).filter(([,, c]) => c > 0)].map(([t, label, count]) => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: "6px 12px", background: filter === t ? "#1a2538" : "#080d16",
            border: `1px solid ${filter === t ? "#3B82F6" : "#1a2538"}`,
            borderRadius: 8, color: filter === t ? "#f1f5f9" : "#475569",
            fontSize: 12, transition: "all .15s",
          }}>
            {label} ({count})
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState icon="📂" title="Nessun evento" sub="Registra il primo evento per questo veicolo" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredEvents.map(ev => {
            const meta = EVENT_TYPES[ev.type] || EVENT_TYPES.altro;
            const nd = ev.nextDate ? daysUntil(ev.nextDate) : null;
            return (
              <div
                key={ev.id}
                onClick={() => { setSelectedEvent(ev); setModal("event-detail"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "#0d1424", border: "1px solid #1a2538",
                  borderRadius: 10, padding: "12px 16px", cursor: "pointer",
                  transition: "border-color .15s",
                }}
              >
                <span style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, background: meta.color + "22", color: meta.color,
                }}>{meta.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{meta.label}</span>
                    {ev.supplier && <span style={{ fontSize: 12, color: "#475569" }}>{ev.supplier}</span>}
                    {ev.cost && <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>€{ev.cost}</span>}
                  </div>
                  {ev.notes && <p style={{ color: "#475569", fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.notes}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ color: "#334155", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{formatDate(ev.date)}</span>
                  {ev.km && <span style={{ fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace" }}>{Number(ev.km).toLocaleString("it-IT")} km</span>}
                  {nd !== null && <DaysTag days={nd} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {modal === "event" && (
        <Modal title="Registra Evento" onClose={() => setModal(null)} wide>
          <EventForm vehicleId={vehicle.id} onSave={async (ev) => { await onAddEvent(ev); setModal(null); }} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === "km" && (
        <Modal title="Aggiorna Chilometri" onClose={() => setModal(null)}>
          <KmForm vehicleId={vehicle.id} onSave={async (km) => { await onAddKm(km); setModal(null); }} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === "event-detail" && selectedEvent && (
        <Modal title="Dettaglio Evento" onClose={() => { setModal(null); setSelectedEvent(null); }} wide>
          <EventDetailModal
            ev={selectedEvent}
            vehicles={vehicles}
            onDelete={async (id) => { await onDeleteEvent(id); setModal(null); setSelectedEvent(null); }}
            onClose={() => { setModal(null); setSelectedEvent(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
