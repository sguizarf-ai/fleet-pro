// firebaseDB.js — Adaptador Firebase Firestore para Fleet Pro v6
// Las fotos se almacenan en Cloudinary (URLs). Firestore solo guarda texto/URLs.
import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot
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

const COL = "config";

// ── Lee una clave de Firestore ────────────────────────────────────────────────
export async function fsGet(key) {
  try {
    const ref  = doc(db, COL, key);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data().value ?? null;
    return null;
  } catch (e) {
    console.warn("fsGet error:", e);
    return null;
  }
}

// ── Guarda una clave en Firestore ─────────────────────────────────────────────
// Las fotos ya vienen como URLs de Cloudinary (no base64), así que
// el tamaño del documento es mínimo y nunca supera el límite de 1MB.
export async function fsSet(key, value) {
  try {
    const ref = doc(db, COL, key);
    await setDoc(ref, { value });
    return true;
  } catch (e) {
    console.warn("fsSet error:", e);
    const msg = e?.message || "";
    // Mostrar error completo para diagnóstico
    alert("⚠️ Error Firebase [" + key + "]\nCódigo: " + (e?.code || "?") + "\nMensaje: " + msg.slice(0, 200));
    return false;
  }
}

// ── Escucha cambios en tiempo real ────────────────────────────────────────────
export function fsListen(key, callback) {
  const ref = doc(db, COL, key);
  return onSnapshot(ref, snap => {
    if (snap.exists()) callback(snap.data().value ?? null);
  });
}

// ── deleteStoragePhoto — no-op con Cloudinary ─────────────────────────────────
// Cloudinary no permite borrar desde el cliente sin API secret.
// Las fotos huérfanas se pueden limpiar manualmente en cloudinary.com/console
// o con una Cloud Function en el futuro.
export async function deleteStoragePhoto(_url) {
  // No-op: con Cloudinary no borramos desde el cliente
  return;
}
