// firebaseDB.js — Adaptador Firebase Firestore para Fleet Pro v6
import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot, collection
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhnf0pZw6qA7T9bQsq8GAleLlrwjbdKEA",
  authDomain: "fleet-pro-ff821.firebaseapp.com",
  projectId: "fleet-pro-ff821",
  storageBucket: "fleet-pro-ff821.firebasestorage.app",
  messagingSenderId: "522003123754",
  appId: "1:522003123754:web:7cb1e7fbf8936117dcbd53",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Nombre del documento principal donde se guardan todos los datos
const DOC_ID = "fleetpro_data";
const COL    = "config";

// Lee todos los datos de Firestore
export async function fsGet(key) {
  try {
    const ref = doc(db, COL, key);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data().value ?? null;
    return null;
  } catch (e) {
    console.warn("fsGet error:", e);
    return null;
  }
}

// Guarda datos en Firestore
export async function fsSet(key, value) {
  try {
    const ref = doc(db, COL, key);
    await setDoc(ref, { value });
  } catch (e) {
    console.warn("fsSet error:", e);
  }
}

// Escucha cambios en tiempo real de una clave
export function fsListen(key, callback) {
  const ref = doc(db, COL, key);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data().value ?? null);
  });
}
