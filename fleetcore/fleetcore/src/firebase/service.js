import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "./config";

// ── COLLECTIONS ──────────────────────────────────────────────
export const vehiclesCol = () => collection(db, "vehicles");
export const eventsCol   = () => collection(db, "events");
export const kmCol       = () => collection(db, "km_readings");

// ── VEHICLES ─────────────────────────────────────────────────
export const addVehicle = (data) =>
  addDoc(vehiclesCol(), { ...data, createdAt: serverTimestamp() });

export const updateVehicle = (id, data) =>
  updateDoc(doc(db, "vehicles", id), data);

export const deleteVehicle = async (id) => {
  await deleteDoc(doc(db, "vehicles", id));
};

// ── EVENTS ───────────────────────────────────────────────────
export const addEvent = (data) =>
  addDoc(eventsCol(), { ...data, createdAt: serverTimestamp() });

export const deleteEvent = (id) =>
  deleteDoc(doc(db, "events", id));

// ── KM READINGS ──────────────────────────────────────────────
export const addKmReading = (data) =>
  addDoc(kmCol(), { ...data, createdAt: serverTimestamp() });

export const deleteKmReading = (id) =>
  deleteDoc(doc(db, "km_readings", id));

// ── REALTIME LISTENERS ───────────────────────────────────────
export const listenVehicles = (cb) =>
  onSnapshot(query(vehiclesCol(), orderBy("createdAt", "asc")), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

export const listenEvents = (cb) =>
  onSnapshot(query(eventsCol(), orderBy("date", "desc")), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

export const listenKm = (cb) =>
  onSnapshot(query(kmCol(), orderBy("date", "desc")), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
