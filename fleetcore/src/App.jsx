import { useState, useEffect } from "react";
import { listenVehicles, listenEvents, listenKm, addVehicle, deleteVehicle, addEvent, deleteEvent, addKmReading, deleteKmReading } from "./firebase/service";
import { db } from "./firebase/config";
import { collection, deleteDoc, getDocs, query, where } from "firebase/firestore";

import Dashboard from "./components/Dashboard";
import VehiclesList from "./components/VehiclesList";
import VehicleDetail from "./components/VehicleDetail";
import VehicleForm from "./components/VehicleForm";
import { Modal, Toast } from "./components/UI";

export default function App() {
  const [vehicles,   setVehicles]   = useState([]);
  const [events,     setEvents]     = useState([]);
  const [kmReadings, setKmReadings] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [modal,      setModal]      = useState(null);
  const [toast,      setToast]      = useState(null);

  // Realtime listeners
  useEffect(() => {
    let ready = 0;
    const done = () => { ready++; if (ready === 3) setLoading(false); };
    const unV = listenVehicles(v => { setVehicles(v); done(); });
    const unE = listenEvents(e => { setEvents(e); done(); });
    const unK = listenKm(k => { setKmReadings(k); done(); });
    return () => { unV(); unE(); unK(); };
  }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handlers
  const handleAddVehicle = async (data) => {
    await addVehicle(data);
    setModal(null);
    showToast("Veicolo aggiunto ✓");
  };

  const handleDeleteVehicle = async (id) => {
    if (!confirm("Eliminare il veicolo e tutti i suoi dati?")) return;
    // Delete all events and km for this vehicle
    const evSnap = await getDocs(query(collection(db, "events"), where("vehicleId", "==", id)));
    for (const d of evSnap.docs) await deleteDoc(d.ref);
    const kmSnap = await getDocs(query(collection(db, "km_readings"), where("vehicleId", "==", id)));
    for (const d of kmSnap.docs) await deleteDoc(d.ref);
    await deleteVehicle(id);
    setView("vehicles");
    setSelectedId(null);
    showToast("Veicolo eliminato");
  };

  const handleAddEvent = async (data) => {
    await addEvent(data);
    showToast("Evento registrato ✓");
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Eliminare questo evento?")) return;
    await deleteEvent(id);
    showToast("Evento eliminato");
  };

  const handleAddKm = async (data) => {
    await addKmReading(data);
    showToast("Km aggiornati ✓");
  };

  const handleDeleteKm = async (id) => {
    await deleteKmReading(id);
    showToast("Lettura eliminata");
  };

  const goToVehicle = (id) => {
    setSelectedId(id);
    setView("vehicle");
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedId);

  if (loading) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "3px solid #1a2538", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ color: "#475569", fontFamily: "'DM Sans', sans-serif" }}>Connessione a Firebase…</p>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 220, background: "#0d1424", borderRight: "1px solid #1a2538",
        display: "flex", flexDirection: "column", padding: "0 0 24px",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1a2538" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, color: "#3B82F6" }}>⬡</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#f1f5f9", letterSpacing: "-0.5px" }}>FleetCore</span>
          </div>
          <p style={{ fontSize: 10, color: "#334155", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>GESTIONE FLOTTA</p>
        </div>

        {/* Nav */}
        <nav style={{ padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            { id: "dashboard", icon: "▦", label: "Dashboard" },
            { id: "vehicles",  icon: "◈", label: "Veicoli"   },
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setSelectedId(null); }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              background: view === item.id ? "#1a2538" : "transparent",
              border: "none", color: view === item.id ? "#f1f5f9" : "#475569",
              borderRadius: 8, fontSize: 14, fontWeight: 500, textAlign: "left",
              transition: "all .15s", width: "100%",
            }}>
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Vehicle list */}
        {vehicles.length > 0 && (
          <div style={{ padding: "0 10px", flex: 1 }}>
            <p style={{ fontSize: 10, color: "#1e3050", fontWeight: 700, letterSpacing: "0.1em", padding: "0 10px", marginBottom: 8 }}>
              VEICOLI
            </p>
            {vehicles.map(v => (
              <button key={v.id} onClick={() => goToVehicle(v.id)} style={{
                display: "flex", flexDirection: "column", width: "100%",
                padding: "8px 10px", background: selectedId === v.id ? "#1a2538" : "transparent",
                border: "none", color: "#94a3b8", borderRadius: 6, textAlign: "left",
                marginBottom: 2, cursor: "pointer", transition: "all .15s",
              }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 12, color: selectedId === v.id ? "#3B82F6" : "#3B82F680" }}>
                  {v.plate}
                </span>
                <span style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>{v.brand} {v.model}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: "12px 10px 0" }}>
          <button onClick={() => setModal("vehicle")} style={{
            width: "100%", padding: 10, background: "transparent",
            border: "1px dashed #1a2538", borderRadius: 8, color: "#334155",
            fontSize: 13, cursor: "pointer", transition: "all .15s",
          }}>+ Aggiungi Veicolo</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: "auto", padding: "40px 32px 60px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }} className="fade-in">
          {view === "dashboard" && (
            <Dashboard
              vehicles={vehicles}
              events={events}
              kmReadings={kmReadings}
              onVehicleClick={goToVehicle}
              onAddVehicle={() => setModal("vehicle")}
            />
          )}
          {view === "vehicles" && (
            <VehiclesList
              vehicles={vehicles}
              events={events}
              kmReadings={kmReadings}
              onVehicleClick={goToVehicle}
              onAddVehicle={() => setModal("vehicle")}
            />
          )}
          {view === "vehicle" && selectedVehicle && (
            <VehicleDetail
              vehicle={selectedVehicle}
              vehicles={vehicles}
              events={events}
              kmReadings={kmReadings}
              onBack={() => setView("vehicles")}
              onDelete={handleDeleteVehicle}
              onAddEvent={handleAddEvent}
              onAddKm={handleAddKm}
              onDeleteEvent={handleDeleteEvent}
              onDeleteKm={handleDeleteKm}
            />
          )}
        </div>
      </main>

      {/* MODALS */}
      {modal === "vehicle" && (
        <Modal title="Nuovo Veicolo" onClose={() => setModal(null)}>
          <VehicleForm onSave={handleAddVehicle} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
