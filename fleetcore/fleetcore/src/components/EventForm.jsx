import { useState } from "react";
import { today, EVENT_TYPES, TIRE_TYPES, TIRE_CONDITIONS } from "../constants";
import { Field, FormGrid, PrimaryBtn, SecondaryBtn } from "./UI";

export default function EventForm({ vehicleId, onSave, onCancel }) {
  const [type, setType] = useState("tagliando");
  const [f, setF] = useState({
    date: today(), km: "", cost: "", notes: "", nextDate: "",
    supplier: "",
    // gomme
    tireType: "", tireBrand: "", tireSize: "", tireCondition: "", tireDeposit: "", isNewTires: "",
    // ispezione pneumatici
    frontLeftMm: "", frontRightMm: "", rearLeftMm: "", rearRightMm: "",
    tireConditionFL: "", tireConditionFR: "", tireConditionRL: "", tireConditionRR: "",
    inspectionNotes: "",
    // sostitutiva
    fromDate: "", toDate: "", substituteVehicle: "",
    // sinistro
    damageType: "", insuranceClaim: "", counterpart: "", workshop: "",
    // manutenzione
    maintenanceType: "", inRepair: false,
  });

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const setCheck = k => e => setF(p => ({ ...p, [k]: e.target.checked }));
  const meta = EVENT_TYPES[type];

  return (
    <div>
      {/* TYPE SELECTOR */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 24,
      }}>
        {Object.entries(EVENT_TYPES).map(([t, m]) => (
          <button key={t} onClick={() => setType(t)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "10px 4px", borderRadius: 10, border: "1px solid",
            borderColor: type === t ? m.color : "#1a2538",
            background: type === t ? m.color + "22" : "#080d16",
            color: type === t ? "#f1f5f9" : "#475569",
            fontSize: 11, fontFamily: "'DM Sans', sans-serif",
            transition: "all .15s", gap: 4,
          }}>
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            <span style={{ textAlign: "center", lineHeight: 1.3 }}>{m.label}</span>
          </button>
        ))}
      </div>

      <FormGrid>
        <Field label="Data evento *">
          <input value={f.date} onChange={set("date")} type="date" />
        </Field>
        <Field label="Km attuali">
          <input value={f.km} onChange={set("km")} placeholder="125000" type="number" />
        </Field>
        <Field label="Costo (€)">
          <input value={f.cost} onChange={set("cost")} placeholder="0.00" type="number" step="0.01" />
        </Field>
        <Field label="Fornitore / Officina">
          <input value={f.supplier} onChange={set("supplier")} placeholder="Autofficina Rossi" />
        </Field>

        {/* TRACKED: next deadline */}
        {meta.tracked && (
          <Field label={`Prossima scadenza — ${meta.label}`} span2>
            <input value={f.nextDate} onChange={set("nextDate")} type="date" />
          </Field>
        )}

        {/* GOMME specifics */}
        {type === "gomme" && (<>
          <Field label="Tipo gomme">
            <select value={f.tireType} onChange={set("tireType")}>
              <option value="">Seleziona…</option>
              {TIRE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Gomme nuove o deposito">
            <select value={f.isNewTires} onChange={set("isNewTires")}>
              <option value="">Seleziona…</option>
              <option>Nuove</option>
              <option>Da deposito</option>
            </select>
          </Field>
          <Field label="Marca pneumatici">
            <input value={f.tireBrand} onChange={set("tireBrand")} placeholder="Michelin, Pirelli…" />
          </Field>
          <Field label="Misura">
            <input value={f.tireSize} onChange={set("tireSize")} placeholder="205/55 R16" />
          </Field>
          <Field label="Dove sono depositate le gomme smontate" span2>
            <input value={f.tireDeposit} onChange={set("tireDeposit")} placeholder="Officina Rossi / Magazzino aziendale" />
          </Field>
        </>)}

        {/* ISPEZIONE PNEUMATICI */}
        {type === "ispezione_pn" && (<>
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 12, fontWeight: 600 }}>BATTISTRADA (mm)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Ant. Sinistro (mm)">
                <input value={f.frontLeftMm} onChange={set("frontLeftMm")} placeholder="7.0" type="number" step="0.1" />
              </Field>
              <Field label="Ant. Destro (mm)">
                <input value={f.frontRightMm} onChange={set("frontRightMm")} placeholder="7.0" type="number" step="0.1" />
              </Field>
              <Field label="Post. Sinistro (mm)">
                <input value={f.rearLeftMm} onChange={set("rearLeftMm")} placeholder="7.0" type="number" step="0.1" />
              </Field>
              <Field label="Post. Destro (mm)">
                <input value={f.rearRightMm} onChange={set("rearRightMm")} placeholder="7.0" type="number" step="0.1" />
              </Field>
            </div>
          </div>
          <Field label="Stato generale pneumatici" span2>
            <select value={f.tireCondition} onChange={set("tireCondition")}>
              <option value="">Seleziona…</option>
              {TIRE_CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Note ispezione" span2>
            <textarea value={f.inspectionNotes} onChange={set("inspectionNotes")} rows={2} placeholder="Usura irregolare, tagli, rigonfiamenti…" style={{ resize: "vertical" }} />
          </Field>
        </>)}

        {/* SOSTITUTIVA */}
        {type === "sostitutiva" && (<>
          <Field label="Dal">
            <input value={f.fromDate} onChange={set("fromDate")} type="date" />
          </Field>
          <Field label="Al">
            <input value={f.toDate} onChange={set("toDate")} type="date" />
          </Field>
          <Field label="Targa vettura sostitutiva" span2>
            <input value={f.substituteVehicle} onChange={e => setF(p => ({ ...p, substituteVehicle: e.target.value.toUpperCase() }))} placeholder="BB 111 CC" style={{ fontFamily: "'DM Mono', monospace" }} />
          </Field>
        </>)}

        {/* SINISTRO */}
        {type === "sinistro" && (<>
          <Field label="Tipo di danno">
            <input value={f.damageType} onChange={set("damageType")} placeholder="Carrozzeria, cristalli…" />
          </Field>
          <Field label="N° pratica assicurativa">
            <input value={f.insuranceClaim} onChange={set("insuranceClaim")} placeholder="INS-2024-0001" />
          </Field>
          <Field label="Controparte">
            <input value={f.counterpart} onChange={set("counterpart")} placeholder="Nome / Targa controparte" />
          </Field>
          <Field label="Carrozzeria / Officina">
            <input value={f.workshop} onChange={set("workshop")} placeholder="Carrozzeria Bianchi" />
          </Field>
        </>)}

        {/* MANUTENZIONE */}
        {type === "manutenzione" && (<>
          <Field label="Tipo intervento" span2>
            <input value={f.maintenanceType} onChange={set("maintenanceType")} placeholder="Freni, cinghia, batteria…" />
          </Field>
          <Field label="Veicolo attualmente in officina" span2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={f.inRepair} onChange={setCheck("inRepair")} style={{ width: "auto" }} id="inRepair" />
              <label htmlFor="inRepair" style={{ color: "#94a3b8", fontSize: 14 }}>Sì, il veicolo è fermo in officina</label>
            </div>
          </Field>
        </>)}

        <Field label="Note" span2>
          <textarea value={f.notes} onChange={set("notes")} placeholder="Dettagli aggiuntivi…" rows={2} style={{ resize: "vertical" }} />
        </Field>
      </FormGrid>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <SecondaryBtn onClick={onCancel}>Annulla</SecondaryBtn>
        <PrimaryBtn onClick={() => f.date && onSave({ ...f, type, vehicleId })} disabled={!f.date}>
          Registra Evento
        </PrimaryBtn>
      </div>
    </div>
  );
}
