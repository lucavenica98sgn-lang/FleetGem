import { useState, useEffect, useRef } from "react";
import { listenVehicles, listenEvents, listenKm, addVehicle, deleteVehicle, addEvent, deleteEvent, addKmReading, deleteKmReading } from "./firebase/service";
import { db } from "./firebase/config";
import { collection, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { EVENT_TYPES } from "./constants";

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
  const [search,     setSearch]     = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    let ready = 0;
    const done = () => { ready++; if (ready === 3) setLoading(false); };
    const unV = listenVehicles(v => { setVehicles(v); done(); });
    const unE = listenEvents(e => { setEvents(e); done(); });
    const unK = listenKm(k => { setKmReadings(k); done(); });
    return () => { unV(); unE(); unK(); };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const searchResults = q.length >= 2 ? (() => {
    const results = [];
    vehicles.forEach(v => {
      if (v.plate.toLowerCase().includes(q)) {
        results.push({ icon: "🚗", label: v.plate, sub: v.brand + " " + v.model + (v.driver ? " · " + v.driver : ""), vehicleId: v.id });
      }
    });
    Object.entries(EVENT_TYPES).forEach(([type, meta]) => {
      if (meta.label.toLowerCase().includes(q) || type.includes(q)) {
        events.filter(e => e.type === type).forEach(e => {
          const v = vehicles.find(vv => vv.id === e.vehicleId);
          if (v) results.push({ icon: meta.icon, label: meta.label + " — " + v.plate, sub: e.date ? e.date.split("-").reverse().join("/") : "", vehicleId: v.id });
        });
      }
    });
    events.forEach(e => {
      const dateIt = e.date ? e.date.split("-").reverse().join("/") : "";
      if (e.date?.includes(q) || dateIt.includes(q)) {
        const v = vehicles.find(vv => vv.id === e.vehicleId);
        if (!v) return;
        const meta = EVENT_TYPES[e.type] || EVENT_TYPES.altro;
        const lbl = meta.label + " — " + v.plate;
        if (!results.find(r => r.label === lbl && r.sub === dateIt)) {
          results.push({ icon: meta.icon, label: lbl, sub: dateIt, vehicleId: v.id });
        }
      }
    });
    return results.slice(0, 8);
  })() : [];

  const handleAddVehicle = async (data) => { await addVehicle(data); setModal(null); showToast("Veicolo aggiunto ✓"); };
  const handleDeleteVehicle = async (id) => {
    if (!confirm("Eliminare il veicolo e tutti i suoi dati?")) return;
    const evSnap = await getDocs(query(collection(db, "events"), where("vehicleId", "==", id)));
    for (const d of evSnap.docs) await deleteDoc(d.ref);
    const kmSnap = await getDocs(query(collection(db, "km_readings"), where("vehicleId", "==", id)));
    for (const d of kmSnap.docs) await deleteDoc(d.ref);
    await deleteVehicle(id);
    setView("vehicles"); setSelectedId(null); showToast("Veicolo eliminato");
  };
  const handleAddEvent   = async (data) => { await addEvent(data); showToast("Evento registrato ✓"); };
  const handleDeleteEvent = async (id) => { if (!confirm("Eliminare questo evento?")) return; await deleteEvent(id); showToast("Evento eliminato"); };
  const handleAddKm      = async (data) => { await addKmReading(data); showToast("Km aggiornati ✓"); };
  const handleDeleteKm   = async (id)  => { await deleteKmReading(id); showToast("Lettura eliminata"); };
  const goToVehicle = (id) => { setSelectedId(id); setView("vehicle"); setSearch(""); setSearchOpen(false); };
  const selectedVehicle = vehicles.find(v => v.id === selectedId);

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:40, height:40, border:"3px solid #1a2538", borderTopColor:"#3B82F6", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <p style={{ color:"#475569", fontFamily:"'DM Sans', sans-serif" }}>Connessione a Firebase…</p>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <aside style={{ width:230, background:"#0d1424", borderRight:"1px solid #1a2538", display:"flex", flexDirection:"column", padding:"0 0 24px", position:"sticky", top:0, height:"100vh", overflowY:"auto", flexShrink:0 }}>

        {/* Logo + copyright */}
        <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid #1a2538" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22, color:"#3B82F6" }}>⬡</span>
            <span style={{ fontWeight:700, fontSize:18, color:"#f1f5f9", letterSpacing:"-0.5px" }}>FleetCore</span>
          </div>
          <p style={{ fontSize:10, color:"#334155", marginTop:4, fontFamily:"'DM Mono', monospace" }}>GESTIONE FLOTTA</p>
          <p style={{ fontSize:10, color:"#1e3050", marginTop:6, fontFamily:"'DM Mono', monospace", borderTop:"1px solid #1a2538", paddingTop:6 }}>
            © {new Date().getFullYear()} Luca Venica
          </p>
        </div>

        {/* SEARCH */}
        <div ref={searchRef} style={{ padding:"12px 10px 0", position:"relative" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#334155", fontSize:13, pointerEvents:"none" }}>🔍</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Targa, tipo evento, data…"
              style={{ width:"100%", background:"#080d16", border:"1px solid #1a2538", borderRadius:8, color:"#f1f5f9", padding:"8px 28px 8px 30px", fontSize:12, fontFamily:"'DM Sans', sans-serif", outline:"none" }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setSearchOpen(false); }} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#334155", cursor:"pointer", fontSize:13, padding:0 }}>✕</button>
            )}
          </div>

          {searchOpen && q.length >= 2 && (
            <div style={{ position:"absolute", top:"calc(100% + 4px)", left:10, right:10, zIndex:300, background:"#0d1424", border:"1px solid #243044", borderRadius:10, boxShadow:"0 8px 32px rgba(0,0,0,.6)", overflow:"hidden" }}>
              {searchResults.length === 0 ? (
                <p style={{ color:"#334155", fontSize:12, padding:"12px 14px", textAlign:"center" }}>Nessun risultato</p>
              ) : searchResults.map((r, i) => (
                <button key={i} onClick={() => goToVehicle(r.vehicleId)}
                  onMouseEnter={e => e.currentTarget.style.background = "#1a2538"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 14px", background:"transparent", border:"none", borderBottom: i < searchResults.length-1 ? "1px solid #1a2538" : "none", cursor:"pointer", textAlign:"left" }}>
                  <span style={{ fontSize:15, flexShrink:0 }}>{r.icon}</span>
                  <div style={{ minWidth:0, flex:1 }}>
                    <p style={{ fontFamily:"'DM Mono', monospace", fontWeight:700, fontSize:12, color:"#3B82F6", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.label}</p>
                    <p style={{ fontSize:11, color:"#475569", margin:0, marginTop:1 }}>{r.sub}</p>
                  </div>
                  <span style={{ color:"#243044", fontSize:13, flexShrink:0 }}>→</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding:"12px 10px 0", display:"flex", flexDirection:"column", gap:3 }}>
          {[{ id:"dashboard", icon:"▦", label:"Dashboard" }, { id:"vehicles", icon:"◈", label:"Veicoli" }].map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setSelectedId(null); }} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background: view === item.id ? "#1a2538" : "transparent", border:"none", color: view === item.id ? "#f1f5f9" : "#475569", borderRadius:8, fontSize:14, fontWeight:500, textAlign:"left", transition:"all .15s", width:"100%" }}>
              <span style={{ fontSize:15, width:18, textAlign:"center" }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        {/* Vehicle list */}
        {vehicles.length > 0 && (
          <div style={{ padding:"12px 10px 0", flex:1 }}>
            <p style={{ fontSize:10, color:"#1e3050", fontWeight:700, letterSpacing:"0.1em", padding:"0 10px", marginBottom:8 }}>VEICOLI</p>
            {vehicles.map(v => (
              <button key={v.id} onClick={() => goToVehicle(v.id)} style={{ display:"flex", flexDirection:"column", width:"100%", padding:"8px 10px", background: selectedId === v.id ? "#1a2538" : "transparent", border:"none", borderRadius:6, textAlign:"left", marginBottom:2, cursor:"pointer", transition:"all .15s" }}>
                <span style={{ fontFamily:"'DM Mono', monospace", fontWeight:700, fontSize:12, color: selectedId === v.id ? "#3B82F6" : "#3B82F680" }}>{v.plate}</span>
                <span style={{ fontSize:11, color:"#334155", marginTop:1 }}>{v.brand} {v.model}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ padding:"12px 10px 0" }}>
          <button onClick={() => setModal("vehicle")} style={{ width:"100%", padding:10, background:"transparent", border:"1px dashed #1a2538", borderRadius:8, color:"#334155", fontSize:13, cursor:"pointer" }}>+ Aggiungi Veicolo</button>
        </div>
      </aside>

      <main style={{ flex:1, overflowY:"auto", padding:"40px 32px 60px" }}>
        <div style={{ maxWidth:1040, margin:"0 auto" }} className="fade-in">
          {view === "dashboard" && <Dashboard vehicles={vehicles} events={events} kmReadings={kmReadings} onVehicleClick={goToVehicle} onAddVehicle={() => setModal("vehicle")} />}
          {view === "vehicles"  && <VehiclesList vehicles={vehicles} events={events} kmReadings={kmReadings} onVehicleClick={goToVehicle} onAddVehicle={() => setModal("vehicle")} />}
          {view === "vehicle" && selectedVehicle && (
            <VehicleDetail vehicle={selectedVehicle} vehicles={vehicles} events={events} kmReadings={kmReadings} onBack={() => setView("vehicles")} onDelete={handleDeleteVehicle} onAddEvent={handleAddEvent} onAddKm={handleAddKm} onDeleteEvent={handleDeleteEvent} onDeleteKm={handleDeleteKm} />
          )}
        </div>
      </main>

      {modal === "vehicle" && <Modal title="Nuovo Veicolo" onClose={() => setModal(null)}><VehicleForm onSave={handleAddVehicle} onCancel={() => setModal(null)} /></Modal>}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
