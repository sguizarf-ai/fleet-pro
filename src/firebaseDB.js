// firebaseDB.js — Adaptador Firebase Firestore para Fleet Pro v6
import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc,
  collection, getDocs, onSnapshot, query
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

const COL = "config";  // colección principal para todos los datos
const DOCS_COL = "documents"; // colección separada para documentos (sin límite 1MB)

// ── API principal (config collection) ────────────────────────────────────────

export async function fsGet(key) {
  try {
    const ref = doc(db, COL, key);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data().value ?? null;
    return null;
  } catch (e) {
    console.warn("fsGet error:", key, e?.message);
    return null;
  }
}

export async function fsSet(key, value) {
  try {
    const ref = doc(db, COL, key);
    await setDoc(ref, { value });
    return true;
  } catch (e) {
    console.warn("fsSet error:", key, e?.message);
    const msg = e?.message || "";
    if (msg.includes("exceeds") || msg.includes("size") || msg.includes("large") || e?.code === "invalid-argument") {
      alert("⚠️ No se pudo guardar: el documento supera el límite.\nSi hay fotos sin subir a Cloudinary, elimínalas e intenta de nuevo.");
    } else {
      alert("⚠️ Error al guardar: " + msg + "\nRevisa tu conexión.");
    }
    return false;
  }
}

export async function fsSetSilent(key, value) {
  try {
    const ref = doc(db, COL, key);
    await setDoc(ref, { value });
    return true;
  } catch (e) {
    console.warn("fsSetSilent:", key, e?.message);
    return false;
  }
}

export function fsListen(key, callback) {
  const ref = doc(db, COL, key);
  return onSnapshot(ref, snap => {
    if (snap.exists()) callback(snap.data().value ?? null);
  });
}

// ── API para documentos (colección separada, sin límite 1MB) ─────────────────

/** Sanitiza un objeto para Firestore: solo strings, numbers, booleans, arrays y objetos planos */
function sanitizeForFirestore(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return val;
  if (Array.isArray(val)) return val.map(sanitizeForFirestore).filter(v => v !== undefined);
  if (typeof val === "object") {
    // Rechazar eventos de React/DOM (tienen nativeEvent, _reactName, etc.)
    if ("nativeEvent" in val || "_reactName" in val || "_reactFiber" in val) return undefined;
    // Rechazar objetos con constructor que no sea Object o Array
    if (val.constructor && val.constructor !== Object && val.constructor !== Array) return undefined;
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      const clean = sanitizeForFirestore(v);
      if (clean !== undefined) out[k] = clean;
    }
    return out;
  }
  return undefined;
}

/** Guarda un documento individual */
export async function docSave(item) {
  try {
    const clean = sanitizeForFirestore(item);
    const ref = doc(db, DOCS_COL, clean.id);
    await setDoc(ref, clean);
    return true;
  } catch (e) {
    console.error("docSave error:", e?.code, e?.message);
    alert("⚠️ Error al guardar: " + (e?.message || e?.code || "desconocido"));
    return false;
  }
}

/** Elimina un documento individual */
export async function docDelete(id) {
  try {
    const ref = doc(db, DOCS_COL, id);
    await deleteDoc(ref);
    return true;
  } catch (e) {
    console.warn("docDelete error:", e?.message);
    return false;
  }
}

/** Carga todos los documentos */
export async function docsGetAll() {
  try {
    const snap = await getDocs(collection(db, DOCS_COL));
    return snap.docs.map(d => d.data());
  } catch (e) {
    console.warn("docsGetAll error:", e?.message);
    return null;
  }
}

/** Escucha cambios en tiempo real en todos los documentos */
export function docsListen(callback) {
  return onSnapshot(collection(db, DOCS_COL), snap => {
    callback(snap.docs.map(d => d.data()));
  });
}

export async function deleteStoragePhoto(_url) {
  return; // no-op con Cloudinary
}
