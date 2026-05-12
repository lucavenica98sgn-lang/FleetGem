import { useState } from "react";
import { today } from "../constants";
import { Field, FormGrid, PrimaryBtn, SecondaryBtn } from "./UI";

export default function KmForm({ vehicleId, onSave, onCancel }) {
  const [f, setF] = useState({ date: today(), km: "", notes: "" });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const valid = f.date && f.km;

  return (
    <div>
      <FormGrid>
        <Field label="Data rilevazione *">
          <input value={f.date} onChange={set("date")} type="date" />
        </Field>
        <Field label="Chilometri *">
          <input value={f.km} onChange={set("km")} placeholder="125000" type="number" style={{ fontFamily: "'DM Mono', monospace", fontSize: 16 }} />
        </Field>
        <Field label="Note" span2>
          <input value={f.notes} onChange={set("notes")} placeholder="Rilevato al rifornimento, fine mese…" />
        </Field>
      </FormGrid>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <SecondaryBtn onClick={onCancel}>Annulla</SecondaryBtn>
        <PrimaryBtn onClick={() => valid && onSave({ ...f, vehicleId, km: Number(f.km) })} disabled={!valid}>
          Salva Km
        </PrimaryBtn>
      </div>
    </div>
  );
}
