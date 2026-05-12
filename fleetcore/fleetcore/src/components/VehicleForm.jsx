import { useState } from "react";
import { today, FUEL_TYPES } from "../constants";
import { Field, FormGrid, PrimaryBtn, SecondaryBtn } from "./UI";

export default function VehicleForm({ onSave, onCancel }) {
  const [f, setF] = useState({
    plate: "", brand: "", model: "", year: "",
    fuel: "", color: "", driver: "", notes: "",
    vin: "", insurance: "", insuranceExpiry: "",
  });

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const valid = f.plate.trim() && f.brand.trim() && f.model.trim();

  return (
    <div>
      <FormGrid>
        <Field label="Targa *">
          <input value={f.plate} onChange={e => setF(p => ({ ...p, plate: e.target.value.toUpperCase() }))} placeholder="AA 000 BB" />
        </Field>
        <Field label="Marca *">
          <input value={f.brand} onChange={set("brand")} placeholder="Fiat" />
        </Field>
        <Field label="Modello *">
          <input value={f.model} onChange={set("model")} placeholder="Doblò" />
        </Field>
        <Field label="Anno immatricolazione">
          <input value={f.year} onChange={set("year")} placeholder="2022" type="number" />
        </Field>
        <Field label="Carburante">
          <select value={f.fuel} onChange={set("fuel")}>
            <option value="">Seleziona…</option>
            {FUEL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Colore">
          <input value={f.color} onChange={set("color")} placeholder="Bianco" />
        </Field>
        <Field label="Assegnatario / Autista" span2>
          <input value={f.driver} onChange={set("driver")} placeholder="Mario Rossi" />
        </Field>
        <Field label="Telaio (VIN)">
          <input value={f.vin} onChange={set("vin")} placeholder="WBA…" style={{ fontFamily: "'DM Mono', monospace" }} />
        </Field>
        <Field label="Compagnia assicurativa">
          <input value={f.insurance} onChange={set("insurance")} placeholder="UnipolSAI" />
        </Field>
        <Field label="Scadenza polizza" span2>
          <input value={f.insuranceExpiry} onChange={set("insuranceExpiry")} type="date" />
        </Field>
        <Field label="Note" span2>
          <textarea value={f.notes} onChange={set("notes")} placeholder="Note aggiuntive…" rows={2} style={{ resize: "vertical" }} />
        </Field>
      </FormGrid>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <SecondaryBtn onClick={onCancel}>Annulla</SecondaryBtn>
        <PrimaryBtn onClick={() => valid && onSave({ ...f, plate: f.plate.toUpperCase() })} disabled={!valid}>
          Aggiungi Veicolo
        </PrimaryBtn>
      </div>
    </div>
  );
}
