import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { fsGet, fsSet, fsListen } from "./firebaseDB";

/* ═══════════════════════════════════════════════════════════════
   FLEET PRO v6.0 — Sistema Integral de Gestión de Flota
   Con módulo de logística externa, evidencias fotográficas,
   consolidados financieros y reportes avanzados
═══════════════════════════════════════════════════════════════ */

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
${FONT_LINK}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg0:#F5F7FA;--bg1:#FFFFFF;--bg2:#E8EDF2;--bg3:#D4DCE6;--bg4:#C0CAD8;
  --cyan:#0099CC;--cyan2:#00B8E6;--orange:#FF6B2B;--green:#00C896;
  --red:#E63946;--yellow:#FFB800;--purple:#7B61FF;
  --text:#1A2332;--muted:#6B7A8F;--border:#D0D8E0;
  --font-hd:'Rajdhani',sans-serif;--font-bd:'DM Sans',sans-serif;
}
[data-theme="dark"]{
  --bg0:#0D1117;--bg1:#161B22;--bg2:#1C2430;--bg3:#243042;--bg4:#2D3B52;
  --text:#E2E8F0;--muted:#8899AA;--border:#2D3B52;
  --cyan:#00BFFF;--cyan2:#33CFFF;--orange:#FF7A40;--green:#00E5A8;
  --red:#FF4D5A;--yellow:#FFD000;--purple:#9D87FF;
}
[data-theme="blue"]{
  --bg0:#0A0F1E;--bg1:#0F172A;--bg2:#1E293B;--bg3:#263548;--bg4:#2E4060;
  --text:#CBD5E1;--muted:#64748B;--border:#1E3A5F;
  --cyan:#38BDF8;--cyan2:#7DD3FC;--orange:#FB923C;--green:#34D399;
  --red:#F87171;--yellow:#FBBF24;--purple:#A78BFA;
}
body{background:var(--bg0);color:var(--text);font-family:var(--font-bd);font-size:13px;min-height:100vh}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--muted);border-radius:3px}
.app{display:flex;min-height:100vh}
.sidebar{width:250px;min-height:100vh;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;z-index:200;overflow-y:auto;box-shadow:2px 0 8px rgba(0,0,0,.04)}
.main{margin-left:250px;flex:1;padding:24px 28px;min-height:100vh}
.sb-logo{padding:18px 16px 14px;border-bottom:1px solid var(--border);flex-shrink:0}
.sb-logo-title{font-family:var(--font-hd);font-size:24px;font-weight:700;letter-spacing:.06em;background:linear-gradient(135deg,var(--cyan),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sb-logo-sub{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;margin-top:2px}
.sb-sect{padding:10px 14px 4px;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}
.nav-btn{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;border-left:3px solid transparent;border-radius:0 8px 8px 0;margin:2px 10px 2px 0;transition:all .2s;color:var(--muted);font-size:13px;font-weight:500}
.nav-btn:hover{background:var(--bg2);color:var(--text)}
.nav-btn.on{border-left-color:var(--cyan);background:linear-gradient(90deg,var(--bg2),transparent);color:var(--cyan);font-weight:600}
.nav-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
.sb-footer{padding:12px 14px;border-top:1px solid var(--border);flex-shrink:0;margin-top:auto}
.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:14px;flex-wrap:wrap}
.topbar-title{font-family:var(--font-hd);font-size:30px;font-weight:700;letter-spacing:.04em;color:var(--text)}
.topbar-sub{font-size:11px;color:var(--muted);margin-top:2px}
.card{background:var(--bg1);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.card-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);background:var(--bg2);gap:12px;flex-wrap:wrap}
.card-hdr h3{font-family:var(--font-hd);font-size:17px;font-weight:600;letter-spacing:.03em;white-space:nowrap;color:var(--text)}
.card-body{overflow-x:auto}
.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:20px}
.stat{background:var(--bg1);border:1px solid var(--border);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden;cursor:pointer;transition:all .2s;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.stat:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.08)}
.stat::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--c)}
.stat-icon{font-size:22px;margin-bottom:6px;opacity:.9}
.stat-val{font-family:var(--font-hd);font-size:30px;font-weight:700;line-height:1;color:var(--text)}
.stat-val.sm{font-size:18px}
.stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:5px;font-weight:600}
.stat-sub{font-size:11px;color:var(--muted);margin-top:3px}
table{width:100%;border-collapse:collapse}
thead tr{background:var(--bg2)}
th{padding:10px 14px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);white-space:nowrap;border-bottom:1px solid var(--border)}
td{padding:11px 14px;border-bottom:1px solid var(--border);font-size:12px;vertical-align:middle}
tr:last-child td{border-bottom:none}
tbody tr:hover{background:var(--bg2)}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.04em;white-space:nowrap}
.bg{background:#D4F4DD;color:#00864E}
.br{background:#FFE5E8;color:#C41E3A}
.by{background:#FFF3CD;color:#997404}
.bb{background:#D4EDFF;color:#006699}
.bp{background:#E8E0FF;color:#5A3DB8}
.bm{background:#E8EDF2;color:#6B7A8F}
.bo{background:#FFE4D6;color:#CC4400}
.btn{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:8px;border:none;cursor:pointer;font-family:var(--font-bd);font-size:12px;font-weight:600;transition:all .2s;white-space:nowrap;line-height:1}
.btn:active{transform:scale(.98)}
.btn-cyan{background:var(--cyan);color:#fff;box-shadow:0 2px 6px rgba(0,153,204,.25)}
.btn-cyan:hover{background:var(--cyan2);box-shadow:0 4px 12px rgba(0,153,204,.35)}
.btn-orange{background:var(--orange);color:#fff;box-shadow:0 2px 6px rgba(255,107,43,.25)}
.btn-orange:hover{box-shadow:0 4px 12px rgba(255,107,43,.35)}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--bg2);color:var(--text);border-color:var(--muted)}
.btn-red{background:#FFE5E8;color:var(--red);border:1px solid #FFD0D5}
.btn-red:hover{background:#FFD0D5}
.btn-green{background:#D4F4DD;color:#00864E;border:1px solid #B8EDCA}
.btn-green:hover{background:#B8EDCA}
.btn-purple{background:#E8E0FF;color:#5A3DB8;border:1px solid #D4C7FF}
.btn-purple:hover{background:#D4C7FF}
.btn-sm{padding:5px 11px;font-size:11px}
.btn-xs{padding:3px 9px;font-size:10px}
.modal-ov{position:fixed;inset:0;background:rgba(26,35,50,.65);backdrop-filter:blur(6px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--bg1);border:1px solid var(--border);border-radius:16px;width:100%;max-width:700px;max-height:92vh;overflow-y:auto;animation:mUp .25s ease;box-shadow:0 20px 60px rgba(0,0,0,.15)}
.modal.wide{max-width:920px}
.modal.xwide{max-width:1200px}
@keyframes mUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.mhdr{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid var(--border);background:var(--bg2);position:sticky;top:0;z-index:2}
.mhdr h3{font-family:var(--font-hd);font-size:19px;font-weight:700;color:var(--text)}
.mbody{padding:22px}
.mftr{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg2);position:sticky;bottom:0}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fg .s2{grid-column:1/-1}
.field{display:flex;flex-direction:column;gap:6px}
.field label{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.field input,.field select,.field textarea{background:var(--bg0);border:1px solid var(--border);color:var(--text);padding:9px 12px;border-radius:8px;font-family:var(--font-bd);font-size:12px;transition:all .2s}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,153,204,.1);background:var(--bg1)}
.field select option{background:var(--bg1)}
.field textarea{resize:vertical;min-height:75px}
.sec-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--cyan);padding:16px 0 10px;border-bottom:2px solid var(--cyan);margin-bottom:14px}
.sw{display:flex;align-items:center;gap:8px;background:var(--bg0);border:1px solid var(--border);border-radius:8px;padding:6px 12px}
.sw input{background:none;border:none;outline:none;color:var(--text);font-family:var(--font-bd);font-size:12px;min-width:160px}
.row-gap{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.acts{display:flex;gap:6px;align-items:center}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;color:var(--muted)}
.empty-icon{font-size:40px;margin-bottom:12px;opacity:.5}
.sbar{display:flex;align-items:center;gap:20px;padding:8px 16px;background:var(--bg2);border-bottom:1px solid var(--border);font-size:11px;color:var(--muted);flex-wrap:wrap}
.ftabs{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.ftab{background:transparent;border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-size:10px;font-weight:600;cursor:pointer;color:var(--muted);transition:all .2s}
.ftab.on{background:var(--cyan);color:#fff;border-color:var(--cyan)}
.ftab:hover:not(.on){background:var(--bg2);color:var(--text)}
.ab{display:flex;align-items:flex-start;gap:14px;padding:12px 18px;border-left:4px solid;border-radius:0 8px 8px 0;margin-bottom:10px}
.ab-r{background:#FFF0F1;border-left-color:var(--red)}
.ab-y{background:#FFFBF0;border-left-color:var(--yellow)}
[data-theme="dark"] .ab-r{background:#2A1820}
[data-theme="dark"] .ab-y{background:#2A2010}
[data-theme="blue"] .ab-r{background:#2A1020}
[data-theme="blue"] .ab-y{background:#1A2030}
.kpi-card{background:var(--bg1);border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:8px;cursor:pointer;transition:all .2s;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.kpi-card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.1)}
.chart-row{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.chart-lbl{width:90px;font-size:11px;color:var(--muted);font-weight:600;text-align:right;flex-shrink:0}
.bar-bg{background:var(--bg2);border-radius:4px;flex:1;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;display:flex;align-items:center;padding:0 6px;min-width:4px;transition:width .4s ease}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg0)}
.login-card{background:var(--bg1);border:1px solid var(--border);border-radius:20px;padding:40px;width:100%;max-width:420px;box-shadow:0 8px 32px rgba(0,0,0,.1)}
.tema-btn{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;cursor:pointer;color:var(--muted);transition:all .2s;display:flex;align-items:center;gap:6px}
.tema-btn:hover{background:var(--bg3);color:var(--text)}
.hv-section{margin-bottom:24px}
.hv-title{font-family:var(--font-hd);font-size:18px;font-weight:700;color:var(--cyan);margin-bottom:8px;padding-bottom:8px;border-bottom:2px solid var(--border)}
.pdf-preview{background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px;font-family:'DM Sans',sans-serif;font-size:12px;color:#1A2332;max-width:800px;margin:0 auto}
.tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:10px}
.tool-chip{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:11px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:6px}
`;


const uid = () => Math.random().toString(36).slice(2, 10);
const fmt$ = v => v > 0 ? `$${Number(v).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00";
const fmtN = v => v ? Number(v).toLocaleString("es-MX") : "0";
const toISO = s => { if (!s) return ""; if (s.includes("-")) return s; const [d, m, y] = s.split("/"); return y && m && d ? `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}` : ""; };
const daysUntil = s => { const iso = toISO(s); if (!iso) return null; return Math.ceil((new Date(iso) - new Date()) / 86400000); };
const getWeekNumber = d => { const date = new Date(toISO(d)); const firstDayOfYear = new Date(date.getFullYear(), 0, 1); const pastDaysOfYear = (date - firstDayOfYear) / 86400000; return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7); };
const getMonthName = d => { const iso = toISO(d); if (!iso) return ""; const date = new Date(iso); return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" }); };
const addDays = (dateStr, days) => { const date = new Date(toISO(dateStr)); date.setDate(date.getDate() + days); const d = date.getDate(); const m = date.getMonth() + 1; const y = date.getFullYear(); return `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y}`; };

const TIPOS = ["CAMIÓN", "TRACTOCAMIÓN", "CAJA SECA", "PLATAFORMA", "RABÓN", "TORTÓN", "PIPA", "PLATAFORMA 20 PIES", "CAJA SECA 20 PIES", "PLATAFORMA 10 PIES", "CAJA SECA 18 PIES", "PLATAFORMA 48 PIES", "CAJA SECA 48 PIES", "CAJA SECA 53 PIES", "ESTAQUITA", "VAN", "LOWBOY", "CAMA BAJA", "OTRO"];
const ESTADOS = ["ACTIVA", "EN TALLER", "BAJA TEMPORAL", "BAJA DEFINITIVA", "INACTIVA"];
const SERVS = ["PREVENTIVO", "CORRECTIVO", "EMERGENCIA", "REVISIÓN"];
const PRIOS = ["ALTA", "MEDIA", "BAJA"];
const DOCS_LIST_UNIDAD = ["Seguro", "Verificación", "Permiso SCT", "Tarjeta Circulación", "Revista Vehicular", "Póliza GPS", "Otro"];
const DOCS_LIST_OPERADOR = ["Licencia Operador", "INE / Identificación", "IMSS Operador", "Examen Médico", "Comprobante Domicilio", "Acta de Nacimiento", "Otro"];
const DOCS_LIST = [...DOCS_LIST_UNIDAD, ...DOCS_LIST_OPERADOR];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const PROVEEDOR_CATS = ["Refacciones", "Mano de Obra", "Talleres", "Herramientas", "Combustible", "Llantas", "Seguros", "Servicios", "Otro"];

const D_PROVEEDORES = [
  { id: "pv1", nombre: "Refaccionaria Norma", categoria: "Refacciones", tipoProv: "Llantera", contacto: "Norma López", tel: "8181234500", email: "norma@refacs.com", rfc: "RNL990101XXX", direccion: "Av. Colón 200, MTY", banco: "BBVA", cuenta: "1234567890", diasCredito: 30, limiteCredito: 50000, saldoPendiente: 8500, ultimoPago: "2026-02-15", notas: "" },
  { id: "pv2", nombre: "Taller Express MTY", categoria: "Talleres", tipoProv: "Taller Mecánico", contacto: "Ing. Ramírez", tel: "8189876543", email: "taller@express.com", rfc: "TEM010101YYY", direccion: "Carr. Nacional km 5, MTY", banco: "Banorte", cuenta: "9876543210", diasCredito: 15, limiteCredito: 20000, saldoPendiente: 3200, ultimoPago: "2026-02-28", notas: "Servicio 24hrs" },
];

const TIPO_PROVEEDOR_CATS = ["Llantera","Taller Mecánico","Combustible","Refacciones","Seguros","Casetas / Peajes","Servicio de Grúa","Lavado","Transportista Externo","Administrativo","Otro"];
const FORMAS_PAGO = ["Transferencia SPEI","Depósito bancario","Cheque","Efectivo","Tarjeta de crédito","Tarjeta de débito","Otro"];
// Map tipoProv → what type of service reference to show
const TIPO_PROV_SERVICIO = {
  "Transportista Externo": "viaje",
  "Taller Mecánico": "mantenimiento",
  "Llantera": "mantenimiento",
  "Combustible": "combustible",
  "Refacciones": "mantenimiento",
  "Seguros": "general",
  "Casetas / Peajes": "general",
  "Servicio de Grúa": "mantenimiento",
  "Lavado": "mantenimiento",
  "Administrativo": "general",
  "Otro": "general",
};

// ──────────────────────────────────────────────────────────────────────────────
// USUARIOS Y ROLES
// roles: "admin" | "supervisor" | "capturista"
// ──────────────────────────────────────────────────────────────────────────────
const D_NOMINAS_ADMIN = [
  { id: "na1", nombre: "María González", puesto: "Secretaria", sueldoBase: 12000, deducciones: 800, descripcionDeducciones: "IMSS", bonos: 0, otrasPercepciones: 0, activo: true, notas: "" },
  { id: "na2", nombre: "Roberto Sánchez", puesto: "Gerente de Operaciones", sueldoBase: 25000, deducciones: 2000, descripcionDeducciones: "IMSS + Crédito Infonavit", bonos: 500, otrasPercepciones: 0, activo: true, notas: "" },
];

const D_ROLES = [
  { id: "admin",      nombre: "Administrador", descripcion: "Acceso total al sistema", color: "var(--red)",    icono: "🔒", editable: false,
    permisos: { verFinanciero:true, editarFacturas:true, cobrarFacturas:true, verNominas:true, verNominasAdmin:true, verReportes:true, verCostos:true, editarUnidades:true, editarConductores:true, editarProveedores:true, crearViajes:true, editarViajes:true, crearMantenimientos:true, crearGastos:true, crearCombustible:true, gestionarUsuarios:true, verFacturacion:true, crearFacturas:true, hojaViaje:true } },
  { id: "supervisor", nombre: "Supervisor",     descripcion: "Operaciones y reportes básicos", color: "var(--orange)", icono: "🔧", editable: false,
    permisos: { verFinanciero:false, editarFacturas:false, cobrarFacturas:false, verNominas:false, verNominasAdmin:false, verReportes:true, verCostos:true, editarUnidades:false, editarConductores:false, editarProveedores:false, crearViajes:true, editarViajes:true, crearMantenimientos:true, crearGastos:true, crearCombustible:true, gestionarUsuarios:false, verFacturacion:true, crearFacturas:true, hojaViaje:true } },
  { id: "capturista", nombre: "Capturista",     descripcion: "Captura operativa diaria", color: "var(--cyan)",   icono: "✏️", editable: false,
    permisos: { verFinanciero:false, editarFacturas:false, cobrarFacturas:false, verNominas:false, verNominasAdmin:false, verReportes:false, verCostos:false, editarUnidades:false, editarConductores:false, editarProveedores:false, crearViajes:true, editarViajes:true, crearMantenimientos:false, crearGastos:false, crearCombustible:true, gestionarUsuarios:false, verFacturacion:false, crearFacturas:false, hojaViaje:true } },
];

const D_USUARIOS = [
  { id: "u1", nombre: "Administrador",  email: "admin@empresa.com",      password: "admin123",  rol: "admin",       activo: true },
  { id: "u2", nombre: "Supervisor",     email: "supervisor@empresa.com", password: "super123",  rol: "supervisor",  activo: true },
  { id: "u3", nombre: "Capturista",     email: "captura@empresa.com",    password: "captura123",rol: "capturista",  activo: true },
];

// Permisos por rol
// Permisos base por rol (se pueden sobreescribir individualmente por usuario)
const PERMS_BASE = {
  admin: {
    verFinanciero: true, editarFacturas: true,
    verNominas: true, verNominasAdmin: true, verReportes: true, verCostos: true,
    editarUnidades: true, editarConductores: true, editarProveedores: true,
    crearViajes: true, editarViajes: true, crearMantenimientos: true,
    crearGastos: true, crearCombustible: true, gestionarUsuarios: true,
    verFacturacion: true, crearFacturas: true, cobrarFacturas: true, hojaViaje: true,
  },
  supervisor: {
    verFinanciero: false, editarFacturas: false, cobrarFacturas: false,
    verNominas: false, verNominasAdmin: false, verReportes: true, verCostos: true,
    editarUnidades: false, editarConductores: false, editarProveedores: false,
    crearViajes: true, editarViajes: true, crearMantenimientos: true,
    crearGastos: true, crearCombustible: true, gestionarUsuarios: false,
    verFacturacion: true, crearFacturas: true, hojaViaje: true,
  },
  capturista: {
    verFinanciero: false, editarFacturas: false, cobrarFacturas: false,
    verNominas: false, verNominasAdmin: false, verReportes: false, verCostos: false,
    editarUnidades: false, editarConductores: false, editarProveedores: false,
    crearViajes: true, editarViajes: true, crearMantenimientos: false,
    crearGastos: false, crearCombustible: true, gestionarUsuarios: false,
    verFacturacion: false, crearFacturas: false, hojaViaje: true,
  },
};

// Lista de todos los permisos disponibles con etiqueta legible
const TODOS_PERMISOS = [
  { key:"verFinanciero",      lbl:"Ver datos financieros",       grupo:"💰 Finanzas" },
  { key:"verNominas",         lbl:"Ver nóminas de operadores",   grupo:"💰 Finanzas" },
  { key:"verNominasAdmin",    lbl:"Ver nóminas administrativas", grupo:"💰 Finanzas" },
  { key:"verFacturacion",     lbl:"Ver facturación y clientes",  grupo:"💰 Finanzas" },
  { key:"crearFacturas",      lbl:"Crear facturas",              grupo:"💰 Finanzas" },
  { key:"cobrarFacturas",     lbl:"Marcar facturas cobradas",    grupo:"💰 Finanzas" },
  { key:"editarFacturas",     lbl:"Editar/eliminar facturas",    grupo:"💰 Finanzas" },
  { key:"verReportes",        lbl:"Ver reportes históricos",     grupo:"📊 Reportes" },
  { key:"verCostos",          lbl:"Ver costos y tarifas",        grupo:"📊 Reportes" },
  { key:"crearViajes",        lbl:"Crear viajes",                grupo:"🚛 Operativo" },
  { key:"editarViajes",       lbl:"Editar viajes",               grupo:"🚛 Operativo" },
  { key:"hojaViaje",          lbl:"Generar hoja de viaje",       grupo:"🚛 Operativo" },
  { key:"crearMantenimientos",lbl:"Crear mantenimientos",        grupo:"🔧 Taller" },
  { key:"crearGastos",        lbl:"Registrar gastos generales",  grupo:"🔧 Taller" },
  { key:"crearCombustible",   lbl:"Registrar combustible",       grupo:"🔧 Taller" },
  { key:"editarUnidades",     lbl:"Agregar/editar unidades",     grupo:"⚙️ Config" },
  { key:"editarConductores",  lbl:"Agregar/editar conductores",  grupo:"⚙️ Config" },
  { key:"editarProveedores",  lbl:"Gestionar proveedores",       grupo:"⚙️ Config" },
  { key:"gestionarUsuarios",  lbl:"Gestionar usuarios del sistema", grupo:"⚙️ Config" },
];

// Resolver permisos reales: busca en roles dinámicos, luego PERMS_BASE, luego aplica overrides
const getPerms = (usuario, rolesLista = []) => {
  if (!usuario) return {};
  // Buscar en roles dinámicos primero
  const rolDin = rolesLista.find(r => r.id === usuario.rol);
  const base = rolDin
    ? { ...rolDin.permisos }
    : { ...(PERMS_BASE[usuario.rol] || PERMS_BASE.capturista) };
  if (usuario.permisosExtra) Object.assign(base, usuario.permisosExtra);
  return base;
};

// Helper de compatibilidad
const PERMS = PERMS_BASE;
const can = (rol, perm) => !!(PERMS_BASE[rol] && PERMS_BASE[rol][perm]);



const GASTO_TIPOS = ["Telefonía e Internet", "Renta de Instalaciones", "Servicios Públicos", "Papelería", "Mantenimiento Oficina", "Seguros Generales", "Software y Licencias", "Publicidad", "Honorarios", "Impuestos", "Gastos a Proveedores", "Otro"];
const HERRAMIENTAS = ["Torreta Mata Chispas", "Extintor", "Cadenas", "Gata", "Bandas", "Tacones", "Llave de Cruz", "Triángulos Seguridad", "Botiquín", "Conos", "Cables Pasa Corriente", "Señalamientos", "Otro"];

const FORMAS_PAGO_SAT = {
  "01": "Efectivo",
  "02": "Cheque nominativo",
  "03": "Transferencia electrónica",
  "04": "Tarjeta de crédito",
  "28": "Tarjeta de débito",
  "99": "Por definir"
};

const METODOS_PAGO = {
  "PUE": "Pago en una exhibición",
  "PPD": "Pago en parcialidades"
};

const USOS_CFDI = {
  "G03": "Gastos en general",
  "P01": "Por definir",
  "D02": "Gastos médicos",
  "S01": "Sin efectos fiscales"
};


const D_UNITS = [
  { id: "u1", num: "001", operador: "op1", placas: "ABC-1234", eco: "ECO-01", tipo: "TRACTOCAMIÓN", marca: "KENWORTH", modelo: "T680", anio: "2021", vin: "1XKAD49X8LJ123456", ruta: "Monterrey-CDMX", estado: "ACTIVA", kmActual: 145200, kmUltMant: 143500, intervaloMant: 5000, notas: "", foto: "", deprecAnual: 50000, rendEsperado: 2.2 },
  { id: "u2", num: "002", operador: "op2", placas: "DEF-5678", eco: "ECO-02", tipo: "CAMIÓN", marca: "FREIGHTLINER", modelo: "M2 106", anio: "2019", vin: "1FVHG5BX3KHAB7890", ruta: "GDL-Tijuana", estado: "EN TALLER", kmActual: 87300, kmUltMant: 85000, intervaloMant: 5000, notas: "Frenos", foto: "", deprecAnual: 35000, rendEsperado: 2.5 },
  { id: "u3", num: "003", operador: "op3", placas: "GHI-9012", eco: "ECO-03", tipo: "PLATAFORMA 48 PIES", marca: "DINA", modelo: "T682", anio: "2018", vin: "8T1BF4D55EU123789", ruta: "MTY-Laredo", estado: "ACTIVA", kmActual: 201500, kmUltMant: 199800, intervaloMant: 5000, notas: "", foto: "", deprecAnual: 40000, rendEsperado: 2.0 },
];

const D_DRIVERS = [
  { id: "op1", nombre: "Juan Pérez Soto", licencia: "LIC-2345678", licTipo: "E", licVence: "31/12/2026", tel: "8112345678", email: "juan@empresa.com", antiguedad: "2018", status: "ACTIVO", foto: "", notas: "", sueldoBase: 8000, porcentajeViaje: 10 },
  { id: "op2", nombre: "Carlos Mendoza", licencia: "LIC-3456789", licTipo: "E", licVence: "15/06/2025", tel: "8123456789", email: "carlos@empresa.com", antiguedad: "2020", status: "ACTIVO", foto: "", notas: "", sueldoBase: 7500, porcentajeViaje: 12 },
  { id: "op3", nombre: "Luis Torres", licencia: "LIC-4567890", licTipo: "D", licVence: "30/09/2026", tel: "8134567890", email: "luis@empresa.com", antiguedad: "2015", status: "ACTIVO", foto: "", notas: "", sueldoBase: 9000, porcentajeViaje: 10 },
];

const D_DOCS = [
  { id: "d1", unidadId: "u1", nombre: "Seguro", numero: "SEG-001", vence: "31/12/2026", empresa: "GNP", notas: "", foto: "" },
  { id: "d2", unidadId: "u1", nombre: "Verificación", numero: "VER-001", vence: "30/06/2026", empresa: "Gob NL", notas: "", foto: "" },
];

const D_MAINTS = [
  { id: "m1", unidadId: "u1", tipo: "PREVENTIVO", desc: "Cambio aceite motor y filtros", prioridad: "BAJA", fechaProg: "05/02/2026", fechaEjec: "05/02/2026", realizado: "SI", taller: "Taller Expreso", km: 145200, costoRef: 1200, costoMO: 1600, obs: "Aceite 15W40" },
  { id: "m2", unidadId: "u2", tipo: "CORRECTIVO", desc: "Reparación frenos delanteros", prioridad: "ALTA", fechaProg: "10/02/2026", fechaEjec: "", realizado: "NO", taller: "Taller Norma", km: 87300, costoRef: 4500, costoMO: 2000, obs: "En espera refacciones" },
];

const D_FUELS = [
  { id: "f1", unidadId: "u1", fecha: "01/02/2026", km: 145000, litros: 400, precio: 24.50, estacion: "PEMEX Carretera", ticket: "T-001258", kmRec: 800, obs: "" },
  { id: "f2", unidadId: "u2", fecha: "03/02/2026", km: 86800, litros: 350, precio: 24.50, estacion: "OXXO Gas", ticket: "T-002341", kmRec: 700, obs: "" },
];

const D_TRIPS = [
  { id: "t1", unidadId: "u1", esExterno: false, origen: "Monterrey, NL", destino: "CDMX", fecha: "01/02/2026", fechaReg: "03/02/2026", kmSalida: 144200, kmLlegada: 145200, carga: "Electrónicos", cliente: "TechMex SA", status: "COMPLETADO", notas: "", costoOfrecido: 25000, gastosExtras: 1200, costoEstadias: 0, evidencias: [] },
  { id: "t2", unidadId: "u3", esExterno: false, origen: "Monterrey, NL", destino: "Nuevo Laredo", fecha: "06/02/2026", fechaReg: "07/02/2026", kmSalida: 200700, kmLlegada: 201500, carga: "Autopartes", cliente: "Exportadora NL", status: "COMPLETADO", notas: "", costoOfrecido: 15000, gastosExtras: 800, costoEstadias: 0, evidencias: [] },
];

const D_EXTERNOS = [
  { id: "ex1", fecha: "05/02/2026", empresa: "Transportes del Norte", contacto: "Roberto Garza", tel: "8198765432", tipoUnidad: "TRACTOCAMIÓN KENWORTH", placas: "XYZ-9876", color: "Blanco", eco: "TN-505", operador: "Miguel Hernández", seguroOp: "SEG-OP-2025", seguroVeh: "SEG-VEH-2025", herramientas: ["Extintor", "Cadenas", "Gata"], origen: "Guadalajara", destino: "Tijuana", cliente: "Exportadora Pacífico", carga: "Electrónicos", costoPagar: 18000, precioCliente: 24000, costoEstadias: 1500, status: "COMPLETADO", notas: "Viaje completado sin novedad", evidencias: [], proveedorId: "", pagoStatus: "pendiente", pagoFecha: "", pagoForma: "", pagoReferencia: "", pagoNotas: "", pagoEvidencias: [] },
];

const D_GASTOS = [
  { id: "g1", fecha: "01/02/2026", tipo: "Renta de Instalaciones", descripcion: "Renta mensual oficina MTY", monto: 15000, responsable: "Administración" },
  { id: "g2", fecha: "05/02/2026", tipo: "Telefonía e Internet", descripcion: "Pago mensual Telmex + internet", monto: 2500, responsable: "Administración" },
];


const D_FACTURAS = [
  {
    id: "fac1",
    serie: "A",
    numeroFactura: "001",
    clienteId: "cli1",
    cliente: "TechMex SA de CV",
    rfcCliente: "TMX980101ABC",
    tipoCliente: "MORAL",
    emailCliente: "facturacion@techmex.com",
    fechaEmision: "03/02/2026",
    diasCredito: 30,
    fechaVencimiento: "05/03/2026",
    subtotal: 25000,
    iva: 4000,
    retencionIVA: 1000,
    total: 28000,
    status: "PENDIENTE",
    formaPago: "03",
    metodoPago: "PPD",
    usoCFDI: "G03",
    viajeId: "t1",
    fechaPago: "",
    notas: ""
  }
];

const D_CLIENTES = [
  {
    id: "cli1",
    nombre: "TechMex SA de CV",
    nombreCorto: "TechMex",
    rfc: "TMX980101ABC",
    tipo: "MORAL",
    email: "facturacion@techmex.com",
    telefono: "8181234567",
    direccion: "Av. Principal 123, MTY",
    diasCreditoDefault: 30,
    limiteCredito: 500000,
    status: "ACTIVO",
    notas: ""
  },
  {
    id: "cli2",
    nombre: "Exportadora NL SA",
    nombreCorto: "Exportadora NL",
    rfc: "ENL950215XYZ",
    tipo: "MORAL",
    email: "cxp@exportadoranl.com",
    telefono: "8187654321",
    direccion: "Carr. Miguel Alemán 456",
    diasCreditoDefault: 45,
    limiteCredito: 750000,
    status: "ACTIVO",
    notas: ""
  }
];


const Bdg = ({ c, t }) => <span className={`badge ${c}`}>{t}</span>;
const estadoBdg = e => <Bdg c={{ "ACTIVA": "bg", "EN TALLER": "by", "BAJA TEMPORAL": "br", "BAJA DEFINITIVA": "bm", "INACTIVA": "bm" }[e] || "bm"} t={`● ${e}`} />;
const prioBdg = p => <Bdg c={{ ALTA: "br", MEDIA: "by", BAJA: "bg" }[p] || "bm"} t={p} />;
const realBdg = r => r === "SI" ? <Bdg c="bg" t="✓ SI" /> : <Bdg c="by" t="✗ NO" />;
const docBdg = days => {
  if (days === null) return <Bdg c="bm" t="Sin fecha" />;
  if (days < 0) return <Bdg c="br" t="VENCIDO" />;
  if (days <= 30) return <Bdg c="by" t={`⚠ ${days}d`} />;
  return <Bdg c="bg" t={`✓ ${days}d`} />;
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose]);
  return <div className={`toast ${{ success: "t-ok", error: "t-err", info: "t-info" }[type] || "t-ok"}`}><span>{{ success: "✓", error: "✕", info: "ℹ" }[type]}</span>{msg}</div>;
}

function Confirm({ msg, onOk, onCancel }) {
  return (
    <div className="modal-ov" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>⚠️ Confirmar</h3></div>
        <div className="mbody"><p style={{ lineHeight: 1.7 }}>{msg}</p></div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onCancel}>Cancelar</button><button className="btn btn-red" onClick={onOk}>Eliminar</button></div>
      </div>
    </div>
  );
}

function PhotoInput({ value, onChange, label = "Foto" }) {
  const ref = useRef();
  const handle = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => onChange(ev.target.result); r.readAsDataURL(f) };
  return (
    <div className="field">
      <label>{label}</label>
      <div className="photo-box" onClick={() => ref.current.click()}>
        {value ? <img src={value} alt="" /> : <><span style={{ fontSize: 28, opacity: .4 }}>📷</span><span style={{ fontSize: 11, color: "var(--muted)" }}>Clic para subir</span></>}
        <input ref={ref} type="file" accept="image/*" onChange={handle} style={{ display: "none" }} />
      </div>
    </div>
  );
}

function PhotoInputSm({ value, onChange, label = "Foto" }) {
  const ref = useRef();
  const handle = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => onChange(ev.target.result); r.readAsDataURL(f) };
  return (
    <div className="field">
      <label>{label}</label>
      <div className="photo-box sm" onClick={() => ref.current.click()}>
        {value ? <img src={value} alt="" /> : <><span style={{ fontSize: 22, opacity: .4 }}>📷</span><span style={{ fontSize: 10, color: "var(--muted)" }}>Clic</span></>}
        <input ref={ref} type="file" accept="image/*" onChange={handle} style={{ display: "none" }} />
      </div>
    </div>
  );
}

function MultiPhotoInput({ values = [], onChange, label = "Evidencias Fotográficas" }) {
  const ref = useRef();
  const handle = e => {
    const files = Array.from(e.target.files);
    const readers = files.map(f => new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(f) }));
    Promise.all(readers).then(results => onChange([...values, ...results]));
  };
  const remove = i => onChange(values.filter((_, idx) => idx !== i));
  return (
    <div className="field s2">
      <label>{label} ({values.length})</label>
      <div className="photo-box" onClick={() => ref.current.click()} style={{ height: 60, flexDirection: "row", gap: 8 }}>
        <span style={{ fontSize: 24, opacity: .4 }}>📸</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Clic para subir (múltiples)</span>
        <input ref={ref} type="file" accept="image/*" multiple onChange={handle} style={{ display: "none" }} />
      </div>
      {values.length > 0 && (
        <div className="photo-grid">
          {values.map((v, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={v} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} alt={`ev${i}`} />
              <button className="btn btn-red btn-xs" onClick={e => { e.stopPropagation(); remove(i) }} style={{ position: "absolute", top: 4, right: 4 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
function UnitModal({ unit, drivers, onSave, onClose, tiposPersonalizados = [], onAddTipo }) {
  const [f, setF] = useState(unit || { 
    num: "", 
    operador: "", 
    placas: "", 
    eco: "", 
    tipo: "CAMIÓN", 
    marca: "", 
    modelo: "", 
    anio: "", 
    vin: "", 
    ruta: "", 
    estado: "ACTIVA", 
    kmActual: "", 
    kmUltMant: "", 
    intervaloMant: 5000,  // NUEVO - reemplaza proxMant
    notas: "", 
    foto: "", 
    deprecAnual: 0, 
    rendEsperado: 0 
  });
  
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  
  const ok = () => { 
    if (!f.num || !f.placas) return alert("Número y placas requeridos"); 
    onSave({ ...f, id: f.id || uid() }) 
  };

  // Calcular KM para próximo mantenimiento
  const kmProximo = (Number(f.kmUltMant) || 0) + (Number(f.intervaloMant) || 0);
  const kmRestantes = kmProximo - (Number(f.kmActual) || 0);

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr">
          <h3>{f.id ? "✏️ Editar Unidad" : "🚛 Nueva Unidad"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="fg">
            <PhotoInput value={f.foto} onChange={v => setF(p => ({ ...p, foto: v }))} label="Fotografía de la Unidad" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="fg">
                <div className="field">
                  <label>N° Unidad *</label>
                  <input value={f.num} onChange={ch("num")} placeholder="001" />
                </div>
                <div className="field">
                  <label>Eco.</label>
                  <input value={f.eco} onChange={ch("eco")} placeholder="ECO-01" />
                </div>
              </div>
              <div className="field">
                <label>Operador</label>
                <select value={f.operador} onChange={ch("operador")}>
                  <option value="">— Sin asignar —</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Placas *</label>
                <input value={f.placas} onChange={ch("placas")} placeholder="ABC-1234" />
              </div>
            </div>
          </div>

          <div className="sec-lbl">Datos Técnicos</div>
          <div className="fg">
            <div className="field">
              <label>Tipo</label>
              <select value={[...TIPOS, ...tiposPersonalizados].includes(f.tipo) ? f.tipo : "__custom__"}
                onChange={e => {
                  if (e.target.value === "__custom__") setF(p=>({...p, tipo:""}));
                  else setF(p=>({...p, tipo:e.target.value}));
                }}>
                {[...TIPOS, ...tiposPersonalizados].map(t => <option key={t} value={t}>{t}</option>)}
                <option value="__custom__">✏️ Agregar tipo nuevo...</option>
              </select>
              {(![...TIPOS, ...tiposPersonalizados].includes(f.tipo) || f.tipo === "") && (
                <input
                  value={f.tipo}
                  onChange={ch("tipo")}
                  placeholder="Escribe el tipo de unidad"
                  style={{marginTop:6}}
                  onBlur={() => {
                    if (f.tipo && f.tipo.trim() && !TIPOS.includes(f.tipo) && !tiposPersonalizados.includes(f.tipo)) {
                      if (onAddTipo) onAddTipo(f.tipo.trim().toUpperCase());
                      setF(p=>({...p, tipo: p.tipo.trim().toUpperCase()}));
                    }
                  }}
                />
              )}
            </div>
            <div className="field">
              <label>Marca</label>
              <input value={f.marca} onChange={ch("marca")} />
            </div>
            <div className="field">
              <label>Modelo</label>
              <input value={f.modelo} onChange={ch("modelo")} />
            </div>
            <div className="field">
              <label>Año</label>
              <input value={f.anio} onChange={ch("anio")} type="number" />
            </div>
            <div className="field s2">
              <label>VIN / No. Serie</label>
              <input value={f.vin} onChange={ch("vin")} />
            </div>
          </div>

          <div className="sec-lbl">Estado & Operación</div>
          <div className="fg">
            <div className="field">
              <label>Estado</label>
              <select value={f.estado} onChange={ch("estado")}>
                {ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Ruta Asignada</label>
              <input value={f.ruta} onChange={ch("ruta")} />
            </div>
            <div className="field">
              <label>KM Actual</label>
              <input value={f.kmActual} onChange={ch("kmActual")} type="number" />
            </div>
            <div className="field">
              <label>KM Último Mantenimiento</label>
              <input value={f.kmUltMant} onChange={ch("kmUltMant")} type="number" />
            </div>
            <div className="field">
              <label>Intervalo de Mantenimiento (km)</label>
              <input 
                value={f.intervaloMant} 
                onChange={ch("intervaloMant")} 
                type="number"
                placeholder="5000"
              />
            </div>
            <div className="field s2">
              <label>Notas</label>
              <textarea value={f.notas} onChange={ch("notas")} rows={2} />
            </div>
          </div>

          {/* Alerta de mantenimiento */}
          {f.kmActual && f.kmUltMant && f.intervaloMant && (
            <div className={`km-alert ${kmRestantes <= 0 ? "critical" : ""}`}>
              <span style={{ fontSize: 20 }}>
                {kmRestantes <= 0 ? "🚨" : kmRestantes <= 500 ? "⚠️" : "✓"}
              </span>
              <div>
                <strong>Próximo mantenimiento:</strong> {fmtN(kmProximo)} km
                <div style={{ fontSize: 11, marginTop: 2 }}>
                  {kmRestantes > 0 
                    ? `Faltan ${fmtN(kmRestantes)} km` 
                    : `¡ATENCIÓN! Pasado por ${fmtN(Math.abs(kmRestantes))} km`}
                </div>
              </div>
            </div>
          )}

          <div className="sec-lbl">🔒 Financiero</div>
          <div className="fg">
            <div className="field">
              <label>Depreciación Anual ($)</label>
              <input value={f.deprecAnual} onChange={ch("deprecAnual")} type="number" />
            </div>
            <div className="field">
              <label>Rendimiento Esperado (km/L)</label>
              <input value={f.rendEsperado} onChange={ch("rendEsperado")} type="number" step="0.1" />
            </div>
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-cyan" onClick={ok}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// DRIVER MODAL ACTUALIZADO (v6)
// CAMBIOS: porcentajeViaje en lugar de salarioSemanal
// ──────────────────────────────────────────────────────────────

function DriverModal({ driver, units, onSave, onClose }) {
  const [f, setF] = useState(driver || { 
    nombre: "", 
    licencia: "", 
    licTipo: "E", 
    licVence: "", 
    tel: "", 
    email: "", 
    antiguedad: "", 
    status: "ACTIVO", 
    foto: "", 
    notas: "", 
    sueldoBase: 0,
    porcentajeViaje: 10
  });
  
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const ok = () => { if (!f.nombre) return alert("Nombre requerido"); onSave({ ...f, id: f.id || uid() }) };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr">
          <h3>{f.id ? "✏️ Editar Conductor" : "👨‍✈️ Nuevo Conductor"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="fg">
            <PhotoInput value={f.foto} onChange={v => setF(p => ({ ...p, foto: v }))} label="Foto del Conductor" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="field">
                <label>Nombre Completo *</label>
                <input value={f.nombre} onChange={ch("nombre")} />
              </div>
              <div className="field">
                <label>Teléfono</label>
                <input value={f.tel} onChange={ch("tel")} />
              </div>
              <div className="field">
                <label>Status</label>
                <select value={f.status} onChange={ch("status")}>
                  <option>ACTIVO</option>
                  <option>INACTIVO</option>
                  <option>VACACIONES</option>
                  <option>BAJA</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sec-lbl">Documentos</div>
          <div className="fg">
            <div className="field">
              <label>N° Licencia</label>
              <input value={f.licencia} onChange={ch("licencia")} />
            </div>
            <div className="field">
              <label>Tipo Lic.</label>
              <select value={f.licTipo} onChange={ch("licTipo")}>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
                <option>E</option>
              </select>
            </div>
            <div className="field">
              <label>Vence Licencia</label>
              <input value={f.licVence} onChange={ch("licVence")} placeholder="dd/mm/aaaa" />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={f.email} onChange={ch("email")} type="email" />
            </div>
            <div className="field">
              <label>Año Ingreso</label>
              <input value={f.antiguedad} onChange={ch("antiguedad")} type="number" />
            </div>
            <div className="field s2">
              <label>Notas</label>
              <textarea value={f.notas} onChange={ch("notas")} rows={2} />
            </div>
          </div>

          <div className="sec-lbl" style={{ color: "var(--cyan)", borderColor: "var(--cyan)", background: "rgba(0,153,204,.08)", padding: "6px 12px", borderRadius: 6 }}>💵 Nómina — Sueldo y Comisión por Viaje</div>
          <div className="fg">
            <div className="field">
              <label>Sueldo Base Mensual ($)</label>
              <input 
                value={f.sueldoBase} 
                onChange={ch("sueldoBase")} 
                type="number" 
                min="0"
                step="100"
                placeholder="8000"
              />
            </div>
            <div className="field">
              <label>% Comisión por Viaje</label>
              <input 
                value={f.porcentajeViaje} 
                onChange={ch("porcentajeViaje")} 
                type="number" 
                step="0.1"
                min="0"
                max="100"
                placeholder="10"
              />
            </div>
            <div className="field s2">
              <div style={{
                padding: "12px 16px",
                background: "#E8F5FA",
                borderRadius: 8,
                fontSize: 11,
                border: "1px solid #B3E0F2"
              }}>
                <strong style={{ color: "var(--cyan)" }}>ℹ️ Nómina:</strong>
                <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.6 }}>
                  Sueldo base: <strong>{fmt$(Number(f.sueldoBase) || 0)}</strong>/mes<br/>
                  Comisión por viaje: <strong>{f.porcentajeViaje}%</strong> sobre el costo (antes de IVA)
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-cyan" onClick={ok}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// FUEL MODAL ACTUALIZADO (v6)
// CAMBIOS: Actualiza automáticamente kmActual de la unidad
// ──────────────────────────────────────────────────────────────

function FuelModal({ fuel, units, onSave, onClose, onUpdateUnit }) {
  const [f, setF] = useState(fuel || { 
    unidadId: "", 
    fecha: "", 
    km: "", 
    litros: "", 
    precio: "", 
    estacion: "", 
    ticket: "", 
    kmRec: "", 
    obs: "" 
  });
  
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const costo = (Number(f.litros) || 0) * (Number(f.precio) || 0);
  const rend = f.kmRec && f.litros ? (Number(f.kmRec) / Number(f.litros)).toFixed(2) : null;
  
  const ok = () => { 
    if (!f.unidadId || !f.litros) return alert("Unidad y litros requeridos"); 
    
    // NUEVO: Actualizar KM de la unidad automáticamente
    const unit = units.find(u => u.id === f.unidadId);
    if (unit && f.km && Number(f.km) > Number(unit.kmActual)) {
      const updatedUnit = { ...unit, kmActual: Number(f.km) };
      onUpdateUnit(updatedUnit);
    }
    
    onSave({ ...f, id: f.id || uid() });
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr">
          <h3>{f.id ? "✏️ Editar Carga" : "⛽ Nueva Carga"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2">
              <label>Unidad *</label>
              <select value={f.unidadId} onChange={ch("unidadId")}>
                <option value="">— Seleccionar —</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Fecha</label>
              <input value={f.fecha} onChange={ch("fecha")} placeholder="dd/mm/aaaa" />
            </div>
            <div className="field">
              <label>KM al Cargar</label>
              <input value={f.km} onChange={ch("km")} type="number" />
            </div>
            <div className="field">
              <label>Litros *</label>
              <input value={f.litros} onChange={ch("litros")} type="number" step="0.01" />
            </div>
            <div className="field">
              <label>Precio/Litro ($)</label>
              <input value={f.precio} onChange={ch("precio")} type="number" step="0.01" />
            </div>
            <div className="field">
              <label>KM Recorridos</label>
              <input value={f.kmRec} onChange={ch("kmRec")} type="number" />
            </div>
            <div className="field">
              <label>Estación</label>
              <input value={f.estacion} onChange={ch("estacion")} />
            </div>
            <div className="field">
              <label>Ticket / Factura</label>
              <input value={f.ticket} onChange={ch("ticket")} />
            </div>
            <div className="field s2">
              <label>Observaciones</label>
              <textarea value={f.obs} onChange={ch("obs")} rows={2} />
            </div>
          </div>
          
          {costo > 0 && (
            <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--bg2)", borderRadius: 10, display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, fontWeight: 700 }}>
                  COSTO TOTAL
                </div>
                <div style={{ fontFamily: "var(--font-hd)", fontSize: 24, fontWeight: 700, color: "var(--orange)" }}>
                  {fmt$(costo)}
                </div>
              </div>
              {rend && (
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, fontWeight: 700 }}>
                    RENDIMIENTO
                  </div>
                  <div style={{ fontFamily: "var(--font-hd)", fontSize: 24, fontWeight: 700, color: "var(--cyan)" }}>
                    {rend} km/L
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensaje informativo sobre actualización automática */}
          {f.unidadId && f.km && (
            <div style={{
              padding: "10px 14px",
              background: "#E8F9F3",
              border: "1px solid #B8EDCA",
              borderRadius: 8,
              marginTop: 12,
              fontSize: 11,
              color: "#00864E"
            }}>
              <strong>✓ Actualización automática:</strong> El kilometraje actual de la unidad se actualizará a {fmtN(f.km)} km
            </div>
          )}
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-cyan" onClick={ok}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}
function DocModal({ doc, units, drivers, onSave, onClose }) {
  const [f, setF] = useState(doc || { entidadTipo: "unidad", unidadId: "", operadorId: "", nombre: DOCS_LIST_UNIDAD[0], numero: "", vence: "", empresa: "", notas: "", foto: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const docList = f.entidadTipo === "operador" ? DOCS_LIST_OPERADOR : DOCS_LIST_UNIDAD;

  const ok = () => { 
    if (f.entidadTipo === "unidad" && !f.unidadId) return alert("Selecciona una unidad");
    if (f.entidadTipo === "operador" && !f.operadorId) return alert("Selecciona un operador");
    if (!f.nombre) return alert("Tipo de documento requerido");
    onSave({ ...f, id: f.id || uid() });
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar" : "📄 Nuevo Documento"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            {/* Tipo de entidad */}
            <div className="field s2">
              <label>Pertenece a</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button className={`btn ${f.entidadTipo === "unidad" ? "btn-cyan" : "btn-ghost"} btn-sm`} onClick={() => setF(p => ({ ...p, entidadTipo: "unidad", operadorId: "", nombre: DOCS_LIST_UNIDAD[0] }))}>🚛 Unidad</button>
                <button className={`btn ${f.entidadTipo === "operador" ? "btn-cyan" : "btn-ghost"} btn-sm`} onClick={() => setF(p => ({ ...p, entidadTipo: "operador", unidadId: "", nombre: DOCS_LIST_OPERADOR[0] }))}>👤 Operador</button>
              </div>
            </div>
            {/* Selector condicional */}
            {f.entidadTipo === "unidad" ? (
              <div className="field s2"><label>Unidad *</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u => <option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            ) : (
              <div className="field s2"><label>Operador *</label><select value={f.operadorId} onChange={ch("operadorId")}><option value="">— Seleccionar —</option>{(drivers||[]).map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></div>
            )}
            <div className="field"><label>Tipo *</label><select value={f.nombre} onChange={ch("nombre")}>{docList.map(d => <option key={d}>{d}</option>)}</select></div>
            <div className="field"><label>Número / Folio</label><input value={f.numero} onChange={ch("numero")} /></div>
            <div className="field"><label>Fecha Vencimiento</label><input value={f.vence} onChange={ch("vence")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>Empresa / Emisor</label><input value={f.empresa} onChange={ch("empresa")} /></div>
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2} /></div>
            <PhotoInputSm value={f.foto} onChange={v => setF(p => ({ ...p, foto: v }))} label="Foto del documento" />
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function MaintModal({ maint, units, proveedores, onSave, onClose }) {
  const [f, setF] = useState(maint || { unidadId: "", tipo: "PREVENTIVO", desc: "", prioridad: "MEDIA", fechaProg: "", fechaEjec: "", realizado: "NO", proveedorId: "", taller: "", km: "", costoRef: 0, costoMO: 0, obs: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const provs = (proveedores || []).filter(p => ["Talleres","Mano de Obra","Refacciones"].includes(p.categoria));
  const selectedProv = provs.find(p => p.id === f.proveedorId);
  const ok = () => { if (!f.unidadId || !f.desc) return alert("Unidad y descripción requeridos"); onSave({ ...f, id: f.id || uid() }) };
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar" : "🔧 Nuevo Mantenimiento"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2"><label>Unidad *</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u => <option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            <div className="field"><label>Tipo</label><select value={f.tipo} onChange={ch("tipo")}>{SERVS.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="field"><label>Prioridad</label><select value={f.prioridad} onChange={ch("prioridad")}>{PRIOS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div className="field s2"><label>Descripción *</label><textarea value={f.desc} onChange={ch("desc")} rows={2} /></div>
            <div className="field"><label>F. Programada</label><input value={f.fechaProg} onChange={ch("fechaProg")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>F. Ejecución</label><input value={f.fechaEjec} onChange={ch("fechaEjec")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>Realizado</label><select value={f.realizado} onChange={ch("realizado")}><option>NO</option><option>SI</option></select></div>
            <div className="field"><label>KM Servicio</label><input value={f.km} onChange={ch("km")} type="number" /></div>
            <div className="field s2">
              <label>Proveedor / Taller</label>
              <select value={f.proveedorId} onChange={e => { const id = e.target.value; const pv = provs.find(p => p.id === id); setF(prev => ({ ...prev, proveedorId: id, taller: pv ? pv.nombre : prev.taller })) }}>
                <option value="">— Sin vincular —</option>
                {provs.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.categoria})</option>)}
              </select>
            </div>
            {!f.proveedorId && (
              <div className="field s2"><label>Nombre Taller / Proveedor (manual)</label><input value={f.taller} onChange={ch("taller")} placeholder="Nombre del taller o proveedor" /></div>
            )}
            {selectedProv && (
              <div className="field s2">
                <div style={{ padding: "10px 14px", background: "#E8F5FA", borderRadius: 8, fontSize: 11, border: "1px solid #B3E0F2" }}>
                  <strong style={{ color: "var(--cyan)" }}>🏪 {selectedProv.nombre}</strong>
                  <div style={{ marginTop: 4, color: "var(--muted)" }}>
                    {selectedProv.contacto && <span>Contacto: {selectedProv.contacto} · </span>}
                    {selectedProv.tel && <span>Tel: {selectedProv.tel}</span>}
                  </div>
                </div>
              </div>
            )}
            <div className="field"><label>Costo Refac. ($)</label><input value={f.costoRef} onChange={ch("costoRef")} type="number" /></div>
            <div className="field"><label>Costo M.O. ($)</label><input value={f.costoMO} onChange={ch("costoMO")} type="number" /></div>
            <div className="field s2"><label>Observaciones</label><textarea value={f.obs} onChange={ch("obs")} rows={2} /></div>
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}
function TripModal({ trip, units, onSave, onClose }) {
  const [f, setF] = useState(trip || { unidadId: "", esExterno: false, origen: "", destino: "", fecha: "", fechaReg: "", kmSalida: "", kmLlegada: "", carga: "", cliente: "", status: "EN RUTA", notas: "", costoOfrecido: 0, gastosExtras: 0, costoEstadias: 0, evidencias: [] });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const dist = f.kmLlegada && f.kmSalida ? Number(f.kmLlegada) - Number(f.kmSalida) : null;
  const ok = () => { if (!f.unidadId || !f.origen) return alert("Unidad y origen requeridos"); onSave({ ...f, id: f.id || uid() }) };
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar Viaje" : "🗺️ Nuevo Viaje"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2"><label>Unidad *</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u => <option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            <div className="field"><label>Origen *</label><input value={f.origen} onChange={ch("origen")} placeholder="Ciudad, Estado" /></div>
            <div className="field"><label>Destino</label><input value={f.destino} onChange={ch("destino")} placeholder="Ciudad, Estado" /></div>
            <div className="field"><label>F. Salida</label><input value={f.fecha} onChange={ch("fecha")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>F. Regreso</label><input value={f.fechaReg} onChange={ch("fechaReg")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>KM Salida</label><input value={f.kmSalida} onChange={ch("kmSalida")} type="number" /></div>
            <div className="field"><label>KM Llegada</label><input value={f.kmLlegada} onChange={ch("kmLlegada")} type="number" /></div>
            <div className="field"><label>Carga / Mercancía</label><input value={f.carga} onChange={ch("carga")} /></div>
            <div className="field"><label>Cliente</label><input value={f.cliente} onChange={ch("cliente")} /></div>
            <div className="field"><label>Status</label><select value={f.status} onChange={ch("status")}><option>EN RUTA</option><option>COMPLETADO</option><option>CANCELADO</option></select></div>
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2} /></div>
          </div>
          {dist && <div style={{ marginTop: 10, padding: "10px 16px", background: "var(--bg2)", borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>DISTANCIA: </span>
            <span style={{ fontFamily: "var(--font-hd)", fontSize: 22, fontWeight: 700, color: "var(--cyan)" }}>{fmtN(dist)} km</span>
          </div>}
          <div className="sec-lbl">🔒 Datos Financieros</div>
          <div className="fg">
            <div className="field"><label>Precio al Cliente ($)</label><input value={f.costoOfrecido} onChange={ch("costoOfrecido")} type="number" /></div>
            <div className="field"><label>Gastos Extras ($)</label><input value={f.gastosExtras} onChange={ch("gastosExtras")} type="number" /></div>
            <div className="field"><label>Costo Estadías ($)</label><input value={f.costoEstadias} onChange={ch("costoEstadias")} type="number" /></div>
          </div>
          <MultiPhotoInput values={f.evidencias || []} onChange={v => setF(p => ({ ...p, evidencias: v }))} label="📸 Evidencias de Entrega" />
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function ExternoModal({ externo, onSave, onClose, tiposPersonalizados = [], proveedores = [], onNuevoProveedor }) {
  const [f, setF] = useState(externo || { fecha: "", empresa: "", contacto: "", tel: "", tipoUnidad: "", placas: "", color: "", eco: "", operador: "", seguroOp: "", seguroVeh: "", herramientas: [], origen: "", destino: "", cliente: "", carga: "", costoPagar: 0, precioCliente: 0, costoEstadias: 0, status: "EN RUTA", notas: "", evidencias: [] });
  const [nuevoTipo, setNuevoTipo] = useState("");
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const toggleHerr = h => setF(p => ({ ...p, herramientas: p.herramientas.includes(h) ? p.herramientas.filter(x => x !== h) : [...p.herramientas, h] }));
  const addTipo = () => { if (nuevoTipo.trim()) { setF(p => ({ ...p, tipoUnidad: nuevoTipo.trim() })); setNuevoTipo("") } };
  const ok = () => {
    if (!f.empresa || !f.origen) return alert("Empresa y origen requeridos");
    let finalForm = { ...f, id: f.id || uid(), pagoStatus: f.pagoStatus||"pendiente", pagoEvidencias: f.pagoEvidencias||[] };
    // Auto-create proveedor if new name entered
    if (f.proveedorId === "__nuevo__" && f.empresa.trim() && onNuevoProveedor) {
      const newPv = { id: "pv_"+Date.now(), nombre: f.empresa.trim(), tipoProv: "Transportista Externo", categoria: "Servicios", contacto: f.contacto||"", tel: f.tel||"", email:"", rfc:"", direccion:"", banco:"", cuenta:"", diasCredito:0, limiteCredito:0, saldoPendiente:0, ultimoPago:"", notas:"" };
      onNuevoProveedor(newPv);
      finalForm.proveedorId = newPv.id;
    }
    onSave(finalForm);
  };
  const utilidad = (Number(f.precioCliente) || 0) - (Number(f.costoPagar) || 0) - (Number(f.costoEstadias) || 0);
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal xwide" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar" : "🚚 Nuevo Viaje Externo"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="sec-lbl">Empresa Transportista</div>
          <div className="fg">
            <div className="field"><label>Fecha</label><input value={f.fecha} onChange={ch("fecha")} placeholder="dd/mm/aaaa" /></div>
            <div className="field s2">
              <label>Empresa Transportista *</label>
              <div style={{ display:"flex", gap:8 }}>
                <select value={f.proveedorId||""} onChange={e => {
                  const pv = (proveedores||[]).find(p=>p.id===e.target.value);
                  setF(prev => ({...prev, proveedorId:e.target.value, empresa:pv?pv.nombre:prev.empresa, contacto:pv?pv.contacto:prev.contacto, tel:pv?pv.tel:prev.tel}));
                }} style={{ flex:1, padding:"9px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)" }}>
                  <option value="">— Seleccionar del catálogo —</option>
                  {(proveedores||[]).filter(p=>p.tipoProv==="Transportista Externo"||!p.tipoProv).map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                  <option value="__nuevo__">✏️ Escribir nombre nuevo (se agrega al catálogo)</option>
                </select>
              </div>
            </div>
            <div className="field s2"><label>Nombre de empresa {f.proveedorId&&f.proveedorId!=="__nuevo__"?"(del catálogo)":"*"}</label><input value={f.empresa} onChange={ch("empresa")} placeholder="Ej: Transportes del Norte SA" style={{background: f.proveedorId&&f.proveedorId!=="__nuevo__"?"var(--bg2)":"var(--bg0)"}}/></div>
            <div className="field"><label>Contacto</label><input value={f.contacto} onChange={ch("contacto")} /></div>
            <div className="field"><label>Teléfono</label><input value={f.tel} onChange={ch("tel")} /></div>
          </div>
          <div className="sec-lbl">Datos de la Unidad</div>
          <div className="fg">
            <div className="field s2">
              <label>Tipo de Unidad</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={f.tipoUnidad} onChange={ch("tipoUnidad")} style={{ flex: 1 }}>
                  <option value="">— Seleccionar o escribir nuevo —</option>
                  {[...TIPOS, ...tiposPersonalizados].map(t => <option key={t}>{t}</option>)}
                </select>
                <input placeholder="Nuevo tipo" value={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)} style={{ flex: 1, background: "var(--bg0)", border: "1px solid var(--border)", padding: "9px 12px", borderRadius: 8 }} />
                <button className="btn btn-green btn-sm" onClick={addTipo}>+ Agregar</button>
              </div>
            </div>
            <div className="field"><label>Placas</label><input value={f.placas} onChange={ch("placas")} /></div>
            <div className="field"><label>Color</label><input value={f.color} onChange={ch("color")} /></div>
            <div className="field"><label>No. Económico</label><input value={f.eco} onChange={ch("eco")} /></div>
            <div className="field"><label>Operador</label><input value={f.operador} onChange={ch("operador")} /></div>
            <div className="field"><label>Seguro Operador</label><input value={f.seguroOp} onChange={ch("seguroOp")} /></div>
            <div className="field"><label>Seguro Vehículo</label><input value={f.seguroVeh} onChange={ch("seguroVeh")} /></div>
          </div>
          <div className="field s2">
            <label>Herramientas / Equipamiento</label>
            <div className="tools-grid">
              {HERRAMIENTAS.map(h => (
                <div key={h} className="tool-chip" onClick={() => toggleHerr(h)} style={{ cursor: "pointer", background: f.herramientas.includes(h) ? "var(--cyan)" : "var(--bg2)", color: f.herramientas.includes(h) ? "#fff" : "var(--text)" }}>
                  {f.herramientas.includes(h) ? "✓" : "○"} {h}
                </div>
              ))}
            </div>
          </div>
          <div className="sec-lbl">Datos del Viaje</div>
          <div className="fg">
            <div className="field"><label>Origen *</label><input value={f.origen} onChange={ch("origen")} /></div>
            <div className="field"><label>Destino</label><input value={f.destino} onChange={ch("destino")} /></div>
            <div className="field"><label>Cliente</label><input value={f.cliente} onChange={ch("cliente")} /></div>
            <div className="field"><label>Carga</label><input value={f.carga} onChange={ch("carga")} /></div>
            <div className="field"><label>Status</label><select value={f.status} onChange={ch("status")}><option>EN RUTA</option><option>COMPLETADO</option><option>CANCELADO</option></select></div>
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2} /></div>
          </div>
          <div className="sec-lbl">🔒 Financiero</div>
          <div className="fg">
            <div className="field"><label>Costo a Pagar ($)</label><input value={f.costoPagar} onChange={ch("costoPagar")} type="number" /></div>
            <div className="field"><label>Precio al Cliente ($)</label><input value={f.precioCliente} onChange={ch("precioCliente")} type="number" /></div>
            <div className="field"><label>Costo Estadías ($)</label><input value={f.costoEstadias} onChange={ch("costoEstadias")} type="number" /></div>
          </div>
          {utilidad !== 0 && <div style={{ marginTop: 10, padding: "12px 16px", background: utilidad >= 0 ? "#E8F9F3" : "#FFF0F2", borderRadius: 10, border: `1px solid ${utilidad >= 0 ? "#B8EDCA" : "#FFD0D5"}` }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>UTILIDAD: </span>
            <span style={{ fontFamily: "var(--font-hd)", fontSize: 24, fontWeight: 700, color: utilidad >= 0 ? "#00864E" : "var(--red)" }}>{fmt$(utilidad)}</span>
          </div>}
          <MultiPhotoInput values={f.evidencias || []} onChange={v => setF(p => ({ ...p, evidencias: v }))} label="📸 Evidencias de Entrega" />
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}


// ── Modal de Registro de Pago a Transportista Externo ────────────────────────
// ── MODAL UNIVERSAL DE PAGO A PROVEEDOR ─────────────────────────────────────
function PagoTransportistaModal({ externo, proveedor, branding, onSave, onClose, trips, maints, fuels, gastos }) {
  const tipoServicio = TIPO_PROV_SERVICIO[proveedor?.tipoProv] || "general";
  const [f, setF] = useState({
    pagoStatus:     externo.pagoStatus     || "pendiente",
    pagoFecha:      externo.pagoFecha      || "",
    pagoForma:      externo.pagoForma      || "Transferencia SPEI",
    pagoReferencia: externo.pagoReferencia || "",
    pagoNotas:      externo.pagoNotas      || "",
    pagoEvidencias: externo.pagoEvidencias || [],
    pagoFactura:    externo.pagoFactura    || "",
    pagoMontoParcial: externo.pagoMontoParcial || "",
    viajeRefId:     externo.viajeRefId     || "",
    maintRefId:     externo.maintRefId     || "",
  });
  const ch = k => e => setF(p=>({...p,[k]:e.target.value}));

  const handleImg = e => {
    Array.from(e.target.files).forEach(file => {
      const r = new FileReader();
      r.onload = ev => setF(p=>({...p, pagoEvidencias:[...(p.pagoEvidencias||[]), ev.target.result]}));
      r.readAsDataURL(file);
    });
  };
  const delImg = idx => setF(p=>({...p, pagoEvidencias: p.pagoEvidencias.filter((_,i)=>i!==idx)}));

  const fmx = n => "$"+Number(n||0).toLocaleString("es-MX",{minimumFractionDigits:2});

  const handleWhatsApp = () => {
    const refViaje = tipoServicio==="viaje" && trips ? trips.find(t=>t.id===f.viajeRefId) : null;
    const refMaint = tipoServicio==="mantenimiento" && maints ? maints.find(m=>m.id===f.maintRefId) : null;
    const msg =
`✅ *CONFIRMACIÓN DE PAGO — ${branding?.nombre||"Fleet Pro"}*

🏢 *Proveedor:* ${proveedor?.nombre||externo.empresa||"—"}
${tipoServicio==="viaje"?`🚛 *Viaje:* ${externo.origen} → ${externo.destino||""}\n📅 Fecha servicio: ${externo.fecha||"—"}`:
  tipoServicio==="mantenimiento"?`🔧 *Servicio:* ${refMaint?.descripcion||"Mantenimiento"}\n📅 Fecha: ${refMaint?.fecha||"—"}`:
  `📋 Servicio general`}

━━━━━━━━━━━━━━
💰 *Monto:* ${fmx(f.pagoStatus==="parcial"?f.pagoMontoParcial:externo.costoPagar)}
📅 Fecha pago: ${f.pagoFecha||"—"}
💳 Forma: ${f.pagoForma}
🔑 Referencia: ${f.pagoReferencia||"—"}
${f.pagoFactura?`🧾 Factura: ${f.pagoFactura}`:""}
${f.pagoNotas?`📝 Notas: ${f.pagoNotas}`:""}

_${branding?.nombre||"Fleet Pro"} — Comprobante de liquidación_`;
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  };

  const inp = {padding:"8px 12px",borderRadius:8,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)",fontSize:13,width:"100%",boxSizing:"border-box"};
  const lbl = {fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",display:"block",marginBottom:4};

  // Color accent by status
  const stCol = f.pagoStatus==="pagado"?"var(--green)":f.pagoStatus==="parcial"?"var(--cyan)":"var(--orange)";

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" style={{maxWidth:620}} onClick={e=>e.stopPropagation()}>
        <div className="mhdr" style={{borderBottom:`3px solid ${stCol}`}}>
          <h3>💳 {tipoServicio==="viaje"?"Pago a Transportista":"Conciliación de Pago"} — {proveedor?.nombre||externo.empresa||"Proveedor"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">

          {/* ── Resumen del servicio ── */}
          <div style={{padding:"12px 16px",background:"var(--bg2)",borderRadius:10,border:`1px solid var(--border)`,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"var(--text)"}}>
              {tipoServicio==="viaje"?"🚛":"tipoServicio"==="mantenimiento"?"🔧":"📋"} Resumen del Servicio
            </div>
            {tipoServicio==="viaje" ? (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:12}}>
                {[["📍 Ruta",`${externo.origen||"—"} → ${externo.destino||"—"}`],["📅 Fecha",externo.fecha||"—"],["👤 Operador",externo.operador||"—"],["🚗 Unidad",`${externo.tipoUnidad||"—"}${externo.placas?" · "+externo.placas:""}`]].map(([l,v])=>(
                  <div key={l}><span style={{color:"var(--muted)"}}>{l}: </span><strong>{v}</strong></div>
                ))}
              </div>
            ) : (
              <div style={{fontSize:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                <div><span style={{color:"var(--muted)"}}>🏪 Tipo: </span><strong>{proveedor?.tipoProv||"—"}</strong></div>
                <div><span style={{color:"var(--muted)"}}>📞 Contacto: </span><strong>{proveedor?.contacto||"—"}</strong></div>
                {proveedor?.rfc&&<div><span style={{color:"var(--muted)"}}>🪪 RFC: </span><strong>{proveedor.rfc}</strong></div>}
                {proveedor?.banco&&<div><span style={{color:"var(--muted)"}}>🏦 Banco: </span><strong>{proveedor.banco}</strong></div>}
              </div>
            )}
            <div style={{marginTop:10,padding:"8px 12px",background:"var(--bg0)",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"var(--muted)",fontSize:12}}>Monto total del servicio</span>
              <span style={{fontFamily:"var(--font-hd)",fontSize:20,fontWeight:700,color:"var(--orange)"}}>{fmx(externo.costoPagar)}</span>
            </div>
          </div>

          {/* ── Vincular con registro ── */}
          {tipoServicio==="viaje" && trips && trips.filter(t=>t.esExterno).length>0 && (
            <div style={{marginBottom:14}}>
              <label style={lbl}>🔗 Vincular con Viaje Externo</label>
              <select value={f.viajeRefId} onChange={ch("viajeRefId")} style={inp}>
                <option value="">— Seleccionar viaje —</option>
                {trips.filter(t=>t.esExterno).map(t=>(
                  <option key={t.id} value={t.id}>{t.fecha} · {t.origen} → {t.destino} · {fmx(t.costo||t.costoPagar||0)}</option>
                ))}
              </select>
            </div>
          )}
          {tipoServicio==="mantenimiento" && maints && maints.length>0 && (
            <div style={{marginBottom:14}}>
              <label style={lbl}>🔗 Vincular con Mantenimiento</label>
              <select value={f.maintRefId} onChange={ch("maintRefId")} style={inp}>
                <option value="">— Seleccionar mantenimiento —</option>
                {maints.filter(m=>m.proveedorId===proveedor?.id||(proveedor?.nombre&&m.taller===proveedor.nombre)||true).map(m=>(
                  <option key={m.id} value={m.id}>{m.fecha} · {m.descripcion} · {fmx(m.costo)}</option>
                ))}
              </select>
            </div>
          )}

          {/* ── Estado del pago ── */}
          <div style={{marginBottom:14}}>
            <label style={lbl}>Estado del pago</label>
            <div style={{display:"flex",gap:8}}>
              {[["pendiente","⏳ Pendiente","var(--yellow)"],["pagado","✅ Pagado","var(--green)"],["parcial","🔄 Parcial","var(--cyan)"]].map(([val,lbl2,col])=>(
                <button key={val} onClick={()=>setF(p=>({...p,pagoStatus:val}))}
                  style={{flex:1,padding:"10px 8px",borderRadius:10,border:`2px solid ${f.pagoStatus===val?col:"var(--border)"}`,background:f.pagoStatus===val?`rgba(${val==="pendiente"?"255,184,0":val==="pagado"?"0,200,150":"0,153,204"},.15)`:"var(--bg2)",color:f.pagoStatus===val?col:"var(--muted)",fontWeight:f.pagoStatus===val?700:400,cursor:"pointer",fontSize:12,transition:"all .15s"}}>
                  {lbl2}
                </button>
              ))}
            </div>
          </div>

          {/* Monto parcial si aplica */}
          {f.pagoStatus==="parcial" && (
            <div style={{marginBottom:14,padding:"10px 14px",background:"rgba(0,153,204,.08)",borderRadius:8,border:"1px solid var(--cyan)"}}>
              <label style={{...lbl,color:"var(--cyan)"}}>💰 Monto a pagar (parcial)</label>
              <input type="number" value={f.pagoMontoParcial} onChange={ch("pagoMontoParcial")} placeholder="0.00" style={inp} min="0" step="0.01"/>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Pendiente: {fmx((externo.costoPagar||0)-(f.pagoMontoParcial||0))}</div>
            </div>
          )}

          {/* ── Datos del pago ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div>
              <label style={lbl}>Fecha de pago</label>
              <input type="date" value={f.pagoFecha} onChange={ch("pagoFecha")} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Forma de pago</label>
              <select value={f.pagoForma} onChange={ch("pagoForma")} style={inp}>
                {FORMAS_PAGO.map(fp=><option key={fp}>{fp}</option>)}
              </select>
            </div>
          </div>

          {/* Referencia y Factura en la misma fila */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div>
              <label style={lbl}>
                {f.pagoForma==="Efectivo"?"🧾 Recibo / Folio":"🔑 Referencia / No. transferencia"}
              </label>
              <input value={f.pagoReferencia} onChange={ch("pagoReferencia")}
                placeholder={f.pagoForma==="Efectivo"?"Ej: REC-001":"Ej: SPEI-20260310-001"}
                style={inp}/>
            </div>
            <div>
              <label style={lbl}>🧾 No. Factura / Comprobante</label>
              <input value={f.pagoFactura} onChange={ch("pagoFactura")}
                placeholder="Ej: FAC-2026-0042 o CFDI-XXX"
                style={inp}/>
            </div>
          </div>

          {/* Datos bancarios del proveedor si tiene */}
          {(proveedor?.banco||proveedor?.cuenta) && (
            <div style={{marginBottom:14,padding:"8px 14px",background:"rgba(0,200,100,.06)",border:"1px solid rgba(0,200,100,.2)",borderRadius:8,fontSize:12}}>
              <span style={{fontWeight:700,color:"var(--green)"}}>🏦 Datos bancarios del proveedor: </span>
              {proveedor.banco && <span>{proveedor.banco} </span>}
              {proveedor.cuenta && <span style={{fontFamily:"monospace",background:"var(--bg0)",padding:"1px 6px",borderRadius:4}}>CLABE/Cta: {proveedor.cuenta}</span>}
            </div>
          )}

          <div style={{marginBottom:14}}>
            <label style={lbl}>📝 Notas u observaciones</label>
            <textarea value={f.pagoNotas} onChange={ch("pagoNotas")} rows={2}
              placeholder="Descuentos aplicados, aclaraciones, condiciones, etc."
              style={{...inp,resize:"vertical"}}/>
          </div>

          {/* Evidencia */}
          <div style={{marginBottom:14}}>
            <label style={lbl}>📎 Comprobante de pago (imagen / PDF)</label>
            <label style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",background:"var(--bg2)",border:"1.5px dashed var(--border)",borderRadius:8,cursor:"pointer",fontSize:12,color:"var(--cyan)"}}>
              📎 Adjuntar archivo
              <input type="file" accept="image/*,application/pdf" multiple onChange={handleImg} style={{display:"none"}}/>
            </label>
            {f.pagoEvidencias?.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
                {f.pagoEvidencias.map((src,i)=>(
                  <div key={i} style={{position:"relative",width:72,height:72}}>
                    <img src={src} style={{width:72,height:72,objectFit:"cover",borderRadius:8,border:"1px solid var(--border)"}} alt="comprobante"/>
                    <button onClick={()=>delImg(i)} style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",background:"var(--red)",color:"#fff",border:"none",fontSize:11,cursor:"pointer"}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-ghost" style={{color:"var(--green)",border:"1px solid var(--green)"}} onClick={handleWhatsApp}>💬 WhatsApp</button>
          <button className="btn btn-cyan" onClick={()=>onSave({...externo,...f})}>💾 Guardar Pago</button>
        </div>
      </div>
    </div>
  );
}

function GastoModal({ gasto, proveedores, onSave, onClose }) {
  const [f, setF] = useState(gasto || { fecha: "", tipo: GASTO_TIPOS[0], descripcion: "", monto: 0, responsable: "", proveedorId: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const ok = () => { if (!f.tipo || !f.monto) return alert("Tipo y monto requeridos"); onSave({ ...f, id: f.id || uid() }) };
  const selectedProv = (proveedores||[]).find(p => p.id === f.proveedorId);
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar" : "💵 Nuevo Gasto General"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field"><label>Fecha</label><input value={f.fecha} onChange={ch("fecha")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>Tipo de Gasto</label><select value={f.tipo} onChange={ch("tipo")}>{GASTO_TIPOS.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="field s2"><label>Descripción</label><input value={f.descripcion} onChange={ch("descripcion")} /></div>
            <div className="field"><label>Monto ($)</label><input value={f.monto} onChange={ch("monto")} type="number" /></div>
            <div className="field"><label>Responsable</label><input value={f.responsable} onChange={ch("responsable")} /></div>
            <div className="field s2">
              <label>Vincular a Proveedor (opcional)</label>
              <select value={f.proveedorId} onChange={ch("proveedorId")}>
                <option value="">— Sin proveedor —</option>
                {(proveedores||[]).map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.categoria})</option>)}
              </select>
            </div>
            {selectedProv && (
              <div className="field s2">
                <div style={{ padding: "9px 13px", background: "#E8F5FA", borderRadius: 8, fontSize: 11, border: "1px solid #B3E0F2" }}>
                  🏪 <strong>{selectedProv.nombre}</strong> · {selectedProv.categoria}
                  {selectedProv.tel && <span style={{ color: "var(--muted)" }}> · {selectedProv.tel}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function ChangeDriverModal({ unit, drivers, onSave, onClose }) {
  const [newOp, setNewOp] = useState(unit.operador || "");
  const ok = () => onSave({ ...unit, operador: newOp });
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>🔄 Cambiar Operador</h3></div>
        <div className="mbody">
          <p style={{ marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>Unidad: <strong>{unit.num} — {unit.placas}</strong></p>
          <div className="field"><label>Nuevo Operador</label><select value={newOp} onChange={e => setNewOp(e.target.value)}><option value="">— Sin asignar —</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>✓ Cambiar</button></div>
      </div>
    </div>
  );
}


// ──────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ──────────────────────────────────────────────────────────────────────────────
function LoginScreen({ usuarios, branding, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);

  const doLogin = () => {
    setErr("");
    const ahora = new Date();
    const fechaHoy = ahora.toLocaleDateString("es-MX");
    const horaAhora = ahora.toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" });

    // Buscar por email (sin importar si está activo aún — para dar mensaje diferente)
    const uEmail = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!uEmail) {
      setErr("No existe ningún usuario con ese email");
      return;
    }
    if (!uEmail.activo) {
      setErr("Este usuario está desactivado. Contacta al administrador.");
      return;
    }
    if (uEmail.password !== pass) {
      // Registrar intento fallido
      onLogin(null, uEmail.id, "fallido");
      setErr(`Contraseña incorrecta. ${(uEmail.intentosFallidos||0)+1} intento(s) fallido(s).`);
      return;
    }

    // Login exitoso — actualizar datos del usuario
    const usuarioActualizado = {
      ...uEmail,
      ultimoAcceso: fechaHoy,
      ultimoAccesoHora: horaAhora,
      totalAccesos: (uEmail.totalAccesos || 0) + 1,
      intentosFallidos: 0,
    };
    onLogin(usuarioActualizado, uEmail.id, "exitoso");
  };

  const rolBadge = { admin: ["🔒 Admin","var(--red)"], supervisor: ["🔧 Supervisor","var(--orange)"], capturista: ["✏️ Capturista","var(--cyan)"] };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg0)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      {/* Background glow orbs */}
      <div style={{ position:"absolute", top:"15%", left:"20%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,var(--glow-cyan) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"absolute", bottom:"20%", right:"15%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,var(--glow-purple) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

      <div style={{ width:400, background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:20, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.04)", position:"relative", zIndex:1 }}>
        {/* Header */}
        <div style={{ padding:"32px 28px 22px", borderBottom:"1px solid var(--border)", textAlign:"center", background:"linear-gradient(180deg,var(--bg2),var(--bg1))", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)" }}/>
          {branding.logo
            ? <img src={branding.logo} style={{ maxHeight:52, maxWidth:200, objectFit:"contain", marginBottom:10 }} alt="Logo" />
            : <div style={{ fontFamily:"var(--font-hd)", fontSize:28, fontWeight:900, background:"linear-gradient(135deg,var(--cyan),var(--purple))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4, letterSpacing:".06em" }}>{branding.nombre || "FLEET PRO"}</div>
          }
          <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:".16em", textTransform:"uppercase", fontWeight:600 }}>{branding.slogan || "Sistema Integral de Flota"}</div>
        </div>

        <div style={{ padding:"28px 28px 32px" }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:22, color:"var(--text)", fontFamily:"var(--font-hd)", letterSpacing:".04em" }}>INICIAR SESIÓN</div>

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:9, color:"var(--muted)", display:"block", marginBottom:6, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>Correo electrónico</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doLogin()}
              placeholder="usuario@empresa.com"
              type="email"
              autoFocus
              style={{ width:"100%", padding:"11px 14px", borderRadius:8, border:`1px solid ${err?"var(--red)":"var(--border)"}`, background:"var(--bg0)", color:"var(--text)", fontSize:13, boxSizing:"border-box", outline:"none", fontFamily:"var(--font-bd)", transition:"all .2s" }}
              
            />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:9, color:"var(--muted)", display:"block", marginBottom:6, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>Contraseña</label>
            <div style={{ position:"relative" }}>
              <input
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doLogin()}
                placeholder="••••••••"
                type={showPass ? "text" : "password"}
                style={{ width:"100%", padding:"11px 42px 11px 14px", borderRadius:8, border:`1px solid ${err?"var(--red)":"var(--border)"}`, background:"var(--bg0)", color:"var(--text)", fontSize:13, boxSizing:"border-box", outline:"none", fontFamily:"var(--font-bd)", transition:"all .2s" }}
                
              />
              <button onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:15 }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {err && <div style={{ padding:"10px 14px", background:"rgba(229,23,60,.08)", border:"1px solid rgba(229,23,60,.25)", borderRadius:8, fontSize:12, color:"var(--red)", marginBottom:16, fontWeight:600 }}>⚠️ {err}</div>}

          <button
            onClick={doLogin}
            style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", background:"linear-gradient(135deg,var(--cyan),var(--purple))", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:".08em", fontFamily:"var(--font-hd)", boxShadow:"0 4px 20px var(--glow-cyan)", transition:"all .2s" }}
          >
            ENTRAR AL SISTEMA
          </button>

          {/* Accesos rápidos para demo */}
          <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid var(--border)" }}>
            <div style={{ fontSize:10, color:"var(--muted)", marginBottom:8, textAlign:"center", textTransform:"uppercase", letterSpacing:".08em" }}>Accesos rápidos (demo)</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {usuarios.filter(u=>u.activo).map(u => {
                const [lbl, clr] = rolBadge[u.rol] || ["👤","var(--muted)"];
                return (
                  <button key={u.id} onClick={() => { setEmail(u.email); setPass(u.password); }}
                    style={{ flex:1, padding:"7px 10px", borderRadius:8, border:`1px solid ${clr}`, background:"transparent", color:clr, fontSize:11, cursor:"pointer", fontWeight:600, whiteSpace:"nowrap" }}>
                    {lbl}<br/><span style={{ fontSize:9, opacity:.7 }}>{u.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// GESTIÓN DE USUARIOS (solo admin)
// ──────────────────────────────────────────────────────────────────────────────
function UsuariosModal({ usuarios, roles, onSave, onSaveRoles, onClose }) {
  const [lista,    setLista]    = useState(usuarios.map(u => ({ ...u })));
  const [listaRoles, setListaRoles] = useState(roles.map(r => ({ ...r })));
  const [vistaTab, setVistaTab] = useState("lista"); // lista | nuevo | roles | log
  const [editId,   setEditId]   = useState(null);
  const [resetId,  setResetId]  = useState(null);
  const [permsId,  setPermsId]  = useState(null);
  const [newPass,  setNewPass]  = useState("");
  const [showPassMap, setShowPassMap] = useState({});

  // ── Rol editor state ─────────────────────────────────────────────────────
  const [editRolId,  setEditRolId]  = useState(null); // id del rol editando
  const [rolForm,    setRolForm]    = useState({ nombre:"", descripcion:"", icono:"🏷️", color:"var(--cyan)", permisos:{} });

  const [form, setForm] = useState({ nombre:"", email:"", password:"", rol:"capturista", activo:true, notas:"" });
  const ch  = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const chR = k => e => setRolForm(p => ({ ...p, [k]: e.target.value }));

  const rolIcon  = r => r?.icono || "🏷️";
  const rolBdgC  = r => r?.editable === false ? (r.id==="admin"?"br":r.id==="supervisor"?"bo":"bb") : "bp";

  const getRol = id => listaRoles.find(r => r.id === id);

  // ── User CRUD ────────────────────────────────────────────────────────────
  const saveUser = () => {
    if (!form.nombre.trim()) return alert("El nombre es requerido");
    if (!form.email.trim())  return alert("El email es requerido");
    if (!editId && !form.password.trim()) return alert("La contraseña es requerida");
    if (lista.some(u => u.email.toLowerCase()===form.email.toLowerCase() && u.id!==editId))
      return alert("Ya existe un usuario con ese email");
    if (editId) {
      setLista(l => l.map(u => u.id===editId
        ? { ...u, nombre:form.nombre, email:form.email, rol:form.rol, activo:form.activo, notas:form.notas,
            ...(form.password ? { password:form.password } : {}) }
        : u));
    } else {
      setLista(l => [...l, { ...form, id:uid(), creadoEn:new Date().toLocaleDateString("es-MX"), ultimoAcceso:null, intentosFallidos:0 }]);
    }
    setForm({ nombre:"", email:"", password:"", rol:"capturista", activo:true, notas:"" });
    setEditId(null); setVistaTab("lista");
  };

  const startEdit = u => { setEditId(u.id); setForm({ nombre:u.nombre, email:u.email, password:"", rol:u.rol, activo:u.activo, notas:u.notas||"" }); setVistaTab("nuevo"); };
  const cancelEdit = () => { setEditId(null); setForm({ nombre:"", email:"", password:"", rol:"capturista", activo:true, notas:"" }); setVistaTab("lista"); };

  const doReset = () => {
    if (!newPass.trim() || newPass.length < 6) return alert("Mínimo 6 caracteres");
    setLista(l => l.map(u => u.id===resetId ? { ...u, password:newPass, intentosFallidos:0, ultimoCambioPass:new Date().toLocaleDateString("es-MX") } : u));
    setResetId(null); setNewPass(""); alert("✅ Contraseña actualizada");
  };

  // ── Role CRUD ────────────────────────────────────────────────────────────
  const startEditRol = r => {
    setEditRolId(r.id);
    setRolForm({ nombre:r.nombre, descripcion:r.descripcion||"", icono:r.icono||"🏷️", color:r.color||"var(--cyan)", permisos:{ ...r.permisos } });
    setVistaTab("roles");
  };

  const newRol = () => {
    setEditRolId("__new__");
    setRolForm({ nombre:"", descripcion:"", icono:"🏷️", color:"var(--cyan)", permisos:{} });
    setVistaTab("roles");
  };

  const saveRol = () => {
    if (!rolForm.nombre.trim()) return alert("El nombre del rol es requerido");
    const slug = rolForm.nombre.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"");
    if (editRolId === "__new__") {
      if (listaRoles.find(r => r.id===slug)) return alert("Ya existe un rol con ese nombre");
      setListaRoles(l => [...l, { id:slug, ...rolForm, editable:true }]);
    } else {
      setListaRoles(l => l.map(r => r.id===editRolId ? { ...r, ...rolForm } : r));
    }
    setEditRolId(null);
  };

  const delRol = id => {
    if (listaRoles.find(r=>r.id===id)?.editable === false) return alert("Los roles base no se pueden eliminar");
    if (lista.some(u => u.rol===id)) return alert("No puedes eliminar un rol que tiene usuarios asignados");
    if (!window.confirm("¿Eliminar este rol?")) return;
    setListaRoles(l => l.filter(r => r.id!==id));
  };

  const togglePerm = (perm, val) => setRolForm(p => ({ ...p, permisos: { ...p.permisos, [perm]: val } }));

  // Color presets
  const COLOR_PRESETS = ["var(--red)","var(--orange)","var(--yellow)","var(--green)","var(--cyan)","var(--purple)","#E91E8C","#795548"];
  const ICON_PRESETS  = ["🔒","🔧","✏️","💰","📊","👥","🚛","💼","📋","🏷️","⭐","🎯"];

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" style={{ maxWidth:820 }} onClick={e => e.stopPropagation()}>
        <div className="mhdr" style={{ borderBottom:"3px solid var(--cyan)" }}>
          <h3>👥 Gestión de Usuarios y Roles</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Tabs principales */}
        <div style={{ padding:"10px 20px 0", borderBottom:"1px solid var(--border)" }}>
          <div className="ftabs">
            {[["lista","👥 Usuarios"],["nuevo", editId?"✏️ Editar":"➕ Nuevo Usuario"],["roles","🎭 Roles"],["log","📋 Historial"]].map(([k,l]) => (
              <button key={k} className={`ftab${vistaTab===k?" on":""}`} onClick={() => { if(k!=="nuevo") cancelEdit(); setVistaTab(k); }}>{l}</button>
            ))}
          </div>
        </div>

        <div className="mbody">

          {/* ══ TAB: LISTA USUARIOS ══════════════════════════════════════════ */}
          {vistaTab === "lista" && (
            <div>
              <div className="sbar">
                <span>{lista.filter(u=>u.activo).length} activos · {lista.filter(u=>!u.activo).length} inactivos</span>
                <button className="btn btn-cyan btn-sm" onClick={() => setVistaTab("nuevo")}>➕ Nuevo Usuario</button>
              </div>
              <table>
                <thead><tr><th>Usuario</th><th>Email / Contraseña</th><th>Rol</th><th>Permisos extra</th><th>Último Acceso</th><th>Status</th><th>Acciones</th></tr></thead>
                <tbody>{lista.map(u => {
                  const rol = getRol(u.rol);
                  return (
                    <tr key={u.id}>
                      <td><div style={{fontWeight:700}}>{u.nombre}</div>{u.notas&&<div style={{fontSize:10,color:"var(--muted)"}}>{u.notas}</div>}</td>
                      <td>
                        <div style={{fontSize:12}}>{u.email}</div>
                        <div style={{fontSize:10,color:"var(--muted)",display:"flex",gap:4,alignItems:"center",marginTop:2}}>
                          <span style={{fontFamily:"monospace"}}>{showPassMap[u.id] ? u.password : "••••••••"}</span>
                          <button onClick={()=>setShowPassMap(p=>({...p,[u.id]:!p[u.id]}))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:11,padding:0}}>{showPassMap[u.id]?"🙈":"👁️"}</button>
                        </div>
                      </td>
                      <td>
                        {rol
                          ? <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:`${rol.color}22`,border:`1px solid ${rol.color}`,fontSize:11,fontWeight:700,color:rol.color}}>
                              {rol.icono} {rol.nombre}
                            </span>
                          : <Bdg c="bm" t={u.rol}/>
                        }
                      </td>
                      <td style={{fontSize:10,maxWidth:130}}>
                        {u.permisosExtra && Object.keys(u.permisosExtra).length > 0
                          ? <div style={{color:"var(--cyan)"}}>
                              {Object.entries(u.permisosExtra).slice(0,3).map(([k,v])=>(
                                <div key={k}>{v?"✅":"❌"} {TODOS_PERMISOS.find(p=>p.key===k)?.lbl||k}</div>
                              ))}
                              {Object.keys(u.permisosExtra).length>3&&<div style={{color:"var(--muted)"}}>+{Object.keys(u.permisosExtra).length-3} más</div>}
                            </div>
                          : <span style={{color:"var(--muted)",fontSize:11}}>Base del rol</span>
                        }
                      </td>
                      <td style={{fontSize:11}}>
                        {u.ultimoAcceso
                          ? <><div style={{color:"var(--green)"}}>{u.ultimoAcceso}</div><div style={{fontSize:10,color:"var(--muted)"}}>{u.ultimoAccesoHora}</div></>
                          : <span style={{color:"var(--muted)"}}>Nunca</span>}
                        {(u.intentosFallidos||0)>0&&<div style={{color:"var(--red)",fontSize:10}}>⚠️ {u.intentosFallidos} fallidos</div>}
                      </td>
                      <td><Bdg c={u.activo?"bg":"bm"} t={u.activo?"ACTIVO":"INACTIVO"}/></td>
                      <td>
                        <div className="acts">
                          <button className="btn btn-ghost btn-xs" onClick={()=>startEdit(u)}>✏️</button>
                          <button className="btn btn-ghost btn-xs" onClick={()=>{setPermsId(permsId===u.id?null:u.id);}}>🔑 Permisos</button>
                          <button className="btn btn-ghost btn-xs" style={{background:"var(--yellow)",color:"#000",border:"none"}} onClick={()=>{setResetId(u.id);setNewPass("");}}>🔒 Reset</button>
                          <button className="btn btn-ghost btn-xs" onClick={()=>setLista(l=>l.map(x=>x.id===u.id?{...x,activo:!x.activo}:x))}>
                            {u.activo?"🔇":"✅"}
                          </button>
                          {(u.intentosFallidos||0)>0&&<button className="btn btn-ghost btn-xs" onClick={()=>setLista(l=>l.map(x=>x.id===u.id?{...x,intentosFallidos:0}:x))}>🧹</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>

              {/* Panel permisos individuales */}
              {permsId && (() => {
                const u = lista.find(x=>x.id===permsId);
                const rol = getRol(u?.rol);
                const basePerms = rol?.permisos || PERMS_BASE[u?.rol] || {};
                const overrides = u?.permisosExtra || {};
                const grupos = [...new Set(TODOS_PERMISOS.map(p=>p.grupo))];
                return (
                  <div style={{marginTop:16,padding:"16px 20px",background:"var(--bg2)",border:"2px solid var(--cyan)",borderRadius:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{fontWeight:700,color:"var(--cyan)"}}>🔑 Permisos extra para: {u?.nombre}</div>
                      <div style={{fontSize:11,color:"var(--muted)"}}>Rol: {rol?.icono} {rol?.nombre} — estos permisos sobreescriben los del rol</div>
                    </div>
                    {grupos.map(g=>(
                      <div key={g} style={{marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>{g}</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                          {TODOS_PERMISOS.filter(p=>p.grupo===g).map(p=>{
                            const baseVal = basePerms[p.key]??false;
                            const overVal = overrides[p.key];
                            const efectivo = overVal!==undefined?overVal:baseVal;
                            const tieneOverride = overVal!==undefined;
                            return (
                              <div key={p.key} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderRadius:6,background:tieneOverride?"rgba(0,153,204,.08)":"var(--bg0)",border:`1px solid ${tieneOverride?"var(--cyan)":"var(--border)"}`}}>
                                <input type="checkbox" checked={efectivo} onChange={e=>{
                                  const nv = e.target.checked;
                                  setLista(l=>l.map(x=>x.id===permsId?{...x,permisosExtra:nv===baseVal?Object.fromEntries(Object.entries(x.permisosExtra||{}).filter(([k])=>k!==p.key)):{...(x.permisosExtra||{}),[p.key]:nv}}:x));
                                }} style={{width:15,height:15,cursor:"pointer"}}/>
                                <span style={{fontSize:11,flex:1}}>{p.lbl}</span>
                                {tieneOverride&&<span style={{fontSize:9,color:"var(--cyan)",fontWeight:700}}>MOD</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setLista(l=>l.map(x=>x.id===permsId?{...x,permisosExtra:{}}:x))}>↺ Restaurar defaults del rol</button>
                      <button className="btn btn-cyan btn-sm" onClick={()=>setPermsId(null)}>✅ Listo</button>
                    </div>
                  </div>
                );
              })()}

              {/* Panel reset contraseña */}
              {resetId && (() => {
                const u = lista.find(x=>x.id===resetId);
                return (
                  <div style={{marginTop:16,padding:"14px 18px",background:"rgba(255,183,0,.08)",border:"2px solid var(--yellow)",borderRadius:10}}>
                    <div style={{fontWeight:700,color:"var(--yellow)",marginBottom:10}}>🔒 Resetear contraseña — {u?.nombre}</div>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <input value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Nueva contraseña (mín. 6 caracteres)" type="text" onKeyDown={e=>e.key==="Enter"&&doReset()}
                        style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)",fontSize:13}}/>
                      <button className="btn btn-cyan" onClick={doReset}>💾 Guardar</button>
                      <button className="btn btn-ghost" onClick={()=>{setResetId(null);setNewPass("");}}>Cancelar</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══ TAB: NUEVO / EDITAR USUARIO ═════════════════════════════════ */}
          {vistaTab === "nuevo" && (
            <div>
              <div style={{padding:"8px 0 14px",fontSize:12,color:"var(--muted)"}}>
                {editId ? `Editando: ${lista.find(u=>u.id===editId)?.nombre}` : "Nuevo usuario del sistema"}
              </div>
              <div className="fg">
                <div className="field"><label>Nombre Completo *</label><input value={form.nombre} onChange={ch("nombre")} placeholder="Ana Martínez" autoFocus/></div>
                <div className="field"><label>Email *</label><input value={form.email} onChange={ch("email")} type="email" placeholder="ana@empresa.com"/></div>
                <div className="field"><label>{editId?"Nueva Contraseña (vacío = sin cambios)":"Contraseña *"}</label><input value={form.password} onChange={ch("password")} type="text" placeholder={editId?"Dejar vacío para no cambiar":"Mínimo 6 caracteres"}/></div>
                <div className="field">
                  <label>Rol *</label>
                  <select value={form.rol} onChange={ch("rol")}>
                    {listaRoles.map(r => (
                      <option key={r.id} value={r.id}>{r.icono} {r.nombre} — {r.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div className="field"><label>Status</label>
                  <select value={form.activo?"true":"false"} onChange={e=>setForm(p=>({...p,activo:e.target.value==="true"}))}>
                    <option value="true">✅ Activo</option><option value="false">🔇 Inactivo</option>
                  </select>
                </div>
                <div className="field s2"><label>Notas internas</label><input value={form.notas} onChange={ch("notas")} placeholder="Área, turno, observaciones..."/></div>
              </div>
              {/* Preview permisos del rol seleccionado */}
              {(() => {
                const rol = getRol(form.rol);
                if (!rol) return null;
                const perms = rol.permisos || {};
                const activos = TODOS_PERMISOS.filter(p => perms[p.key]);
                return (
                  <div style={{padding:"12px 16px",background:"var(--bg2)",borderRadius:8,border:"1px solid var(--border)",marginTop:4}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:8,color:rol.color}}>{rol.icono} Permisos del rol "{rol.nombre}":</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {activos.map(p=><span key={p.key} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:`${rol.color}22`,color:rol.color,border:`1px solid ${rol.color}44`}}>✅ {p.lbl}</span>)}
                      {activos.length===0&&<span style={{color:"var(--muted)",fontSize:11}}>Sin permisos activos</span>}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══ TAB: ROLES ══════════════════════════════════════════════════ */}
          {vistaTab === "roles" && (
            <div>
              <div className="sbar">
                <span>{listaRoles.length} roles ({listaRoles.filter(r=>r.editable!==false).length} personalizados)</span>
                <button className="btn btn-cyan btn-sm" onClick={newRol}>➕ Nuevo Rol</button>
              </div>

              {/* Lista de roles */}
              {editRolId === null && (
                <table>
                  <thead><tr><th>Rol</th><th>Descripción</th><th>Usuarios</th><th>Permisos activos</th><th>Acciones</th></tr></thead>
                  <tbody>{listaRoles.map(r=>{
                    const usrsConRol = lista.filter(u=>u.rol===r.id).length;
                    const permsActivos = TODOS_PERMISOS.filter(p=>r.permisos?.[p.key]);
                    return (
                      <tr key={r.id}>
                        <td>
                          <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:20,background:`${r.color}22`,border:`1px solid ${r.color}`,fontWeight:700,color:r.color,fontSize:12}}>
                            {r.icono} {r.nombre}
                          </span>
                          {r.editable===false&&<div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>Rol base (no eliminable)</div>}
                        </td>
                        <td style={{fontSize:12,color:"var(--muted)"}}>{r.descripcion}</td>
                        <td style={{textAlign:"center"}}><Bdg c="bb" t={`${usrsConRol} usuarios`}/></td>
                        <td style={{fontSize:10,maxWidth:200}}>
                          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                            {permsActivos.slice(0,4).map(p=><span key={p.key} style={{background:"var(--bg3)",padding:"1px 6px",borderRadius:8,fontSize:9}}>{p.lbl}</span>)}
                            {permsActivos.length>4&&<span style={{fontSize:9,color:"var(--muted)"}}>+{permsActivos.length-4} más</span>}
                          </div>
                        </td>
                        <td>
                          <div className="acts">
                            <button className="btn btn-cyan btn-xs" onClick={()=>startEditRol(r)}>✏️ Editar</button>
                            {r.editable!==false&&<button className="btn btn-ghost btn-xs" onClick={()=>delRol(r.id)}>🗑️</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              )}

              {/* Editor de rol */}
              {editRolId !== null && (
                <div style={{border:"2px solid var(--cyan)",borderRadius:12,padding:"18px 20px",marginTop:8}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"var(--cyan)"}}>
                    {editRolId==="__new__" ? "➕ Nuevo Rol" : `✏️ Editando: ${getRol(editRolId)?.nombre}`}
                  </div>

                  {/* Datos básicos del rol */}
                  <div className="fg" style={{marginBottom:12}}>
                    <div className="field">
                      <label>Nombre del Rol *</label>
                      <input value={rolForm.nombre} onChange={chR("nombre")} placeholder="Ej: Finanzas, Recursos Humanos, Logística..." autoFocus/>
                    </div>
                    <div className="field">
                      <label>Descripción</label>
                      <input value={rolForm.descripcion} onChange={chR("descripcion")} placeholder="Breve descripción de responsabilidades"/>
                    </div>
                    <div className="field">
                      <label>Ícono</label>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                        {ICON_PRESETS.map(ic=>(
                          <button key={ic} onClick={()=>setRolForm(p=>({...p,icono:ic}))}
                            style={{padding:"4px 8px",borderRadius:6,fontSize:18,background:rolForm.icono===ic?"var(--cyan)":"var(--bg2)",border:`1px solid ${rolForm.icono===ic?"var(--cyan)":"var(--border)"}`,cursor:"pointer"}}>
                            {ic}
                          </button>
                        ))}
                        <input value={rolForm.icono} onChange={chR("icono")} style={{width:50,textAlign:"center",fontSize:16,padding:"4px",borderRadius:6,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)"}}/>
                      </div>
                    </div>
                    <div className="field">
                      <label>Color</label>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                        {COLOR_PRESETS.map(c=>(
                          <button key={c} onClick={()=>setRolForm(p=>({...p,color:c}))}
                            style={{width:28,height:28,borderRadius:"50%",background:c,border:rolForm.color===c?"3px solid var(--text)":"2px solid transparent",cursor:"pointer"}}>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preview del badge */}
                  <div style={{marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:11,color:"var(--muted)"}}>Vista previa:</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:20,background:`${rolForm.color}22`,border:`1px solid ${rolForm.color}`,fontWeight:700,color:rolForm.color,fontSize:13}}>
                      {rolForm.icono} {rolForm.nombre||"Nombre del rol"}
                    </span>
                  </div>

                  {/* Permisos del rol */}
                  <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:"var(--text)"}}>🔑 Permisos de este rol:</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[...new Set(TODOS_PERMISOS.map(p=>p.grupo))].map(g=>(
                      <div key={g} style={{background:"var(--bg2)",borderRadius:8,padding:"10px 12px",border:"1px solid var(--border)"}}>
                        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>{g}</div>
                        {TODOS_PERMISOS.filter(p=>p.grupo===g).map(p=>(
                          <div key={p.key} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                            <input type="checkbox" checked={!!(rolForm.permisos[p.key])} onChange={e=>togglePerm(p.key,e.target.checked)}
                              style={{width:15,height:15,cursor:"pointer",accentColor:rolForm.color}}/>
                            <span style={{fontSize:12}}>{p.lbl}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
                    <button className="btn btn-ghost" onClick={()=>setEditRolId(null)}>Cancelar</button>
                    <button className="btn btn-cyan" onClick={saveRol}>💾 Guardar Rol</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: HISTORIAL ══════════════════════════════════════════════ */}
          {vistaTab === "log" && (
            <div>
              <table>
                <thead><tr><th>Usuario</th><th>Rol</th><th>Último Acceso</th><th>Hora</th><th>Total Accesos</th><th>Intentos Fallidos</th><th>Creado</th></tr></thead>
                <tbody>{[...lista].sort((a,b)=>(b.ultimoAcceso||"").localeCompare(a.ultimoAcceso||"")).map(u=>{
                  const rol = getRol(u.rol);
                  return (
                    <tr key={u.id}>
                      <td><div style={{fontWeight:700}}>{u.nombre}</div><div style={{fontSize:11,color:"var(--muted)"}}>{u.email}</div></td>
                      <td>{rol?<span style={{fontSize:11,color:rol.color,fontWeight:700}}>{rol.icono} {rol.nombre}</span>:<span style={{color:"var(--muted)"}}>{u.rol}</span>}</td>
                      <td style={{color:u.ultimoAcceso?"var(--green)":"var(--muted)",fontWeight:u.ultimoAcceso?700:400}}>{u.ultimoAcceso||"Nunca"}</td>
                      <td style={{fontSize:11,color:"var(--muted)"}}>{u.ultimoAccesoHora||"—"}</td>
                      <td style={{textAlign:"center"}}><Bdg c="bb" t={`${u.totalAccesos||0} veces`}/></td>
                      <td style={{textAlign:"center"}}>{(u.intentosFallidos||0)>0?<Bdg c="br" t={`${u.intentosFallidos}`}/>:<span style={{color:"var(--muted)"}}>—</span>}</td>
                      <td style={{fontSize:11,color:"var(--muted)"}}>{u.creadoEn||"—"}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          {vistaTab==="nuevo"&&editId&&<button className="btn btn-ghost" onClick={cancelEdit}>Cancelar edición</button>}
          {vistaTab==="nuevo"&&<button className="btn btn-cyan" onClick={saveUser}>{editId?"💾 Guardar cambios":"➕ Agregar Usuario"}</button>}
          <button className="btn btn-green" onClick={()=>{ onSave(lista); onSaveRoles(listaRoles); onClose(); }}>✅ Guardar todo y cerrar</button>
        </div>
      </div>
    </div>
  );
}



// ──────────────────────────────────────────────────────────────────────────────
// FACTURAPI — Timbrado CFDI 4.0 + Carta Porte 3.1
// Documentación: https://www.facturapi.io/docs
// ──────────────────────────────────────────────────────────────────────────────

const FACTURAPI_BASE = "https://www.facturapi.io/v2";

// Función principal de timbrado — lista para conectar con API key real
async function timbrarFactura({ factura, cliente, viaje, unit, driver, apiKey }) {
  if (!apiKey || apiKey === "TEST_API_KEY") {
    // Modo simulación — retorna respuesta falsa para pruebas
    return {
      ok: true,
      simulado: true,
      uuid: `SIM-${Date.now()}`,
      folio_number: factura.numeroFactura,
      pdf_url: null,
      xml_url: null,
      mensaje: "Simulación: sin API Key real. Configura tu key de Facturapi en Ajustes."
    };
  }

  // Construir objeto CFDI 4.0 con Complemento Carta Porte 3.1
  const cfdi = {
    type: "I", // Ingreso
    customer: {
      legal_name: cliente.nombre,
      tax_id: cliente.rfc,
      tax_system: cliente.regimenFiscal || "626",
      email: cliente.email,
      address: { zip: cliente.cp || "64000" }
    },
    use: factura.usoCFDI || "G03",
    payment_form: factura.formaPago || "99",
    payment_method: factura.metodoPago || "PPD",
    items: [{
      product: {
        description: `Servicio de transporte: ${viaje?.origen || "—"} → ${viaje?.destino || "—"}`,
        product_key: "78101803", // Clave SAT: Servicios de flete terrestre
        unit_key: "E48",         // Unidad: Unidad de servicio
        unit_name: "Servicio",
        price: Number(factura.subtotal) || 0,
        tax_included: false,
        taxes: [{ type: "IVA", rate: 0.16, factor: "Tasa", withholding: false }]
      },
      quantity: 1
    }],
    // Complemento Carta Porte 3.1
    ...(viaje ? {
      complement: {
        carta_porte: {
          version: "3.1",
          transport_interstate: true,
          gross_vehicle_weight: unit?.pesoVehiculo || 0,
          locations: [
            {
              type: "Origin",
              id: "OR001",
              tax_id: cliente.rfc || "",
              date: viaje.fecha || new Date().toLocaleDateString("es-MX"),
              address: {
                street: viaje.origen || "",
                zip: viaje.cpOrigen || "64000",
                state: "NL",
                country: "MEX"
              }
            },
            {
              type: "Destination",
              id: "DE001",
              tax_id: cliente.rfc || "",
              estimated_arrival: viaje.fechaReg || "",
              distance_km: viaje.kmDistancia || 0,
              address: {
                street: viaje.destino || "",
                zip: viaje.cpDestino || "64000",
                state: "NL",
                country: "MEX"
              }
            }
          ],
          transport: {
            federal_motor_transport: {
              truck_config: unit?.configVehicular || "T3S2R4",
              gross_vehicle_weight: unit?.pesoVehiculo || 0
            }
          },
          goods: [{
            goods_transport: factura.claveProducto || "47131500",
            description: viaje?.carga || "Mercancía general",
            quantity: 1,
            unit_key: "KGM",
            unit_name: "Kilogramo",
            weight: Number(viaje?.pesoKg || 1000),
            hazardous_material: false
          }],
          operators: driver ? [{
            type: "Operator",
            name: driver.nombre,
            rfc: driver.rfc || "XAXX010101000",
            license_num: driver.licencia
          }] : []
        }
      }
    } : {})
  };

  try {
    const res = await fetch(`${FACTURAPI_BASE}/invoices`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cfdi)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error en Facturapi");
    return {
      ok: true,
      simulado: false,
      uuid: data.uuid,
      folio_number: data.folio_number,
      pdf_url: data.pdf_url,
      xml_url: data.xml_url,
      facturapi_id: data.id
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function FacturapiModal({ factura, cliente, viaje, unit, driver, apiKey, onSuccess, onClose }) {
  const [estado, setEstado] = useState("idle"); // idle | loading | ok | error
  const [resultado, setResultado] = useState(null);
  const [keyLocal, setKeyLocal] = useState(apiKey || "");
  const [cpOrigen, setCpOrigen] = useState("");
  const [cpDestino, setCpDestino] = useState("");
  const [claveProducto, setClaveProducto] = useState("47131500");
  const [pesoKg, setPesoKg] = useState("1000");

  const doTimbrar = async () => {
    setEstado("loading");
    const r = await timbrarFactura({
      factura,
      cliente,
      viaje: viaje ? { ...viaje, cpOrigen, cpDestino, pesoKg } : null,
      unit,
      driver,
      apiKey: keyLocal
    });
    setResultado(r);
    setEstado(r.ok ? "ok" : "error");
    if (r.ok) onSuccess({ ...factura, uuid: r.uuid, facturapi_id: r.facturapi_id, timbrado: true, pdf_url: r.pdf_url, xml_url: r.xml_url });
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
        <div className="mhdr" style={{ borderBottom:"3px solid var(--cyan)" }}>
          <h3>🧾 Timbrar con Facturapi — CFDI 4.0 + Carta Porte 3.1</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">

          {/* API Key */}
          <div className="sec-lbl" style={{ color:"var(--cyan)", borderColor:"var(--cyan)" }}>🔑 API Key de Facturapi</div>
          <div className="fg">
            <div className="field s2">
              <label>Live Secret Key (sk_live_...) o Test Key (sk_test_...)</label>
              <input value={keyLocal} onChange={e => setKeyLocal(e.target.value)}
                placeholder="sk_live_xxxxxxxxxxxxxxxx o TEST_API_KEY para simular"
                style={{ fontFamily:"monospace", fontSize:12 }} />
              <div style={{ fontSize:10, color:"var(--muted)", marginTop:3 }}>
                Obtén tu key en <strong>facturapi.io → Dashboard → API Keys</strong>. Usa "TEST_API_KEY" para simular sin timbrar.
              </div>
            </div>
          </div>

          {/* Resumen de la factura */}
          <div className="sec-lbl">📋 Resumen</div>
          <div style={{ padding:"10px 14px", background:"var(--bg2)", borderRadius:8, fontSize:12, marginBottom:12 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              <div><span style={{color:"var(--muted)"}}>Folio:</span> <strong>{factura.serie}-{factura.numeroFactura}</strong></div>
              <div><span style={{color:"var(--muted)"}}>Cliente:</span> <strong>{factura.cliente}</strong></div>
              <div><span style={{color:"var(--muted)"}}>RFC:</span> <strong>{factura.rfcCliente}</strong></div>
              <div><span style={{color:"var(--muted)"}}>Total:</span> <strong style={{color:"var(--green)"}}>{fmt$(factura.total)}</strong></div>
              <div><span style={{color:"var(--muted)"}}>Uso CFDI:</span> <strong>{factura.usoCFDI}</strong></div>
              <div><span style={{color:"var(--muted)"}}>Forma pago:</span> <strong>{factura.formaPago}</strong></div>
            </div>
          </div>

          {/* Datos Carta Porte */}
          {viaje && (
            <>
              <div className="sec-lbl" style={{ color:"var(--green)", borderColor:"var(--green)" }}>🚛 Carta Porte 3.1</div>
              <div style={{ padding:"8px 14px", background:"var(--bg2)", borderRadius:8, fontSize:12, marginBottom:10 }}>
                <div><span style={{color:"var(--muted)"}}>Viaje:</span> <strong>{viaje.origen} → {viaje.destino}</strong></div>
                {unit && <div><span style={{color:"var(--muted)"}}>Unidad:</span> <strong>{unit.num} {unit.placas} — {unit.configVehicular||"T3S2R4"}</strong></div>}
                {driver && <div><span style={{color:"var(--muted)"}}>Operador:</span> <strong>{driver.nombre}</strong></div>}
              </div>
              <div className="fg">
                <div className="field"><label>CP Origen *</label><input value={cpOrigen} onChange={e=>setCpOrigen(e.target.value)} placeholder="64000" maxLength={5} /></div>
                <div className="field"><label>CP Destino *</label><input value={cpDestino} onChange={e=>setCpDestino(e.target.value)} placeholder="06600" maxLength={5} /></div>
                <div className="field"><label>Peso total (kg) *</label><input value={pesoKg} onChange={e=>setPesoKg(e.target.value)} type="number" placeholder="1000" /></div>
                <div className="field"><label>Clave producto SAT</label><input value={claveProducto} onChange={e=>setClaveProducto(e.target.value)} placeholder="47131500" style={{fontFamily:"monospace",fontSize:12}} /></div>
              </div>
            </>
          )}

          {/* Resultado */}
          {estado === "ok" && resultado && (
            <div style={{ padding:"14px", background:"rgba(0,134,78,.1)", border:"1px solid var(--green)", borderRadius:8, marginTop:10 }}>
              <div style={{ fontWeight:700, color:"var(--green)", marginBottom:6 }}>
                {resultado.simulado ? "🟡 Simulación exitosa (sin timbrado real)" : "✅ Timbrado exitoso"}
              </div>
              <div style={{ fontSize:12 }}>
                <div>UUID: <code style={{fontSize:11}}>{resultado.uuid}</code></div>
                {resultado.pdf_url && <div style={{marginTop:6}}><a href={resultado.pdf_url} target="_blank" rel="noreferrer" style={{color:"var(--cyan)"}}>📄 Descargar PDF</a> &nbsp; <a href={resultado.xml_url} target="_blank" rel="noreferrer" style={{color:"var(--cyan)"}}>📎 Descargar XML</a></div>}
                {resultado.simulado && <div style={{marginTop:6,color:"var(--muted)",fontSize:11}}>{resultado.mensaje}</div>}
              </div>
            </div>
          )}
          {estado === "error" && resultado && (
            <div style={{ padding:"12px", background:"rgba(220,38,38,.1)", border:"1px solid var(--red)", borderRadius:8, marginTop:10 }}>
              <div style={{ fontWeight:700, color:"var(--red)" }}>❌ Error al timbrar</div>
              <div style={{ fontSize:12, marginTop:4 }}>{resultado.error}</div>
            </div>
          )}
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          {estado !== "ok" && (
            <button className="btn btn-cyan" onClick={doTimbrar} disabled={estado==="loading"} style={{minWidth:140}}>
              {estado === "loading" ? "⏳ Timbrando..." : "🧾 Timbrar CFDI"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BrandingModal({ branding, onSave, onClose }) {
  const [f, setF] = useState(branding || { nombre: "", slogan: "", logo: "" });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) return alert("El logo debe pesar menos de 500 KB");
    const reader = new FileReader();
    reader.onload = (ev) => setF(p => ({ ...p, logo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const ok = () => {
    if (!f.nombre.trim()) return alert("El nombre de la empresa es requerido");
    onSave(f);
    onClose();
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="mhdr">
          <h3>🏢 Configuración de Empresa</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          {/* Logo preview + upload */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "20px 0 24px",
            borderBottom: "1px solid var(--border)",
            marginBottom: 20
          }}>
            <div style={{
              width: 160,
              height: 80,
              background: "var(--bg2)",
              border: "2px dashed var(--border)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}>
              {f.logo
                ? <img src={f.logo} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} alt="Logo" />
                : <span style={{ fontSize: 11, color: "var(--muted)" }}>Sin logo</span>
              }
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <label style={{
                cursor: "pointer",
                padding: "7px 16px",
                background: "var(--cyan)",
                color: "#fff",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700
              }}>
                📁 Subir Logo
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
              </label>
              {f.logo && (
                <button className="btn btn-ghost btn-sm" onClick={() => setF(p => ({ ...p, logo: "" }))}>
                  🗑 Quitar
                </button>
              )}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>PNG, JPG o SVG · máx 500 KB · fondo transparente recomendado</div>
          </div>

          <div className="fg">
            <div className="field s2">
              <label>Nombre de la Empresa *</label>
              <input
                value={f.nombre}
                onChange={e => setF(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Transportes Regio SA de CV"
              />
            </div>
            <div className="field s2">
              <label>Slogan / Subtítulo</label>
              <input
                value={f.slogan}
                onChange={e => setF(p => ({ ...p, slogan: e.target.value }))}
                placeholder="Flota profesional de transporte"
              />
            </div>
          </div>

          {/* Preview */}
          <div style={{
            marginTop: 8,
            padding: "14px 18px",
            background: "var(--bg0)",
            borderRadius: 10,
            border: "1px solid var(--border)"
          }}>
            <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>
              Vista previa en sidebar
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {f.logo
                ? <img src={f.logo} style={{ height: 40, maxWidth: 100, objectFit: "contain" }} alt="preview" />
                : <div style={{
                    fontFamily: "var(--font-hd)",
                    fontSize: 18,
                    fontWeight: 700,
                    background: "linear-gradient(135deg,var(--cyan),var(--purple))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: ".06em"
                  }}>
                    {f.nombre || "EMPRESA"}
                  </div>
              }
            </div>
            {f.slogan && (
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, letterSpacing: ".1em", textTransform: "uppercase" }}>
                {f.slogan}
              </div>
            )}
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-cyan" onClick={ok}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

function ProveedorModal({ proveedor, onSave, onClose }) {
  const [f, setF] = useState(proveedor || { nombre: "", categoria: PROVEEDOR_CATS[0], tipoProv: TIPO_PROVEEDOR_CATS[0], contacto: "", tel: "", email: "", rfc: "", direccion: "", banco: "", cuenta: "", diasCredito: 0, limiteCredito: 0, saldoPendiente: 0, ultimoPago: "", notas: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const chN = k => e => setF(p => ({ ...p, [k]: Number(e.target.value) }));
  const ok = () => { if (!f.nombre) return alert("Nombre requerido"); onSave({ ...f, id: f.id || uid() }) };
  // Días vencidos de crédito
  const diasUsados = f.ultimoPago ? Math.floor((Date.now() - new Date(f.ultimoPago)) / 86400000) : null;
  const creditoVencido = diasUsados != null && diasUsados > (f.diasCredito || 0);
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar Proveedor" : "🏪 Nuevo Proveedor"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="sec-lbl">📋 Datos Generales</div>
          <div className="fg">
            <div className="field s2"><label>Nombre *</label><input value={f.nombre} onChange={ch("nombre")} placeholder="Nombre del proveedor" /></div>
            <div className="field"><label>Categoría</label><select value={f.categoria} onChange={ch("categoria")}>{PROVEEDOR_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label>Tipo de Proveedor</label><select value={f.tipoProv||""} onChange={ch("tipoProv")}><option value="">— Tipo —</option>{TIPO_PROVEEDOR_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="field"><label>Contacto</label><input value={f.contacto} onChange={ch("contacto")} /></div>
            <div className="field"><label>Teléfono</label><input value={f.tel} onChange={ch("tel")} /></div>
            <div className="field"><label>Email</label><input value={f.email} onChange={ch("email")} type="email" /></div>
            <div className="field"><label>RFC</label><input value={f.rfc} onChange={ch("rfc")} style={{ textTransform: "uppercase" }} /></div>
            <div className="field s2"><label>Dirección</label><input value={f.direccion} onChange={ch("direccion")} /></div>
            <div className="field"><label>Banco</label><input value={f.banco} onChange={ch("banco")} /></div>
            <div className="field"><label>Cuenta / CLABE</label><input value={f.cuenta} onChange={ch("cuenta")} /></div>
          </div>
          <div className="sec-lbl" style={{color:"var(--orange)",borderColor:"var(--orange)"}}>💳 Crédito</div>
          <div className="fg">
            <div className="field"><label>Días de Crédito</label><input type="number" value={f.diasCredito||0} onChange={chN("diasCredito")} min="0" placeholder="30"/></div>
            <div className="field"><label>Límite de Crédito ($)</label><input type="number" value={f.limiteCredito||0} onChange={chN("limiteCredito")} min="0" placeholder="50000"/></div>
            <div className="field"><label>Saldo Pendiente ($)</label><input type="number" value={f.saldoPendiente||0} onChange={chN("saldoPendiente")} min="0" placeholder="0"/></div>
            <div className="field"><label>Fecha Último Pago</label><input type="date" value={f.ultimoPago||""} onChange={ch("ultimoPago")}/></div>
          </div>
          {diasUsados != null && (
            <div style={{padding:"10px 14px",borderRadius:8,background:creditoVencido?"rgba(220,50,50,.1)":"rgba(0,200,100,.08)",border:`1px solid ${creditoVencido?"var(--red)":"var(--green)"}`,fontSize:12,marginBottom:8}}>
              {creditoVencido ? `🚨 Crédito vencido hace ${diasUsados - (f.diasCredito||0)} días (${diasUsados} días desde último pago, límite: ${f.diasCredito} días)` : `✅ Crédito vigente — ${diasUsados} de ${f.diasCredito} días usados`}
            </div>
          )}
          <div className="fg">
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2} /></div>
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function HojaViajeModal({ units, drivers, onClose, companyLogo, companyName }) {
  const [f, setF] = useState({
    folio: "", fecha: new Date().toLocaleDateString("es-MX"), unidadId: "", operadorId: "",
    origenHoraCita: "", origenCliente: "", origenDireccion: "", origenContacto: "", origenTel: "",
    destinoHoraCita: "", destinoCliente: "", destinoDireccion: "", destinoContacto: "", destinoTel: "",
    carga: "", peso: "", sello: "", notas: ""
  });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const unit = units.find(u => u.id === f.unidadId);
  const driver = drivers.find(d => d.id === f.operadorId) || (unit ? drivers.find(d => d.id === unit.operador) : null);

  // Genera el HTML completo de la hoja (reutilizable)
  const buildHojaHtml = () => {
    const logoHtml = companyLogo ? `<img src="${companyLogo}" style="height:60px;object-fit:contain" alt="Logo"/>` : `<div style="font-size:22px;font-weight:700;color:#0099CC;letter-spacing:.06em">${companyName || "FLEET PRO"}</div>`;
    return `<!DOCTYPE html><html><head><title>Hoja de Viaje ${f.folio}</title><meta charset="utf-8"/><style>
    body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:16px;max-width:900px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;border-bottom:3px solid #0099CC;padding-bottom:12px}
    .title{font-size:22px;font-weight:700;color:#0099CC}
    h2{font-size:13px;font-weight:700;text-transform:uppercase;padding:7px 12px;margin:0 0 10px;border-radius:4px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
    .field{border:1px solid #ddd;padding:7px 11px;border-radius:5px;background:#FAFBFC}
    .field label{font-size:9px;font-weight:700;display:block;color:#666;text-transform:uppercase;margin-bottom:2px}
    .highlight{background:#FFF9E6;border:2px solid #FFB800}
    .origin-hdr{background:#E8F9F3;color:#00864E}
    .dest-hdr{background:#FFF0F2;color:#C41E3A}
    .section{border:1px solid #ddd;border-radius:8px;padding:12px;margin-bottom:12px}
    .firma-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:24px}
    .firma{border-top:2px solid #000;padding-top:8px;text-align:center;font-size:11px;color:#666}
    .no-print{background:#0099CC;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px;margin:16px 8px 0 0}
    @media print{.no-print{display:none}@page{size:A4;margin:10mm}}
    </style></head><body>
    <div style="margin-bottom:12px" class="no-print">
      <button class="no-print" onclick="window.print()">🖨️ Imprimir</button>
    </div>
    <div class="header">
      ${logoHtml}
      <div style="text-align:right">
        <div class="title">HOJA DE INSTRUCCIONES DE VIAJE</div>
        <div style="font-size:13px;margin-top:4px"><strong>Folio:</strong> ${f.folio || "—"} &nbsp;&nbsp; <strong>Fecha:</strong> ${f.fecha}</div>
      </div>
    </div>
    <div class="section">
      <div class="grid2">
        <div class="field"><label>Unidad</label>${unit ? `${unit.num} — ${unit.placas} (${unit.tipo})` : "—"}</div>
        <div class="field"><label>Operador</label>${driver ? driver.nombre : "—"}</div>
        <div class="field"><label>Carga / Mercancía</label>${f.carga || "—"}</div>
        <div class="field"><label>Peso</label>${f.peso || "—"}</div>
        <div class="field"><label>No. Sello</label>${f.sello || "—"}</div>
      </div>
    </div>
    <div class="section">
      <h2 class="origin-hdr">🟢 Origen / Carga</h2>
      <div class="grid2">
        <div class="field highlight"><label>⏰ Hora de Cita</label>${f.origenHoraCita || "___________"}</div>
        <div class="field"><label>Cliente</label>${f.origenCliente || "___________"}</div>
        <div class="field"><label>Dirección</label>${f.origenDireccion || "___________"}</div>
        <div class="field"><label>Contacto</label>${f.origenContacto || "___________"}</div>
        <div class="field"><label>Teléfono</label>${f.origenTel || "___________"}</div>
      </div>
    </div>
    <div class="section">
      <h2 class="dest-hdr">🔴 Destino / Descarga</h2>
      <div class="grid2">
        <div class="field highlight"><label>⏰ Hora de Cita</label>${f.destinoHoraCita || "___________"}</div>
        <div class="field"><label>Cliente</label>${f.destinoCliente || "___________"}</div>
        <div class="field"><label>Dirección</label>${f.destinoDireccion || "___________"}</div>
        <div class="field"><label>Contacto</label>${f.destinoContacto || "___________"}</div>
        <div class="field"><label>Teléfono</label>${f.destinoTel || "___________"}</div>
      </div>
    </div>
    ${f.notas ? `<div class="section"><h2 style="background:#E8EDF2;color:#1A2332">📝 Notas / Instrucciones</h2><p style="margin:0;font-size:12px">${f.notas}</p></div>` : ""}
    <div class="firma-row">
      <div class="firma">Despachador</div>
      <div class="firma">Operador: ${driver ? driver.nombre : "_______________"}</div>
      <div class="firma">Recibió (Cliente Destino)</div>
    </div>
    <p style="margin-top:20px;font-size:9px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
    </body></html>`;
  };

  const doPrint = () => {
    const w = window.open("", "_blank");
    w.document.write(buildHojaHtml());
    w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  const doDownload = () => {
    const html = buildHojaHtml();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `HojaViaje_${f.folio || "sin-folio"}_${(driver?.nombre || "operador").replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doWhatsApp = () => {
    const tel = driver?.tel || "";
    // Limpiar número: quitar espacios, guiones, paréntesis; agregar 52 si es MX
    const numLimpio = tel.replace(/[\s\-\(\)]/g, "");
    const numFinal = numLimpio.startsWith("52") ? numLimpio : numLimpio.startsWith("+") ? numLimpio.slice(1) : `52${numLimpio}`;

    const msg = [
      `🚛 *INSTRUCCIONES DE VIAJE*`,
      `📋 Folio: ${f.folio || "—"} | Fecha: ${f.fecha}`,
      ``,
      `🚛 Unidad: ${unit ? `${unit.num} — ${unit.placas}` : "—"}`,
      f.carga ? `📦 Carga: ${f.carga}${f.peso ? ` | Peso: ${f.peso}` : ""}` : "",
      f.sello ? `🔒 Sello: ${f.sello}` : "",
      ``,
      `🟢 *ORIGEN / CARGA*`,
      f.origenHoraCita ? `⏰ Hora de cita: *${f.origenHoraCita}*` : "",
      f.origenCliente ? `🏢 Cliente: ${f.origenCliente}` : "",
      f.origenDireccion ? `📍 Dirección: ${f.origenDireccion}` : "",
      f.origenContacto ? `👤 Contacto: ${f.origenContacto}` : "",
      f.origenTel ? `📞 Tel: ${f.origenTel}` : "",
      ``,
      `🔴 *DESTINO / DESCARGA*`,
      f.destinoHoraCita ? `⏰ Hora de cita: *${f.destinoHoraCita}*` : "",
      f.destinoCliente ? `🏢 Cliente: ${f.destinoCliente}` : "",
      f.destinoDireccion ? `📍 Dirección: ${f.destinoDireccion}` : "",
      f.destinoContacto ? `👤 Contacto: ${f.destinoContacto}` : "",
      f.destinoTel ? `📞 Tel: ${f.destinoTel}` : "",
      f.notas ? `\n📝 *Notas:* ${f.notas}` : "",
      ``,
      `_${companyName || "Fleet Pro"}_`,
    ].filter(l => l !== "").join("\n");

    const url = `https://wa.me/${numFinal}?text=${encodeURIComponent(msg)}`;

    if (!tel) {
      alert(`⚠️ El operador ${driver?.nombre || ""} no tiene número de teléfono registrado.\n\nAgrega su número en el módulo Conductores y vuelve a intentar.`);
      return;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>📋 Hoja de Instrucciones de Viaje</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field"><label>Folio</label><input value={f.folio} onChange={ch("folio")} placeholder="HV-001" /></div>
            <div className="field"><label>Fecha</label><input value={f.fecha} onChange={ch("fecha")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>Unidad</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u => <option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            <div className="field"><label>Operador</label><select value={f.operadorId} onChange={ch("operadorId")}><option value="">— Auto/manual —</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></div>
            <div className="field"><label>Carga / Mercancía</label><input value={f.carga} onChange={ch("carga")} /></div>
            <div className="field"><label>Peso</label><input value={f.peso} onChange={ch("peso")} placeholder="Toneladas, m³..." /></div>
            <div className="field"><label>No. Sello</label><input value={f.sello} onChange={ch("sello")} /></div>
          </div>

          {/* Info del operador seleccionado */}
          {driver && (
            <div style={{ padding: "8px 14px", background: "var(--bg2)", borderRadius: 8, marginBottom: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
              {driver.foto ? <img src={driver.foto} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: 20 }}>👤</span>}
              <div>
                <strong>{driver.nombre}</strong>
                <span style={{ color: "var(--muted)", marginLeft: 8 }}>
                  📞 {driver.tel || <span style={{ color: "var(--orange)" }}>Sin teléfono registrado</span>}
                </span>
              </div>
            </div>
          )}

          <div className="sec-lbl" style={{ color: "var(--green)", borderColor: "var(--green)" }}>🟢 Origen / Carga</div>
          <div className="fg">
            <div className="field" style={{ background: "#FFF9E6", border: "2px solid #FFB800" }}>
              <label>⏰ Hora de Cita *</label>
              <input value={f.origenHoraCita} onChange={ch("origenHoraCita")} placeholder="08:00 hrs" />
            </div>
            <div className="field"><label>Cliente</label><input value={f.origenCliente} onChange={ch("origenCliente")} /></div>
            <div className="field s2"><label>Dirección</label><input value={f.origenDireccion} onChange={ch("origenDireccion")} /></div>
            <div className="field"><label>Contacto</label><input value={f.origenContacto} onChange={ch("origenContacto")} /></div>
            <div className="field"><label>Teléfono</label><input value={f.origenTel} onChange={ch("origenTel")} /></div>
          </div>

          <div className="sec-lbl" style={{ color: "var(--red)", borderColor: "var(--red)" }}>🔴 Destino / Descarga</div>
          <div className="fg">
            <div className="field" style={{ background: "#FFF9E6", border: "2px solid #FFB800" }}>
              <label>⏰ Hora de Cita *</label>
              <input value={f.destinoHoraCita} onChange={ch("destinoHoraCita")} placeholder="18:00 hrs" />
            </div>
            <div className="field"><label>Cliente</label><input value={f.destinoCliente} onChange={ch("destinoCliente")} /></div>
            <div className="field s2"><label>Dirección</label><input value={f.destinoDireccion} onChange={ch("destinoDireccion")} /></div>
            <div className="field"><label>Contacto</label><input value={f.destinoContacto} onChange={ch("destinoContacto")} /></div>
            <div className="field"><label>Teléfono</label><input value={f.destinoTel} onChange={ch("destinoTel")} /></div>
          </div>

          <div className="fg">
            <div className="field s2"><label>Notas / Instrucciones Especiales</label><textarea value={f.notas} onChange={ch("notas")} rows={3} /></div>
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-ghost btn-sm" onClick={doDownload} title="Descargar como archivo HTML">⬇️ Descargar</button>
          <button
            className="btn btn-green btn-sm"
            onClick={doWhatsApp}
            title={driver?.tel ? `Enviar a ${driver.nombre} (${driver.tel})` : "Selecciona un operador con teléfono"}
            style={{ background: "#25D366", border: "none" }}
          >
            <span style={{ fontSize: 15 }}>📱</span> WhatsApp
          </button>
          <button className="btn btn-cyan" onClick={doPrint}>🖨️ Imprimir</button>
        </div>
      </div>
    </div>
  );
}

function NominaModal({ driver, trips, units = [], onClose, companyLogo, companyName }) {
  const [periodo, setPeriodo] = useState({ inicio: "", fin: "" });
  const [bonos, setBonos] = useState(0);
  const [estimulos, setEstimulos] = useState(0);
  const [otrasPercepciones, setOtrasPercepciones] = useState(0);
  const [deducciones, setDeducciones] = useState(0);
  const [notasDed, setNotasDed] = useState("");
  const [editPct, setEditPct] = useState(Number(driver?.porcentajeViaje) || 0);
  const [editSueldo, setEditSueldo] = useState(Number(driver?.sueldoBase) || 0);

  // Buscar unidad asignada al conductor
  const unitDelDriver = units.find(u => u.operador === driver?.id);

  const viajesOp = trips.filter(t =>
    !t.esExterno &&
    t.status === "COMPLETADO" &&
    unitDelDriver &&
    t.unidadId === unitDelDriver.id
  );

  // Filter trips in period
  const viajesPeriodo = viajesOp.filter(t => {
    if (!periodo.inicio || !periodo.fin) return true;
    const iso = toISO(t.fechaReg || t.fecha);
    if (!iso) return false;
    return iso >= toISO(periodo.inicio) && iso <= toISO(periodo.fin);
  });

  const comisionViajes = viajesPeriodo.reduce((a, t) => a + (Number(t.costoOfrecido) || 0) * editPct / 100, 0);
  const sueldoBase = editSueldo;
  const totalPercepciones = sueldoBase + comisionViajes + Number(bonos) + Number(estimulos) + Number(otrasPercepciones);
  const totalDeducciones = Number(deducciones);
  const totalNeto = totalPercepciones - totalDeducciones;

  const doPrint = () => {
    const logoHtml = companyLogo ? `<img src="${companyLogo}" style="height:50px;object-fit:contain" alt="Logo"/>` : `<div style="font-size:18px;font-weight:700;color:#0099CC">${companyName || "FLEET PRO"}</div>`;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Nómina ${driver.nombre}</title><style>
    body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px;max-width:700px;margin:0 auto}
    h1{font-size:18px;border-bottom:2px solid #0099CC;padding-bottom:6px;margin-bottom:14px;color:#0099CC}
    table{width:100%;border-collapse:collapse;margin:10px 0}
    th{background:#0099CC;color:#fff;padding:7px 12px;text-align:left;font-size:10px}
    td{padding:7px 12px;border-bottom:1px solid #eee;font-size:11px}
    .total-row td{font-weight:700;background:#E8F5FA;font-size:14px}
    .neto-row td{font-weight:700;background:#0099CC;color:#fff;font-size:16px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
    @media print{@page{size:A4;margin:12mm}}
    </style></head><body>`);
    w.document.write(`
      <div class="header">${logoHtml}<div style="text-align:right"><strong>RECIBO DE NÓMINA</strong><br/>${periodo.inicio ? `Período: ${periodo.inicio} al ${periodo.fin}` : ""}</div></div>
      <h1>👤 ${driver.nombre}</h1>
      <p><strong>Licencia:</strong> ${driver.licencia || "—"} | <strong>Antigüedad desde:</strong> ${driver.antiguedad || "—"}</p>
      <h3 style="color:#00864E;margin-top:16px">PERCEPCIONES</h3>
      <table>
        <thead><tr><th>Concepto</th><th>Monto</th></tr></thead>
        <tbody>
          <tr><td>Sueldo Base</td><td>$${sueldoBase.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
          <tr><td>Comisión por Viajes (${editPct}% sobre ${viajesPeriodo.length} viajes)</td><td>$${comisionViajes.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
          <tr><td>Bonos / Estímulos</td><td>$${Number(bonos).toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
          <tr><td>Estímulos de Productividad</td><td>$${Number(estimulos).toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
          <tr><td>Otras Percepciones</td><td>$${Number(otrasPercepciones).toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
          <tr class="total-row"><td>TOTAL PERCEPCIONES</td><td>$${totalPercepciones.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
        </tbody>
      </table>
      <h3 style="color:#C41E3A;margin-top:16px">DEDUCCIONES</h3>
      <table>
        <thead><tr><th>Concepto</th><th>Monto</th></tr></thead>
        <tbody>
          <tr><td>Deducciones ${notasDed ? `(${notasDed})` : ""}</td><td>$${totalDeducciones.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
          <tr class="total-row"><td>TOTAL DEDUCCIONES</td><td>$${totalDeducciones.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
        </tbody>
      </table>
      <table style="margin-top:10px"><tbody><tr class="neto-row"><td>💰 NETO A PAGAR</td><td>$${totalNeto.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr></tbody></table>
      <div style="margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:32px">
        <div style="border-top:2px solid #000;padding-top:8px;text-align:center;font-size:11px">Empresa — Autorizado por</div>
        <div style="border-top:2px solid #000;padding-top:8px;text-align:center;font-size:11px">Operador — ${driver.nombre}</div>
      </div>
      <p style="margin-top:16px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
    </body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>💵 Recibo de Nómina — {driver.nombre}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">

          {/* Info del operador */}
          <div style={{ padding: "10px 14px", background: "var(--bg2)", borderRadius: 8, marginBottom: 14, display: "flex", gap: 16, alignItems: "center" }}>
            {driver.foto ? <img src={driver.foto} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--cyan)" }} alt="" /> : <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{driver.nombre}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Lic. {driver.licTipo} · {driver.licencia} · Unidad: {unitDelDriver ? `${unitDelDriver.num} ${unitDelDriver.placas}` : <span style={{ color: "var(--orange)" }}>Sin unidad asignada</span>}</div>
            </div>
          </div>

          {/* Período */}
          <div className="sec-lbl">📅 Período de Nómina</div>
          <div className="fg">
            <div className="field"><label>Fecha Inicio</label><input value={periodo.inicio} onChange={e => setPeriodo(p => ({ ...p, inicio: e.target.value }))} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>Fecha Fin</label><input value={periodo.fin} onChange={e => setPeriodo(p => ({ ...p, fin: e.target.value }))} placeholder="dd/mm/aaaa" /></div>
            <div className="field s2">
              <div style={{ padding: "10px 14px", background: "var(--bg0)", borderRadius: 8, fontSize: 12, border: "1px solid var(--border)" }}>
                {unitDelDriver
                  ? <><strong style={{ color: "var(--cyan)" }}>{viajesPeriodo.length}</strong> viajes completados en el período · Total costo: <strong style={{ color: "var(--green)" }}>{fmt$(viajesPeriodo.reduce((a, t) => a + (Number(t.costoOfrecido) || 0), 0))}</strong> · <span style={{ color: "var(--muted)", fontSize: 11 }}>{viajesOp.length} en total del operador</span></>
                  : <span style={{ color: "var(--orange)" }}>⚠️ Operador sin unidad asignada — no se pueden calcular viajes</span>
                }
              </div>
            </div>
          </div>

          {/* Sueldo base y % comisión — EDITABLES en este recibo */}
          <div className="sec-lbl" style={{ color: "var(--cyan)", borderColor: "var(--cyan)" }}>💼 Parámetros de Pago (editables para este recibo)</div>
          <div className="fg">
            <div className="field">
              <label>Sueldo Base Mensual ($)</label>
              <input value={editSueldo} onChange={e => setEditSueldo(Number(e.target.value) || 0)} type="number" min="0" step="100" placeholder="0" />
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>Base guardada: {fmt$(Number(driver.sueldoBase) || 0)}</div>
            </div>
            <div className="field">
              <label>% Comisión por Viaje</label>
              <input value={editPct} onChange={e => setEditPct(Number(e.target.value) || 0)} type="number" min="0" max="100" step="0.1" placeholder="0" />
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>% guardado: {driver.porcentajeViaje || 0}%</div>
            </div>
          </div>

          {/* Percepciones */}
          <div className="sec-lbl" style={{ color: "var(--green)", borderColor: "var(--green)" }}>✅ Percepciones</div>
          <div className="fg">
            <div className="field">
              <label>Sueldo Base ($)</label>
              <input value={fmt$(sueldoBase)} readOnly style={{ background: "var(--bg2)", fontWeight: 700 }} />
            </div>
            <div className="field">
              <label>Comisión Viajes ({editPct}% · {viajesPeriodo.length} viajes)</label>
              <input value={fmt$(comisionViajes)} readOnly style={{ background: "var(--bg2)", color: "var(--cyan)", fontWeight: 700 }} />
            </div>
            <div className="field"><label>Bonos ($)</label><input value={bonos} onChange={e => setBonos(e.target.value)} type="number" min="0" placeholder="0" /></div>
            <div className="field"><label>Estímulos de Productividad ($)</label><input value={estimulos} onChange={e => setEstimulos(e.target.value)} type="number" min="0" placeholder="0" /></div>
            <div className="field s2"><label>Otras Percepciones ($)</label><input value={otrasPercepciones} onChange={e => setOtrasPercepciones(e.target.value)} type="number" min="0" placeholder="Vales, pagos especiales, etc." /></div>
          </div>

          {/* Deducciones */}
          <div className="sec-lbl" style={{ color: "var(--red)", borderColor: "var(--red)" }}>❌ Deducciones</div>
          <div className="fg">
            <div className="field"><label>Total Deducciones ($)</label><input value={deducciones} onChange={e => setDeducciones(e.target.value)} type="number" min="0" placeholder="0" /></div>
            <div className="field"><label>Descripción</label><input value={notasDed} onChange={e => setNotasDed(e.target.value)} placeholder="IMSS, préstamos, faltas, etc." /></div>
          </div>

          {/* Resumen */}
          <div style={{ marginTop: 14, padding: "16px 18px", background: "var(--bg0)", borderRadius: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, border: "2px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, textTransform: "uppercase" }}>Total Percepciones</div>
              <div style={{ fontFamily: "var(--font-hd)", fontSize: 20, fontWeight: 700, color: "var(--green)" }}>{fmt$(totalPercepciones)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, textTransform: "uppercase" }}>Total Deducciones</div>
              <div style={{ fontFamily: "var(--font-hd)", fontSize: 20, fontWeight: 700, color: "var(--red)" }}>-{fmt$(totalDeducciones)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, textTransform: "uppercase" }}>💰 Neto a Pagar</div>
              <div style={{ fontFamily: "var(--font-hd)", fontSize: 24, fontWeight: 700, color: "var(--cyan)" }}>{fmt$(totalNeto)}</div>
            </div>
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-cyan" onClick={doPrint}>🖨️ Imprimir Recibo</button>
        </div>
      </div>
    </div>
  );
}

function ClienteModal({ cliente, onSave, onClose }) {
  const [f, setF] = useState(cliente || {
    nombre: "",
    nombreCorto: "",
    rfc: "",
    tipo: "MORAL",
    email: "",
    telefono: "",
    direccion: "",
    diasCreditoDefault: 30,
    limiteCredito: 0,
    status: "ACTIVO",
    notas: ""
  });

  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const ok = () => {
    if (!f.nombre || !f.rfc) return alert("Nombre y RFC requeridos");
    onSave({ ...f, id: f.id || uid() });
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr">
          <h3>{f.id ? "✏️ Editar Cliente" : "👤 Nuevo Cliente"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2">
              <label>Nombre Completo / Razón Social *</label>
              <input 
                value={f.nombre} 
                onChange={ch("nombre")}
                placeholder="TechMex SA de CV"
              />
            </div>
            <div className="field">
              <label>Nombre Corto</label>
              <input 
                value={f.nombreCorto} 
                onChange={ch("nombreCorto")}
                placeholder="TechMex"
              />
            </div>
            <div className="field">
              <label>RFC *</label>
              <input 
                value={f.rfc} 
                onChange={ch("rfc")}
                placeholder="TMX980101ABC"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div className="field">
              <label>Tipo de Cliente</label>
              <select value={f.tipo} onChange={ch("tipo")}>
                <option value="FISICA">Persona Física</option>
                <option value="MORAL">Persona Moral</option>
              </select>
            </div>
            <div className="field">
              <label>Email</label>
              <input 
                value={f.email} 
                onChange={ch("email")}
                type="email"
                placeholder="facturacion@empresa.com"
              />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input 
                value={f.telefono} 
                onChange={ch("telefono")}
                placeholder="8181234567"
              />
            </div>
            <div className="field s2">
              <label>Dirección Fiscal</label>
              <input 
                value={f.direccion} 
                onChange={ch("direccion")}
                placeholder="Av. Principal 123, Col. Centro, MTY"
              />
            </div>
          </div>

          <div className="sec-lbl">Condiciones Comerciales</div>
          <div className="fg">
            <div className="field">
              <label>Días de Crédito</label>
              <input 
                value={f.diasCreditoDefault} 
                onChange={ch("diasCreditoDefault")}
                type="number"
                min="0"
              />
            </div>
            <div className="field">
              <label>Límite de Crédito ($)</label>
              <input 
                value={f.limiteCredito} 
                onChange={ch("limiteCredito")}
                type="number"
                min="0"
                step="1000"
              />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={f.status} onChange={ch("status")}>
                <option value="ACTIVO">Activo</option>
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </div>
            <div className="field s2">
              <label>Notas</label>
              <textarea 
                value={f.notas} 
                onChange={ch("notas")}
                rows={3}
                placeholder="Información adicional del cliente..."
              />
            </div>
          </div>

          {f.tipo === "MORAL" && (
            <div style={{
              padding: "12px 16px",
              background: "#E8F5FA",
              borderRadius: 8,
              marginTop: 14,
              fontSize: 12,
              border: "1px solid #B3E0F2"
            }}>
              <strong style={{ color: "var(--cyan)" }}>ℹ️ Persona Moral:</strong> Se aplicará retención de IVA del 4% en las facturas.
            </div>
          )}
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-cyan" onClick={ok}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

function FacturaModal({ factura, clientes, viajes, onSave, onClose }) {
  const [f, setF] = useState(factura || {
    serie: "A",
    numeroFactura: "",
    clienteId: "",
    fechaEmision: "",
    diasCredito: 30,
    subtotal: 0,
    formaPago: "99",
    metodoPago: "PPD",
    usoCFDI: "G03",
    viajeId: "",
    notas: ""
  });

  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const cliente = clientes.find(c => c.id === f.clienteId);
  const iva = f.subtotal * 0.16;
  const retIVA = cliente?.tipo === "MORAL" ? f.subtotal * 0.04 : 0;
  const total = f.subtotal + iva - retIVA;

  const fechaVenc = useMemo(() => {
    if (!f.fechaEmision) return "";
    return addDays(f.fechaEmision, Number(f.diasCredito));
  }, [f.fechaEmision, f.diasCredito]);

  // Auto-completar con datos del viaje si se selecciona
  useEffect(() => {
    if (f.viajeId && !f.subtotal) {
      const viaje = viajes.find(v => v.id === f.viajeId);
      if (viaje) {
        setF(p => ({ ...p, subtotal: viaje.costoOfrecido || 0 }));
      }
    }
  }, [f.viajeId, viajes, f.subtotal]);

  const ok = () => {
    if (!f.clienteId || !f.numeroFactura || !f.subtotal) {
      return alert("Cliente, número de factura y subtotal son requeridos");
    }

    onSave({
      ...f,
      cliente: cliente.nombre,
      rfcCliente: cliente.rfc,
      tipoCliente: cliente.tipo,
      emailCliente: cliente.email,
      fechaVencimiento: fechaVenc,
      iva,
      retencionIVA: retIVA,
      total,
      status: "PENDIENTE",
      fechaPago: "",
      id: f.id || uid()
    });
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr">
          <h3>{f.id ? "✏️ Editar Factura" : "🧾 Nueva Factura"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          {/* CLIENTE */}
          <div className="sec-lbl">Cliente</div>
          <div className="fg">
            <div className="field s2">
              <label>Cliente *</label>
              <select 
                value={f.clienteId} 
                onChange={e => {
                  const cli = clientes.find(c => c.id === e.target.value);
                  setF(p => ({
                    ...p, 
                    clienteId: e.target.value,
                    diasCredito: cli?.diasCreditoDefault || 30
                  }));
                }}
              >
                <option value="">— Seleccionar cliente —</option>
                {clientes.filter(c => c.status === "ACTIVO").map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombreCorto || c.nombre} ({c.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cliente && (
            <div style={{
              padding: "12px 16px",
              background: "var(--bg2)",
              borderRadius: 8,
              marginBottom: 14,
              fontSize: 11
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <strong>RFC:</strong> {cliente.rfc}
                </div>
                <div>
                  <strong>Tipo:</strong> {cliente.tipo}
                </div>
                <div>
                  <strong>Crédito:</strong> {cliente.diasCreditoDefault} días
                </div>
                <div>
                  <strong>Email:</strong> {cliente.email || "—"}
                </div>
              </div>
            </div>
          )}

          {/* DATOS FACTURA */}
          <div className="sec-lbl">Datos de la Factura</div>
          <div className="fg">
            <div className="field">
              <label>Serie</label>
              <input 
                value={f.serie} 
                onChange={ch("serie")} 
                maxLength={1}
                style={{ textTransform: "uppercase" }}
                placeholder="A"
              />
            </div>
            <div className="field">
              <label>Folio / Número *</label>
              <input 
                value={f.numeroFactura} 
                onChange={ch("numeroFactura")}
                placeholder="001"
              />
            </div>
            <div className="field">
              <label>Fecha Emisión *</label>
              <input 
                value={f.fechaEmision} 
                onChange={ch("fechaEmision")} 
                placeholder="dd/mm/aaaa"
              />
            </div>
            <div className="field">
              <label>Días de Crédito</label>
              <input 
                value={f.diasCredito} 
                onChange={ch("diasCredito")} 
                type="number"
                min="0"
              />
            </div>
            <div className="field s2">
              <label>Viaje Relacionado (opcional)</label>
              <select value={f.viajeId} onChange={ch("viajeId")}>
                <option value="">— Sin relacionar —</option>
                {viajes.filter(v => v.status === "COMPLETADO").map(v => {
                  return (
                    <option key={v.id} value={v.id}>
                      {v.origen} → {v.destino} ({v.fecha}) - {fmt$(v.costoOfrecido)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* MONTOS */}
          <div className="sec-lbl">Montos</div>
          <div className="fg">
            <div className="field s2">
              <label>Subtotal (antes de IVA) *</label>
              <input 
                value={f.subtotal} 
                onChange={ch("subtotal")} 
                type="number" 
                step="0.01"
                min="0"
                placeholder="25000.00"
              />
            </div>
          </div>

          {f.subtotal > 0 && (
            <div className="profit-card">
              <div className="profit-row">
                <span className="profit-lbl">Subtotal</span>
                <span className="profit-val">{fmt$(f.subtotal)}</span>
              </div>
              <div className="profit-row">
                <span className="profit-lbl">IVA (16%)</span>
                <span className="profit-val" style={{color:"var(--green)"}}>
                  +{fmt$(iva)}
                </span>
              </div>
              {cliente?.tipo === "MORAL" && (
                <div className="profit-row">
                  <span className="profit-lbl">
                    Retención IVA (4%)
                    <span style={{ 
                      fontSize: 10, 
                      color: "var(--muted)",
                      marginLeft: 6 
                    }}>
                      retenido por cliente
                    </span>
                  </span>
                  <span className="profit-val" style={{color:"var(--red)"}}>
                    -{fmt$(retIVA)}
                  </span>
                </div>
              )}
              <div className="profit-row">
                <span className="profit-lbl">TOTAL A COBRAR</span>
                <span className="profit-val" style={{
                  color: "var(--cyan)",
                  fontSize: 20
                }}>
                  {fmt$(total)}
                </span>
              </div>
            </div>
          )}

          {fechaVenc && (
            <div style={{
              padding: "10px 14px",
              background: "#FFF9E6",
              border: "1px solid #FFE699",
              borderRadius: 8,
              marginTop: 10,
              fontSize: 12,
              color: "#997404",
              fontWeight: 600
            }}>
              📅 Fecha de vencimiento: {fechaVenc}
            </div>
          )}

          {/* DATOS FISCALES SAT */}
          <div className="sec-lbl">Datos Fiscales (SAT)</div>
          <div className="fg">
            <div className="field">
              <label>Forma de Pago</label>
              <select value={f.formaPago} onChange={ch("formaPago")}>
                {Object.entries(FORMAS_PAGO_SAT).map(([k, v]) => (
                  <option key={k} value={k}>
                    {k} - {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Método de Pago</label>
              <select value={f.metodoPago} onChange={ch("metodoPago")}>
                {Object.entries(METODOS_PAGO).map(([k, v]) => (
                  <option key={k} value={k}>
                    {k} - {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="field s2">
              <label>Uso de CFDI</label>
              <select value={f.usoCFDI} onChange={ch("usoCFDI")}>
                {Object.entries(USOS_CFDI).map(([k, v]) => (
                  <option key={k} value={k}>
                    {k} - {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="field s2">
              <label>Notas / Observaciones</label>
              <textarea 
                value={f.notas} 
                onChange={ch("notas")} 
                rows={2}
                placeholder="Información adicional..."
              />
            </div>
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-cyan" onClick={ok}>
            💾 Crear Factura
          </button>
        </div>
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════
// PRINT FUNCTIONS
// ══════════════════════════════════════════════════════════════

function printEvidencias({ trip, unit, externos = [] }) {
  const w = window.open("", "_blank");
  const isExt = trip.esExterno;
  const ext = isExt ? externos.find(e => e.id === trip.unidadId) : null;
  const evidencias = trip.evidencias || [];
  
  w.document.write(`<!DOCTYPE html><html><head><title>Evidencias ${isExt ? ext?.empresa : unit?.num}</title><style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px}
  h1{font-size:20px;border-bottom:3px solid #0099CC;padding-bottom:8px;margin-bottom:18px;color:#0099CC}
  .info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
  .field{border:1px solid #ddd;padding:8px 12px;border-radius:6px}
  .field label{font-size:10px;font-weight:700;display:block;color:#666;text-transform:uppercase}
  .photos{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:20px}
  .photo-item{page-break-inside:avoid}
  .photo-item img{width:100%;height:auto;border:2px solid #0099CC;border-radius:8px}
  .photo-caption{text-align:center;margin-top:8px;font-size:11px;color:#666;font-weight:600}
  @media print{@page{size:A4;margin:15mm}.photos{grid-template-columns:1fr}}
  </style></head><body>`);
  
  w.document.write(`
    <h1>📸 EVIDENCIAS DE ENTREGA DE MERCANCÍA</h1>
    <div class="info">
      <div class="field"><label>${isExt ? "Empresa Transportista" : "Unidad"}</label>${isExt ? ext?.empresa : `${unit?.num} — ${unit?.placas}`}</div>
      <div class="field"><label>Ruta</label>${trip.origen} → ${trip.destino}</div>
      <div class="field"><label>Cliente</label>${trip.cliente || "—"}</div>
      <div class="field"><label>Fecha Entrega</label>${trip.fechaReg || trip.fecha}</div>
      <div class="field"><label>Carga</label>${trip.carga || "—"}</div>
      <div class="field"><label>Status</label>${trip.status}</div>
    </div>
  `);
  
  if (evidencias.length === 0) {
    w.document.write(`<p style="text-align:center;padding:40px;color:#999">Sin evidencias fotográficas</p>`);
  } else {
    w.document.write(`<div class="photos">`);
    evidencias.forEach((ev, i) => {
      w.document.write(`
        <div class="photo-item">
          <img src="${ev}" alt="Evidencia ${i + 1}"/>
          <div class="photo-caption">Evidencia ${i + 1} de ${evidencias.length}</div>
        </div>
      `);
    });
    w.document.write(`</div>`);
  }
  
  w.document.write(`<p style="margin-top:20px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></body></html>`);
  w.document.close(); w.focus(); setTimeout(() => w.print(), 600);
}

function printUnitSheet({ unit, driver, docs, maints, fuels, trips, showFinancial = true, companyLogo = "", companyName = "" }) {
  const w = window.open("", "_blank");
  const totalM = maints.filter(m => m.unidadId === unit.id).reduce((a, m) => a + (Number(m.costoRef) || 0) + (Number(m.costoMO) || 0), 0);
  const totalF = fuels.filter(f => f.unidadId === unit.id).reduce((a, f) => a + (Number(f.litros) || 0) * (Number(f.precio) || 0), 0);
  const op = driver || {};
  const logoHtml = companyLogo ? `<img src="${companyLogo}" style="height:44px;object-fit:contain;margin-bottom:4px" alt="Logo"/>` : `<div style="font-size:16px;font-weight:700;color:#0099CC">${companyName || "FLEET PRO"}</div>`;
  w.document.write(`<!DOCTYPE html><html><head><title>Ficha ${unit.num}</title><style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px;max-width:850px;margin:0 auto}
  h1{font-size:20px;border-bottom:3px solid #0099CC;padding-bottom:6px;margin-bottom:16px;color:#0099CC}
  h2{font-size:13px;background:#E8F5FA;padding:6px 12px;margin:14px 0 8px;border-left:4px solid #0099CC;color:#006699}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
  .field{border:1px solid #ddd;padding:7px 11px;border-radius:5px;background:#FAFBFC}
  .field label{font-size:9px;font-weight:700;display:block;color:#666;text-transform:uppercase}
  table{width:100%;border-collapse:collapse;margin-bottom:10px}
  th{background:#0099CC;color:#fff;padding:6px 10px;text-align:left;font-size:10px}
  td{padding:6px 10px;border-bottom:1px solid #eee;font-size:11px}
  .header-row{display:flex;gap:18px;align-items:flex-start;margin-bottom:16px}
  .photo{width:160px;height:120px;object-fit:cover;border:2px solid #0099CC;border-radius:8px}
  .totals{display:flex;gap:24px;padding:12px 16px;background:#E8F5FA;border-radius:8px;margin-top:10px;border:1px solid #B3E0F2}
  @media print{@page{size:A4;margin:12mm}}
  </style></head><body>`);
  w.document.write(`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;border-bottom:3px solid #0099CC;padding-bottom:10px">
      <div>${logoHtml}</div>
      <div style="font-size:11px;color:#666;text-align:right">Ficha Técnica · ${new Date().toLocaleDateString("es-MX")}</div>
    </div>
    <div class="header-row">
      ${unit.foto ? `<img src="${unit.foto}" class="photo" alt=""/>` : `<div style="width:160px;height:120px;background:#E8EDF2;border:2px solid #0099CC;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:40px">🚛</div>`}
      <div style="flex:1">
        <h1>FICHA TÉCNICA — UNIDAD ${unit.num}</h1>
        <div class="grid">
          <div class="field"><label>Placas</label>${unit.placas}</div>
          <div class="field"><label>No. Económico</label>${unit.eco || "—"}</div>
          <div class="field"><label>Marca / Modelo / Año</label>${unit.marca} ${unit.modelo} ${unit.anio}</div>
          <div class="field"><label>Tipo</label>${unit.tipo}</div>
          <div class="field"><label>VIN</label>${unit.vin || "—"}</div>
          <div class="field"><label>Estado</label>${unit.estado}</div>
        </div>
      </div>
    </div>
    <h2>👨‍✈️ Operador</h2>
    <div class="grid">
      <div class="field"><label>Nombre</label>${op.nombre || "Sin asignar"}</div>
      <div class="field"><label>Licencia</label>${op.licencia || "—"} Tipo ${op.licTipo || "—"}</div>
      <div class="field"><label>Vence Licencia</label>${op.licVence || "—"}</div>
      <div class="field"><label>Teléfono</label>${op.tel || "—"}</div>
    </div>
    <h2>📏 Kilometraje</h2>
    <div class="grid">
      <div class="field"><label>KM Actual</label>${fmtN(unit.kmActual)} km</div>
      <div class="field"><label>KM Último Mant.</label>${fmtN(unit.kmUltMant)} km</div>
      <div class="field"><label>KM desde último mant.</label>${fmtN((Number(unit.kmActual) || 0) - (Number(unit.kmUltMant) || 0))} km</div>
      <div class="field"><label>Próx. Mantenimiento</label>${unit.proxMant || "—"}</div>
    </div>
    <h2>📄 Documentos</h2>
    <table><thead><tr><th>Documento</th><th>Número</th><th>Empresa</th><th>Vence</th><th>Estado</th></tr></thead><tbody>
    ${docs.filter(d => d.unidadId === unit.id).map(d => { const dy = daysUntil(d.vence); const lbl = dy === null ? "Sin fecha" : dy < 0 ? `VENCIDO (${Math.abs(dy)}d)` : dy <= 30 ? `Por vencer (${dy}d)` : `OK (${dy}d)`; return `<tr><td>${d.nombre}</td><td>${d.numero || "—"}</td><td>${d.empresa || "—"}</td><td>${d.vence || "—"}</td><td>${lbl}</td></tr>` }).join("")}
    </tbody></table>
  `);
  if (showFinancial) {
    w.document.write(`
      <h2>🔧 Mantenimientos</h2>
      <table><thead><tr><th>Tipo</th><th>Descripción</th><th>F.Programada</th><th>Realizado</th><th>Taller</th><th>Costo</th></tr></thead><tbody>
      ${maints.filter(m => m.unidadId === unit.id).map(m => `<tr><td>${m.tipo}</td><td>${m.desc}</td><td>${m.fechaProg}</td><td>${m.realizado}</td><td>${m.taller || "—"}</td><td>$${((Number(m.costoRef) || 0) + (Number(m.costoMO) || 0)).toLocaleString("es-MX")}</td></tr>`).join("")}
      </tbody></table>
      <h2>⛽ Combustible</h2>
      <table><thead><tr><th>Fecha</th><th>Litros</th><th>Precio/L</th><th>Costo</th><th>KM Rec.</th><th>Rendimiento</th></tr></thead><tbody>
      ${fuels.filter(f => f.unidadId === unit.id).map(f => { const c = (Number(f.litros) || 0) * (Number(f.precio) || 0); const r = f.kmRec && f.litros ? (Number(f.kmRec) / Number(f.litros)).toFixed(2) : "—"; return `<tr><td>${f.fecha}</td><td>${f.litros} L</td><td>$${Number(f.precio).toFixed(2)}</td><td>$${c.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td><td>${f.kmRec ? fmtN(f.kmRec) + " km" : "—"}</td><td>${r !== "—" ? r + " km/L" : "—"}</td></tr>` }).join("")}
      </tbody></table>
      <div class="totals">
        <span><b>Gasto Mantenimientos:</b> ${fmt$(totalM)}</span>
        <span><b>Gasto Combustible:</b> ${fmt$(totalF)}</span>
        <span><b>TOTAL GENERAL:</b> ${fmt$(totalM + totalF)}</span>
      </div>
    `);
  }
  w.document.write(`<p style="margin-top:16px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></body></html>`);
  w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
}

function printDriverSheet({ driver, unit, companyLogo = "", companyName = "" }) {
  const w = window.open("", "_blank");
  const logoHtml = companyLogo ? `<img src="${companyLogo}" style="height:40px;object-fit:contain" alt="Logo"/>` : `<div style="font-size:14px;font-weight:700;color:#0099CC">${companyName || "FLEET PRO"}</div>`;
  w.document.write(`<!DOCTYPE html><html><head><title>Hoja Conductor ${driver.nombre}</title><style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px;max-width:750px;margin:0 auto}
  h1{font-size:20px;border-bottom:3px solid#0099CC;padding-bottom:6px;margin-bottom:16px;color:#0099CC}
  .header-row{display:flex;gap:18px;align-items:flex-start;margin-bottom:16px}
  .photo{width:130px;height:130px;object-fit:cover;border-radius:50%;border:4px solid #0099CC}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
  .field{border:1px solid #ddd;padding:7px 11px;border-radius:5px;background:#FAFBFC}
  .field label{font-size:9px;font-weight:700;display:block;color:#666;text-transform:uppercase}
  @media print{@page{size:A4;margin:12mm}}
  </style></head><body>`);
  w.document.write(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:3px solid #0099CC;padding-bottom:10px">
      <div>${logoHtml}</div>
      <div style="font-size:11px;color:#666">Hoja de Conductor · ${new Date().toLocaleDateString("es-MX")}</div>
    </div>
    <div class="header-row">
      ${driver.foto ? `<img src="${driver.foto}" class="photo" alt=""/>` : `<div style="width:130px;height:130px;background:#E8EDF2;border-radius:50%;border:4px solid #0099CC;display:flex;align-items:center;justify-content:center;font-size:60px">👤</div>`}
      <div style="flex:1">
        <h1>HOJA DE DATOS DEL CONDUCTOR</h1>
        <div class="grid">
          <div class="field"><label>Nombre Completo</label>${driver.nombre}</div>
          <div class="field"><label>Status</label>${driver.status}</div>
          <div class="field"><label>Licencia</label>${driver.licencia || "—"}</div>
          <div class="field"><label>Tipo Licencia</label>Tipo ${driver.licTipo || "—"}</div>
        </div>
      </div>
    </div>
    <div class="grid">
      <div class="field"><label>Vence Licencia</label>${driver.licVence || "—"}</div>
      <div class="field"><label>Teléfono</label>${driver.tel || "—"}</div>
      <div class="field"><label>Email</label>${driver.email || "—"}</div>
      <div class="field"><label>Año de Ingreso</label>${driver.antiguedad || "—"}</div>
      <div class="field"><label>Unidad Asignada</label>${unit ? `${unit.num} — ${unit.placas}` : "Sin unidad asignada"}</div>
      <div class="field"><label>Tipo Unidad</label>${unit ? unit.tipo : "—"}</div>
    </div>
    <div class="field" style="margin-top:12px"><label>Notas</label>${driver.notas || "Sin notas"}</div>
    <p style="margin-top:16px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
  </body></html>`);
  w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
}

function printNominaOperador({ driver, weeks = 4 }) {
  const w = window.open("", "_blank");
  const total = weeks * (Number(driver.salarioSemanal) || 0);
  w.document.write(`<!DOCTYPE html><html><head><title>Nómina ${driver.nombre}</title><style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px;max-width:700px;margin:0 auto}
  h1{font-size:18px;border-bottom:2px solid #0099CC;padding-bottom:6px;margin-bottom:14px;color:#0099CC}
  table{width:100%;border-collapse:collapse;margin:12px 0}
  th{background:#0099CC;color:#fff;padding:7px 12px;text-align:left;font-size:10px}
  td{padding:7px 12px;border-bottom:1px solid #eee;font-size:11px}
  .total-row{font-weight:700;background:#E8F5FA;font-size:14px}
  @media print{@page{size:A4;margin:12mm}}
  </style></head><body>`);
  w.document.write(`
    <h1>📋 REPORTE DE NÓMINA — ${driver.nombre}</h1>
    <p style="margin-bottom:12px"><strong>Período:</strong> ${weeks} semanas</p>
    <table>
      <thead><tr><th>Semana</th><th>Salario Semanal</th></tr></thead>
      <tbody>
      ${Array(weeks).fill(0).map((_, i) => `<tr><td>Semana ${i + 1}</td><td>$${Number(driver.salarioSemanal).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td></tr>`).join("")}
      <tr class="total-row"><td>TOTAL ${weeks} SEMANAS</td><td>$${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td></tr>
      </tbody>
    </table>
    <p style="margin-top:16px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
  </body></html>`);
  w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
}

function printTripsReport({ trips, units, externos = [], companyLogo = "", companyName = "" }) {
  const w = window.open("", "_blank");
  const logoHtml = companyLogo ? `<img src="${companyLogo}" style="height:36px;object-fit:contain" alt=""/>` : `<strong style="color:#0099CC">${companyName||"FLEET PRO"}</strong>`;
  w.document.write(`<!DOCTYPE html><html><head><title>Reporte de Viajes</title><style>
  body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:20px}
  h1{font-size:18px;border-bottom:2px solid #0099CC;padding-bottom:6px;margin-bottom:14px;color:#0099CC}
  table{width:100%;border-collapse:collapse;margin:12px 0}
  th{background:#0099CC;color:#fff;padding:6px 9px;text-align:left;font-size:10px}
  td{padding:6px 9px;border-bottom:1px solid #eee;font-size:10px}
  @media print{@page{size:A4 landscape;margin:10mm}}
  </style></head><body>`);
  w.document.write(`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:3px solid #0099CC;padding-bottom:8px"><div>${logoHtml}</div><div style="font-size:11px;color:#666">Reporte de Viajes · ${new Date().toLocaleDateString("es-MX")}</div></div>`);
  w.document.write(`<h1>🗺️ REPORTE DE VIAJES — FLOTA COMPLETA</h1><table><thead><tr><th>Tipo</th><th>Unidad/Empresa</th><th>Origen</th><th>Destino</th><th>Salida</th><th>Regreso</th><th>KM</th><th>Cliente</th><th>Status</th></tr></thead><tbody>`);
  trips.forEach(t => {
    const isExt = t.esExterno;
    const u = isExt ? null : units.find(u => u.id === t.unidadId);
    const ext = isExt ? externos.find(e => e.id === t.unidadId) : null;
    const dist = t.kmLlegada && t.kmSalida ? Number(t.kmLlegada) - Number(t.kmSalida) : 0;
    w.document.write(`<tr><td>${isExt ? "EXT" : "INT"}</td><td>${isExt ? ext?.empresa : `${u?.num} ${u?.placas}`}</td><td>${t.origen}</td><td>${t.destino || "—"}</td><td>${t.fecha}</td><td>${t.fechaReg || "Pendiente"}</td><td>${dist ? fmtN(dist) + " km" : "—"}</td><td>${t.cliente || "—"}</td><td>${t.status}</td></tr>`);
  });
  w.document.write(`</tbody></table><p style="margin-top:16px;font-size:10px;color:#999">Total viajes: ${trips.length} | Generado: ${new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></body></html>`);
  w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
}

function printTripProfit({ trip, unit, fuels, maints, externos = [] }) {
  const w = window.open("", "_blank");
  const isExt = trip.esExterno;
  const ext = isExt ? externos.find(e => e.id === trip.unidadId) : null;
  
  if (isExt) {
    const utilidad = (Number(trip.precioCliente) || 0) - (Number(trip.costoPagar) || 0) - (Number(trip.costoEstadias) || 0);
    w.document.write(`<!DOCTYPE html><html><head><title>Utilidad Viaje Externo</title><style>
    body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px;max-width:700px;margin:0 auto}
    h1{font-size:18px;border-bottom:2px solid #0099CC;padding-bottom:6px;margin-bottom:14px;color:#0099CC}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}
    .total{font-weight:700;font-size:16px;background:#E8F5FA;padding:12px;margin-top:12px;border-radius:6px;border:1px solid #B3E0F2}
    @media print{@page{size:A4;margin:12mm}}
    </style></head><body>`);
    w.document.write(`
      <h1>💰 REPORTE DE UTILIDAD — VIAJE EXTERNO</h1>
      <p><strong>Empresa Transportista:</strong> ${ext?.empresa}</p>
      <p><strong>Ruta:</strong> ${trip.origen} → ${trip.destino}</p>
      <p><strong>Fecha:</strong> ${trip.fecha}</p>
      <hr style="margin:16px 0">
      <h2 style="font-size:14px;margin-bottom:10px">INGRESOS</h2>
      <div class="row"><span>Precio al cliente</span><span>${fmt$(trip.precioCliente)}</span></div>
      <h2 style="font-size:14px;margin:14px 0 10px">COSTOS</h2>
      <div class="row"><span>Costo a pagar al transportista</span><span>${fmt$(trip.costoPagar)}</span></div>
      <div class="row"><span>Costo de estadías</span><span>${fmt$(trip.costoEstadias)}</span></div>
      <div class="row" style="font-weight:700;background:#fafafa"><span>Total costos</span><span>${fmt$((Number(trip.costoPagar) || 0) + (Number(trip.costoEstadias) || 0))}</span></div>
      <div class="total" style="color:${utilidad >= 0 ? "#00864E" : "#C41E3A"}"><span>UTILIDAD NETA:</span> <span style="float:right">${fmt$(utilidad)}</span></div>
      <p style="margin-top:16px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX")}</p>
    </body></html>`);
  } else {
    const dist = (Number(trip.kmLlegada) || 0) - (Number(trip.kmSalida) || 0);
    const fuelTrip = fuels.filter(f => { const iso = toISO(f.fecha); const tiso = toISO(trip.fecha); return f.unidadId === trip.unidadId && iso >= tiso });
    const costoComb = fuelTrip.reduce((a, f) => a + (Number(f.litros) || 0) * (Number(f.precio) || 0), 0);
    const maintTrip = maints.filter(m => { const iso = toISO(m.fechaEjec); const tiso = toISO(trip.fecha); return m.unidadId === trip.unidadId && iso >= tiso && m.realizado === "SI" });
    const costoMaint = maintTrip.reduce((a, m) => a + (Number(m.costoRef) || 0) + (Number(m.costoMO) || 0), 0);
    const deprec = (Number(unit.deprecAnual) || 0) / 365 * 7;
    const gastos = (Number(trip.gastosExtras) || 0) + (Number(trip.costoEstadias) || 0);
    const costoTotal = costoComb + costoMaint + deprec + gastos;
    const ingreso = Number(trip.costoOfrecido) || 0;
    const utilidad = ingreso - costoTotal;
    w.document.write(`<!DOCTYPE html><html><head><title>Utilidad Viaje</title><style>
    body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px;max-width:700px;margin:0 auto}
    h1{font-size:18px;border-bottom:2px solid #0099CC;padding-bottom:6px;margin-bottom:14px;color:#0099CC}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}
    .total{font-weight:700;font-size:16px;background:#E8F5FA;padding:12px;margin-top:12px;border-radius:6px;border:1px solid #B3E0F2}
    @media print{@page{size:A4;margin:12mm}}
    </style></head><body>`);
    w.document.write(`
      <h1>💰 REPORTE DE UTILIDAD POR VIAJE</h1>
      <p><strong>Unidad:</strong> ${unit.num} — ${unit.placas}</p>
      <p><strong>Ruta:</strong> ${trip.origen} → ${trip.destino}</p>
      <p><strong>Fecha:</strong> ${trip.fecha}</p>
      <p><strong>Distancia:</strong> ${fmtN(dist)} km</p>
      <hr style="margin:16px 0">
      <h2 style="font-size:14px;margin-bottom:10px">INGRESOS</h2>
      <div class="row"><span>Costo ofrecido al cliente</span><span>${fmt$(ingreso)}</span></div>
      <h2 style="font-size:14px;margin:14px 0 10px">COSTOS</h2>
      <div class="row"><span>Combustible</span><span>${fmt$(costoComb)}</span></div>
      <div class="row"><span>Mantenimiento</span><span>${fmt$(costoMaint)}</span></div>
      <div class="row"><span>Depreciación (7 días aprox)</span><span>${fmt$(deprec)}</span></div>
      <div class="row"><span>Gastos extras + estadías</span><span>${fmt$(gastos)}</span></div>
      <div class="row" style="font-weight:700;background:#fafafa"><span>Total costos</span><span>${fmt$(costoTotal)}</span></div>
      <div class="total" style="color:${utilidad >= 0 ? "#00864E" : "#C41E3A"}"><span>UTILIDAD NETA:</span> <span style="float:right">${fmt$(utilidad)}</span></div>
      <p style="margin-top:16px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX")}</p>
    </body></html>`);
  }
  w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
}

// ══════════════════════════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════════════════════════

function Dashboard({ 
  units, 
  drivers, 
  docs, 
  maints, 
  fuels, 
  trips, 
  gastos, 
  externos, 
  facturas,
  clientes,
  proveedores = [],
  isAdmin 
}) {
  
  // ──────────────────────────────────────────────────────────────
  // ESTADÍSTICAS OPERACIONALES
  // ──────────────────────────────────────────────────────────────
  
  const activas = units.filter(u => u.estado === "ACTIVA").length;
  const enTaller = units.filter(u => u.estado === "EN TALLER").length;
  const alta = maints.filter(m => m.realizado === "NO" && m.prioridad === "ALTA").length;
  
  // Alertas de documentos
  const docAlert = docs.filter(d => { 
    const dy = daysUntil(d.vence); 
    return dy !== null && dy <= 30 
  }).length;
  
  // Viajes en ruta
  const enRuta = trips.filter(t => t.status === "EN RUTA").length;

  // Operadores activos
  const operadoresActivos = drivers.filter(d => d.status === "ACTIVO").length;
  const operadoresEnRuta  = trips.filter(t => t.status === "EN RUTA").map(t => t.conductorId).filter(Boolean).length;

  // Proveedores con crédito por vencer / vencidos
  const diasDesdeP = (f) => f ? Math.floor((Date.now() - new Date(f)) / 86400000) : null;
  const credVencidos  = proveedores.filter(p => { if (!p.diasCredito||!p.ultimoPago) return false; return diasDesdeP(p.ultimoPago) > p.diasCredito; });
  const credPorVencer = proveedores.filter(p => { if (!p.diasCredito||!p.ultimoPago) return false; const r=(p.diasCredito)-diasDesdeP(p.ultimoPago); return r>=0&&r<=7; });
  const saldoTotalProv = proveedores.reduce((s,p)=>s+(p.saldoPendiente||0),0);

  // NUEVO: Alertas de mantenimiento por KM
  const alertasKm = units.filter(u => {
    const kmRestantes = (u.kmUltMant + u.intervaloMant) - u.kmActual;
    return kmRestantes <= 500;
  }).length;

  const alertasKmCriticas = units.filter(u => {
    const kmRestantes = (u.kmUltMant + u.intervaloMant) - u.kmActual;
    return kmRestantes <= 0;
  }).length;

  // ──────────────────────────────────────────────────────────────
  // ESTADÍSTICAS FINANCIERAS (Solo Admin)
  // ──────────────────────────────────────────────────────────────
  
  // Costos operacionales
  const totalC = fuels.reduce((a, f) => a + (Number(f.litros) || 0) * (Number(f.precio) || 0), 0);
  const totalM = maints.reduce((a, m) => a + (Number(m.costoRef) || 0) + (Number(m.costoMO) || 0), 0);
  const totalG = gastos.reduce((a, g) => a + (Number(g.monto) || 0), 0);
  
  // Viajes propios
  const viajesPropios = trips.filter(t => !t.esExterno && t.status === "COMPLETADO");
  const ingresosPropios = viajesPropios.reduce((a, t) => a + (Number(t.costoOfrecido) || 0), 0);
  const gastosPropios = viajesPropios.reduce((a, t) => a + (Number(t.gastosExtras) || 0) + (Number(t.costoEstadias) || 0), 0);
  
  // Depreciación
  const deprecPropios = viajesPropios.length * 7 * (
    units.reduce((a, u) => a + (Number(u.deprecAnual) || 0), 0) / units.length / 365
  );
  
  const costosTotalesPropios = totalC + totalM + totalG + gastosPropios + deprecPropios;
  const utilidadPropios = ingresosPropios - costosTotalesPropios;
  
  // Viajes externos
  const viajesExternos = trips.filter(t => t.esExterno && t.status === "COMPLETADO");
  const ingresosExternos = viajesExternos.reduce((a, t) => a + (Number(t.costoOfrecido) || 0), 0);
  const costosExternos = viajesExternos.reduce((a, t) => a + (Number(t.costoPagar) || 0) + (Number(t.costoEstadias) || 0), 0);
  const utilidadExternos = ingresosExternos - costosExternos;
  
  // Totales consolidados
  const ingresosTotal = ingresosPropios + ingresosExternos;
  const costosTotal = costosTotalesPropios + costosExternos;
  const utilidadTotal = utilidadPropios + utilidadExternos;
  
  const percUtilidad = ingresosTotal > 0 ? ((utilidadTotal / ingresosTotal) * 100).toFixed(1) : 0;
  const percCostos = ingresosTotal > 0 ? ((costosTotal / ingresosTotal) * 100).toFixed(1) : 0;

  // ──────────────────────────────────────────────────────────────
  // ESTADÍSTICAS DE FACTURACIÓN (Solo Admin)
  // ──────────────────────────────────────────────────────────────
  
  const facturasPendientes = facturas.filter(f => f.status === "PENDIENTE");
  const facturasVencidas = facturas.filter(f => f.status === "VENCIDA");
  const facturasPagadas = facturas.filter(f => f.status === "PAGADA");
  
  const facturasVencenProx = facturasPendientes.filter(f => {
    const days = daysUntil(f.fechaVencimiento);
    return days !== null && days >= 0 && days <= 5;
  });

  const totalPendiente = facturasPendientes.reduce((a, f) => a + (Number(f.total) || 0), 0);
  const totalVencido = facturasVencidas.reduce((a, f) => a + (Number(f.total) || 0), 0);
  const totalCobrado = facturasPagadas.reduce((a, f) => a + (Number(f.total) || 0), 0);

  // Días promedio de cobranza (DSO)
  const facturasConPago = facturasPagadas.filter(f => f.fechaPago && f.fechaEmision);
  const diasCobranza = facturasConPago.length > 0
    ? Math.round(facturasConPago.reduce((a, f) => {
        const dias = Math.abs(daysUntil(f.fechaEmision)) - Math.abs(daysUntil(f.fechaPago));
        return a + dias;
      }, 0) / facturasConPago.length)
    : 0;

  // Tasa de cobranza
  const totalFacturado = facturas.reduce((a, f) => a + (Number(f.total) || 0), 0);
  const tasaCobranza = totalFacturado > 0 
    ? ((totalCobrado / totalFacturado) * 100).toFixed(1) 
    : 0;

  // ── KPI DETAIL MODAL ──────────────────────────────────────────
  const [kpi, setKpi] = useState(null); // { id, title, icon, color }

  const KpiModal = ({ id, title, icon, color, onClose }) => {
    const rows = (() => {
      switch (id) {
        case "unidades": return (
          <table>
            <thead><tr><th>No.</th><th>Placas</th><th>Tipo</th><th>Estado</th><th>KM Actual</th><th>Operador</th></tr></thead>
            <tbody>{units.map(u => {
              const drv = drivers.find(d => d.id === u.operador);
              return <tr key={u.id}>
                <td><strong>{u.num}</strong></td>
                <td style={{fontWeight:700,letterSpacing:".05em"}}>{u.placas}</td>
                <td style={{fontSize:11}}>{u.tipo}</td>
                <td>{estadoBdg(u.estado)}</td>
                <td style={{fontSize:12}}>{fmtN(u.kmActual)} km</td>
                <td style={{fontSize:12}}>{drv?.nombre || <span style={{color:"var(--muted)"}}>Sin asignar</span>}</td>
              </tr>;
            })}</tbody>
          </table>
        );
        case "enruta": {
          const enRutaTrips = trips.filter(t => t.status === "EN RUTA");
          return enRutaTrips.length === 0
            ? <div className="empty"><div className="empty-icon">🗺️</div><p>No hay viajes en ruta</p></div>
            : <table>
                <thead><tr><th>Unidad</th><th>Origen</th><th>Destino</th><th>Fecha</th><th>Carga</th><th>Cliente</th></tr></thead>
                <tbody>{enRutaTrips.map(t => {
                  const u = units.find(u => u.id === t.unidadId);
                  return <tr key={t.id}>
                    <td><strong>{u?.num || "EXT"}</strong> <span style={{fontSize:11,color:"var(--muted)"}}>{u?.placas}</span></td>
                    <td style={{fontSize:12}}>{t.origen}</td>
                    <td style={{fontSize:12}}>{t.destino || "—"}</td>
                    <td style={{fontSize:12}}>{t.fecha}</td>
                    <td style={{fontSize:11,color:"var(--muted)"}}>{t.carga || "—"}</td>
                    <td style={{fontSize:12}}>{t.cliente || "—"}</td>
                  </tr>;
                })}</tbody>
              </table>;
        }
        case "mant_pendientes": {
          const mp = maints.filter(m => m.realizado === "NO").sort((a,b) => {
            const p = {ALTA:0,MEDIA:1,BAJA:2};
            return (p[a.prioridad]||1) - (p[b.prioridad]||1);
          });
          return mp.length === 0
            ? <div className="empty"><div className="empty-icon">✅</div><p>Sin mantenimientos pendientes</p></div>
            : <table>
                <thead><tr><th>Unidad</th><th>Tipo</th><th>Descripción</th><th>Prioridad</th><th>F. Programada</th><th>KM</th><th>Costo Est.</th></tr></thead>
                <tbody>{mp.map(m => {
                  const u = units.find(u => u.id === m.unidadId);
                  const ct = (Number(m.costoRef)||0)+(Number(m.costoMO)||0);
                  return <tr key={m.id}>
                    <td><strong>{u?.num||"?"}</strong> <span style={{fontSize:11,color:"var(--muted)"}}>{u?.placas}</span></td>
                    <td><Bdg c="bb" t={m.tipo}/></td>
                    <td style={{fontSize:12,maxWidth:220}}>{m.desc}</td>
                    <td>{prioBdg(m.prioridad)}</td>
                    <td style={{fontSize:12}}>{m.fechaProg||"—"}</td>
                    <td style={{fontSize:12}}>{m.km ? fmtN(m.km)+" km" : "—"}</td>
                    <td style={{color:"var(--orange)",fontWeight:700}}>{ct>0?fmt$(ct):"—"}</td>
                  </tr>;
                })}</tbody>
              </table>;
        }
        case "mant_km": {
          const mkm = units.filter(u => ((u.kmUltMant||0)+(u.intervaloMant||20000)) - (u.kmActual||0) <= 500)
            .sort((a,b) => {
              const ra = ((a.kmUltMant||0)+(a.intervaloMant||20000))-(a.kmActual||0);
              const rb = ((b.kmUltMant||0)+(b.intervaloMant||20000))-(b.kmActual||0);
              return ra - rb;
            });
          return mkm.length === 0
            ? <div className="empty"><div className="empty-icon">✅</div><p>Todas las unidades en orden por kilometraje</p></div>
            : <table>
                <thead><tr><th>Unidad</th><th>Placas</th><th>KM Actual</th><th>Último Mant.</th><th>Próximo Mant.</th><th>KM Restantes</th><th>Estado</th></tr></thead>
                <tbody>{mkm.map(u => {
                  const prox = (u.kmUltMant||0)+(u.intervaloMant||20000);
                  const rest = prox-(u.kmActual||0);
                  const critico = rest <= 0;
                  return <tr key={u.id}>
                    <td><strong>{u.num}</strong></td>
                    <td style={{fontWeight:700}}>{u.placas}</td>
                    <td style={{fontSize:12}}>{fmtN(u.kmActual)} km</td>
                    <td style={{fontSize:12}}>{fmtN(u.kmUltMant)} km</td>
                    <td style={{fontSize:12}}>{fmtN(prox)} km</td>
                    <td style={{fontWeight:700,color:critico?"var(--red)":"var(--yellow)"}}>
                      {critico ? `EXCEDIDO ${fmtN(Math.abs(rest))} km` : `${fmtN(rest)} km`}
                    </td>
                    <td><Bdg c={critico?"br":"by"} t={critico?"URGENTE":"PRÓXIMO"}/></td>
                  </tr>;
                })}</tbody>
              </table>;
        }
        case "docs_vencer": {
          const dv = docs.filter(d => { const dy=daysUntil(d.vence); return dy!==null && dy<=30; })
            .sort((a,b) => (daysUntil(a.vence)||0)-(daysUntil(b.vence)||0));
          return dv.length === 0
            ? <div className="empty"><div className="empty-icon">✅</div><p>Sin documentos próximos a vencer</p></div>
            : <table>
                <thead><tr><th>Documento</th><th>Unidad / Operador</th><th>Número</th><th>Empresa</th><th>Vence</th><th>Días</th></tr></thead>
                <tbody>{dv.map(d => {
                  const dy = daysUntil(d.vence);
                  const isOp = d.entidadTipo === "operador";
                  const u = !isOp && units.find(u => u.id === d.unidadId);
                  const drv = isOp && drivers.find(dr => dr.id === d.operadorId);
                  const clr = dy < 0 ? "var(--red)" : dy <= 7 ? "var(--red)" : dy <= 15 ? "var(--orange)" : "var(--yellow)";
                  return <tr key={d.id}>
                    <td style={{fontWeight:600}}>{d.nombre}</td>
                    <td style={{fontSize:12}}>
                      {isOp
                        ? <span>👤 {drv?.nombre||"—"}</span>
                        : <span>🚛 {u ? `${u.num} ${u.placas}` : "—"}</span>}
                    </td>
                    <td style={{fontSize:11,color:"var(--muted)"}}>{d.numero||"—"}</td>
                    <td style={{fontSize:11,color:"var(--muted)"}}>{d.empresa||"—"}</td>
                    <td style={{fontWeight:700,color:clr}}>{d.vence}</td>
                    <td><Bdg c={dy<0?"br":dy<=7?"br":dy<=15?"bo":"by"} t={dy<0?`Vencido ${Math.abs(dy)}d`:`${dy}d`}/></td>
                  </tr>;
                })}</tbody>
              </table>;
        }
        case "fact_pendientes": {
          const sorted = [...facturasPendientes].sort((a,b)=>(daysUntil(a.fechaVencimiento)||0)-(daysUntil(b.fechaVencimiento)||0));
          return sorted.length === 0
            ? <div className="empty"><div className="empty-icon">✅</div><p>Sin facturas pendientes</p></div>
            : <table>
                <thead><tr><th>Folio</th><th>Cliente</th><th>Emisión</th><th>Vencimiento</th><th>Días</th><th>Total</th><th>Viaje</th></tr></thead>
                <tbody>{sorted.map(f => {
                  const dy = daysUntil(f.fechaVencimiento);
                  const clr = dy===null?"var(--muted)":dy<=0?"var(--red)":dy<=5?"var(--orange)":"var(--yellow)";
                  const viaje = trips.find(t=>t.id===f.viajeId);
                  return <tr key={f.id}>
                    <td style={{fontFamily:"var(--font-hd)",fontWeight:700}}>{f.serie}-{f.numeroFactura}</td>
                    <td><div style={{fontWeight:600,fontSize:12}}>{f.cliente}</div><div style={{fontSize:10,color:"var(--muted)"}}>{f.rfcCliente}</div></td>
                    <td style={{fontSize:12}}>{f.fechaEmision}</td>
                    <td style={{fontWeight:700,color:clr}}>{f.fechaVencimiento}</td>
                    <td><Bdg c={dy<=0?"br":dy<=5?"bo":"by"} t={dy<=0?`Vencida ${Math.abs(dy||0)}d`:`${dy}d restantes`}/></td>
                    <td style={{fontWeight:700,color:"var(--cyan)"}}>{fmt$(f.total)}</td>
                    <td style={{fontSize:11,color:"var(--muted)"}}>{viaje?`${viaje.origen} → ${viaje.destino}`:"—"}</td>
                  </tr>;
                })}</tbody>
              </table>;
        }
        case "fact_vencidas": {
          const sorted = [...facturasVencidas].sort((a,b)=>(daysUntil(b.fechaVencimiento)||0)-(daysUntil(a.fechaVencimiento)||0));
          return sorted.length === 0
            ? <div className="empty"><div className="empty-icon">✅</div><p>Sin facturas vencidas</p></div>
            : <table>
                <thead><tr><th>Folio</th><th>Cliente</th><th>Emisión</th><th>Venció</th><th>Días Vencida</th><th>Total</th></tr></thead>
                <tbody>{sorted.map(f => {
                  const dy = daysUntil(f.fechaVencimiento);
                  return <tr key={f.id}>
                    <td style={{fontFamily:"var(--font-hd)",fontWeight:700}}>{f.serie}-{f.numeroFactura}</td>
                    <td><div style={{fontWeight:600,fontSize:12}}>{f.cliente}</div><div style={{fontSize:10,color:"var(--muted)"}}>{f.rfcCliente}</div></td>
                    <td style={{fontSize:12}}>{f.fechaEmision}</td>
                    <td style={{color:"var(--red)",fontWeight:700}}>{f.fechaVencimiento}</td>
                    <td><Bdg c="br" t={`${Math.abs(dy||0)} días`}/></td>
                    <td style={{fontWeight:700,color:"var(--red)"}}>{fmt$(f.total)}</td>
                  </tr>;
                })}</tbody>
              </table>;
        }
        case "cobrado": {
          const sorted = [...facturasPagadas].sort((a,b)=>b.fechaPago?.localeCompare(a.fechaPago||"")||0);
          return sorted.length === 0
            ? <div className="empty"><div className="empty-icon">💰</div><p>Sin facturas cobradas</p></div>
            : <table>
                <thead><tr><th>Folio</th><th>Cliente</th><th>Emisión</th><th>Cobrada</th><th>Total</th></tr></thead>
                <tbody>{sorted.map(f => <tr key={f.id}>
                  <td style={{fontFamily:"var(--font-hd)",fontWeight:700}}>{f.serie}-{f.numeroFactura}</td>
                  <td><div style={{fontWeight:600,fontSize:12}}>{f.cliente}</div></td>
                  <td style={{fontSize:12}}>{f.fechaEmision}</td>
                  <td style={{color:"var(--green)",fontWeight:700}}>{f.fechaPago||"—"}</td>
                  <td style={{fontWeight:700,color:"var(--green)"}}>{fmt$(f.total)}</td>
                </tr>)}</tbody>
              </table>;
        }
        default: return null;
      }
    })();

    return (
      <div className="modal-ov" onClick={onClose}>
        <div className="modal wide" style={{maxWidth:900}} onClick={e=>e.stopPropagation()}>
          <div className="mhdr" style={{borderBottom:`3px solid ${color}`}}>
            <h3 style={{color}}>{icon} {title}</h3>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
          <div className="mbody" style={{padding:"16px 20px",overflowX:"auto"}}>
            {rows}
          </div>
        </div>
      </div>
    );
  };

  // Clickable stat wrapper
  const ClickStat = ({ kpiId, color, icon, val, lbl, sub, lock }) => (
    <div
      className="stat"
      style={{"--c":color, cursor:"pointer", transition:"transform .1s, box-shadow .1s"}}
      onClick={() => setKpi({id:kpiId, title:lbl.replace("🔒","").trim(), icon, color})}
      title="Clic para ver detalle"
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.25)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}
    >
      <div className="stat-icon">{icon}</div>
      <div className={`stat-val${typeof val==="string"&&val.length>5?" sm":""}`}>{val}</div>
      <div className="stat-lbl">{lbl}{lock&&<span className="lock-icon">🔒</span>}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      <div style={{fontSize:9,color:"rgba(255,255,255,.5)",marginTop:4,letterSpacing:".05em"}}>▼ VER DETALLE</div>
    </div>
  );

  return (
    <div>
      {kpi && <KpiModal {...kpi} onClose={()=>setKpi(null)} />}

      {/* KPIs PRINCIPALES */}
      <div className="stats">
        <ClickStat kpiId="unidades" color="var(--cyan)" icon="🚛" val={units.length} lbl="Unidades Totales" sub={`${activas} activas · ${enTaller} en taller`} />
        <ClickStat kpiId="enruta" color="var(--green)" icon="🗺️" val={enRuta} lbl="En Ruta Ahora" sub={`${viajesPropios.length+viajesExternos.length} completados`} />
        <ClickStat kpiId="mant_pendientes" color={alta>0?"var(--red)":"var(--orange)"} icon="🔧" val={maints.filter(m=>m.realizado==="NO").length} lbl="Mant. Pendientes" sub={`${alta} alta prioridad`} />
        <ClickStat kpiId="mant_km" color={alertasKmCriticas>0?"var(--red)":"var(--yellow)"} icon={alertasKmCriticas>0?"🚨":"⚠️"} val={alertasKm} lbl="Mant. por KM" sub={alertasKmCriticas>0?`${alertasKmCriticas} críticas`:"≤500 km restantes"} />
        <ClickStat kpiId="docs_vencer" color={docAlert>0?"var(--yellow)":"var(--green)"} icon="📄" val={docAlert} lbl="Docs por Vencer" sub="próximos 30 días" />
        <ClickStat kpiId="operadores" color="var(--cyan)" icon="👨‍✈️" val={operadoresActivos} lbl="Operadores Activos" sub={`${operadoresEnRuta} en ruta ahora`} />
        {isAdmin && saldoTotalProv > 0 && (
          <ClickStat kpiId="prov_credito" color={credVencidos.length>0?"var(--red)":credPorVencer.length>0?"var(--orange)":"var(--yellow)"} icon="💳" val={credVencidos.length+credPorVencer.length} lbl="Pagos Proveedores" sub={`Saldo: ${fmt$(saldoTotalProv)}`} lock />
        )}

        {isAdmin && (
          <>
            <ClickStat kpiId="fact_pendientes" color="var(--yellow)" icon="🧾" val={facturasPendientes.length} lbl="Facturas Pendientes" sub={fmt$(totalPendiente)} lock />
            <ClickStat kpiId="fact_vencidas" color="var(--red)" icon="⏰" val={facturasVencidas.length} lbl="Facturas Vencidas" sub={fmt$(totalVencido)} lock />
            <ClickStat kpiId="cobrado" color="var(--green)" icon="💰" val={fmt$(totalCobrado)} lbl="Cobrado" sub={`${facturasPagadas.length} facturas`} lock />
            <ClickStat kpiId="dso" color="var(--cyan)" icon="💳" val={diasCobranza} lbl="Días Prom. Cobranza" sub="DSO" lock />
            <ClickStat kpiId="tasa" color="var(--purple)" icon="📈" val={`${tasaCobranza}%`} lbl="Tasa de Cobranza" sub="últimos pagos" lock />
          </>
        )}
      </div>

      {/* CONSOLIDADO FINANCIERO - Solo Admin */}
      {isAdmin && (
        <div className="card">
          <div className="card-hdr">
            <h3>💰 Consolidado Financiero — Utilidades vs Costos</h3>
          </div>
          <div style={{ padding: "20px 24px" }}>
            
            {/* Indicadores circulares de porcentaje */}
            <div className="percentage-card">
              <div 
                className="perc-circle" 
                style={{ 
                  background: `conic-gradient(var(--green) 0% ${percUtilidad}%, var(--bg3) ${percUtilidad}% 100%)`, 
                  border: "4px solid var(--green)" 
                }}
              >
                {percUtilidad}%
              </div>
              <div className="perc-info">
                <div className="perc-lbl">Margen de Utilidad</div>
                <div className="perc-val" style={{ color: "var(--green)" }}>
                  {fmt$(utilidadTotal)}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                  De {fmt$(ingresosTotal)} en ingresos totales
                </div>
              </div>
            </div>

            <div className="percentage-card">
              <div 
                className="perc-circle" 
                style={{ 
                  background: `conic-gradient(var(--red) 0% ${percCostos}%, var(--bg3) ${percCostos}% 100%)`, 
                  border: "4px solid var(--red)" 
                }}
              >
                {percCostos}%
              </div>
              <div className="perc-info">
                <div className="perc-lbl">Porcentaje de Costos</div>
                <div className="perc-val" style={{ color: "var(--red)" }}>
                  {fmt$(costosTotal)}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                  Gastos totales de operación
                </div>
              </div>
            </div>

            {/* Desglose por tipo de operación */}
            <div className="sec-lbl">Desglose por Tipo de Operación</div>
            
            <div className="profit-card">
              <div className="profit-row">
                <span className="profit-lbl">🚛 Ingresos Unidades Propias</span>
                <span className="profit-val" style={{ color: "var(--green)" }}>
                  {fmt$(ingresosPropios)}
                </span>
              </div>
              <div className="profit-row">
                <span className="profit-lbl">📉 Costos Unidades Propias</span>
                <span className="profit-val" style={{ color: "var(--red)" }}>
                  -{fmt$(costosTotalesPropios)}
                </span>
              </div>
              <div className="profit-row">
                <span className="profit-lbl">💰 Utilidad Unidades Propias</span>
                <span className="profit-val" style={{ 
                  color: utilidadPropios >= 0 ? "var(--green)" : "var(--red)" 
                }}>
                  {fmt$(utilidadPropios)}
                </span>
              </div>
            </div>

            <div className="profit-card">
              <div className="profit-row">
                <span className="profit-lbl">🚚 Ingresos Logística Externa</span>
                <span className="profit-val" style={{ color: "var(--green)" }}>
                  {fmt$(ingresosExternos)}
                </span>
              </div>
              <div className="profit-row">
                <span className="profit-lbl">📉 Costos Logística Externa</span>
                <span className="profit-val" style={{ color: "var(--red)" }}>
                  -{fmt$(costosExternos)}
                </span>
              </div>
              <div className="profit-row">
                <span className="profit-lbl">💰 Utilidad Logística Externa</span>
                <span className="profit-val" style={{ 
                  color: utilidadExternos >= 0 ? "var(--green)" : "var(--red)" 
                }}>
                  {fmt$(utilidadExternos)}
                </span>
              </div>
            </div>

            {/* Totales consolidados */}
            <div className="profit-card">
              <div className="profit-row">
                <span className="profit-lbl">💵 INGRESOS TOTALES</span>
                <span className="profit-val" style={{ color: "var(--green)" }}>
                  {fmt$(ingresosTotal)}
                </span>
              </div>
              <div className="profit-row">
                <span className="profit-lbl">📉 COSTOS TOTALES</span>
                <span className="profit-val" style={{ color: "var(--red)" }}>
                  -{fmt$(costosTotal)}
                </span>
              </div>
              <div className="profit-row">
                <span className="profit-lbl">💰 UTILIDAD NETA TOTAL</span>
                <span className="profit-val" style={{ 
                  color: utilidadTotal >= 0 ? "var(--green)" : "var(--red)" 
                }}>
                  {fmt$(utilidadTotal)}
                </span>
              </div>
            </div>

            {/* Desglose detallado de costos */}
            <div className="sec-lbl">Desglose de Costos</div>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: 12 
            }}>
              <div style={{ 
                padding: "12px 16px", 
                background: "var(--bg2)", 
                borderRadius: 8,
                border: "1px solid var(--border)" 
              }}>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  Combustible
                </div>
                <div style={{ 
                  fontFamily: "var(--font-hd)", 
                  fontSize: 18, 
                  fontWeight: 700,
                  color: "var(--cyan)" 
                }}>
                  {fmt$(totalC)}
                </div>
              </div>

              <div style={{ 
                padding: "12px 16px", 
                background: "var(--bg2)", 
                borderRadius: 8,
                border: "1px solid var(--border)" 
              }}>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  Mantenimiento
                </div>
                <div style={{ 
                  fontFamily: "var(--font-hd)", 
                  fontSize: 18, 
                  fontWeight: 700,
                  color: "var(--orange)" 
                }}>
                  {fmt$(totalM)}
                </div>
              </div>

              <div style={{ 
                padding: "12px 16px", 
                background: "var(--bg2)", 
                borderRadius: 8,
                border: "1px solid var(--border)" 
              }}>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  Gastos Generales
                </div>
                <div style={{ 
                  fontFamily: "var(--font-hd)", 
                  fontSize: 18, 
                  fontWeight: 700,
                  color: "var(--purple)" 
                }}>
                  {fmt$(totalG)}
                </div>
              </div>

              <div style={{ 
                padding: "12px 16px", 
                background: "var(--bg2)", 
                borderRadius: 8,
                border: "1px solid var(--border)" 
              }}>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  Depreciación
                </div>
                <div style={{ 
                  fontFamily: "var(--font-hd)", 
                  fontSize: 18, 
                  fontWeight: 700,
                  color: "var(--yellow)" 
                }}>
                  {fmt$(deprecPropios)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alertas de mantenimiento por KM */}
      {alertasKm > 0 && (
        <div className="card">
          <div className="card-hdr">
            <h3>🔧 Alertas de Mantenimiento por Kilometraje</h3>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {units.filter(u => {
              const kmRestantes = (u.kmUltMant + u.intervaloMant) - u.kmActual;
              return kmRestantes <= 500;
            }).map(u => {
              const kmRestantes = (u.kmUltMant + u.intervaloMant) - u.kmActual;
              const esCritico = kmRestantes <= 0;
              
              return (
                <div 
                  key={u.id} 
                  className={`km-alert ${esCritico ? "critical" : ""}`}
                  style={{ marginBottom: 10 }}
                >
                  <span style={{ fontSize: 24 }}>
                    {esCritico ? "🚨" : "⚠️"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      Unidad {u.num} — {u.placas}
                    </div>
                    <div style={{ fontSize: 11 }}>
                      {esCritico 
                        ? `¡URGENTE! Excedido por ${fmtN(Math.abs(kmRestantes))} km` 
                        : `Faltan ${fmtN(kmRestantes)} km para mantenimiento`}
                    </div>
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>
                      Último mant: {fmtN(u.kmUltMant)} km • 
                      Actual: {fmtN(u.kmActual)} km • 
                      Próximo: {fmtN(u.kmUltMant + u.intervaloMant)} km
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas de facturas (Solo Admin) */}
      {isAdmin && (facturasVencidas.length > 0 || facturasVencenProx.length > 0) && (
        <div className="card">
          <div className="card-hdr">
            <h3>🧾 Alertas de Facturación</h3>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {facturasVencidas.length > 0 && (
              <div className="ab ab-r">
                <span style={{ fontSize: 20 }}>🚨</span>
                <div>
                  <strong>{facturasVencidas.length} facturas vencidas</strong>
                  <div style={{ marginTop: 4 }}>
                    Total: {fmt$(totalVencido)} — Requiere atención urgente
                  </div>
                </div>
              </div>
            )}

            {facturasVencenProx.length > 0 && (
              <div className="ab ab-y">
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <strong>{facturasVencenProx.length} facturas por vencer</strong>
                  <div style={{ marginTop: 4 }}>
                    Vencen en los próximos 5 días — Enviar recordatorios
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function UnitsPage({ units, drivers, docs, maints, fuels, trips, onAdd, onEdit, onDelete, onChangeDriver, isAdmin, branding = {} }) {
  const [q, setQ] = useState(""); const [ef, setEf] = useState("TODOS");
  const fil = units.filter(u => { const d = drivers.find(d => d.id === u.operador); return (u.num + u.placas + u.eco + (d?.nombre || "")).toLowerCase().includes(q.toLowerCase()) && (ef === "TODOS" || u.estado === ef) });
  return (
    <div className="card">
      <div className="card-hdr"><h3>🚛 Unidades ({units.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{ color: "var(--muted)" }}>🔍</span><input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className="btn btn-cyan" onClick={onAdd}>+ Nueva</button>
        </div>
      </div>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>ESTADO:</span>
        <div className="ftabs">{["TODOS", ...ESTADOS].map(e => <button key={e} className={`ftab${ef === e ? " on" : ""}`} onClick={() => setEf(e)}>{e}</button>)}</div>
      </div>
      <div className="card-body">
        {fil.length === 0 ? <div className="empty"><div className="empty-icon">🚛</div><p>Sin resultados</p></div> :
          <table>
            <thead><tr><th>Foto</th><th>No.</th><th>Eco</th><th>Operador</th><th>Placas</th><th>Tipo/Marca</th><th>Estado</th><th>KM</th><th>Rend. Esp.</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(u => {
              const drv = drivers.find(d => d.id === u.operador);
              const kd = (Number(u.kmActual) || 0) - (Number(u.kmUltMant) || 0);
              const pct = Math.min((kd / 20000) * 100, 100);
              return (
                <tr key={u.id}>
                  <td style={{ width: 50 }}>{u.foto ? <img src={u.foto} style={{ width: 46, height: 38, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} alt="" /> : <div style={{ width: 46, height: 38, background: "var(--bg3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚛</div>}</td>
                  <td><strong>{u.num}</strong></td>
                  <td><Bdg c="bb" t={u.eco || "—"} /></td>
                  <td style={{ fontSize: 12 }}>{drv?.nombre || <span style={{ color: "var(--muted)" }}>Sin asignar</span>}</td>
                  <td style={{ fontWeight: 700, letterSpacing: ".05em", fontFamily: "var(--font-hd)", fontSize: 14 }}>{u.placas}</td>
                  <td style={{ fontSize: 11 }}><div>{u.tipo}</div><div style={{ color: "var(--muted)" }}>{u.marca} {u.modelo} {u.anio}</div></td>
                  <td>{estadoBdg(u.estado)}</td>
                  <td><div style={{ fontSize: 11 }}>{fmtN(u.kmActual)} km</div><div className="km-meter"><div className="km-fill" style={{ width: pct + "%", background: pct > 80 ? "var(--orange)" : "var(--cyan)" }} /></div></td>
                  <td><Bdg c="bp" t={`${u.rendEsperado || 0} km/L`} /></td>
                  <td><div className="acts">
                    <button className="btn btn-purple btn-xs" onClick={() => onChangeDriver(u)} title="Cambiar operador">🔄</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => printUnitSheet({ unit: u, driver: drv, docs, maints, fuels, trips, showFinancial: isAdmin, companyLogo: branding.logo, companyName: branding.nombre })} title="Imprimir ficha">🖨️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onEdit(u)}>✏️</button>
                    <button className="btn btn-red btn-sm" onClick={() => onDelete(u.id)}>🗑</button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>}
      </div>
    </div>
  );
}

function DriversPage({ drivers, units, trips, onAdd, onEdit, onDelete, onHojaViaje, onNomina, branding = {} }) {
  const [q, setQ] = useState("");
  const fil = drivers.filter(d => (d.nombre + d.licencia).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="card">
      <div className="card-hdr"><h3>👨‍✈️ Conductores ({drivers.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{ color: "var(--muted)" }}>🔍</span><input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className="btn btn-cyan" onClick={onAdd}>+ Nuevo</button>
        </div>
      </div>
      <div className="card-body">
        {fil.length === 0 ? <div className="empty"><div className="empty-icon">👨‍✈️</div><p>Sin conductores</p></div> :
          <table>
            <thead><tr><th>Foto</th><th>Nombre</th><th>Licencia</th><th>Vence</th><th>Unidad</th><th>Tel</th><th>Sueldo Base</th><th>% Viaje</th><th>Status</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(d => {
              const unit = units.find(u => u.operador === d.id);
              const dy = daysUntil(d.licVence);
              return (
                <tr key={d.id}>
                  <td>{d.foto ? <img src={d.foto} style={{ width: 38, height: 38, objectFit: "cover", borderRadius: "50%", border: "2px solid var(--border)" }} alt="" /> : <div style={{ width: 38, height: 38, background: "var(--bg3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>}</td>
                  <td style={{ fontWeight: 600 }}>{d.nombre}</td>
                  <td style={{ fontSize: 11 }}>{d.licencia || "—"} <Bdg c="bb" t={`Tipo ${d.licTipo}`} /></td>
                  <td><span style={{ color: dy === null ? "var(--muted)" : dy < 0 ? "var(--red)" : dy <= 30 ? "var(--yellow)" : "var(--green)", fontSize: 12, fontWeight: 600 }}>{d.licVence || "—"}</span></td>
                  <td>{unit ? <Bdg c="bb" t={`${unit.num} ${unit.placas}`} /> : <span style={{ color: "var(--muted)", fontSize: 11 }}>Sin unidad</span>}</td>
                  <td style={{ fontSize: 12 }}>{d.tel || "—"}</td>
                  <td style={{ fontWeight: 600, color: "var(--cyan)" }}>{d.sueldoBase ? fmt$(d.sueldoBase) : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                  <td><Bdg c="bp" t={`${d.porcentajeViaje || 0}%`} /></td>
                  <td><Bdg c={d.status === "ACTIVO" ? "bg" : "bm"} t={d.status} /></td>
                  <td><div className="acts">
                    <button className="btn btn-ghost btn-xs" onClick={() => printDriverSheet({ driver: d, unit, companyLogo: branding.logo, companyName: branding.nombre })} title="Imprimir hoja">🖨️</button>
                    <button className="btn btn-green btn-xs" onClick={() => onNomina(d)} title="Nómina">💵</button>
                    <button className="btn btn-purple btn-xs" onClick={() => onHojaViaje(d)} title="Hoja de Viaje">📋</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onEdit(d)}>✏️</button>
                    <button className="btn btn-red btn-sm" onClick={() => onDelete(d.id)}>🗑</button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>}
      </div>
    </div>
  );
}

function printAndDownloadDoc(doc, unit, driver) {
  const entidadNombre = doc.entidadTipo === "operador" ? (driver?.nombre || "Operador") : (unit ? `${unit.num} — ${unit.placas}` : "—");
  const dy = daysUntil(doc.vence);
  const statusColor = dy === null ? "#999" : dy < 0 ? "#C41E3A" : dy <= 30 ? "#997404" : "#00864E";
  const statusTxt = dy === null ? "Sin fecha" : dy < 0 ? `VENCIDO (${Math.abs(dy)}d)` : dy <= 30 ? `Por vencer (${dy}d)` : `Vigente (${dy}d)`;
  const html = `<!DOCTYPE html><html><head><title>${doc.nombre} — ${entidadNombre}</title><style>
  body{font-family:Arial,sans-serif;font-size:13px;color:#000;padding:24px;max-width:680px;margin:0 auto}
  h1{font-size:20px;border-bottom:3px solid #0099CC;padding-bottom:8px;color:#0099CC;margin-bottom:16px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
  .field{border:1px solid #ddd;padding:8px 12px;border-radius:6px;background:#FAFBFC}
  .field label{font-size:9px;font-weight:700;display:block;color:#666;text-transform:uppercase}
  .status{display:inline-block;padding:6px 18px;border-radius:20px;font-weight:700;font-size:14px;color:#fff;background:${statusColor};margin-bottom:16px}
  .photo{max-width:100%;max-height:200px;border-radius:8px;border:2px solid #0099CC;margin-top:10px;display:block}
  .btn-row{display:flex;gap:12px;margin-top:20px}
  button{padding:8px 20px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:700}
  .print-btn{background:#0099CC;color:#fff}
  .close-btn{background:#eee;color:#333}
  @media print{.btn-row{display:none}@page{size:A4;margin:12mm}}
  </style></head><body>
  <h1>📄 ${doc.nombre}</h1>
  <div class="status">${statusTxt}</div>
  <div class="grid">
    <div class="field"><label>${doc.entidadTipo === "operador" ? "Operador" : "Unidad"}</label>${entidadNombre}</div>
    <div class="field"><label>Tipo</label>${doc.nombre}</div>
    <div class="field"><label>Número / Folio</label>${doc.numero || "—"}</div>
    <div class="field"><label>Empresa / Emisor</label>${doc.empresa || "—"}</div>
    <div class="field"><label>Fecha Vencimiento</label><span style="color:${statusColor};font-weight:700">${doc.vence || "Sin fecha"}</span></div>
  </div>
  ${doc.notas ? `<div class="field" style="margin-bottom:12px"><label>Notas</label>${doc.notas}</div>` : ""}
  ${doc.foto ? `<img src="${doc.foto}" class="photo" alt="Documento"/>` : ""}
  <div class="btn-row"><button class="print-btn" onclick="window.print()">🖨️ Imprimir</button><button class="close-btn" onclick="window.close()">✕ Cerrar</button></div>
  <p style="margin-top:16px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
  </body></html>`;
  return html;
}

function downloadDocAsHtml(doc, unit, driver) {
  const html = printAndDownloadDoc(doc, unit, driver);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.nombre}_${unit ? unit.num : (driver?.nombre || "doc")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function openDocPrint(doc, unit, driver) {
  const html = printAndDownloadDoc(doc, unit, driver);
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}

function DocsPage({ units, drivers, docs, onAdd, onEdit, onDelete }) {
  const [viewMode, setViewMode] = useState("unidad"); // "unidad" | "operador"
  const [uf, setUf] = useState("TODOS");

  const docsUnidad = docs.filter(d => !d.entidadTipo || d.entidadTipo === "unidad");
  const docsOperador = docs.filter(d => d.entidadTipo === "operador");

  const fdUnidad = docsUnidad.filter(d => uf === "TODOS" || d.unidadId === uf);
  const fdOperador = docsOperador.filter(d => uf === "TODOS" || d.operadorId === uf);

  return (
    <div className="card">
      <div className="card-hdr"><h3>📄 Documentos y Vencimientos ({docs.length})</h3>
        <div className="row-gap">
          <div style={{ display: "flex", gap: 6 }}>
            <button className={`btn btn-sm ${viewMode === "unidad" ? "btn-cyan" : "btn-ghost"}`} onClick={() => { setViewMode("unidad"); setUf("TODOS") }}>🚛 Unidades</button>
            <button className={`btn btn-sm ${viewMode === "operador" ? "btn-cyan" : "btn-ghost"}`} onClick={() => { setViewMode("operador"); setUf("TODOS") }}>👤 Operadores</button>
          </div>
          <button className="btn btn-cyan btn-sm" onClick={onAdd}>+ Agregar</button>
        </div>
      </div>

      {viewMode === "unidad" && (
        <>
          <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="ftabs">
              <button className={`ftab${uf === "TODOS" ? " on" : ""}`} onClick={() => setUf("TODOS")}>Todas</button>
              {units.map(u => <button key={u.id} className={`ftab${uf === u.id ? " on" : ""}`} onClick={() => setUf(u.id)}>{u.num} {u.placas}</button>)}
            </div>
          </div>
          {units.filter(u => uf === "TODOS" || u.id === uf).map(u => {
            const ud = fdUnidad.filter(d => d.unidadId === u.id);
            return (
              <div key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <div style={{ padding: "10px 16px 4px", fontSize: 13, fontWeight: 700, color: "var(--cyan)" }}>🚛 {u.num} — {u.placas}</div>
                <div className="doc-grid">
                  {ud.map(d => {
                    const dy = daysUntil(d.vence);
                    const dc = dy === null ? "var(--muted)" : dy < 0 ? "var(--red)" : dy <= 30 ? "var(--yellow)" : "var(--green)";
                    return (
                      <div key={d.id} className="doc-card" style={{ "--dc": dc }}>
                        <div className="doc-name">{d.nombre}</div>
                        <div className="doc-date">{d.vence || "Sin fecha"}</div>
                        <div style={{ marginTop: 5 }}>{docBdg(dy)}</div>
                        {d.numero && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{d.numero}</div>}
                        {d.empresa && <div style={{ fontSize: 10, color: "var(--muted)" }}>{d.empresa}</div>}
                        {d.foto && <div style={{ marginTop: 8 }}><img src={d.foto} style={{ width: "100%", height: 65, objectFit: "cover", borderRadius: 5, border: "1px solid var(--border)" }} alt="doc" /></div>}
                        <div className="acts" style={{ marginTop: 8 }}>
                          <button className="btn btn-ghost btn-xs" title="Imprimir" onClick={() => openDocPrint(d, u, null)}>🖨️</button>
                          <button className="btn btn-ghost btn-xs" title="Descargar" onClick={() => downloadDocAsHtml(d, u, null)}>⬇️</button>
                          <button className="btn btn-ghost btn-xs" onClick={() => onEdit(d)}>✏️</button>
                          <button className="btn btn-red btn-xs" onClick={() => onDelete(d.id)}>🗑</button>
                        </div>
                      </div>
                    );
                  })}
                  {ud.length === 0 && <div style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>Sin documentos registrados</div>}
                </div>
              </div>
            );
          })}
        </>
      )}

      {viewMode === "operador" && (
        <>
          <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="ftabs">
              <button className={`ftab${uf === "TODOS" ? " on" : ""}`} onClick={() => setUf("TODOS")}>Todos</button>
              {(drivers||[]).map(d => <button key={d.id} className={`ftab${uf === d.id ? " on" : ""}`} onClick={() => setUf(d.id)}>{d.nombre.split(" ")[0]}</button>)}
            </div>
          </div>
          {(drivers||[]).filter(d => uf === "TODOS" || d.id === uf).map(driver => {
            const dd = fdOperador.filter(d => d.operadorId === driver.id);
            return (
              <div key={driver.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <div style={{ padding: "10px 16px 4px", fontSize: 13, fontWeight: 700, color: "var(--purple)" }}>👤 {driver.nombre}</div>
                <div className="doc-grid">
                  {dd.map(d => {
                    const dy = daysUntil(d.vence);
                    const dc = dy === null ? "var(--muted)" : dy < 0 ? "var(--red)" : dy <= 30 ? "var(--yellow)" : "var(--green)";
                    return (
                      <div key={d.id} className="doc-card" style={{ "--dc": dc }}>
                        <div className="doc-name">{d.nombre}</div>
                        <div className="doc-date">{d.vence || "Sin fecha"}</div>
                        <div style={{ marginTop: 5 }}>{docBdg(dy)}</div>
                        {d.numero && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{d.numero}</div>}
                        {d.empresa && <div style={{ fontSize: 10, color: "var(--muted)" }}>{d.empresa}</div>}
                        {d.foto && <div style={{ marginTop: 8 }}><img src={d.foto} style={{ width: "100%", height: 65, objectFit: "cover", borderRadius: 5, border: "1px solid var(--border)" }} alt="doc" /></div>}
                        <div className="acts" style={{ marginTop: 8 }}>
                          <button className="btn btn-ghost btn-xs" title="Imprimir" onClick={() => openDocPrint(d, null, driver)}>🖨️</button>
                          <button className="btn btn-ghost btn-xs" title="Descargar" onClick={() => downloadDocAsHtml(d, null, driver)}>⬇️</button>
                          <button className="btn btn-ghost btn-xs" onClick={() => onEdit(d)}>✏️</button>
                          <button className="btn btn-red btn-xs" onClick={() => onDelete(d.id)}>🗑</button>
                        </div>
                      </div>
                    );
                  })}
                  {dd.length === 0 && <div style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>Sin documentos registrados</div>}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function TripsPage({ trips, units, externos, maints, fuels, onAdd, onEdit, onDelete, onAddExt, onEditExt, onDeleteExt, isAdmin, branding = {} }) {
  const [q, setQ] = useState(""); const [sf, setSf] = useState("TODOS"); const [tf, setTf] = useState("TODOS");
  const allTrips = [...trips.filter(t => !t.esExterno).map(t => ({ ...t, tipo: "PROPIO" })), ...trips.filter(t => t.esExterno).map(t => ({ ...t, tipo: "EXTERNO" }))];
  const fil = allTrips.filter(t => {
    const u = t.tipo === "PROPIO" ? units.find(u => u.id === t.unidadId) : null;
    const ext = t.tipo === "EXTERNO" ? externos.find(e => e.id === t.unidadId) : null;
    return (t.origen + t.destino + t.carga + t.cliente + (u?.placas || "") + (ext?.empresa || "")).toLowerCase().includes(q.toLowerCase()) && (sf === "TODOS" || t.status === sf) && (tf === "TODOS" || t.tipo === tf)
  });
  const totKm = fil.reduce((a, t) => a + ((Number(t.kmLlegada) || 0) - (Number(t.kmSalida) || 0)), 0);
  const totIng = fil.filter(t => t.status === "COMPLETADO").reduce((a, t) => a + (Number(t.costoOfrecido) || 0), 0);
  
  return (
    <div className="card">
      <div className="card-hdr"><h3>🗺️ Viajes ({allTrips.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{ color: "var(--muted)" }}>🔍</span><input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className="btn btn-ghost btn-sm" onClick={() => printTripsReport({ trips: fil, units, externos, companyLogo: branding.logo, companyName: branding.nombre })}>📊 Imprimir Reporte</button>
          <button className="btn btn-purple" onClick={onAddExt}>+ Viaje Externo</button>
          <button className="btn btn-cyan" onClick={onAdd}>+ Viaje Propio</button>
        </div>
      </div>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div className="ftabs"><span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>TIPO:</span>{["TODOS", "PROPIO", "EXTERNO"].map(s => <button key={s} className={`ftab${tf === s ? " on" : ""}`} onClick={() => setTf(s)}>{s}</button>)}</div>
        <div className="ftabs"><span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>STATUS:</span>{["TODOS", "EN RUTA", "COMPLETADO", "CANCELADO"].map(s => <button key={s} className={`ftab${sf === s ? " on" : ""}`} onClick={() => setSf(s)}>{s}</button>)}</div>
      </div>
      <div className="sbar">
        <span>Registros: <strong>{fil.length}</strong></span>
        <span>En Ruta: <strong style={{ color: "var(--cyan)" }}>{fil.filter(t => t.status === "EN RUTA").length}</strong></span>
        <span>KM totales: <strong style={{ color: "var(--green)" }}>{fmtN(totKm)} km</strong></span>
        {isAdmin && <span>Ingresos: <strong style={{ color: "var(--green)" }}>{fmt$(totIng)}</strong> 🔒</span>}
      </div>
      <div className="card-body">
        {fil.length === 0 ? <div className="empty"><div className="empty-icon">🗺️</div><p>Sin viajes</p></div> :
          <table>
            <thead><tr><th>Tipo</th><th>Unidad/Empresa</th><th>Origen → Destino</th><th>Salida</th><th>Regreso</th><th>KM</th><th>Cliente</th><th>Status</th><th>Evid.</th>{isAdmin && <th>💰</th>}<th>Acciones</th></tr></thead>
            <tbody>{fil.map(t => {
              const u = t.tipo === "PROPIO" ? units.find(u => u.id === t.unidadId) : null;
              const ext = t.tipo === "EXTERNO" ? externos.find(e => e.id === t.unidadId) : null;
              const dist = t.kmLlegada && t.kmSalida ? Number(t.kmLlegada) - Number(t.kmSalida) : null;
              const hasEvid = (t.evidencias || []).length > 0;
              return (
                <tr key={t.id}>
                  <td><Bdg c={t.tipo === "PROPIO" ? "bb" : "bp"} t={t.tipo === "PROPIO" ? "INT" : "EXT"} /></td>
                  <td style={{ fontSize: 12 }}><strong>{t.tipo === "PROPIO" ? u?.num : ext?.empresa}</strong> <span style={{ color: "var(--muted)", fontSize: 11 }}>{t.tipo === "PROPIO" ? u?.placas : ext?.contacto}</span></td>
                  <td style={{ fontSize: 12 }}><span style={{ color: "var(--cyan)" }}>📍{t.origen}</span><span style={{ color: "var(--muted)", margin: "0 5px" }}>→</span><span>{t.destino || "—"}</span></td>
                  <td style={{ fontSize: 12 }}>{t.fecha || "—"}</td>
                  <td style={{ fontSize: 12, color: t.fechaReg ? "var(--text)" : "var(--muted)" }}>{t.fechaReg || "Pendiente"}</td>
                  <td style={{ color: "var(--cyan)", fontFamily: "var(--font-hd)", fontWeight: 700 }}>{dist ? `${fmtN(dist)} km` : "—"}</td>
                  <td style={{ fontSize: 12 }}>{t.cliente || "—"}</td>
                  <td><Bdg c={t.status === "COMPLETADO" ? "bg" : t.status === "EN RUTA" ? "bb" : "bm"} t={t.status} /></td>
                  <td>{hasEvid ? <button className="btn btn-ghost btn-xs" onClick={() => printEvidencias({ trip: t, unit: u, externos })} title="Ver evidencias">📸 {t.evidencias.length}</button> : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                  {isAdmin && <td>{t.status === "COMPLETADO" ? <button className="btn btn-purple btn-xs" onClick={() => printTripProfit({ trip: t, unit: u, fuels, maints, externos })} title="Ver utilidad">💰</button> : <span style={{ color: "var(--muted)" }}>—</span>}</td>}
                  <td><div className="acts">
                    <button className="btn btn-ghost btn-sm" onClick={() => t.tipo === "PROPIO" ? onEdit(t) : onEditExt(t)}>✏️</button>
                    <button className="btn btn-red btn-sm" onClick={() => t.tipo === "PROPIO" ? onDelete(t.id) : onDeleteExt(t.id)}>🗑</button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>}
      </div>
    </div>
  );
}


// ──────────────────────────────────────────────────────────────────────────────
// NÓMINA ADMINISTRATIVA — personal de oficina
// ──────────────────────────────────────────────────────────────────────────────
function NominaAdminModal({ persona, onSave, onClose, companyLogo, companyName }) {
  const [f, setF] = useState({ ...persona });
  const [periodo, setPeriodo] = useState({ inicio: "", fin: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const totalPercepciones = (Number(f.sueldoBase)||0) + (Number(f.bonos)||0) + (Number(f.otrasPercepciones)||0);
  const totalDeducciones  = Number(f.deducciones)||0;
  const neto = totalPercepciones - totalDeducciones;

  const doPrint = () => {
    const logoHtml = companyLogo
      ? `<img src="${companyLogo}" style="height:50px;object-fit:contain" alt="Logo"/>`
      : `<div style="font-size:18px;font-weight:700;color:#0099CC">${companyName||"FLEET PRO"}</div>`;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Nómina ${f.nombre}</title><meta charset="utf-8"/><style>
    body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px;max-width:700px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
    h1{font-size:16px;border-bottom:2px solid #0099CC;padding-bottom:6px;color:#0099CC}
    table{width:100%;border-collapse:collapse;margin:10px 0}
    th{background:#0099CC;color:#fff;padding:7px 12px;text-align:left;font-size:10px}
    td{padding:7px 12px;border-bottom:1px solid #eee;font-size:11px}
    .total-row td{font-weight:700;background:#E8F5FA}
    .neto-row td{font-weight:700;background:#0099CC;color:#fff;font-size:16px}
    .firma-row{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:28px}
    .firma{border-top:2px solid #000;padding-top:8px;text-align:center;font-size:11px;color:#666}
    @media print{@page{size:A4;margin:12mm}}
    </style></head><body>
    <div class="header">${logoHtml}<div style="text-align:right"><strong>RECIBO DE NÓMINA ADMINISTRATIVA</strong><br/>${periodo.inicio?`Período: ${periodo.inicio} al ${periodo.fin}`:""}</div></div>
    <h1>👤 ${f.nombre}</h1>
    <p><strong>Puesto:</strong> ${f.puesto||"—"} ${f.notas?`<br/><em>${f.notas}</em>`:""}</p>
    <h3 style="color:#00864E;margin-top:16px">PERCEPCIONES</h3>
    <table><thead><tr><th>Concepto</th><th>Monto</th></tr></thead><tbody>
      <tr><td>Sueldo Base</td><td>$${(Number(f.sueldoBase)||0).toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
      <tr><td>Bonos / Incentivos</td><td>$${(Number(f.bonos)||0).toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
      <tr><td>Otras Percepciones</td><td>$${(Number(f.otrasPercepciones)||0).toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
      <tr class="total-row"><td>TOTAL PERCEPCIONES</td><td>$${totalPercepciones.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
    </tbody></table>
    <h3 style="color:#C41E3A;margin-top:16px">DEDUCCIONES</h3>
    <table><thead><tr><th>Concepto</th><th>Monto</th></tr></thead><tbody>
      <tr><td>${f.descripcionDeducciones||"Deducciones (IMSS, préstamos, etc.)"}</td><td>$${totalDeducciones.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
      <tr class="total-row"><td>TOTAL DEDUCCIONES</td><td>$${totalDeducciones.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>
    </tbody></table>
    <table style="margin-top:10px"><tbody><tr class="neto-row"><td>💰 NETO A PAGAR</td><td>$${neto.toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr></tbody></table>
    <div class="firma-row">
      <div class="firma">Empresa — Autorizado por</div>
      <div class="firma">Empleado — ${f.nombre}</div>
    </div>
    <p style="margin-top:16px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
    </body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>💼 Nómina Administrativa — {f.nombre}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="sec-lbl">📅 Período</div>
          <div className="fg">
            <div className="field"><label>Inicio</label><input value={periodo.inicio} onChange={e=>setPeriodo(p=>({...p,inicio:e.target.value}))} placeholder="dd/mm/aaaa"/></div>
            <div className="field"><label>Fin</label><input value={periodo.fin} onChange={e=>setPeriodo(p=>({...p,fin:e.target.value}))} placeholder="dd/mm/aaaa"/></div>
            <div className="field s2"><div style={{padding:"8px 12px",background:"var(--bg2)",borderRadius:8,fontSize:12}}><strong>{f.nombre}</strong> — {f.puesto||"Sin puesto"}</div></div>
          </div>
          <div className="sec-lbl" style={{color:"var(--cyan)",borderColor:"var(--cyan)"}}>💼 Parámetros (editables para este recibo)</div>
          <div className="fg">
            <div className="field"><label>Sueldo Base ($)</label><input value={f.sueldoBase} onChange={ch("sueldoBase")} type="number" min="0" step="100"/></div>
            <div className="field"><label>Bonos / Incentivos ($)</label><input value={f.bonos} onChange={ch("bonos")} type="number" min="0"/></div>
            <div className="field"><label>Otras Percepciones ($)</label><input value={f.otrasPercepciones} onChange={ch("otrasPercepciones")} type="number" min="0" placeholder="Vales, comisiones..."/></div>
            <div className="field"><label>Deducciones ($)</label><input value={f.deducciones} onChange={ch("deducciones")} type="number" min="0" placeholder="IMSS, préstamos..."/></div>
            <div className="field s2"><label>Descripción de Deducciones</label><input value={f.descripcionDeducciones||""} onChange={ch("descripcionDeducciones")} placeholder="Ej: IMSS $600 + Préstamo $200"/></div>
          </div>
          <div style={{marginTop:14,padding:"16px 18px",background:"var(--bg0)",borderRadius:10,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,border:"2px solid var(--border)"}}>
            <div><div style={{fontSize:10,color:"var(--muted)",marginBottom:2,textTransform:"uppercase"}}>Total Percepciones</div><div style={{fontFamily:"var(--font-hd)",fontSize:20,fontWeight:700,color:"var(--green)"}}>{fmt$(totalPercepciones)}</div></div>
            <div><div style={{fontSize:10,color:"var(--muted)",marginBottom:2,textTransform:"uppercase"}}>Total Deducciones</div><div style={{fontFamily:"var(--font-hd)",fontSize:20,fontWeight:700,color:"var(--red)"}}>-{fmt$(totalDeducciones)}</div></div>
            <div><div style={{fontSize:10,color:"var(--muted)",marginBottom:2,textTransform:"uppercase"}}>💰 Neto a Pagar</div><div style={{fontFamily:"var(--font-hd)",fontSize:24,fontWeight:700,color:"var(--cyan)"}}>{fmt$(neto)}</div></div>
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-cyan" onClick={() => { onSave({ ...f }); onClose(); }}>💾 Guardar cambios</button>
          <button className="btn btn-green" onClick={doPrint}>🖨️ Imprimir Recibo</button>
        </div>
      </div>
    </div>
  );
}

function EmpleadoAdminModal({ persona, onSave, onClose }) {
  const [f, setF] = useState(persona || { nombre:"", puesto:"", sueldoBase:0, deducciones:0, descripcionDeducciones:"", bonos:0, otrasPercepciones:0, activo:true, notas:"" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const ok = () => {
    if (!f.nombre.trim()) return alert("El nombre es requerido");
    onSave({ ...f, id: f.id || uid() });
  };
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar Empleado" : "➕ Nuevo Empleado Administrativo"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field"><label>Nombre Completo *</label><input value={f.nombre} onChange={ch("nombre")} placeholder="Ana Martínez López" autoFocus/></div>
            <div className="field"><label>Puesto / Cargo</label><input value={f.puesto} onChange={ch("puesto")} placeholder="Ej: Secretaria, Gerente, Contador..."/></div>
            <div className="field"><label>Sueldo Base Mensual ($)</label><input value={f.sueldoBase} onChange={ch("sueldoBase")} type="number" min="0" step="100" placeholder="15000"/></div>
            <div className="field"><label>Deducciones Fijas ($)</label><input value={f.deducciones} onChange={ch("deducciones")} type="number" min="0" placeholder="IMSS, crédito Infonavit..."/></div>
            <div className="field"><label>Descripción de Deducciones</label><input value={f.descripcionDeducciones||""} onChange={ch("descripcionDeducciones")} placeholder="Ej: IMSS + Infonavit"/></div>
            <div className="field"><label>Bonos Recurrentes ($)</label><input value={f.bonos} onChange={ch("bonos")} type="number" min="0" placeholder="0"/></div>
            <div className="field"><label>Otras Percepciones ($)</label><input value={f.otrasPercepciones} onChange={ch("otrasPercepciones")} type="number" min="0" placeholder="Vales, fondo ahorro..."/></div>
            <div className="field"><label>Status</label><select value={f.activo?"true":"false"} onChange={e=>setF(p=>({...p,activo:e.target.value==="true"}))}><option value="true">✅ Activo</option><option value="false">🔇 Inactivo</option></select></div>
            <div className="field s2"><label>Notas</label><input value={f.notas} onChange={ch("notas")} placeholder="Área, turno, observaciones..."/></div>
          </div>
          <div style={{marginTop:10,padding:"10px 14px",background:"var(--bg2)",borderRadius:8,fontSize:12,border:"1px solid var(--border)"}}>
            <strong>Neto estimado: </strong>
            <span style={{color:"var(--cyan)",fontWeight:700,fontFamily:"var(--font-hd)",fontSize:15}}>
              {fmt$((Number(f.sueldoBase)||0)+(Number(f.bonos)||0)+(Number(f.otrasPercepciones)||0)-(Number(f.deducciones)||0))}
            </span>
            /mes
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-cyan" onClick={ok}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

function NominaPage({ drivers, units, trips, onOpenNomina, nominasAdmin = [], onSaveNominasAdmin }) {
  const [tabNom, setTabNom] = useState("operadores"); // operadores | admin
  const [q, setQ] = useState("");
  const [sf, setSf] = useState("TODOS");
  const [modalAdmin, setModalAdmin] = useState(null); // { mode: "edit"|"recibo", data }

  // ── OPERADORES ──────────────────────────────────────────────
  const fil = drivers.filter(d =>
    d.nombre.toLowerCase().includes(q.toLowerCase()) &&
    (sf === "TODOS" || d.status === sf)
  );

  const getDriverStats = (driver) => {
    const unit = units.find(u => u.operador === driver.id);
    const viajesComp = trips.filter(t => !t.esExterno && t.status === "COMPLETADO");
    const viajesOp = unit ? viajesComp.filter(t => t.unidadId === unit.id) : [];
    const totalViajes = viajesOp.reduce((a, t) => a + (Number(t.costoOfrecido) || 0), 0);
    const comisionCalc = totalViajes * (Number(driver.porcentajeViaje) || 0) / 100;
    return { viajesCount: viajesOp.length, totalViajes, comisionCalc, unit };
  };

  const totalSueldosOp  = fil.reduce((a, d) => a + (Number(d.sueldoBase) || 0), 0);
  const totalSueldosAdm = nominasAdmin.filter(e=>e.activo).reduce((a,e) => a + (Number(e.sueldoBase)||0)+(Number(e.bonos)||0)+(Number(e.otrasPercepciones)||0)-(Number(e.deducciones)||0), 0);

  // ── ADMIN EMPLEADOS ─────────────────────────────────────────
  const filAdm = nominasAdmin.filter(e => e.nombre.toLowerCase().includes(q.toLowerCase()));

  const saveEmpleado = (emp) => {
    const existe = nominasAdmin.find(e => e.id === emp.id);
    const nuevos = existe
      ? nominasAdmin.map(e => e.id === emp.id ? emp : e)
      : [...nominasAdmin, emp];
    onSaveNominasAdmin(nuevos);
  };

  const delEmpleado = (id) => {
    if (!window.confirm("¿Eliminar este empleado de nómina?")) return;
    onSaveNominasAdmin(nominasAdmin.filter(e => e.id !== id));
  };

  return (
    <div>
      {/* KPIs globales */}
      <div className="stats" style={{marginBottom:16}}>
        <div className="stat" style={{"--c":"var(--cyan)"}}>
          <div className="stat-icon">🚛</div>
          <div className="stat-val sm">{drivers.filter(d=>d.status==="ACTIVO").length}</div>
          <div className="stat-lbl">Operadores activos</div>
        </div>
        <div className="stat" style={{"--c":"var(--green)"}}>
          <div className="stat-icon">💵</div>
          <div className="stat-val sm">{fmt$(totalSueldosOp)}</div>
          <div className="stat-lbl">Sueldos base operadores</div>
        </div>
        <div className="stat" style={{"--c":"var(--purple)"}}>
          <div className="stat-icon">💼</div>
          <div className="stat-val sm">{nominasAdmin.filter(e=>e.activo).length}</div>
          <div className="stat-lbl">Personal administrativo</div>
        </div>
        <div className="stat" style={{"--c":"var(--orange)"}}>
          <div className="stat-icon">💰</div>
          <div className="stat-val sm">{fmt$(totalSueldosAdm)}</div>
          <div className="stat-lbl">Neto est. administrativos</div>
        </div>
        <div className="stat" style={{"--c":"var(--red)"}}>
          <div className="stat-icon">🏦</div>
          <div className="stat-val sm">{fmt$(totalSueldosOp + totalSueldosAdm)}</div>
          <div className="stat-lbl">Masa salarial total est.</div>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <h3>💰 Nóminas</h3>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div className="sw">
              <span style={{color:"var(--muted)"}}>🔍</span>
              <input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            {tabNom === "admin" && (
              <button className="btn btn-cyan btn-sm" onClick={() => setModalAdmin({ mode:"edit", data: null })}>➕ Agregar Empleado</button>
            )}
            {tabNom === "operadores" && (
              <button className="btn btn-cyan btn-sm" onClick={() => fil.length > 0 && onOpenNomina(fil[0])} disabled={fil.length===0}>💵 Crear Nómina</button>
            )}
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{padding:"8px 16px 0",borderBottom:"1px solid var(--border)"}}>
          <div className="ftabs">
            <button className={`ftab${tabNom==="operadores"?" on":""}`} onClick={()=>setTabNom("operadores")}>🚛 Operadores ({drivers.length})</button>
            <button className={`ftab${tabNom==="admin"?" on":""}`} onClick={()=>setTabNom("admin")}>💼 Administrativos ({nominasAdmin.length})</button>
          </div>
        </div>

        {/* ── TAB OPERADORES ── */}
        {tabNom === "operadores" && (
          <>
            <div className="sbar">
              {["TODOS","ACTIVO","INACTIVO","VACACIONES","BAJA"].map(s => (
                <button key={s} className={`ftab${sf===s?" on":""}`} onClick={()=>setSf(s)}>{s}</button>
              ))}
            </div>
            <div className="card-body">
              {fil.length === 0
                ? <div className="empty"><div className="empty-icon">🚛</div><p>Sin operadores</p></div>
                : <table>
                    <thead><tr><th>Operador</th><th>Unidad</th><th>Viajes</th><th>Sueldo Base</th><th>% Comisión</th><th>Comisión Est.</th><th>Total Est.</th><th>Status</th><th>Acción</th></tr></thead>
                    <tbody>{fil.map(d => {
                      const s = getDriverStats(d);
                      const sueldoBase = Number(d.sueldoBase) || 0;
                      const totalEst = sueldoBase + s.comisionCalc;
                      return (
                        <tr key={d.id} style={{cursor:"pointer"}} onClick={() => onOpenNomina(d)} title="Clic para generar nómina">
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              {d.foto ? <img src={d.foto} style={{width:30,height:30,borderRadius:"50%",objectFit:"cover"}} alt=""/> : <span style={{fontSize:20}}>👤</span>}
                              <div style={{fontWeight:700,fontSize:13}}>{d.nombre}</div>
                            </div>
                          </td>
                          <td>{s.unit ? <Bdg c="bb" t={`${s.unit.num} ${s.unit.placas}`}/> : <span style={{color:"var(--muted)",fontSize:11}}>Sin unidad</span>}</td>
                          <td style={{textAlign:"center",fontWeight:700,color:"var(--cyan)"}}>{s.viajesCount}</td>
                          <td style={{fontWeight:700,color:"var(--cyan)"}}>{sueldoBase > 0 ? fmt$(sueldoBase) : <span style={{color:"var(--muted)"}}>—</span>}</td>
                          <td><Bdg c="bp" t={`${d.porcentajeViaje || 0}%`}/></td>
                          <td style={{fontWeight:700,color:"var(--green)"}}>{s.comisionCalc > 0 ? fmt$(s.comisionCalc) : <span style={{color:"var(--muted)"}}>—</span>}</td>
                          <td style={{fontFamily:"var(--font-hd)",fontSize:15,fontWeight:700,color:"var(--orange)"}}>{fmt$(totalEst)}</td>
                          <td><Bdg c={d.status==="ACTIVO"?"bg":d.status==="VACACIONES"?"by":"bm"} t={d.status}/></td>
                          <td><div className="acts"><button className="btn btn-cyan btn-sm" onClick={e=>{e.stopPropagation();onOpenNomina(d);}}>💵 Crear Nómina</button></div></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
              }
            </div>
          </>
        )}

        {/* ── TAB ADMINISTRATIVOS ── */}
        {tabNom === "admin" && (
          <div className="card-body">
            {filAdm.length === 0
              ? <div className="empty"><div className="empty-icon">💼</div><p>Sin personal administrativo. Agrega empleados con el botón ➕.</p></div>
              : <table>
                  <thead><tr><th>Nombre</th><th>Puesto</th><th>Sueldo Base</th><th>Bonos</th><th>Deducciones</th><th>Descripción Deducciones</th><th>Neto Est.</th><th>Status</th><th>Acciones</th></tr></thead>
                  <tbody>{filAdm.map(e => {
                    const neto = (Number(e.sueldoBase)||0)+(Number(e.bonos)||0)+(Number(e.otrasPercepciones)||0)-(Number(e.deducciones)||0);
                    return (
                      <tr key={e.id}>
                        <td>
                          <div style={{fontWeight:700,fontSize:13}}>{e.nombre}</div>
                          {e.notas && <div style={{fontSize:10,color:"var(--muted)"}}>{e.notas}</div>}
                        </td>
                        <td><Bdg c="bp" t={e.puesto||"Sin puesto"}/></td>
                        <td style={{fontWeight:700,color:"var(--cyan)"}}>{fmt$(e.sueldoBase)}</td>
                        <td style={{color:"var(--green)"}}>{(Number(e.bonos)||0)>0?fmt$(e.bonos):<span style={{color:"var(--muted)"}}>—</span>}</td>
                        <td style={{color:"var(--red)"}}>{(Number(e.deducciones)||0)>0?`-${fmt$(e.deducciones)}`:<span style={{color:"var(--muted)"}}>—</span>}</td>
                        <td style={{fontSize:11,color:"var(--muted)",maxWidth:180}}>
                          {e.descripcionDeducciones
                            ? <span title={e.descripcionDeducciones} style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.descripcionDeducciones}</span>
                            : <span style={{fontStyle:"italic"}}>—</span>}
                        </td>
                        <td style={{fontFamily:"var(--font-hd)",fontSize:15,fontWeight:700,color:"var(--orange)"}}>{fmt$(neto)}</td>
                        <td><Bdg c={e.activo?"bg":"bm"} t={e.activo?"ACTIVO":"INACTIVO"}/></td>
                        <td>
                          <div className="acts">
                            <button className="btn btn-cyan btn-xs" onClick={()=>setModalAdmin({mode:"recibo",data:{...e}})}>🖨️ Recibo</button>
                            <button className="btn btn-ghost btn-xs" onClick={()=>setModalAdmin({mode:"edit",data:{...e}})}>✏️</button>
                            <button className="btn btn-ghost btn-xs" onClick={()=>delEmpleado(e.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}</tbody>
                </table>
            }
          </div>
        )}
      </div>

      {/* Modales inline */}
      {modalAdmin?.mode === "edit" && (
        <EmpleadoAdminModal
          persona={modalAdmin.data}
          onSave={emp => { saveEmpleado(emp); setModalAdmin(null); }}
          onClose={() => setModalAdmin(null)}
        />
      )}
      {modalAdmin?.mode === "recibo" && (
        <NominaAdminModal
          persona={modalAdmin.data}
          onSave={emp => saveEmpleado(emp)}
          onClose={() => setModalAdmin(null)}
        />
      )}
    </div>
  );
}

// ── MODAL DE PAGO GENÉRICO (mantenimientos, gastos, etc.) ────────────────────
function PagoProveedorGenericoModal({ item, proveedor, branding, trips, maints, onSave, onClose }) {
  const data = item.data;
  const [f, setF] = useState({
    pagoStatus:      data.pagoStatus      || "pendiente",
    pagoFecha:       data.pagoFecha       || "",
    pagoForma:       data.pagoForma       || "Transferencia SPEI",
    pagoReferencia:  data.pagoReferencia  || "",
    pagoFactura:     data.pagoFactura     || "",
    pagoNotas:       data.pagoNotas       || "",
    pagoEvidencias:  data.pagoEvidencias  || [],
    pagoMontoParcial:data.pagoMontoParcial|| "",
  });
  const ch = k => e => setF(p=>({...p,[k]:e.target.value}));
  const fmx = n => "$"+Number(n||0).toLocaleString("es-MX",{minimumFractionDigits:2});
  const stCol = f.pagoStatus==="pagado"?"var(--green)":f.pagoStatus==="parcial"?"var(--cyan)":"var(--orange)";
  const inp = {padding:"8px 12px",borderRadius:8,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)",fontSize:13,width:"100%",boxSizing:"border-box"};
  const lbl = {fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",display:"block",marginBottom:4};

  const tipoIcon = item.tipo==="mantenimiento"?"🔧":item.tipo==="gasto"?"💵":"📋";
  const tipoLbl  = item.tipo==="mantenimiento"?"Mantenimiento":item.tipo==="gasto"?"Gasto General":"Servicio";

  const handleImg = e => {
    Array.from(e.target.files).forEach(file => {
      const r = new FileReader(); r.onload = ev => setF(p=>({...p,pagoEvidencias:[...(p.pagoEvidencias||[]),ev.target.result]})); r.readAsDataURL(file);
    });
  };
  const delImg = idx => setF(p=>({...p,pagoEvidencias:p.pagoEvidencias.filter((_,i)=>i!==idx)}));

  const handleWhatsApp = () => {
    const msg =
`✅ *CONFIRMACIÓN DE PAGO — ${branding?.nombre||"Fleet Pro"}*

${tipoIcon} *${tipoLbl}*
🏢 Proveedor: ${proveedor?.nombre||"—"}
📋 Concepto: ${item.label}
📅 Fecha: ${data.fecha||"—"}

━━━━━━━━━━━━━━
💰 *Monto:* ${fmx(f.pagoStatus==="parcial"?f.pagoMontoParcial:item.monto)}
📅 Fecha pago: ${f.pagoFecha||"—"}
💳 Forma: ${f.pagoForma}
🔑 Referencia: ${f.pagoReferencia||"—"}
${f.pagoFactura?`🧾 Factura: ${f.pagoFactura}`:""}
${f.pagoNotas?`📝 ${f.pagoNotas}`:""}

_${branding?.nombre||"Fleet Pro"} — Comprobante_`;
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" style={{maxWidth:580}} onClick={e=>e.stopPropagation()}>
        <div className="mhdr" style={{borderBottom:`3px solid ${stCol}`}}>
          <h3>{tipoIcon} Conciliar Pago — {proveedor?.nombre||"Proveedor"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          {/* Resumen */}
          <div style={{padding:"12px 16px",background:"var(--bg2)",borderRadius:10,border:"1px solid var(--border)",marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{tipoIcon} {tipoLbl}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:12}}>
              <div><span style={{color:"var(--muted)"}}>📋 Concepto: </span><strong>{item.label}</strong></div>
              <div><span style={{color:"var(--muted)"}}>📅 Fecha: </span><strong>{data.fecha||"—"}</strong></div>
              {proveedor?.tipoProv&&<div><span style={{color:"var(--muted)"}}>🏷️ Tipo: </span><strong>{proveedor.tipoProv}</strong></div>}
              {proveedor?.rfc&&<div><span style={{color:"var(--muted)"}}>🪪 RFC: </span><strong>{proveedor.rfc}</strong></div>}
            </div>
            <div style={{marginTop:8,padding:"8px 12px",background:"var(--bg0)",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"var(--muted)",fontSize:12}}>Monto total</span>
              <span style={{fontFamily:"var(--font-hd)",fontSize:20,fontWeight:700,color:"var(--orange)"}}>{fmx(item.monto)}</span>
            </div>
          </div>

          {/* Estado */}
          <div style={{marginBottom:14}}>
            <label style={lbl}>Estado del pago</label>
            <div style={{display:"flex",gap:8}}>
              {[["pendiente","⏳ Pendiente","var(--yellow)"],["pagado","✅ Pagado","var(--green)"],["parcial","🔄 Parcial","var(--cyan)"]].map(([val,lb,col])=>(
                <button key={val} onClick={()=>setF(p=>({...p,pagoStatus:val}))}
                  style={{flex:1,padding:"10px 8px",borderRadius:10,border:`2px solid ${f.pagoStatus===val?col:"var(--border)"}`,background:f.pagoStatus===val?`rgba(${val==="pendiente"?"255,184,0":val==="pagado"?"0,200,150":"0,153,204"},.15)`:"var(--bg2)",color:f.pagoStatus===val?col:"var(--muted)",fontWeight:f.pagoStatus===val?700:400,cursor:"pointer",fontSize:12}}>
                  {lb}
                </button>
              ))}
            </div>
          </div>

          {f.pagoStatus==="parcial" && (
            <div style={{marginBottom:14,padding:"10px 14px",background:"rgba(0,153,204,.08)",borderRadius:8,border:"1px solid var(--cyan)"}}>
              <label style={{...lbl,color:"var(--cyan)"}}>💰 Monto a pagar (parcial)</label>
              <input type="number" value={f.pagoMontoParcial} onChange={ch("pagoMontoParcial")} placeholder="0.00" style={inp} min="0" step="0.01"/>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Pendiente: {fmx(item.monto-(f.pagoMontoParcial||0))}</div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={lbl}>Fecha de pago</label><input type="date" value={f.pagoFecha} onChange={ch("pagoFecha")} style={inp}/></div>
            <div><label style={lbl}>Forma de pago</label>
              <select value={f.pagoForma} onChange={ch("pagoForma")} style={inp}>
                {FORMAS_PAGO.map(fp=><option key={fp}>{fp}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={lbl}>{f.pagoForma==="Efectivo"?"🧾 Recibo / Folio":"🔑 Referencia / No. transferencia"}</label>
              <input value={f.pagoReferencia} onChange={ch("pagoReferencia")} placeholder={f.pagoForma==="Efectivo"?"Ej: REC-001":"Ej: SPEI-20260310-001"} style={inp}/>
            </div>
            <div>
              <label style={lbl}>🧾 No. Factura / CFDI</label>
              <input value={f.pagoFactura} onChange={ch("pagoFactura")} placeholder="Ej: FAC-2026-0042" style={inp}/>
            </div>
          </div>
          {(proveedor?.banco||proveedor?.cuenta) && (
            <div style={{marginBottom:12,padding:"8px 14px",background:"rgba(0,200,100,.06)",border:"1px solid rgba(0,200,100,.2)",borderRadius:8,fontSize:12}}>
              <span style={{fontWeight:700,color:"var(--green)"}}>🏦 Datos bancarios: </span>
              {proveedor.banco&&<span>{proveedor.banco} </span>}
              {proveedor.cuenta&&<span style={{fontFamily:"monospace",background:"var(--bg0)",padding:"1px 6px",borderRadius:4}}>CLABE: {proveedor.cuenta}</span>}
            </div>
          )}
          <div style={{marginBottom:12}}>
            <label style={lbl}>📝 Notas</label>
            <textarea value={f.pagoNotas} onChange={ch("pagoNotas")} rows={2} placeholder="Descuentos, condiciones, aclaraciones..." style={{...inp,resize:"vertical"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={lbl}>📎 Comprobante</label>
            <label style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",background:"var(--bg2)",border:"1.5px dashed var(--border)",borderRadius:8,cursor:"pointer",fontSize:12,color:"var(--cyan)"}}>
              📎 Adjuntar archivo <input type="file" accept="image/*,application/pdf" multiple onChange={handleImg} style={{display:"none"}}/>
            </label>
            {f.pagoEvidencias?.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
                {f.pagoEvidencias.map((src,i)=>(
                  <div key={i} style={{position:"relative",width:72,height:72}}>
                    <img src={src} style={{width:72,height:72,objectFit:"cover",borderRadius:8,border:"1px solid var(--border)"}} alt="ev"/>
                    <button onClick={()=>delImg(i)} style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",background:"var(--red)",color:"#fff",border:"none",fontSize:11,cursor:"pointer"}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-ghost" style={{color:"var(--green)",border:"1px solid var(--green)"}} onClick={handleWhatsApp}>💬 WhatsApp</button>
          <button className="btn btn-cyan" onClick={()=>onSave({...data,...f})}>💾 Guardar Pago</button>
        </div>
      </div>
    </div>
  );
}


function ProveedoresPage({ proveedores, maints, gastos, externos = [], trips = [], onAdd, onEdit, onDelete, onSaveExterno, onSavePagoProveedor, branding }) {
  const [q, setQ] = useState(""); const [cf, setCf] = useState("TODOS"); const [tab, setTab] = useState("lista");
  const [modalPago, setModalPago] = useState(null); // externo being paid (transportista)
  const [modalProvPago, setModalProvPago] = useState(null); // generic provider payment
  const fil = proveedores.filter(p => (p.nombre + p.contacto + (p.tipoProv||"")).toLowerCase().includes(q.toLowerCase()) && (cf === "TODOS" || p.tipoProv === cf));

  const getStats = (pvId) => {
    const gm = maints.filter(m => m.proveedorId === pvId).reduce((a, m) => a + (Number(m.costoRef)||0) + (Number(m.costoMO)||0), 0);
    const gg = gastos.filter(g => g.proveedorId === pvId).reduce((a, g) => a + (Number(g.monto)||0), 0);
    const ge = externos.filter(e => e.proveedorId === pvId).reduce((a, e) => a + (Number(e.costoPagar)||0), 0);
    return { total: gm + gg + ge, mantenimientos: maints.filter(m => m.proveedorId === pvId).length, gastos: gastos.filter(g => g.proveedorId === pvId).length, externos: externos.filter(e => e.proveedorId === pvId).length };
  };

  // Credit status helpers
  const diasDesde = (fecha) => fecha ? Math.floor((Date.now() - new Date(fecha)) / 86400000) : null;
  const creditStatus = (p) => {
    if (!p.diasCredito) return null;
    const dias = diasDesde(p.ultimoPago);
    if (dias == null) return { color:"var(--muted)", lbl:"Sin fecha pago", icon:"❓" };
    const restantes = (p.diasCredito||0) - dias;
    if (restantes < 0) return { color:"var(--red)", lbl:`Vencido ${Math.abs(restantes)}d`, icon:"🚨" };
    if (restantes <= 5) return { color:"var(--orange)", lbl:`Vence en ${restantes}d`, icon:"⚠️" };
    return { color:"var(--green)", lbl:`${restantes}d restantes`, icon:"✅" };
  };

  // Build a unified "pending payments" list for ALL provider types
  const allPendingPayments = [
    // From externos (transportistas)
    ...externos.filter(e => e.pagoStatus !== "pagado" && (e.costoPagar||0) > 0).map(e => ({
      tipo: "viaje", id: e.id, label: `${e.empresa||"—"}: ${e.origen||""} → ${e.destino||""}`,
      fecha: e.fecha, monto: e.costoPagar||0, status: e.pagoStatus||"pendiente",
      proveedorId: e.proveedorId, data: e,
    })),
    // From maints with pending balance
    ...maints.filter(m => m.pagoStatus !== "pagado" && ((m.costoRef||0)+(m.costoMO||0)) > 0 && m.proveedorId).map(m => ({
      tipo: "mantenimiento", id: m.id, label: `Mant: ${m.descripcion||m.tipo||"—"}`,
      fecha: m.fecha, monto: (m.costoRef||0)+(m.costoMO||0), status: m.pagoStatus||"pendiente",
      proveedorId: m.proveedorId, data: m,
    })),
    // From gastos with pending balance
    ...gastos.filter(g => g.pagoStatus !== "pagado" && (g.monto||0) > 0 && g.proveedorId).map(g => ({
      tipo: "gasto", id: g.id, label: `Gasto: ${g.descripcion||g.tipo||"—"}`,
      fecha: g.fecha, monto: g.monto||0, status: g.pagoStatus||"pendiente",
      proveedorId: g.proveedorId, data: g,
    })),
  ];

  // KPIs de crédito
  const conCredito = proveedores.filter(p => p.diasCredito > 0);
  const saldoTotal = proveedores.reduce((s,p) => s + (p.saldoPendiente||0), 0);
  const vencidos   = proveedores.filter(p => { const st = creditStatus(p); return st && st.icon==="🚨"; });
  const porVencer  = proveedores.filter(p => { const st = creditStatus(p); return st && st.icon==="⚠️"; });

  return (
    <div>
      {/* KPIs crédito */}
      <div className="stats" style={{marginBottom:16}}>
        <div className="stat" style={{"--c":"var(--cyan)"}}>
          <div className="stat-icon">🏪</div><div className="stat-val sm">{proveedores.length}</div><div className="stat-lbl">Proveedores</div>
        </div>
        <div className="stat" style={{"--c":"var(--orange)"}}>
          <div className="stat-icon">💳</div><div className="stat-val sm">{conCredito.length}</div><div className="stat-lbl">Con crédito</div>
        </div>
        <div className="stat" style={{"--c":"var(--yellow)"}}>
          <div className="stat-icon">💰</div><div className="stat-val sm">{fmt$(saldoTotal)}</div><div className="stat-lbl">Saldo pendiente total</div>
        </div>
        <div className="stat" style={{"--c":"var(--red)"}}>
          <div className="stat-icon">🚨</div><div className="stat-val sm">{vencidos.length}</div><div className="stat-lbl">Créditos vencidos</div>
        </div>
        <div className="stat" style={{"--c":"var(--orange)"}}>
          <div className="stat-icon">⚠️</div><div className="stat-val sm">{porVencer.length}</div><div className="stat-lbl">Por vencer (≤5 días)</div>
        </div>
      </div>

      {/* Alertas de crédito vencido */}
      {vencidos.length > 0 && (
        <div style={{padding:"10px 16px",background:"rgba(220,50,50,.1)",border:"2px solid var(--red)",borderRadius:10,marginBottom:14,fontSize:12}}>
          <strong style={{color:"var(--red)"}}>🚨 Créditos vencidos:</strong>{" "}
          {vencidos.map(p=><span key={p.id} style={{marginLeft:8,padding:"2px 8px",background:"rgba(220,50,50,.15)",borderRadius:6,color:"var(--red)"}}>{p.nombre} — Saldo: {fmt$(p.saldoPendiente||0)}</span>)}
        </div>
      )}

      {/* Tab selector */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <button className={`btn btn-sm ${tab==="lista"?"btn-cyan":"btn-ghost"}`} onClick={()=>setTab("lista")}>🏪 Proveedores ({proveedores.length})</button>
        <button className={`btn btn-sm ${tab==="transportistas"?"btn-cyan":"btn-ghost"}`} onClick={()=>setTab("transportistas")}>
          🚛 Transportistas
          {externos.filter(e=>e.pagoStatus!=="pagado"&&e.costoPagar>0).length>0 && (
            <span style={{background:"var(--red)",color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,marginLeft:4}}>
              {externos.filter(e=>e.pagoStatus!=="pagado"&&e.costoPagar>0).length}
            </span>
          )}
        </button>
        <button className={`btn btn-sm ${tab==="cxp"?"btn-cyan":"btn-ghost"}`} onClick={()=>setTab("cxp")}>
          💳 Cuentas por Pagar
          {allPendingPayments.length>0 && (
            <span style={{background:"var(--orange)",color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,marginLeft:4}}>
              {allPendingPayments.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab: Proveedores */}
      {tab==="lista" && (
        <div className="card">
          <div className="card-hdr">
            <h3>🏪 Proveedores ({proveedores.length})</h3>
            <div className="row-gap">
              <div className="sw"><span style={{color:"var(--muted)"}}>🔍</span><input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/></div>
              <button className="btn btn-cyan" onClick={onAdd}>+ Nuevo Proveedor</button>
            </div>
          </div>
          <div style={{padding:"8px 16px",borderBottom:"1px solid var(--border)"}}>
            <div className="ftabs">
              <button className={`ftab${cf==="TODOS"?" on":""}`} onClick={()=>setCf("TODOS")}>Todos</button>
              {TIPO_PROVEEDOR_CATS.map(c=><button key={c} className={`ftab${cf===c?" on":""}`} onClick={()=>setCf(c)}>{c}</button>)}
            </div>
          </div>
          <div className="card-body">
            {fil.length===0
              ? <div className="empty"><div className="empty-icon">🏪</div><p>Sin proveedores</p></div>
              : <table>
                  <thead><tr><th>Nombre</th><th>Tipo</th><th>Contacto</th><th>Crédito</th><th>Saldo</th><th>Estado Pago</th><th>Gasto Total</th><th>Acciones</th></tr></thead>
                  <tbody>{fil.map(p => {
                    const s  = getStats(p.id);
                    const cs = creditStatus(p);
                    return (
                      <tr key={p.id} style={{background:cs?.icon==="🚨"?"rgba(220,50,50,.04)":""}}>
                        <td><div style={{fontWeight:600}}>{p.nombre}</div>{p.rfc&&<div style={{fontSize:10,color:"var(--muted)",fontFamily:"monospace"}}>{p.rfc}</div>}</td>
                        <td><Bdg c="bo" t={p.tipoProv||p.categoria||"—"}/></td>
                        <td style={{fontSize:11}}><div>{p.contacto||"—"}</div><div style={{color:"var(--muted)"}}>{p.tel||""}</div></td>
                        <td style={{fontSize:12}}>
                          {p.diasCredito>0
                            ? <div><div style={{fontWeight:700}}>{p.diasCredito} días</div><div style={{fontSize:10,color:"var(--muted)"}}>Límite: {fmt$(p.limiteCredito||0)}</div></div>
                            : <span style={{color:"var(--muted)",fontSize:11}}>Sin crédito</span>}
                        </td>
                        <td style={{fontWeight:700,color:(p.saldoPendiente||0)>0?"var(--orange)":"var(--muted)"}}>
                          {(p.saldoPendiente||0)>0?fmt$(p.saldoPendiente):"—"}
                        </td>
                        <td>
                          {cs?<span style={{fontSize:11,fontWeight:700,color:cs.color}}>{cs.icon} {cs.lbl}</span>:<span style={{color:"var(--muted)",fontSize:11}}>—</span>}
                          {p.ultimoPago&&<div style={{fontSize:10,color:"var(--muted)"}}>Últ. pago: {p.ultimoPago}</div>}
                        </td>
                        <td style={{fontWeight:700,color:s.total>0?"var(--purple)":"var(--muted)"}}>{s.total>0?fmt$(s.total):"—"}</td>
                        <td><div className="acts"><button className="btn btn-ghost btn-sm" onClick={()=>onEdit(p)}>✏️</button><button className="btn btn-red btn-sm" onClick={()=>onDelete(p.id)}>🗑</button></div></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
            }
          </div>
        </div>
      )}

      {/* Tab: Cuentas por pagar transportistas */}
      {tab==="transportistas" && (() => {
        const pendientes = externos.filter(e=>e.pagoStatus!=="pagado"&&e.costoPagar>0);
        const pagados    = externos.filter(e=>e.pagoStatus==="pagado");
        const totalPend  = pendientes.reduce((s,e)=>s+(Number(e.costoPagar)||0),0);
        const totalPag   = pagados.reduce((s,e)=>s+(Number(e.costoPagar)||0),0);
        return (
            <div>
            <div className="stats" style={{marginBottom:14}}>
              <div className="stat" style={{"--c":"var(--orange)"}}>
                <div className="stat-icon">⏳</div><div className="stat-val sm">{pendientes.length}</div><div className="stat-lbl">Por liquidar</div>
              </div>
              <div className="stat" style={{"--c":"var(--red)"}}>
                <div className="stat-icon">💸</div><div className="stat-val sm" style={{fontSize:16}}>{fmt$(totalPend)}</div><div className="stat-lbl">Total pendiente</div>
              </div>
              <div className="stat" style={{"--c":"var(--green)"}}>
                <div className="stat-icon">✅</div><div className="stat-val sm">{pagados.length}</div><div className="stat-lbl">Pagados</div>
              </div>
              <div className="stat" style={{"--c":"var(--muted)"}}>
                <div className="stat-icon">💰</div><div className="stat-val sm" style={{fontSize:16}}>{fmt$(totalPag)}</div><div className="stat-lbl">Total liquidado</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{padding:0}}>
                <table>
                  <thead><tr><th>Empresa Transportista</th><th>Ruta</th><th>Fecha Viaje</th><th style={{textAlign:"right"}}>Costo</th><th>Estado Pago</th><th>Fecha Pago</th><th>Referencia</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {externos.length===0
                      ? <tr><td colSpan={8} style={{textAlign:"center",color:"var(--muted)",padding:24}}>Sin viajes externos registrados</td></tr>
                      : [...externos].sort((a,b)=>{const ord={pendiente:0,parcial:1,pagado:2};return (ord[a.pagoStatus||"pendiente"]||0)-(ord[b.pagoStatus||"pendiente"]||0);}).map(e=>{
                          const pv = proveedores.find(p=>p.id===e.proveedorId);
                          const stColor = e.pagoStatus==="pagado"?"var(--green)":e.pagoStatus==="parcial"?"var(--cyan)":"var(--orange)";
                          const stIcon  = e.pagoStatus==="pagado"?"✅":e.pagoStatus==="parcial"?"🔄":"⏳";
                          return (
                          
                            <tr key={e.id} style={{background:e.pagoStatus==="pagado"?"rgba(0,200,100,.03)":"rgba(255,184,0,.03)"}}>
                              <td>
                                <div style={{fontWeight:700}}>{e.empresa}</div>
                                {e.contacto&&<div style={{fontSize:10,color:"var(--muted)"}}>{e.contacto}{e.tel&&` · ${e.tel}`}</div>}
                                {pv&&<Bdg c="bb" t="En catálogo"/>}
                              </td>
                              <td style={{fontSize:12}}>{e.origen} → {e.destino||"—"}</td>
                              <td style={{fontSize:12}}>{e.fecha}</td>
                              <td style={{textAlign:"right",fontWeight:700,color:"var(--orange)",fontSize:14}}>{fmt$(e.costoPagar||0)}</td>
                              <td><span style={{fontWeight:700,color:stColor,fontSize:12}}>{stIcon} {e.pagoStatus==="pagado"?"Pagado":e.pagoStatus==="parcial"?"Parcial":"Pendiente"}</span></td>
                              <td style={{fontSize:12,color:"var(--muted)"}}>{e.pagoFecha||"—"}</td>
                              <td style={{fontSize:11,color:"var(--muted)",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.pagoReferencia||"—"}</td>
                              <td>
                                <button className="btn btn-cyan btn-xs" onClick={()=>setModalPago(e)}>
                                  {e.pagoStatus==="pagado"?"👁️ Ver":"💳 Pagar"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Tab: Cuentas por Pagar — TODOS los proveedores ── */}
      {tab==="cxp" && (() => {
        const fmx = n => "$"+Number(n||0).toLocaleString("es-MX",{minimumFractionDigits:2});
        const totalPend = allPendingPayments.reduce((a,p)=>a+p.monto,0);
        const tipoIcon = t => t==="viaje"?"🚛":t==="mantenimiento"?"🔧":t==="gasto"?"💵":"📋";
        return (
          <>
            <div className="stats" style={{marginBottom:14}}>
              <div className="stat" style={{"--c":"var(--orange)"}}>
                <div className="stat-icon">⏳</div>
                <div className="stat-val sm">{allPendingPayments.length}</div>
                <div className="stat-lbl">Por liquidar</div>
              </div>
              <div className="stat" style={{"--c":"var(--red)"}}>
                <div className="stat-icon">💸</div>
                <div className="stat-val sm" style={{fontSize:15}}>{fmx(totalPend)}</div>
                <div className="stat-lbl">Total pendiente</div>
              </div>
              <div className="stat" style={{"--c":"var(--cyan)"}}>
                <div className="stat-icon">🚛</div>
                <div className="stat-val sm">{allPendingPayments.filter(p=>p.tipo==="viaje").length}</div>
                <div className="stat-lbl">Transportistas</div>
              </div>
              <div className="stat" style={{"--c":"var(--purple)"}}>
                <div className="stat-icon">🔧</div>
                <div className="stat-val sm">{allPendingPayments.filter(p=>p.tipo==="mantenimiento").length}</div>
                <div className="stat-lbl">Mantenimientos</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{padding:0}}>
                <table>
                  <thead><tr>
                    <th>Tipo</th><th>Proveedor</th><th>Concepto</th><th>Fecha</th>
                    <th style={{textAlign:"right"}}>Monto</th><th>Estado</th>
                    <th>Referencia</th><th>Factura</th><th>Acción</th>
                  </tr></thead>
                  <tbody>
                    {allPendingPayments.length===0
                      ? <tr><td colSpan={9} style={{textAlign:"center",color:"var(--muted)",padding:32}}>✅ Sin cuentas pendientes</td></tr>
                      : [...allPendingPayments].sort((a,b)=>(a.status==="pendiente"?0:1)-(b.status==="pendiente"?0:1)).map(item => {
                          const pv = proveedores.find(p=>p.id===item.proveedorId);
                          const stColor = item.status==="pagado"?"var(--green)":item.status==="parcial"?"var(--cyan)":"var(--orange)";
                          const stIcon = item.status==="pagado"?"✅":item.status==="parcial"?"🔄":"⏳";
                          return (
                            <tr key={`${item.tipo}-${item.id}`} style={{background:item.status==="pagado"?"rgba(0,200,100,.03)":"rgba(255,184,0,.03)"}}>
                              <td><span style={{fontSize:18}}>{tipoIcon(item.tipo)}</span></td>
                              <td style={{fontWeight:600,fontSize:12}}>{pv?.nombre||item.data?.empresa||"—"}
                                {pv?.tipoProv&&<div style={{fontSize:10,color:"var(--muted)"}}>{pv.tipoProv}</div>}
                              </td>
                              <td style={{fontSize:11,color:"var(--muted)",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.label}</td>
                              <td style={{fontSize:12}}>{item.fecha||"—"}</td>
                              <td style={{textAlign:"right",fontWeight:700,color:"var(--orange)",fontFamily:"var(--font-hd)"}}>{fmx(item.monto)}</td>
                              <td><span style={{fontWeight:700,color:stColor,fontSize:12}}>{stIcon} {item.status==="pagado"?"Pagado":item.status==="parcial"?"Parcial":"Pendiente"}</span></td>
                              <td style={{fontSize:11,color:"var(--muted)"}}>{item.data?.pagoReferencia||"—"}</td>
                              <td style={{fontSize:11,color:"var(--muted)"}}>{item.data?.pagoFactura||"—"}</td>
                              <td>
                                <button className="btn btn-cyan btn-xs"
                                  onClick={()=>{
                                    if(item.tipo==="viaje") setModalPago(item.data);
                                    else setModalProvPago({item, proveedor: pv});
                                  }}>
                                  {item.status==="pagado"?"👁️ Ver":"💳 Pagar"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Modales de pago ── */}
      {modalPago && (
        <PagoTransportistaModal
          externo={modalPago}
          proveedor={proveedores.find(p => p.id === modalPago.proveedorId)}
          branding={branding}
          trips={trips}
          onSave={(updated) => { onSaveExterno(updated); setModalPago(null); }}
          onClose={() => setModalPago(null)}
        />
      )}
      {modalProvPago && (
        <PagoProveedorGenericoModal
          item={modalProvPago.item}
          proveedor={modalProvPago.proveedor}
          branding={branding}
          trips={trips}
          maints={maints}
          onSave={(updated) => {
            if (onSavePagoProveedor) onSavePagoProveedor(updated, modalProvPago.item.tipo);
            setModalProvPago(null);
          }}
          onClose={() => setModalProvPago(null)}
        />
      )}
  </div>
  );
}


function GastosPage({ gastos, proveedores, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState(""); const [tf, setTf] = useState("TODOS");
  const fil = gastos.filter(g => (g.descripcion + g.responsable).toLowerCase().includes(q.toLowerCase()) && (tf === "TODOS" || g.tipo === tf));
  const tot = fil.reduce((a, g) => a + (Number(g.monto) || 0), 0);
  return (
    <div className="card">
      <div className="card-hdr"><h3>💵 Gastos Generales ({gastos.length}) 🔒</h3>
        <div className="row-gap">
          <div className="sw"><span style={{ color: "var(--muted)" }}>🔍</span><input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className="btn btn-cyan" onClick={onAdd}>+ Nuevo Gasto</button>
        </div>
      </div>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
        <div className="ftabs">{["TODOS", ...GASTO_TIPOS].map(t => <button key={t} className={`ftab${tf === t ? " on" : ""}`} onClick={() => setTf(t)}>{t}</button>)}</div>
      </div>
      <div className="sbar"><span>Registros: <strong>{fil.length}</strong></span><span>Total: <strong style={{ color: "var(--red)" }}>{fmt$(tot)}</strong></span></div>
      <div className="card-body">
        {fil.length === 0 ? <div className="empty"><div className="empty-icon">💵</div><p>Sin gastos registrados</p></div> :
          <table>
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Monto</th><th>Proveedor</th><th>Responsable</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(g => {
              const prov = (proveedores||[]).find(p => p.id === g.proveedorId);
              return (
              <tr key={g.id}>
                <td style={{ fontSize: 12 }}>{g.fecha || "—"}</td>
                <td><Bdg c="bo" t={g.tipo} /></td>
                <td style={{ fontSize: 12 }}>{g.descripcion || "—"}</td>
                <td style={{ color: "var(--red)", fontWeight: 700 }}>{fmt$(g.monto)}</td>
                <td style={{ fontSize: 11 }}>{prov ? <Bdg c="bp" t={prov.nombre} /> : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                <td style={{ fontSize: 12 }}>{g.responsable || "—"}</td>
                <td><div className="acts"><button className="btn btn-ghost btn-sm" onClick={() => onEdit(g)}>✏️</button><button className="btn btn-red btn-sm" onClick={() => onDelete(g.id)}>🗑</button></div></td>
              </tr>
            )})}</tbody>
          </table>}
      </div>
    </div>
  );
}

function MaintPage({ units, maints, proveedores, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState(""); const [pf, setPf] = useState("TODOS"); const [rf, setRf] = useState("TODOS");
  const fil = maints.filter(m => { const u = units.find(u => u.id === m.unidadId) || {}; return (m.desc + (m.taller||"") + (u.placas || "") + (u.num || "")).toLowerCase().includes(q.toLowerCase()) && (pf === "TODOS" || m.prioridad === pf) && (rf === "TODOS" || m.realizado === rf) });
  const total = fil.reduce((a, m) => a + (Number(m.costoRef) || 0) + (Number(m.costoMO) || 0), 0);
  return (
    <div className="card">
      <div className="card-hdr"><h3>🔧 Mantenimientos ({maints.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{ color: "var(--muted)" }}>🔍</span><input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className="btn btn-cyan" onClick={onAdd}>+ Nuevo</button>
        </div>
      </div>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div className="ftabs"><span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>PRIORIDAD:</span>{["TODOS", ...PRIOS].map(p => <button key={p} className={`ftab${pf === p ? " on" : ""}`} onClick={() => setPf(p)}>{p}</button>)}</div>
        <div className="ftabs"><span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>ESTADO:</span>{[["TODOS", "Todos"], ["SI", "Realizado"], ["NO", "Pendiente"]].map(([v, l]) => <button key={v} className={`ftab${rf === v ? " on" : ""}`} onClick={() => setRf(v)}>{l}</button>)}</div>
      </div>
      <div className="sbar"><span>Total: <strong>{fil.length}</strong></span><span>Pendientes: <strong style={{ color: "var(--yellow)" }}>{fil.filter(m => m.realizado === "NO").length}</strong></span><span>Alta prio: <strong style={{ color: "var(--red)" }}>{fil.filter(m => m.prioridad === "ALTA" && m.realizado === "NO").length}</strong></span><span>Costo: <strong style={{ color: "var(--orange)" }}>{fmt$(total)}</strong></span></div>
      <div className="card-body">
        {fil.length === 0 ? <div className="empty"><div className="empty-icon">🔧</div><p>Sin resultados</p></div> :
          <table>
            <thead><tr><th>Unidad</th><th>Tipo</th><th>Descripción</th><th>Prioridad</th><th>F.Prog</th><th>F.Ejec</th><th>Realizado</th><th>Proveedor</th><th>Costo Total</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(m => { 
              const u = units.find(u => u.id === m.unidadId); 
              const prov = (proveedores||[]).find(p => p.id === m.proveedorId);
              const ct = (Number(m.costoRef) || 0) + (Number(m.costoMO) || 0); return (
              <tr key={m.id}>
                <td><strong>{u?.num || "?"}</strong> <span style={{ fontSize: 11, color: "var(--muted)" }}>{u?.placas}</span></td>
                <td><Bdg c="bb" t={m.tipo} /></td>
                <td style={{ maxWidth: 200, fontSize: 12 }}>{m.desc}</td>
                <td>{prioBdg(m.prioridad)}</td>
                <td style={{ fontSize: 12 }}>{m.fechaProg || "—"}</td>
                <td style={{ fontSize: 12, color: m.fechaEjec ? "var(--green)" : "var(--muted)", fontWeight: 600 }}>{m.fechaEjec || "Pendiente"}</td>
                <td>{realBdg(m.realizado)}</td>
                <td style={{ fontSize: 11 }}>{prov ? <Bdg c="bo" t={prov.nombre} /> : (m.taller ? <span style={{ color: "var(--muted)" }}>{m.taller}</span> : "—")}</td>
                <td style={{ color: ct > 0 ? "var(--orange)" : "var(--muted)", fontWeight: 700 }}>{ct > 0 ? fmt$(ct) : "—"}</td>
                <td><div className="acts"><button className="btn btn-ghost btn-sm" onClick={() => onEdit(m)}>✏️</button><button className="btn btn-red btn-sm" onClick={() => onDelete(m.id)}>🗑</button></div></td>
              </tr>
            )})}</tbody>
          </table>}
      </div>
    </div>
  );
}

function FuelPage({ units, fuels, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState(""); const [uf, setUf] = useState("TODOS");
  const fil = fuels.filter(f => { const u = units.find(u => u.id === f.unidadId) || {}; return (f.estacion + f.ticket + (u.placas || "")).toLowerCase().includes(q.toLowerCase()) && (uf === "TODOS" || f.unidadId === uf) });
  const totL = fil.reduce((a, f) => a + (Number(f.litros) || 0), 0);
  const totC = fil.reduce((a, f) => a + (Number(f.litros) || 0) * (Number(f.precio) || 0), 0);
  const vr = fil.filter(f => f.kmRec && f.litros);
  const avgR = vr.length ? vr.reduce((a, f) => a + Number(f.kmRec) / Number(f.litros), 0) / vr.length : 0;
  return (
    <div className="card">
      <div className="card-hdr"><h3>⛽ Combustible ({fuels.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{ color: "var(--muted)" }}>🔍</span><input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className="btn btn-orange" onClick={onAdd}>+ Nueva Carga</button>
        </div>
      </div>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
        <div className="ftabs"><button className={`ftab${uf === "TODOS" ? " on" : ""}`} onClick={() => setUf("TODOS")}>Todas</button>{units.map(u => <button key={u.id} className={`ftab${uf === u.id ? " on" : ""}`} onClick={() => setUf(u.id)}>{u.num} {u.placas}</button>)}</div>
      </div>
      <div className="sbar"><span>Cargas: <strong>{fil.length}</strong></span><span>Litros: <strong style={{ color: "var(--cyan)" }}>{totL.toLocaleString("es-MX", { maximumFractionDigits: 1 })} L</strong></span><span>Gasto: <strong style={{ color: "var(--orange)" }}>{fmt$(totC)}</strong></span>{avgR > 0 && <span>Rend. Prom.: <strong style={{ color: "var(--green)" }}>{avgR.toFixed(2)} km/L</strong></span>}</div>
      <div className="card-body">
        {fil.length === 0 ? <div className="empty"><div className="empty-icon">⛽</div><p>Sin registros</p></div> :
          <table>
            <thead><tr><th>Unidad</th><th>Fecha</th><th>Litros</th><th>Precio/L</th><th>Costo Total</th><th>KM Rec.</th><th>Rendimiento</th><th>Estación</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(f => { const u = units.find(u => u.id === f.unidadId); const c = (Number(f.litros) || 0) * (Number(f.precio) || 0); const r = f.kmRec && f.litros ? (Number(f.kmRec) / Number(f.litros)) : null; return (
              <tr key={f.id}>
                <td><strong>{u?.num || "?"}</strong> <span style={{ fontSize: 11, color: "var(--muted)" }}>{u?.placas}</span></td>
                <td style={{ fontSize: 12 }}>{f.fecha || "—"}</td>
                <td style={{ color: "var(--cyan)", fontWeight: 700 }}>{Number(f.litros).toLocaleString("es-MX")} L</td>
                <td style={{ fontSize: 12 }}>{f.precio ? `$${Number(f.precio).toFixed(2)}` : "—"}</td>
                <td style={{ color: "var(--orange)", fontWeight: 700 }}>{c > 0 ? fmt$(c) : "—"}</td>
                <td style={{ fontSize: 12 }}>{f.kmRec ? fmtN(f.kmRec) + " km" : "—"}</td>
                <td style={{ color: r ? (r > 6 ? "var(--green)" : "var(--yellow)") : "var(--muted)", fontWeight: 700 }}>{r ? `${r.toFixed(2)} km/L` : "—"}</td>
                <td style={{ fontSize: 12, color: "var(--muted)" }}>{f.estacion || "—"}</td>
                <td><div className="acts"><button className="btn btn-ghost btn-sm" onClick={() => onEdit(f)}>✏️</button><button className="btn btn-red btn-sm" onClick={() => onDelete(f.id)}>🗑</button></div></td>
              </tr>
            )})}</tbody>
          </table>}
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  CHARTS PAGE v6  —  10 vistas de análisis
// ════════════════════════════════════════════════════════════════════════════
function ChartsPage({ units, maints, fuels, gastos, trips, facturas, clientes, drivers = [], proveedores = [], externos = [], nominasAdmin = [] }) {

  const hoy        = new Date();
  const anioActual = hoy.getFullYear();

  const [vistaTab,    setVistaTab]    = useState("resumen");
  const [filtroPer,   setFiltroPer]   = useState("mes");
  const [filtroAnio,  setFiltroAnio]  = useState(anioActual);
  const [filtroMes,   setFiltroMes]   = useState(hoy.getMonth());
  const [filtroTrim,  setFiltroTrim]  = useState(Math.floor(hoy.getMonth() / 3));
  const [filtroSemana,setFiltroSemana]= useState(() => { const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toISOString().slice(0,10); });
  const [customDe,    setCustomDe]    = useState("");
  const [customA,     setCustomA]     = useState("");

  // ── helpers ───────────────────────────────────────────────────────────────
  const todosAnios = [...new Set([
    ...facturas.map(f=>{ const d=toISO(f.fechaEmision); return d?new Date(d).getFullYear():null; }),
    ...gastos.map(g=>{ const d=toISO(g.fecha); return d?new Date(d).getFullYear():null; }),
    ...trips.map(t=>{ const d=toISO(t.fechaReg||t.fecha); return d?new Date(d).getFullYear():null; }),
    ...maints.map(m=>{ const d=toISO(m.fechaEjec); return d?new Date(d).getFullYear():null; }),
    anioActual
  ].filter(Boolean))].sort((a,b)=>b-a);

  const getRango = () => {
    if (filtroPer==="custom"&&customDe&&customA) return { de:toISO(customDe), a:toISO(customA) };
    if (filtroPer==="semana") { const i=new Date(filtroSemana),f=new Date(i); f.setDate(f.getDate()+6); return { de:i.toISOString().slice(0,10), a:f.toISOString().slice(0,10) }; }
    if (filtroPer==="mes")    { const ini=`${filtroAnio}-${String(filtroMes+1).padStart(2,"0")}-01`, fin=new Date(filtroAnio,filtroMes+1,0).toISOString().slice(0,10); return { de:ini, a:fin }; }
    if (filtroPer==="trimestre") { const m0=filtroTrim*3, ini=`${filtroAnio}-${String(m0+1).padStart(2,"0")}-01`, fin=new Date(filtroAnio,m0+3,0).toISOString().slice(0,10); return { de:ini, a:fin }; }
    if (filtroPer==="anio") return { de:`${filtroAnio}-01-01`, a:`${filtroAnio}-12-31` };
    return { de:null, a:null };
  };
  const rango   = getRango();
  const enRango = (fechaStr) => {
    if (!rango.de||!rango.a) return true;
    const iso = toISO(fechaStr); if (!iso) return false;
    return iso>=rango.de && iso<=rango.a;
  };
  const lblPeriodo = () => {
    if (filtroPer==="semana") return `Semana del ${filtroSemana}`;
    if (filtroPer==="mes")    return `${MESES[filtroMes]} ${filtroAnio}`;
    if (filtroPer==="trimestre") return `Q${filtroTrim+1} ${filtroAnio}`;
    if (filtroPer==="anio")  return `Año ${filtroAnio}`;
    if (filtroPer==="custom"&&customDe&&customA) return `${customDe} → ${customA}`;
    return "Período";
  };

  // ── datos filtrados ────────────────────────────────────────────────────────
  const fFacturas  = facturas.filter(f=>enRango(f.fechaEmision));
  const fFactPag   = facturas.filter(f=>f.status==="PAGADA"&&enRango(f.fechaPago));
  const fGastos    = gastos.filter(g=>enRango(g.fecha));
  const fFuels     = fuels.filter(f=>enRango(f.fecha));
  const fMaints    = maints.filter(m=>enRango(m.fechaEjec));
  const fTrips     = trips.filter(t=>t.status==="COMPLETADO"&&enRango(t.fechaReg||t.fecha));
  const fTripsProp = fTrips.filter(t=>!t.esExterno);
  const fTripsExt  = fTrips.filter(t=>t.esExterno);

  // totales
  const totFacturado = fFacturas.reduce((a,f)=>a+(Number(f.total)||0),0);
  const totCobrado   = fFactPag.reduce((a,f)=>a+(Number(f.total)||0),0);
  const totPendFact  = fFacturas.filter(f=>f.status==="PENDIENTE"||f.status==="VENCIDA").reduce((a,f)=>a+(Number(f.total)||0),0);
  const totGastos    = fGastos.reduce((a,g)=>a+(Number(g.monto)||0),0);
  const totComb      = fFuels.reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0);
  const totLitros    = fFuels.reduce((a,f)=>a+(Number(f.litros)||0),0);
  const totMant      = fMaints.reduce((a,m)=>a+(Number(m.costoRef)||0)+(Number(m.costoMO)||0),0);
  const totIngresos  = fTrips.reduce((a,t)=>a+(Number(t.costoOfrecido)||0),0);
  const totCostoViaj = fTrips.reduce((a,t)=>a+(Number(t.gastosExtras)||0)+(Number(t.costoEstadias)||0)+(Number(t.costoPagar)||0),0);
  const totCostoOper = totComb+totMant+totGastos+totCostoViaj;
  const utilidadBruta= totIngresos-totCostoOper;
  const margen       = totIngresos>0?((utilidadBruta/totIngresos)*100).toFixed(1):0;

  // nómina estimada del período
  const nomPorDriver = drivers.map(d=>{
    const unit   = units.find(u=>u.operador===d.id);
    const viajesD= unit?fTripsProp.filter(t=>t.unidadId===unit.id):[];
    const comision= viajesD.reduce((a,t)=>a+(Number(t.costoOfrecido)||0),0)*(Number(d.porcentajeViaje)||0)/100;
    const sueldo = Number(d.sueldoBase)||0;
    return { driver:d, unit, viajesD, comision, sueldo, total:sueldo+comision };
  }).filter(x=>x.sueldo>0||x.comision>0);
  const totNomina     = nomPorDriver.reduce((a,x)=>a+x.total,0);
  const totNominaAdmin= nominasAdmin.reduce((a,n)=>a+(Number(n.sueldoBruto)||0),0);

  // datos por mes (año completo para el año seleccionado)
  const meses12 = Array(12).fill(0).map((_,i)=>{
    const yr = filtroAnio;
    const byMes = (arr, fechaFn) => arr.filter(x=>{ const d=toISO(fechaFn(x)); return d&&new Date(d).getFullYear()===yr&&new Date(d).getMonth()===i; });
    const mFuel  = byMes(fuels, f=>f.fecha).reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0);
    const mMaint = byMes(maints,m=>m.fechaEjec).reduce((a,m)=>a+(Number(m.costoRef)||0)+(Number(m.costoMO)||0),0);
    const mGast  = byMes(gastos,g=>g.fecha).reduce((a,g)=>a+(Number(g.monto)||0),0);
    const mIng   = byMes(trips.filter(t=>t.status==="COMPLETADO"),t=>t.fechaReg||t.fecha).reduce((a,t)=>a+(Number(t.costoOfrecido)||0),0);
    const mFact  = byMes(facturas,f=>f.fechaEmision).reduce((a,f)=>a+(Number(f.total)||0),0);
    const mViaj  = byMes(trips.filter(t=>t.status==="COMPLETADO"&&!t.esExterno),t=>t.fechaReg||t.fecha).length;
    const mExt   = byMes(trips.filter(t=>t.status==="COMPLETADO"&&t.esExterno),t=>t.fechaReg||t.fecha).length;
    const mLit   = byMes(fuels,f=>f.fecha).reduce((a,f)=>a+(Number(f.litros)||0),0);
    const mMantN = byMes(maints,m=>m.fechaEjec).length;
    return { fuel:mFuel, maint:mMaint, gast:mGast, ing:mIng, fact:mFact, costos:mFuel+mMaint+mGast, viajes:mViaj, ext:mExt, litros:mLit, mantN:mMantN };
  });

  // colores palette
  const PAL = ["var(--cyan)","var(--orange)","var(--purple)","var(--yellow)","var(--green)","var(--red)","#06b6d4","#f97316","#8b5cf6","#eab308"];

  // ── componentes UI reutilizables ───────────────────────────────────────────
  const KR = ({ icon, lbl, val, sub, c="var(--cyan)" }) => (
    <div className="stat" style={{"--c":c}}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-val sm">{val}</div>
      <div className="stat-lbl">{lbl}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );

  // barra horizontal simple
  const HBar = ({ v, max, c="#06b6d4", h=10 }) => (
    <div style={{flex:1,height:h,background:"var(--bg3)",borderRadius:h/2,overflow:"hidden"}}>
      <div style={{width:`${Math.min((v/Math.max(max,1))*100,100)}%`,height:"100%",background:c,borderRadius:h/2,transition:"width .35s"}}/>
    </div>
  );

  // barra segmentada tipo "pie horizontal"
  const SegBar = ({ items, h=16 }) => {
    const tot = items.reduce((a,x)=>a+x.v,0)||1;
    return (
      <div style={{display:"flex",height:h,borderRadius:h/2,overflow:"hidden",gap:1}}>
        {items.map((x,i)=>(
          <div key={i} title={`${x.lbl}: ${fmt$(x.v)} (${((x.v/tot)*100).toFixed(0)}%)`}
            style={{width:`${(x.v/tot)*100}%`,background:x.c,cursor:"default",transition:"width .35s"}}/>
        ))}
      </div>
    );
  };

  // Fila de leyenda para SegBar
  const Legend = ({ items }) => (
    <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",marginTop:8}}>
      {items.map((x,i)=>(
        <span key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}>
          <span style={{width:10,height:10,borderRadius:"50%",background:x.c,display:"inline-block",flexShrink:0}}/>
          <span style={{color:"var(--muted)"}}>{x.lbl}</span>
          <strong style={{color:x.c}}>{fmt$(x.v)}</strong>
        </span>
      ))}
    </div>
  );

  // ── control de período ─────────────────────────────────────────────────────
  const ControlPer = () => (
    <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",padding:"12px 16px",background:"var(--bg2)",borderRadius:10,marginBottom:16,border:"1px solid var(--border)"}}>
      <div className="ftabs">
        {[["semana","Semana"],["mes","Mes"],["trimestre","Trimestre"],["anio","Año"],["custom","Personalizado"]].map(([k,l])=>(
          <button key={k} className={`ftab${filtroPer===k?" on":""}`} onClick={()=>setFiltroPer(k)}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        {filtroPer!=="custom"&&filtroPer!=="semana"&&(
          <select value={filtroAnio} onChange={e=>setFiltroAnio(Number(e.target.value))} style={{padding:"4px 10px",borderRadius:6,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)",fontSize:13}}>
            {todosAnios.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        )}
        {filtroPer==="mes"&&(
          <select value={filtroMes} onChange={e=>setFiltroMes(Number(e.target.value))} style={{padding:"4px 10px",borderRadius:6,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)",fontSize:13}}>
            {MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
        )}
        {filtroPer==="trimestre"&&(
          <select value={filtroTrim} onChange={e=>setFiltroTrim(Number(e.target.value))} style={{padding:"4px 10px",borderRadius:6,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)",fontSize:13}}>
            <option value={0}>Q1 Ene-Mar</option><option value={1}>Q2 Abr-Jun</option>
            <option value={2}>Q3 Jul-Sep</option><option value={3}>Q4 Oct-Dic</option>
          </select>
        )}
        {filtroPer==="semana"&&(
          <input type="date" value={filtroSemana} onChange={e=>setFiltroSemana(e.target.value)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)",fontSize:13}}/>
        )}
        {filtroPer==="custom"&&(
          <>
            <input type="text" placeholder="De dd/mm/aaaa" value={customDe} onChange={e=>setCustomDe(e.target.value)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)",fontSize:13,width:130}}/>
            <span style={{color:"var(--muted)"}}>→</span>
            <input type="text" placeholder="A dd/mm/aaaa" value={customA} onChange={e=>setCustomA(e.target.value)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid var(--border)",background:"var(--bg0)",color:"var(--text)",fontSize:13,width:130}}/>
          </>
        )}
        <span style={{fontSize:12,color:"var(--cyan)",fontWeight:700,marginLeft:4}}>📅 {lblPeriodo()}</span>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  //  1. RESUMEN EJECUTIVO
  // ══════════════════════════════════════════════════════════════
  const VistaResumen = () => {
    const maxBar = Math.max(...meses12.map(m=>Math.max(m.ing,m.costos,m.fact)),1);
    const segCostos = [
      {v:totComb,     c:"var(--cyan)",  lbl:"⛽ Combustible"},
      {v:totMant,     c:"var(--orange)",lbl:"🔧 Mantenimiento"},
      {v:totGastos,   c:"var(--purple)",lbl:"💸 Gastos grales"},
      {v:totCostoViaj,c:"var(--yellow)",lbl:"🚛 Gastos viajes"},
    ];
    const segCartera = [
      {v:totCobrado,    c:"var(--green)", lbl:"✅ Cobrado"},
      {v:totPendFact,   c:"var(--orange)",lbl:"⏳ Pendiente"},
      {v:fFacturas.filter(f=>f.status==="VENCIDA").reduce((a,f)=>a+(Number(f.total)||0),0), c:"var(--red)",lbl:"❌ Vencido"},
    ];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* KPIs */}
        <div className="stats">
          <KR icon="💵" lbl="Ingresos" val={fmt$(totIngresos)} sub={`${fTrips.length} viajes`} c="var(--green)"/>
          <KR icon="📉" lbl="Costo operación" val={fmt$(totCostoOper)} c="var(--red)"/>
          <KR icon="💰" lbl="Utilidad bruta" val={fmt$(utilidadBruta)} sub={`${margen}% margen`} c={utilidadBruta>=0?"var(--cyan)":"var(--red)"}/>
          <KR icon="🧾" lbl="Facturado" val={fmt$(totFacturado)} sub={`${fFacturas.length} fact.`} c="var(--yellow)"/>
          <KR icon="✅" lbl="Cobrado" val={fmt$(totCobrado)} c="var(--green)"/>
          <KR icon="⏳" lbl="Por cobrar" val={fmt$(totPendFact)} c="var(--orange)"/>
          <KR icon="👷" lbl="Nómina est." val={fmt$(totNomina+totNominaAdmin)} c="var(--purple)"/>
          <KR icon="⛽" lbl="Combustible" val={fmt$(totComb)} sub={`${totLitros.toFixed(0)}L`} c="var(--cyan)"/>
          <KR icon="🔧" lbl="Mantenimiento" val={fmt$(totMant)} c="var(--orange)"/>
        </div>

        {/* Gráfica ingresos vs costos 12 meses */}
        <div className="card">
          <div className="card-hdr"><h3>📊 Ingresos vs Costos vs Facturación — {filtroAnio}</h3></div>
          <div style={{padding:"16px 20px"}}>
            {MESES.map((m,i)=>{
              const d=meses12[i]; const util=d.ing-d.costos;
              return (
                <div key={m} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:10}}>
                  <div style={{width:28,fontSize:9,color:"var(--muted)",fontWeight:700,paddingTop:2}}>{m.slice(0,3)}</div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
                    {[
                      [d.ing,"var(--green)","Ingresos"],
                      [d.costos,"var(--red)","Costos"],
                      [Math.abs(util),util>=0?"var(--cyan)":"var(--orange)",(util>=0?"":"−")+"Utilidad"],
                      [d.fact,"var(--yellow)","Facturado"],
                    ].map(([v,c,nm],j)=>(
                      <div key={j} style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:64,fontSize:9,color:c}}>{nm}</div>
                        <HBar v={v} max={maxBar} c={c} h={9}/>
                        <div style={{width:82,textAlign:"right",fontSize:9,fontWeight:700,color:c}}>{v>0?fmt$(v):"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div style={{display:"flex",gap:14,marginTop:4,paddingLeft:36,flexWrap:"wrap"}}>
              {[["💵 Ingresos","var(--green)"],["📉 Costos","var(--red)"],["💰 Utilidad","var(--cyan)"],["🧾 Facturado","var(--yellow)"]].map(([l,c])=>(
                <span key={l} style={{fontSize:11,color:c,fontWeight:600}}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 2 cards lado a lado */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* Distribución costos */}
          <div className="card">
            <div className="card-hdr"><h3>🥧 Distribución de Costos</h3></div>
            <div style={{padding:"16px 20px"}}>
              <SegBar items={segCostos} h={18}/>
              <Legend items={segCostos}/>
              <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
                {segCostos.map(x=>(
                  <div key={x.lbl} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:x.c,flexShrink:0}}/>
                    <div style={{flex:1,fontSize:12}}>{x.lbl}</div>
                    <HBar v={x.v} max={totCostoOper} c={x.c} h={7}/>
                    <div style={{width:85,textAlign:"right",fontSize:11,fontWeight:700,color:x.c}}>{fmt$(x.v)}</div>
                    <div style={{width:34,textAlign:"right",fontSize:10,color:"var(--muted)"}}>{totCostoOper>0?`${((x.v/totCostoOper)*100).toFixed(0)}%`:"—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Cartera */}
          <div className="card">
            <div className="card-hdr"><h3>💳 Estado de Cartera</h3></div>
            <div style={{padding:"16px 20px"}}>
              <SegBar items={segCartera} h={18}/>
              <Legend items={segCartera}/>
              <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
                {segCartera.map(x=>(
                  <div key={x.lbl} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:x.c,flexShrink:0}}/>
                    <div style={{flex:1,fontSize:12}}>{x.lbl}</div>
                    <HBar v={x.v} max={totFacturado} c={x.c} h={7}/>
                    <div style={{width:85,textAlign:"right",fontSize:11,fontWeight:700,color:x.c}}>{fmt$(x.v)}</div>
                  </div>
                ))}
              </div>
              <div style={{borderTop:"1px solid var(--border)",paddingTop:8,marginTop:8,display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"var(--muted)"}}>Eficiencia cobranza</span>
                <strong style={{color:"var(--green)"}}>{totFacturado>0?`${((totCobrado/totFacturado)*100).toFixed(0)}%`:"—"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  2. RENDIMIENTO DE FLOTA (por unidad)
  // ══════════════════════════════════════════════════════════════
  const VistaRendimiento = () => {
    const stats = units.map(u=>{
      const vUs     = fTripsProp.filter(t=>t.unidadId===u.id);
      const ingresos= vUs.reduce((a,t)=>a+(Number(t.costoOfrecido)||0),0);
      const km      = vUs.reduce((a,t)=>a+(Number(t.km)||0),0);
      const combU   = fFuels.filter(f=>f.unidadId===u.id);
      const litros  = combU.reduce((a,f)=>a+(Number(f.litros)||0),0);
      const costComb= combU.reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0);
      const maintU  = fMaints.filter(m=>m.unidadId===u.id).reduce((a,m)=>a+(Number(m.costoRef)||0)+(Number(m.costoMO)||0),0);
      const costos  = costComb+maintU;
      const utilidad= ingresos-costos;
      const rendL   = km>0?(litros/km*100).toFixed(2):null;
      const ingKm   = km>0?(ingresos/km).toFixed(2):null;
      return { ...u, viajes:vUs.length, ingresos, km, litros, costComb, maintU, costos, utilidad, rendL, ingKm };
    }).sort((a,b)=>b.ingresos-a.ingresos);

    const maxIng = Math.max(...stats.map(s=>s.ingresos),1);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="stats">
          <KR icon="🚛" lbl="Unidades activas" val={stats.filter(s=>s.viajes>0).length} sub={`de ${units.length} total`} c="var(--cyan)"/>
          <KR icon="🗺️" lbl="Viajes propios" val={fTripsProp.length} c="var(--green)"/>
          <KR icon="⛽" lbl="Combustible total" val={`${totLitros.toFixed(0)}L`} sub={fmt$(totComb)} c="var(--yellow)"/>
          <KR icon="🔧" lbl="Mantenimientos" val={fMaints.length} sub={fmt$(totMant)} c="var(--orange)"/>
        </div>

        {/* barras comparativas por unidad */}
        <div className="card">
          <div className="card-hdr"><h3>📊 Ingresos Comparativos por Unidad — {lblPeriodo()}</h3></div>
          <div style={{padding:"16px 20px"}}>
            {stats.filter(s=>s.ingresos>0).length===0
              ? <div className="empty"><div className="empty-icon">🚛</div><p>Sin viajes en el período</p></div>
              : stats.filter(s=>s.ingresos>0).map((s,i)=>(
              <div key={s.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
                  <span style={{fontWeight:700}}>{s.num} <span style={{color:"var(--muted)",fontWeight:400}}>{s.placas}</span> <span style={{fontSize:10,color:"var(--muted)"}}>{s.tipo}</span></span>
                  <span style={{color:"var(--green)",fontWeight:700}}>{fmt$(s.ingresos)} · {s.viajes}v</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <div style={{width:56,fontSize:9,color:"var(--green)"}}>Ingresos</div>
                    <HBar v={s.ingresos} max={maxIng} c="var(--green)" h={9}/>
                    <div style={{width:80,textAlign:"right",fontSize:9,fontWeight:700,color:"var(--green)"}}>{fmt$(s.ingresos)}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <div style={{width:56,fontSize:9,color:"var(--red)"}}>Costos</div>
                    <HBar v={s.costos} max={maxIng} c="var(--red)" h={9}/>
                    <div style={{width:80,textAlign:"right",fontSize:9,fontWeight:700,color:"var(--red)"}}>{fmt$(s.costos)}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <div style={{width:56,fontSize:9,color:s.utilidad>=0?"var(--cyan)":"var(--orange)"}}>Utilidad</div>
                    <HBar v={Math.abs(s.utilidad)} max={maxIng} c={s.utilidad>=0?"var(--cyan)":"var(--orange)"} h={9}/>
                    <div style={{width:80,textAlign:"right",fontSize:9,fontWeight:700,color:s.utilidad>=0?"var(--cyan)":"var(--orange)"}}>{s.utilidad>=0?"":"-"}{fmt$(Math.abs(s.utilidad))}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:12,marginTop:3,fontSize:10,color:"var(--muted)"}}>
                  {s.rendL&&<span>🔥 {s.rendL}L/100km</span>}
                  {s.ingKm&&<span>💲${s.ingKm}/km</span>}
                  <span>🔧 {fmt$(s.maintU)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* tabla detalle */}
        <div className="card">
          <div className="card-hdr"><h3>📋 Tabla Detalle Unidades</h3></div>
          <div className="card-body" style={{padding:0}}>
            <table>
              <thead><tr><th>Unidad</th><th>Tipo</th><th>Viajes</th><th>Km</th><th>Ingresos</th><th>Comb $</th><th>Mant $</th><th>Utilidad</th><th>L/100km</th><th>$/km</th></tr></thead>
              <tbody>
                {stats.length===0
                  ? <tr><td colSpan={10} style={{textAlign:"center",color:"var(--muted)",padding:20}}>Sin datos</td></tr>
                  : stats.map(s=>(
                  <tr key={s.id}>
                    <td><strong>{s.num}</strong><div style={{fontSize:10,color:"var(--muted)"}}>{s.placas}</div></td>
                    <td style={{fontSize:11}}><Bdg c="bb" t={s.tipo||"—"}/></td>
                    <td style={{textAlign:"center",fontWeight:700,color:"var(--cyan)"}}>{s.viajes}</td>
                    <td style={{fontSize:12}}>{s.km>0?`${s.km.toLocaleString()}`:"-"}</td>
                    <td style={{fontWeight:700,color:"var(--green)"}}>{fmt$(s.ingresos)}</td>
                    <td style={{color:"var(--yellow)",fontSize:12}}>{fmt$(s.costComb)}</td>
                    <td style={{color:"var(--orange)",fontSize:12}}>{fmt$(s.maintU)}</td>
                    <td style={{fontWeight:700,color:s.utilidad>=0?"var(--cyan)":"var(--red)"}}>{fmt$(s.utilidad)}</td>
                    <td style={{fontSize:11,color:"var(--muted)"}}>{s.rendL?`${s.rendL}L`:"—"}</td>
                    <td style={{fontSize:11,color:"var(--muted)"}}>{s.ingKm?`$${s.ingKm}`:"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  3. OPERADORES / CONDUCTORES
  // ══════════════════════════════════════════════════════════════
  const VistaOperadores = () => {
    const stats = drivers.map(d=>{
      const unit    = units.find(u=>u.operador===d.id);
      const vUs     = unit?fTripsProp.filter(t=>t.unidadId===unit.id):[];
      const ingresos= vUs.reduce((a,t)=>a+(Number(t.costoOfrecido)||0),0);
      const km      = vUs.reduce((a,t)=>a+(Number(t.km)||0),0);
      const comision= ingresos*(Number(d.porcentajeViaje)||0)/100;
      const sueldo  = Number(d.sueldoBase)||0;
      const destinos= [...new Set(vUs.map(t=>t.destino).filter(Boolean))].length;
      return { ...d, unit, viajes:vUs.length, ingresos, km, comision, sueldo, total:sueldo+comision, destinos };
    }).sort((a,b)=>b.ingresos-a.ingresos);

    const maxIng  = Math.max(...stats.map(s=>s.ingresos),1);
    const maxViaj = Math.max(...stats.map(s=>s.viajes),1);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="stats">
          <KR icon="👨‍✈️" lbl="Operadores" val={drivers.length} sub={`${stats.filter(s=>s.viajes>0).length} activos`} c="var(--cyan)"/>
          <KR icon="🗺️" lbl="Viajes propios" val={fTripsProp.length} c="var(--green)"/>
          <KR icon="💰" lbl="Nómina total" val={fmt$(totNomina)} c="var(--purple)"/>
          <KR icon="🎯" lbl="Ingreso promedio" val={stats.filter(s=>s.viajes>0).length>0?fmt$(totIngresos/stats.filter(s=>s.viajes>0).length):"—"} c="var(--yellow)"/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* ranking ingresos */}
          <div className="card">
            <div className="card-hdr"><h3>🏆 Ranking por Ingresos Generados</h3></div>
            <div style={{padding:"16px 20px"}}>
              {stats.length===0 ? <div className="empty"><p>Sin operadores</p></div>
              : stats.map((s,i)=>(
                <div key={s.id} style={{marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:i===0?"#f4c542":i===1?"#b0bec5":i===2?"#cd7f32":"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:i<3?"#000":"var(--muted)",flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1,fontWeight:700,fontSize:12}}>{s.nombre}</div>
                    <div style={{fontSize:11,color:"var(--green)",fontWeight:700}}>{fmt$(s.ingresos)}</div>
                  </div>
                  <div style={{paddingLeft:28}}>
                    <HBar v={s.ingresos} max={maxIng} c={i===0?"#f4c542":i===1?"#b0bec5":i===2?"#cd7f32":"var(--cyan)"} h={8}/>
                    <div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>{s.viajes} viajes · {s.km>0?`${s.km.toLocaleString()}km`:"sin km"} · {s.destinos} destinos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ranking viajes */}
          <div className="card">
            <div className="card-hdr"><h3>🗺️ Ranking por Viajes Realizados</h3></div>
            <div style={{padding:"16px 20px"}}>
              {stats.length===0 ? <div className="empty"><p>Sin operadores</p></div>
              : [...stats].sort((a,b)=>b.viajes-a.viajes).map((s,i)=>(
                <div key={s.id} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                    <span style={{fontWeight:700}}>{s.nombre}</span>
                    <span style={{color:"var(--cyan)",fontWeight:700}}>{s.viajes} viajes</span>
                  </div>
                  <HBar v={s.viajes} max={maxViaj} c="var(--cyan)" h={8}/>
                  <div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>Base: {fmt$(s.sueldo)} · Comisión: {fmt$(s.comision)} → Total: {fmt$(s.total)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* tabla detalle */}
        <div className="card">
          <div className="card-hdr"><h3>📋 Detalle Operadores — {lblPeriodo()}</h3></div>
          <div className="card-body" style={{padding:0}}>
            <table>
              <thead><tr><th>Operador</th><th>Unidad</th><th>Viajes</th><th>Km</th><th>Ingresos</th><th>Sueldo base</th><th>Comisión</th><th>Costo total</th><th>Destinos únicos</th></tr></thead>
              <tbody>
                {stats.length===0
                  ? <tr><td colSpan={9} style={{textAlign:"center",color:"var(--muted)",padding:20}}>Sin datos</td></tr>
                  : stats.map(s=>(
                  <tr key={s.id}>
                    <td><strong style={{fontSize:12}}>{s.nombre}</strong><div style={{fontSize:10,color:"var(--muted)"}}>{s.licTipo||"—"}</div></td>
                    <td style={{fontSize:11}}>{s.unit?`${s.unit.num}·${s.unit.placas}`:"Sin asignar"}</td>
                    <td style={{textAlign:"center",fontWeight:700,color:"var(--cyan)"}}>{s.viajes}</td>
                    <td style={{fontSize:12}}>{s.km>0?`${s.km.toLocaleString()} km`:"—"}</td>
                    <td style={{fontWeight:700,color:"var(--green)"}}>{fmt$(s.ingresos)}</td>
                    <td style={{fontSize:12}}>{fmt$(s.sueldo)}</td>
                    <td style={{color:"var(--purple)",fontSize:12}}>{fmt$(s.comision)}<div style={{fontSize:9,color:"var(--muted)"}}>{s.porcentajeViaje||0}%</div></td>
                    <td style={{fontWeight:700,color:"var(--orange)"}}>{fmt$(s.total)}</td>
                    <td style={{textAlign:"center"}}>{s.destinos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  4. COMBUSTIBLE & RENDIMIENTO
  // ══════════════════════════════════════════════════════════════
  const VistaCombustible = () => {
    const porUnidad = units.map(u=>{
      const fUs    = fFuels.filter(f=>f.unidadId===u.id);
      const litros = fUs.reduce((a,f)=>a+(Number(f.litros)||0),0);
      const costo  = fUs.reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0);
      const vUs    = fTripsProp.filter(t=>t.unidadId===u.id);
      const km     = vUs.reduce((a,t)=>a+(Number(t.km)||0),0);
      const rend   = km>0?(litros/km*100).toFixed(2):null;
      const precProm=litros>0?(costo/litros).toFixed(2):null;
      return { ...u, litros, costo, km, rend, precProm, cargas:fUs.length };
    }).filter(u=>u.litros>0).sort((a,b)=>b.litros-a.litros);

    const maxLit = Math.max(...porUnidad.map(u=>u.litros),1);

    const precMeses = meses12.map((m,i)=>{
      const lit  = m.litros;
      const cost = m.fuel;
      return { lbl:MESES[i].slice(0,3), lit, prec:lit>0?(cost/lit).toFixed(2):0, cost };
    });
    const maxPrec = Math.max(...precMeses.map(m=>Number(m.prec)),1);
    const maxLitM = Math.max(...meses12.map(m=>m.litros),1);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="stats">
          <KR icon="⛽" lbl="Litros cargados" val={`${totLitros.toFixed(0)}L`} sub={`${fFuels.length} cargas`} c="var(--cyan)"/>
          <KR icon="💵" lbl="Gasto combustible" val={fmt$(totComb)} c="var(--yellow)"/>
          <KR icon="📊" lbl="Precio promedio" val={totLitros>0?`$${(totComb/totLitros).toFixed(2)}/L`:"—"} c="var(--orange)"/>
          <KR icon="🏭" lbl="Unidades con carga" val={porUnidad.length} c="var(--green)"/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* consumo por unidad */}
          <div className="card">
            <div className="card-hdr"><h3>⛽ Consumo por Unidad — {lblPeriodo()}</h3></div>
            <div style={{padding:"16px 20px"}}>
              {porUnidad.length===0
                ? <div className="empty"><div className="empty-icon">⛽</div><p>Sin cargas en el período</p></div>
                : porUnidad.map(u=>(
                <div key={u.id} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                    <span style={{fontWeight:700}}>{u.num} <span style={{color:"var(--muted)",fontWeight:400,fontSize:10}}>{u.placas}</span></span>
                    <span style={{color:"var(--cyan)",fontWeight:700}}>{u.litros.toFixed(0)}L — {fmt$(u.costo)}</span>
                  </div>
                  <HBar v={u.litros} max={maxLit} c="var(--cyan)" h={10}/>
                  <div style={{display:"flex",gap:10,marginTop:3,fontSize:10,color:"var(--muted)"}}>
                    <span>{u.cargas} cargas</span>
                    {u.rend&&<span>🔥 {u.rend}L/100km</span>}
                    {u.precProm&&<span>💲${u.precProm}/L</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* precio/litro por mes */}
          <div className="card">
            <div className="card-hdr"><h3>📈 Precio Promedio por Litro — {filtroAnio}</h3></div>
            <div style={{padding:"16px 20px"}}>
              {precMeses.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:28,fontSize:10,color:"var(--muted)",fontWeight:700}}>{m.lbl}</div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <HBar v={Number(m.prec)} max={maxPrec} c="var(--yellow)" h={8}/>
                      <div style={{width:52,textAlign:"right",fontSize:10,fontWeight:700,color:"var(--yellow)"}}>{m.prec>0?`$${m.prec}`:"—"}</div>
                    </div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <HBar v={meses12[i].litros} max={maxLitM} c="var(--cyan)" h={6}/>
                      <div style={{width:52,textAlign:"right",fontSize:9,color:"var(--cyan)"}}>{meses12[i].litros>0?`${meses12[i].litros.toFixed(0)}L`:"—"}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{display:"flex",gap:12,marginTop:6}}>
                <span style={{fontSize:10,color:"var(--yellow)"}}>■ Precio/L</span>
                <span style={{fontSize:10,color:"var(--cyan)"}}>■ Litros</span>
              </div>
            </div>
          </div>
        </div>

        {/* tabla */}
        <div className="card">
          <div className="card-hdr"><h3>📋 Detalle Combustible por Unidad</h3></div>
          <div className="card-body" style={{padding:0}}>
            <table>
              <thead><tr><th>Unidad</th><th>Tipo</th><th>Cargas</th><th>Litros</th><th>Costo total</th><th>Precio prom.</th><th>Km recorridos</th><th>Rendimiento</th></tr></thead>
              <tbody>
                {porUnidad.length===0
                  ? <tr><td colSpan={8} style={{textAlign:"center",color:"var(--muted)",padding:20}}>Sin cargas de combustible</td></tr>
                  : porUnidad.map(u=>(
                  <tr key={u.id}>
                    <td><strong>{u.num}</strong><div style={{fontSize:10,color:"var(--muted)"}}>{u.placas}</div></td>
                    <td><Bdg c="bb" t={u.tipo||"—"}/></td>
                    <td style={{textAlign:"center"}}>{u.cargas}</td>
                    <td style={{fontWeight:700,color:"var(--cyan)"}}>{u.litros.toFixed(0)}L</td>
                    <td style={{fontWeight:700,color:"var(--yellow)"}}>{fmt$(u.costo)}</td>
                    <td style={{color:"var(--muted)",fontSize:12}}>{u.precProm?`$${u.precProm}/L`:"—"}</td>
                    <td style={{fontSize:12}}>{u.km>0?`${u.km.toLocaleString()} km`:"—"}</td>
                    <td style={{fontWeight:700,color:u.rend&&Number(u.rend)<30?"var(--green)":"var(--orange)"}}>{u.rend?`${u.rend}L/100km`:"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  5. MANTENIMIENTOS
  // ══════════════════════════════════════════════════════════════
  const VistaMantenimientos = () => {
    const porUnidad = units.map(u=>{
      const mUs  = fMaints.filter(m=>m.unidadId===u.id);
      const cRef = mUs.reduce((a,m)=>a+(Number(m.costoRef)||0),0);
      const cMO  = mUs.reduce((a,m)=>a+(Number(m.costoMO)||0),0);
      return { ...u, n:mUs.length, cRef, cMO, total:cRef+cMO, servicios:mUs };
    }).filter(u=>u.n>0).sort((a,b)=>b.total-a.total);

    const porTipo = {};
    fMaints.forEach(m=>{ const t=m.tipo||"Otro"; porTipo[t]=(porTipo[t]||0)+(Number(m.costoRef)||0)+(Number(m.costoMO)||0); });
    const tipoArr = Object.entries(porTipo).sort((a,b)=>b[1]-a[1]);
    const maxTip  = Math.max(...tipoArr.map(([,v])=>v),1);
    const maxUni  = Math.max(...porUnidad.map(u=>u.total),1);

    const porMesM = meses12.map((m,i)=>({ lbl:MESES[i].slice(0,3), n:m.mantN, costo:m.maint }));
    const maxMM   = Math.max(...porMesM.map(m=>m.costo),1);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="stats">
          <KR icon="🔧" lbl="Servicios" val={fMaints.length} c="var(--orange)"/>
          <KR icon="💵" lbl="Costo total" val={fmt$(totMant)} c="var(--red)"/>
          <KR icon="🚛" lbl="Unidades atendidas" val={porUnidad.length} c="var(--cyan)"/>
          <KR icon="📊" lbl="Costo promedio" val={fMaints.length>0?fmt$(totMant/fMaints.length):"—"} c="var(--yellow)"/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* por tipo */}
          <div className="card">
            <div className="card-hdr"><h3>🔧 Costo por Tipo de Servicio</h3></div>
            <div style={{padding:"16px 20px"}}>
              {tipoArr.length===0 ? <div className="empty"><p>Sin mantenimientos</p></div>
              : <>
                <SegBar items={tipoArr.map(([,v],i)=>({v,c:PAL[i%PAL.length],lbl:""}))} h={14}/>
                <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
                  {tipoArr.map(([tipo,v],i)=>(
                    <div key={tipo} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:PAL[i%PAL.length],flexShrink:0}}/>
                      <div style={{flex:1,fontSize:12}}>{tipo}</div>
                      <HBar v={v} max={maxTip} c={PAL[i%PAL.length]} h={7}/>
                      <div style={{width:80,textAlign:"right",fontSize:11,fontWeight:700,color:PAL[i%PAL.length]}}>{fmt$(v)}</div>
                      <div style={{width:30,textAlign:"right",fontSize:10,color:"var(--muted)"}}>{totMant>0?`${((v/totMant)*100).toFixed(0)}%`:"—"}</div>
                    </div>
                  ))}
                </div>
              </>}
            </div>
          </div>

          {/* por mes */}
          <div className="card">
            <div className="card-hdr"><h3>📅 Mantenimientos por Mes — {filtroAnio}</h3></div>
            <div style={{padding:"16px 20px"}}>
              {porMesM.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:28,fontSize:10,color:"var(--muted)",fontWeight:700}}>{m.lbl}</div>
                  <HBar v={m.costo} max={maxMM} c="var(--orange)" h={10}/>
                  <div style={{width:75,textAlign:"right",fontSize:10,fontWeight:700,color:"var(--orange)"}}>{m.costo>0?fmt$(m.costo):"—"}</div>
                  <div style={{width:26,textAlign:"right",fontSize:9,color:"var(--muted)"}}>{m.n>0?`${m.n}sv`:""}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* por unidad */}
        <div className="card">
          <div className="card-hdr"><h3>🚛 Costo de Mantenimiento por Unidad — {lblPeriodo()}</h3></div>
          <div style={{padding:"16px 20px"}}>
            {porUnidad.length===0 ? <div className="empty"><div className="empty-icon">🔧</div><p>Sin mantenimientos en el período</p></div>
            : porUnidad.map(u=>(
              <div key={u.id} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                  <span style={{fontWeight:700}}>{u.num} <span style={{color:"var(--muted)",fontWeight:400}}>{u.placas}</span></span>
                  <span style={{color:"var(--red)",fontWeight:700}}>{fmt$(u.total)} ({u.n} serv.)</span>
                </div>
                <SegBar items={[{v:u.cRef,c:"var(--orange)",lbl:"Refac"},{v:u.cMO,c:"var(--red)",lbl:"M.O."}]} h={10}/>
                <div style={{display:"flex",gap:12,marginTop:3,fontSize:10,color:"var(--muted)"}}>
                  <span>Refacciones: {fmt$(u.cRef)}</span>
                  <span>Mano de obra: {fmt$(u.cMO)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  6. CLIENTES & FACTURACIÓN
  // ══════════════════════════════════════════════════════════════
  const VistaFacturas = () => {
    const porCliente = clientes.map(c=>{
      const fCli    = fFacturas.filter(f=>f.clienteId===c.id);
      const total   = fCli.reduce((a,f)=>a+(Number(f.total)||0),0);
      const cobrado = fCli.filter(f=>f.status==="PAGADA").reduce((a,f)=>a+(Number(f.total)||0),0);
      const pend    = total-cobrado;
      return { ...c, n:fCli.length, total, cobrado, pend };
    }).filter(c=>c.n>0).sort((a,b)=>b.total-a.total);
    const maxCli  = Math.max(...porCliente.map(c=>c.total),1);
    const maxFact = Math.max(...meses12.map(m=>m.fact),1);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="stats">
          <KR icon="🧾" lbl="Emitidas" val={fFacturas.length} sub={fmt$(totFacturado)} c="var(--yellow)"/>
          <KR icon="✅" lbl="Cobradas" val={fFactPag.length} sub={fmt$(totCobrado)} c="var(--green)"/>
          <KR icon="⏳" lbl="Pendientes" val={fFacturas.filter(f=>f.status==="PENDIENTE").length} sub={fmt$(fFacturas.filter(f=>f.status==="PENDIENTE").reduce((a,f)=>a+(Number(f.total)||0),0))} c="var(--orange)"/>
          <KR icon="❌" lbl="Vencidas" val={fFacturas.filter(f=>f.status==="VENCIDA").length} sub={fmt$(fFacturas.filter(f=>f.status==="VENCIDA").reduce((a,f)=>a+(Number(f.total)||0),0))} c="var(--red)"/>
        </div>

        {/* facturación mensual */}
        <div className="card">
          <div className="card-hdr"><h3>📈 Facturación Mensual — {filtroAnio}</h3></div>
          <div style={{padding:"16px 20px"}}>
            {meses12.map((m,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <div style={{width:28,fontSize:10,color:"var(--muted)",fontWeight:700}}>{MESES[i].slice(0,3)}</div>
                <HBar v={m.fact} max={maxFact} c="var(--yellow)" h={12}/>
                <div style={{width:88,textAlign:"right",fontSize:11,fontWeight:700,color:"var(--yellow)"}}>{m.fact>0?fmt$(m.fact):"—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* top clientes */}
        <div className="card">
          <div className="card-hdr"><h3>🏆 Top Clientes por Facturación — {lblPeriodo()}</h3></div>
          <div style={{padding:"16px 20px"}}>
            {porCliente.length===0 ? <div className="empty"><div className="empty-icon">👥</div><p>Sin facturas en el período</p></div>
            : porCliente.map((c,i)=>(
              <div key={c.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                  <span><span style={{color:"var(--muted)",marginRight:6}}>#{i+1}</span><strong>{c.nombre}</strong></span>
                  <span style={{color:"var(--yellow)",fontWeight:700}}>{fmt$(c.total)} · {c.n} fact.</span>
                </div>
                <SegBar items={[{v:c.cobrado,c:"var(--green)",lbl:"Cobrado"},{v:c.pend,c:"var(--orange)",lbl:"Pendiente"}]} h={10}/>
                <div style={{display:"flex",gap:12,marginTop:3,fontSize:10,color:"var(--muted)"}}>
                  <span style={{color:"var(--green)"}}>✅ {fmt$(c.cobrado)}</span>
                  <span style={{color:"var(--orange)"}}>⏳ {fmt$(c.pend)}</span>
                  <span>Cobrado: {c.total>0?`${((c.cobrado/c.total)*100).toFixed(0)}%`:"—"}</span>
                  <span>Participación: {totFacturado>0?`${((c.total/totFacturado)*100).toFixed(0)}%`:"—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  7. GASTOS GENERALES
  // ══════════════════════════════════════════════════════════════
  const VistaGastos = () => {
    const porTipo = {};
    fGastos.forEach(g=>{ const t=g.tipo||"Otro"; porTipo[t]=(porTipo[t]||0)+(Number(g.monto)||0); });
    const tipoArr = Object.entries(porTipo).sort((a,b)=>b[1]-a[1]);
    const maxG    = Math.max(...tipoArr.map(([,v])=>v),1);
    const maxMG   = Math.max(...meses12.map(m=>m.gast),1);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="stats">
          <KR icon="💸" lbl="Total gastos" val={fmt$(totGastos)} sub={`${fGastos.length} registros`} c="var(--purple)"/>
          <KR icon="📊" lbl="Categorías activas" val={tipoArr.length} c="var(--cyan)"/>
          <KR icon="📅" lbl="Prom. mensual" val={fmt$(totGastos/12)} c="var(--yellow)"/>
          <KR icon="🏆" lbl="Mayor categoría" val={tipoArr[0]?tipoArr[0][0]:"—"} sub={tipoArr[0]?fmt$(tipoArr[0][1]):"—"} c="var(--orange)"/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* por categoría */}
          <div className="card">
            <div className="card-hdr"><h3>🥧 Gastos por Categoría — {lblPeriodo()}</h3></div>
            <div style={{padding:"16px 20px"}}>
              {tipoArr.length===0 ? <div className="empty"><div className="empty-icon">💸</div><p>Sin gastos en el período</p></div>
              : <>
                <SegBar items={tipoArr.map(([,v],i)=>({v,c:PAL[i%PAL.length],lbl:""}))} h={14}/>
                <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
                  {tipoArr.map(([tipo,v],i)=>(
                    <div key={tipo} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:PAL[i%PAL.length],flexShrink:0}}/>
                      <div style={{flex:1,fontSize:12}}>{tipo}</div>
                      <HBar v={v} max={maxG} c={PAL[i%PAL.length]} h={7}/>
                      <div style={{width:80,textAlign:"right",fontSize:11,fontWeight:700,color:PAL[i%PAL.length]}}>{fmt$(v)}</div>
                      <div style={{width:30,textAlign:"right",fontSize:10,color:"var(--muted)"}}>{totGastos>0?`${((v/totGastos)*100).toFixed(0)}%`:"—"}</div>
                    </div>
                  ))}
                </div>
              </>}
            </div>
          </div>

          {/* por mes */}
          <div className="card">
            <div className="card-hdr"><h3>📅 Gastos por Mes — {filtroAnio}</h3></div>
            <div style={{padding:"16px 20px"}}>
              {meses12.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:28,fontSize:10,color:"var(--muted)",fontWeight:700}}>{MESES[i].slice(0,3)}</div>
                  <HBar v={m.gast} max={maxMG} c="var(--purple)" h={10}/>
                  <div style={{width:80,textAlign:"right",fontSize:10,fontWeight:700,color:"var(--purple)"}}>{m.gast>0?fmt$(m.gast):"—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  8. NÓMINAS
  // ══════════════════════════════════════════════════════════════
  const VistaNominas = () => {
    const maxOp   = Math.max(...nomPorDriver.map(x=>x.total),1);
    const maxAdm  = Math.max(...nominasAdmin.map(n=>Number(n.sueldoBruto)||0),1);
    const totTotal= totNomina+totNominaAdmin;

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="stats">
          <KR icon="👷" lbl="Nómina operadores" val={fmt$(totNomina)} sub={`${nomPorDriver.length} activos`} c="var(--purple)"/>
          <KR icon="👔" lbl="Nómina admin" val={fmt$(totNominaAdmin)} sub={`${nominasAdmin.length} empleados`} c="var(--cyan)"/>
          <KR icon="💰" lbl="Total nómina" val={fmt$(totTotal)} c="var(--green)"/>
          <KR icon="📊" lbl="% sobre ingresos" val={totIngresos>0?`${((totTotal/totIngresos)*100).toFixed(1)}%`:"—"} c="var(--yellow)"/>
        </div>

        {/* barra comparativa nómina vs ingresos */}
        <div className="card">
          <div className="card-hdr"><h3>📊 Nómina vs Ingresos — {lblPeriodo()}</h3></div>
          <div style={{padding:"16px 20px"}}>
            <SegBar items={[{v:totTotal,c:"var(--purple)",lbl:"Nómina"},{v:Math.max(totIngresos-totTotal,0),c:"var(--green)",lbl:"Ingreso restante"}]} h={20}/>
            <div style={{marginTop:10,display:"flex",gap:14,flexWrap:"wrap",fontSize:12}}>
              <span style={{color:"var(--purple)"}}>■ Nómina: {fmt$(totTotal)} ({totIngresos>0?`${((totTotal/totIngresos)*100).toFixed(0)}%`:"—"})</span>
              <span style={{color:"var(--green)"}}>■ Margen restante: {fmt$(Math.max(totIngresos-totTotal,0))}</span>
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* operadores */}
          <div className="card">
            <div className="card-hdr"><h3>👷 Operadores — Desglose</h3></div>
            <div style={{padding:"16px 20px"}}>
              {nomPorDriver.length===0 ? <div className="empty"><p>Sin operadores con nómina</p></div>
              : nomPorDriver.map(x=>(
                <div key={x.driver.id} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                    <span style={{fontWeight:700}}>{x.driver.nombre}</span>
                    <span style={{color:"var(--purple)",fontWeight:700}}>{fmt$(x.total)}</span>
                  </div>
                  <SegBar items={[{v:x.sueldo,c:"var(--cyan)",lbl:"Base"},{v:x.comision,c:"var(--purple)",lbl:"Comisión"}]} h={8}/>
                  <div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>Base {fmt$(x.sueldo)} + Comisión {x.driver.porcentajeViaje||0}% = {fmt$(x.comision)} · {x.viajesD.length}v</div>
                </div>
              ))}
              <div style={{borderTop:"1px solid var(--border)",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:12}}>
                <strong>Total operadores</strong><strong style={{color:"var(--purple)"}}>{fmt$(totNomina)}</strong>
              </div>
            </div>
          </div>

          {/* admin */}
          <div className="card">
            <div className="card-hdr"><h3>👔 Personal Administrativo</h3></div>
            <div style={{padding:"16px 20px"}}>
              {nominasAdmin.length===0 ? <div className="empty"><p>Sin nómina administrativa</p></div>
              : nominasAdmin.map(n=>(
                <div key={n.id} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                    <span style={{fontWeight:700}}>{n.nombre} <span style={{color:"var(--muted)",fontSize:10}}>{n.puesto}</span></span>
                    <span style={{color:"var(--cyan)",fontWeight:700}}>{fmt$(n.sueldoBruto)}</span>
                  </div>
                  <HBar v={Number(n.sueldoBruto)||0} max={maxAdm} c="var(--cyan)" h={8}/>
                </div>
              ))}
              <div style={{borderTop:"1px solid var(--border)",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:12}}>
                <strong>Total administrativos</strong><strong style={{color:"var(--cyan)"}}>{fmt$(totNominaAdmin)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  9. ANÁLISIS DE VIAJES
  // ══════════════════════════════════════════════════════════════
  const VistaViajes = () => {
    const destMap = {};
    fTrips.forEach(t=>{ const d=t.destino||"Sin destino"; if (!destMap[d]) destMap[d]={n:0,ing:0}; destMap[d].n++; destMap[d].ing+=(Number(t.costoOfrecido)||0); });
    const destArr    = Object.entries(destMap).sort((a,b)=>b[1].ing-a[1].ing).slice(0,10);
    const maxDest    = Math.max(...destArr.map(([,v])=>v.ing),1);

    const maxViajMes = Math.max(...meses12.map(m=>m.viajes+m.ext),1);
    const maxIngMes  = Math.max(...meses12.map(m=>m.ing),1);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="stats">
          <KR icon="🚛" lbl="Viajes propios" val={fTripsProp.length} sub={fmt$(fTripsProp.reduce((a,t)=>a+(Number(t.costoOfrecido)||0),0))} c="var(--cyan)"/>
          <KR icon="🔄" lbl="Logística externa" val={fTripsExt.length} sub={fmt$(fTripsExt.reduce((a,t)=>a+(Number(t.costoPagar)||0),0))} c="var(--purple)"/>
          <KR icon="📦" lbl="Total viajes" val={fTrips.length} sub={fmt$(totIngresos)} c="var(--green)"/>
          <KR icon="📍" lbl="Destinos únicos" val={[...new Set(fTrips.map(t=>t.destino).filter(Boolean))].length} c="var(--orange)"/>
          <KR icon="📈" lbl="Ingreso promedio" val={fTrips.length>0?fmt$(totIngresos/fTrips.length):"—"} c="var(--yellow)"/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* viajes y ingresos por mes */}
          <div className="card">
            <div className="card-hdr"><h3>📅 Viajes e Ingresos por Mes — {filtroAnio}</h3></div>
            <div style={{padding:"16px 20px"}}>
              {meses12.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:28,fontSize:10,color:"var(--muted)",fontWeight:700}}>{MESES[i].slice(0,3)}</div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <HBar v={m.viajes} max={maxViajMes} c="var(--cyan)" h={7}/>
                      <span style={{width:36,fontSize:9,color:"var(--cyan)"}}>{m.viajes>0?`${m.viajes}P`:""}</span>
                      <HBar v={m.ext} max={maxViajMes} c="var(--purple)" h={7}/>
                      <span style={{width:30,fontSize:9,color:"var(--purple)"}}>{m.ext>0?`${m.ext}E`:""}</span>
                    </div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <HBar v={m.ing} max={maxIngMes} c="var(--green)" h={6}/>
                      <span style={{width:66,textAlign:"right",fontSize:9,color:"var(--green)",fontWeight:700}}>{m.ing>0?fmt$(m.ing):"—"}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <span style={{fontSize:10,color:"var(--cyan)"}}>■ Propios</span>
                <span style={{fontSize:10,color:"var(--purple)"}}>■ Externos</span>
                <span style={{fontSize:10,color:"var(--green)"}}>■ Ingresos</span>
              </div>
            </div>
          </div>

          {/* top destinos */}
          <div className="card">
            <div className="card-hdr"><h3>🗺️ Top 10 Destinos por Ingreso</h3></div>
            <div style={{padding:"16px 20px"}}>
              {destArr.length===0 ? <div className="empty"><div className="empty-icon">🗺️</div><p>Sin viajes en el período</p></div>
              : destArr.map(([dest,{n,ing}],i)=>(
                <div key={dest} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                    <span style={{fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:150}}>📍 {dest}</span>
                    <span style={{color:"var(--green)",fontWeight:700,flexShrink:0,marginLeft:8}}>{fmt$(ing)}</span>
                  </div>
                  <HBar v={ing} max={maxDest} c={PAL[i%PAL.length]} h={8}/>
                  <div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>{n} viaje{n!==1?"s":""} · {totIngresos>0?`${((ing/totIngresos)*100).toFixed(0)}% del ingreso`:""}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  10. PROVEEDORES
  // ══════════════════════════════════════════════════════════════
  const VistaProveedores = () => {
    const porProv = proveedores.map(p=>{
      const gm   = maints.filter(m=>m.proveedorId===p.id).reduce((a,m)=>a+(Number(m.costoRef)||0)+(Number(m.costoMO)||0),0);
      const gg   = gastos.filter(g=>g.proveedorId===p.id).reduce((a,g)=>a+(Number(g.monto)||0),0);
      const ge   = externos.filter(e=>e.proveedorId===p.id).reduce((a,e)=>a+(Number(e.costoPagar)||0),0);
      const total= gm+gg+ge;
      const pend = externos.filter(e=>e.proveedorId===p.id&&e.pagoStatus!=="pagado").reduce((a,e)=>a+(Number(e.costoPagar)||0),0)
                 + maints.filter(m=>m.proveedorId===p.id&&m.pagoStatus!=="pagado").reduce((a,m)=>a+(Number(m.costoRef)||0)+(Number(m.costoMO)||0),0);
      return { ...p, gm, gg, ge, total, pend };
    }).filter(p=>p.total>0).sort((a,b)=>b.total-a.total);

    const maxProv  = Math.max(...porProv.map(p=>p.total),1);
    const totGastProv = porProv.reduce((a,p)=>a+p.total,0);
    const totPend  = porProv.reduce((a,p)=>a+p.pend,0);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="stats">
          <KR icon="🏪" lbl="Proveedores activos" val={porProv.length} c="var(--cyan)"/>
          <KR icon="💵" lbl="Gasto total" val={fmt$(totGastProv)} c="var(--red)"/>
          <KR icon="⏳" lbl="Cuentas pendientes" val={fmt$(totPend)} c="var(--orange)"/>
          <KR icon="🏆" lbl="Mayor proveedor" val={porProv[0]?.nombre||"—"} sub={porProv[0]?fmt$(porProv[0].total):"—"} c="var(--yellow)"/>
        </div>

        {/* barras por proveedor */}
        <div className="card">
          <div className="card-hdr"><h3>🏪 Gasto por Proveedor — {lblPeriodo()}</h3></div>
          <div style={{padding:"16px 20px"}}>
            {porProv.length===0 ? <div className="empty"><div className="empty-icon">🏪</div><p>Sin datos de proveedores</p></div>
            : porProv.map((p,i)=>(
              <div key={p.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                  <span style={{fontWeight:700}}>{p.nombre} <span style={{color:"var(--muted)",fontWeight:400,fontSize:10}}>{p.tipoProv||p.categoria||""}</span></span>
                  <span style={{color:"var(--red)",fontWeight:700}}>{fmt$(p.total)}</span>
                </div>
                <SegBar items={[{v:p.gm,c:"var(--orange)",lbl:"Mant"},{v:p.gg,c:"var(--purple)",lbl:"Gastos"},{v:p.ge,c:"var(--cyan)",lbl:"Transport"}]} h={10}/>
                <div style={{display:"flex",gap:12,marginTop:3,fontSize:10,color:"var(--muted)"}}>
                  {p.gm>0&&<span style={{color:"var(--orange)"}}>🔧 {fmt$(p.gm)}</span>}
                  {p.gg>0&&<span style={{color:"var(--purple)"}}>💸 {fmt$(p.gg)}</span>}
                  {p.ge>0&&<span style={{color:"var(--cyan)"}}>🚛 {fmt$(p.ge)}</span>}
                  {p.pend>0&&<span style={{color:"var(--orange)"}}>⏳ Pend: {fmt$(p.pend)}</span>}
                  <span>{totGastProv>0?`${((p.total/totGastProv)*100).toFixed(0)}% del total`:""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  //  RENDER PRINCIPAL
  // ══════════════════════════════════════════════════════════════
  const TABS = [
    ["resumen",        "📊 Resumen"],
    ["rendimiento",    "🚛 Unidades"],
    ["operadores",     "👨‍✈️ Operadores"],
    ["combustible",    "⛽ Combustible"],
    ["mantenimientos", "🔧 Mantenimiento"],
    ["facturas",       "🧾 Facturación"],
    ["gastos",         "💸 Gastos"],
    ["nominas",        "👷 Nóminas"],
    ["viajes",         "🗺️ Viajes"],
    ["proveedores_chart","🏪 Proveedores"],
  ];

  return (
    <div>
      <ControlPer/>
      <div style={{marginBottom:16,overflowX:"auto"}}>
        <div className="ftabs" style={{fontSize:12,display:"flex",flexWrap:"nowrap"}}>
          {TABS.map(([k,l])=>(
            <button key={k} className={`ftab${vistaTab===k?" on":""}`} onClick={()=>setVistaTab(k)} style={{padding:"8px 12px",whiteSpace:"nowrap"}}>{l}</button>
          ))}
        </div>
      </div>
      {vistaTab==="resumen"            && <VistaResumen/>}
      {vistaTab==="rendimiento"        && <VistaRendimiento/>}
      {vistaTab==="operadores"         && <VistaOperadores/>}
      {vistaTab==="combustible"        && <VistaCombustible/>}
      {vistaTab==="mantenimientos"     && <VistaMantenimientos/>}
      {vistaTab==="facturas"           && <VistaFacturas/>}
      {vistaTab==="gastos"             && <VistaGastos/>}
      {vistaTab==="nominas"            && <VistaNominas/>}
      {vistaTab==="viajes"             && <VistaViajes/>}
      {vistaTab==="proveedores_chart"  && <VistaProveedores/>}
    </div>
  );
}



function GpsPage({ units, traccarConfig, onOpenConfig }) {
  const [devices,    setDevices]    = useState([]);
  const [positions,  setPositions]  = useState({});
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [tabGps,     setTabGps]     = useState("mapa"); // mapa | lista | vincular | combustible
  const [vinculaciones, setVinculaciones] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Configuración de combustible por dispositivo
  // { [deviceId]: { activo: bool, capacidadLitros: number, tipoSensor: string, umbralAlerta: number } }
  const [fuelConfigs, setFuelConfigs] = useState({});
  // Historial de lecturas de combustible (últimas 12 lecturas por dispositivo)
  const [fuelHistory, setFuelHistory] = useState({});
  // Geocercas: [{id, nombre, lat, lng, radio, deviceIds:[], alertEntrada, alertSalida, color}]
  const [geocercas, setGeocercas] = useState([]);
  const [historialGeo, setHistorialGeo] = useState([]); // [{ts, deviceId, deviceName, geocercaId, geocercaNombre, tipo:"entrada"|"salida"}]
  const [showGeocercaModal, setShowGeocercaModal] = useState(false);
  const [editGeocerca, setEditGeocerca] = useState(null);

  const isConfigured = traccarConfig?.serverUrl && traccarConfig?.email;
  const authHeader   = traccarConfig ? "Basic " + btoa(`${traccarConfig.email}:${traccarConfig.password}`) : "";
  const baseUrl      = traccarConfig?.serverUrl?.replace(/\/$/, "") || "";

  const fetchGps = async () => {
    if (!isConfigured) return;
    setLoading(true); setError(null);
    try {
      const [devRes, posRes] = await Promise.all([
        fetch(`${baseUrl}/api/devices`,   { headers: { Authorization: authHeader } }),
        fetch(`${baseUrl}/api/positions`, { headers: { Authorization: authHeader } }),
      ]);
      if (!devRes.ok) throw new Error(`Error ${devRes.status}: ${devRes.statusText}`);
      const devs = await devRes.json();
      const poss = await posRes.json();
      setDevices(Array.isArray(devs) ? devs : []);
      const posMap = {};
      (Array.isArray(poss) ? poss : []).forEach(p => { posMap[p.deviceId] = p; });
      setPositions(posMap);
      setLastUpdate(new Date());

      // Detectar eventos de geocercas
      setGeocercas(gcs => {
        if (gcs.length === 0) return gcs;
        const pMap = {};
        (Array.isArray(poss) ? poss : []).forEach(p => { pMap[p.deviceId] = p; });
        const newEvents = [];
        gcs.forEach(gc => {
          (gc.deviceIds || []).forEach(did => {
            const pos = pMap[did]; if (!pos) return;
            const dist = Math.sqrt(Math.pow((pos.latitude - gc.lat)*111000, 2) + Math.pow((pos.longitude - gc.lng)*85000, 2));
            const dentro = dist <= gc.radio;
            const dev = (Array.isArray(devs)?devs:[]).find(d=>d.id===did);
            const prevKey = `geo_${gc.id}_${did}`;
            const prevDentro = sessionStorage.getItem(prevKey);
            if (prevDentro !== null) {
              const eraDentro = prevDentro === "1";
              if (!eraDentro && dentro && gc.alertEntrada) newEvents.push({ts:Date.now(),deviceId:did,deviceName:dev?.name||did,geocercaId:gc.id,geocercaNombre:gc.nombre,tipo:"entrada"});
              if (eraDentro && !dentro && gc.alertSalida)  newEvents.push({ts:Date.now(),deviceId:did,deviceName:dev?.name||did,geocercaId:gc.id,geocercaNombre:gc.nombre,tipo:"salida"});
            }
            sessionStorage.setItem(prevKey, dentro?"1":"0");
          });
        });
        if (newEvents.length > 0) setHistorialGeo(h => [...h, ...newEvents].slice(-200));
        return gcs;
      });

      // Actualizar historial de combustible para dispositivos con sensor activo
      setFuelHistory(prev => {
        const updated = { ...prev };
        (Array.isArray(poss) ? poss : []).forEach(p => {
          if (!fuelConfigs[p.deviceId]?.activo) return;
          const fuelRaw = p.attributes?.fuel ?? p.attributes?.fuelLevel ?? null;
          if (fuelRaw == null) return;
          const pct = fuelRaw > 1 ? fuelRaw : fuelRaw * 100;
          const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
          const hist = prev[p.deviceId] || [];
          updated[p.deviceId] = [...hist.slice(-23), { pct, hora, ts: Date.now() }];
        });
        return updated;
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isConfigured) return;
    fetchGps();
    if (!autoRefresh) return;
    const iv = setInterval(fetchGps, (Number(traccarConfig?.intervalo) || 30) * 1000);
    return () => clearInterval(iv);
  }, [traccarConfig, autoRefresh, fuelConfigs]);

  const enRuta    = devices.filter(d => (positions[d.id]?.speed || 0) > 5).length;
  const detenidos = devices.filter(d => positions[d.id] && (positions[d.id]?.speed || 0) <= 5).length;
  const sinSenial = devices.filter(d => !positions[d.id]).length;
  const conSensor = Object.values(fuelConfigs).filter(c => c.activo).length;

  // Alertas de combustible activas
  const alertasCombustible = devices.filter(d => {
    if (!fuelConfigs[d.id]?.activo) return false;
    const hist = fuelHistory[d.id] || [];
    if (hist.length < 2) return false;
    const caida = hist[hist.length - 2].pct - hist[hist.length - 1].pct;
    return caida > (fuelConfigs[d.id]?.umbralAlerta || 10);
  });

  const selectedPos  = selectedDevice ? positions[selectedDevice.id] : null;
  const selectedUnit = selectedDevice ? units.find(u => vinculaciones[selectedDevice.id] === u.id) : null;

  const updateFuelConfig = (deviceId, changes) =>
    setFuelConfigs(prev => ({ ...prev, [deviceId]: { ...(prev[deviceId] || {}), ...changes } }));

  if (!isConfigured) return (
    <div>
      <div style={{ textAlign:"center", padding:"60px 20px", background:"var(--bg1)", borderRadius:16, border:"2px dashed var(--border)" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>📡</div>
        <div style={{ fontFamily:"var(--font-hd)", fontSize:22, fontWeight:700, marginBottom:8 }}>Módulo GPS no configurado</div>
        <div style={{ color:"var(--muted)", fontSize:14, marginBottom:24, maxWidth:420, margin:"0 auto 24px" }}>
          Conecta tu servidor Traccar para ver ubicación en tiempo real. Puedes usar el servidor demo para probar.
        </div>
        <button className="btn btn-cyan" style={{ fontSize:14, padding:"12px 28px" }} onClick={onOpenConfig}>⚙️ Configurar conexión GPS</button>
        <div style={{ marginTop:20, fontSize:12, color:"var(--muted)" }}>
          Demo: <code style={{ background:"var(--bg3)", padding:"2px 6px", borderRadius:4 }}>demo.traccar.org</code> · usuario: <code style={{ background:"var(--bg3)", padding:"2px 6px", borderRadius:4 }}>demo</code> · contraseña: <code style={{ background:"var(--bg3)", padding:"2px 6px", borderRadius:4 }}>demo</code>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* KPIs */}
      <div className="stats" style={{ marginBottom:16 }}>
        <div className="stat" style={{"--c":"var(--green)"}}>
          <div className="stat-icon">🟢</div><div className="stat-val sm">{enRuta}</div><div className="stat-lbl">En ruta</div>
        </div>
        <div className="stat" style={{"--c":"var(--yellow)"}}>
          <div className="stat-icon">🟡</div><div className="stat-val sm">{detenidos}</div><div className="stat-lbl">Detenidos</div>
        </div>
        <div className="stat" style={{"--c":"var(--muted)"}}>
          <div className="stat-icon">⚫</div><div className="stat-val sm">{sinSenial}</div><div className="stat-lbl">Sin señal</div>
        </div>
        <div className="stat" style={{"--c":"var(--cyan)"}}>
          <div className="stat-icon">📡</div><div className="stat-val sm">{devices.length}</div><div className="stat-lbl">Dispositivos total</div>
        </div>
        <div className="stat" style={{"--c":"var(--orange)"}}>
          <div className="stat-icon">⛽</div><div className="stat-val sm">{conSensor}</div><div className="stat-lbl">Con sensor combustible</div>
        </div>
        {alertasCombustible.length > 0 && (
          <div className="stat" style={{"--c":"var(--red)"}}>
            <div className="stat-icon">🚨</div><div className="stat-val sm">{alertasCombustible.length}</div><div className="stat-lbl">Alertas combustible</div>
          </div>
        )}
      </div>

      {/* Alertas activas de combustible */}
      {alertasCombustible.length > 0 && (
        <div style={{ padding:"12px 16px", background:"rgba(220,50,50,.1)", border:"2px solid var(--red)", borderRadius:10, marginBottom:14, display:"flex", gap:12, alignItems:"center" }}>
          <span style={{ fontSize:24 }}>🚨</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:"var(--red)", marginBottom:4 }}>¡Alerta de extracción de combustible!</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {alertasCombustible.map(d => (
                <button key={d.id} onClick={() => setSelectedDevice(d)}
                  style={{ fontSize:12, padding:"4px 10px", borderRadius:8, background:"rgba(220,50,50,.2)", border:"1px solid var(--red)", color:"var(--red)", cursor:"pointer" }}>
                  🚛 {d.name} — caída detectada
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-hdr">
          <h3>📡 GPS en Tiempo Real</h3>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {lastUpdate && <span style={{ fontSize:11, color:"var(--muted)" }}>Act: {lastUpdate.toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}</span>}
            <button className="btn btn-ghost btn-sm" onClick={() => setAutoRefresh(a => !a)} style={{ color: autoRefresh ? "var(--green)" : "var(--muted)" }}>
              {autoRefresh ? "⏸ Auto" : "▶ Auto"}
            </button>
            <button className="btn btn-cyan btn-sm" onClick={fetchGps} disabled={loading}>{loading ? "⏳" : "🔄"} Actualizar</button>
            <button className="btn btn-ghost btn-sm" onClick={onOpenConfig}>⚙️</button>
          </div>
        </div>

        <div style={{ padding:"8px 16px 0", borderBottom:"1px solid var(--border)" }}>
          <div className="ftabs">
            <button className={`ftab${tabGps==="mapa"?" on":""}`} onClick={() => setTabGps("mapa")}>🗺️ Mapa ({devices.length})</button>
            <button className={`ftab${tabGps==="lista"?" on":""}`} onClick={() => setTabGps("lista")}>📋 Lista</button>
            <button className={`ftab${tabGps==="combustible"?" on":""}`} onClick={() => setTabGps("combustible")}>
              ⛽ Combustible {alertasCombustible.length > 0 && <span style={{ background:"var(--red)", color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:10, marginLeft:4 }}>{alertasCombustible.length}</span>}
            </button>
            <button className={`ftab${tabGps==="vincular"?" on":""}`} onClick={() => setTabGps("vincular")}>🔗 Vincular</button>
            <button className={`ftab${tabGps==="geocercas"?" on":""}`} onClick={() => setTabGps("geocercas")}>🛡️ Geocercas {geocercas.length>0&&<span style={{background:"var(--cyan)",color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:9,marginLeft:3}}>{geocercas.length}</span>}</button>
            <button className={`ftab${tabGps==="historial"?" on":""}`} onClick={() => setTabGps("historial")}>📜 Historial {historialGeo.length>0&&<span style={{background:"var(--purple)",color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:9,marginLeft:3}}>{historialGeo.length}</span>}</button>
            <button className={`ftab${tabGps==="control"?" on":""}`} onClick={() => setTabGps("control")}>⚡ Control Remoto</button>
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div style={{ padding:"12px 16px", background:"rgba(220,50,50,.1)", border:"1px solid var(--red)", borderRadius:8, color:"var(--red)", fontSize:13, marginBottom:12 }}>
              ❌ {error} — <button onClick={onOpenConfig} style={{ background:"none", border:"none", color:"var(--cyan)", cursor:"pointer", fontSize:13 }}>Verificar configuración</button>
            </div>
          )}

          {/* ── MAPA ── */}
          {tabGps === "mapa" && (
            <div>
              <MapaFlota devices={devices} positions={positions} units={units} onSelectDevice={d => setSelectedDevice(d)} />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:10, marginTop:14 }}>
                {devices.map(d => {
                  const pos = positions[d.id];
                  const st  = getVehicleStatus(pos);
                  const vu  = units.find(u => vinculaciones[d.id] === u.id);
                  const fc  = fuelConfigs[d.id];
                  const fuelRaw = pos?.attributes?.fuel ?? pos?.attributes?.fuelLevel ?? null;
                  const fuelPct = fuelRaw != null ? (fuelRaw > 1 ? fuelRaw : fuelRaw * 100) : null;
                  const tieneAlerta = alertasCombustible.some(x => x.id === d.id);
                  return (
                    <div key={d.id} onClick={() => setSelectedDevice(d)}
                      style={{ padding:"12px 14px", background:"var(--bg2)", border:`1.5px solid ${tieneAlerta ? "var(--red)" : st.color+"33"}`, borderRadius:10, cursor:"pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = tieneAlerta ? "var(--red)" : st.color; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = tieneAlerta ? "var(--red)" : `${st.color}33`; }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{d.name}</div>
                        <span>{tieneAlerta ? "🚨" : st.icon}</span>
                      </div>
                      <div style={{ fontSize:11, color: tieneAlerta ? "var(--red)" : st.color, fontWeight:600, marginBottom:4 }}>
                        {tieneAlerta ? "⚠️ Alerta combustible" : st.lbl}
                      </div>
                      {fc?.activo && fuelPct != null && (
                        <div style={{ marginTop:6 }}>
                          <div style={{ height:6, background:"var(--bg3)", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${Math.min(fuelPct,100)}%`, background: fuelPct > 50 ? "var(--green)" : fuelPct > 25 ? "var(--yellow)" : "var(--red)", borderRadius:3 }} />
                          </div>
                          <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>⛽ {Math.round(fuelPct)}%</div>
                        </div>
                      )}
                      {vu && <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>🚛 {vu.num} — {vu.placas}</div>}
                      {pos && <div style={{ fontSize:10, color:"var(--muted)" }}>🕐 {fmtTime(pos.fixTime)}</div>}
                    </div>
                  );
                })}
                {devices.length === 0 && !loading && (
                  <div style={{ gridColumn:"1/-1" }} className="empty"><div className="empty-icon">📡</div><p>Sin dispositivos en el servidor</p></div>
                )}
              </div>
            </div>
          )}

          {/* ── LISTA TABLA ── */}
          {tabGps === "lista" && (
            <table>
              <thead><tr><th>Dispositivo</th><th>Unidad</th><th>Status</th><th>Vel.</th><th>Combustible</th><th>Odómetro</th><th>Ignición</th><th>Última pos.</th><th></th></tr></thead>
              <tbody>{devices.length === 0
                ? <tr><td colSpan={9} style={{ textAlign:"center", color:"var(--muted)", padding:24 }}>Sin dispositivos</td></tr>
                : devices.map(d => {
                  const pos = positions[d.id];
                  const st  = getVehicleStatus(pos);
                  const vu  = units.find(u => vinculaciones[d.id] === u.id);
                  const fc  = fuelConfigs[d.id];
                  const fuelRaw = pos?.attributes?.fuel ?? pos?.attributes?.fuelLevel ?? null;
                  const fuelPct = fuelRaw != null ? (fuelRaw > 1 ? fuelRaw : fuelRaw * 100) : null;
                  const tieneAlerta = alertasCombustible.some(x => x.id === d.id);
                  return (
                    <tr key={d.id} style={{ background: tieneAlerta ? "rgba(220,50,50,.05)" : "" }}>
                      <td><div style={{ fontWeight:700 }}>{d.name}</div><div style={{ fontSize:10, color:"var(--muted)" }}>IMEI: {d.uniqueId}</div></td>
                      <td>{vu ? <Bdg c="bb" t={`${vu.num} ${vu.placas}`}/> : <span style={{ color:"var(--muted)", fontSize:11 }}>—</span>}</td>
                      <td><span style={{ color:st.color, fontWeight:700, fontSize:12 }}>{st.icon} {st.lbl}</span></td>
                      <td style={{ fontWeight:700, color:(pos?.speed||0)>5?"var(--green)":"var(--muted)" }}>{Math.round(pos?.speed||0)} km/h</td>
                      <td>
                        {!fc?.activo ? <span style={{ color:"var(--muted)", fontSize:11 }}>No activo</span>
                          : fuelPct != null
                            ? <div style={{ minWidth:80 }}>
                                <div style={{ height:8, background:"var(--bg3)", borderRadius:4, overflow:"hidden", marginBottom:2 }}>
                                  <div style={{ height:"100%", width:`${Math.min(fuelPct,100)}%`, background: fuelPct>50?"var(--green)":fuelPct>25?"var(--yellow)":"var(--red)", borderRadius:4 }} />
                                </div>
                                <div style={{ fontSize:10, display:"flex", justifyContent:"space-between" }}>
                                  <span style={{ color: tieneAlerta?"var(--red)":"var(--muted)" }}>{tieneAlerta?"🚨":""}{Math.round(fuelPct)}%</span>
                                  {fc.capacidadLitros && <span style={{ color:"var(--muted)" }}>{Math.round(fuelPct/100*fc.capacidadLitros)}L</span>}
                                </div>
                              </div>
                            : <span style={{ color:"var(--muted)", fontSize:11 }}>Sin datos</span>
                        }
                      </td>
                      <td style={{ fontSize:12 }}>{pos?.attributes?.totalDistance ? `${(pos.attributes.totalDistance/1000).toFixed(0)} km` : "—"}</td>
                      <td>{pos?.attributes?.ignition!=null?(pos.attributes.ignition?<Bdg c="bg" t="ON"/>:<Bdg c="br" t="OFF"/>):<span style={{color:"var(--muted)"}}>—</span>}</td>
                      <td style={{ fontSize:11 }}>{fmtTime(pos?.fixTime)}</td>
                      <td><button className="btn btn-cyan btn-xs" onClick={() => setSelectedDevice(d)}>🔍</button></td>
                    </tr>
                  );
                })
              }</tbody>
            </table>
          )}

          {/* ── COMBUSTIBLE — configuración por unidad ── */}
          {tabGps === "combustible" && (
            <div>
              <div style={{ padding:"10px 14px", background:"rgba(255,140,0,.08)", border:"1px solid var(--orange)", borderRadius:8, fontSize:12, marginBottom:14 }}>
                ⛽ <strong>Módulo de Control de Combustible</strong> — Actívalo por unidad según si el cliente tiene instalado el sensor físico en el GPS GT06N. Sin sensor físico, este módulo no recibirá datos.
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Dispositivo GPS</th>
                    <th>Unidad Fleet Pro</th>
                    <th style={{ textAlign:"center" }}>Sensor activo</th>
                    <th>Capacidad tanque</th>
                    <th>Tipo sensor</th>
                    <th>Alerta caída &gt;</th>
                    <th>Nivel actual</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.length === 0
                    ? <tr><td colSpan={8} style={{ textAlign:"center", color:"var(--muted)", padding:24 }}>Sin dispositivos conectados</td></tr>
                    : devices.map(d => {
                      const fc  = fuelConfigs[d.id] || {};
                      const vu  = units.find(u => vinculaciones[d.id] === u.id);
                      const pos = positions[d.id];
                      const fuelRaw = pos?.attributes?.fuel ?? pos?.attributes?.fuelLevel ?? null;
                      const fuelPct = fuelRaw != null ? (fuelRaw > 1 ? fuelRaw : fuelRaw * 100) : null;
                      const tieneAlerta = alertasCombustible.some(x => x.id === d.id);
                      return (
                        <tr key={d.id} style={{ background: tieneAlerta ? "rgba(220,50,50,.05)" : fc.activo ? "rgba(0,153,204,.03)" : "" }}>
                          <td><div style={{ fontWeight:700 }}>{d.name}</div><div style={{ fontSize:10, color:"var(--muted)" }}>ID: {d.id}</div></td>
                          <td>{vu ? <Bdg c="bb" t={`${vu.num}`}/> : <span style={{ fontSize:11, color:"var(--muted)" }}>Sin vincular</span>}</td>
                          <td style={{ textAlign:"center" }}>
                            <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer" }}>
                              <input type="checkbox" checked={!!fc.activo} onChange={e => updateFuelConfig(d.id, { activo: e.target.checked })}
                                style={{ width:18, height:18, cursor:"pointer", accentColor:"var(--orange)" }}/>
                              <span style={{ fontSize:12, fontWeight:700, color: fc.activo ? "var(--orange)" : "var(--muted)" }}>
                                {fc.activo ? "⛽ Activo" : "Inactivo"}
                              </span>
                            </label>
                          </td>
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                              <input type="number" value={fc.capacidadLitros || ""} disabled={!fc.activo}
                                onChange={e => updateFuelConfig(d.id, { capacidadLitros: Number(e.target.value) })}
                                placeholder="ej: 400" min="1" max="2000"
                                style={{ width:70, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background: fc.activo ? "var(--bg0)" : "var(--bg2)", color:"var(--text)", fontSize:12 }}/>
                              <span style={{ fontSize:11, color:"var(--muted)" }}>litros</span>
                            </div>
                          </td>
                          <td>
                            <select value={fc.tipoSensor || "ultrasonico"} disabled={!fc.activo}
                              onChange={e => updateFuelConfig(d.id, { tipoSensor: e.target.value })}
                              style={{ padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background: fc.activo ? "var(--bg0)" : "var(--bg2)", color:"var(--text)", fontSize:11 }}>
                              <option value="ultrasonico">Ultrasónico</option>
                              <option value="sonda">Sonda varilla</option>
                              <option value="analogico">Analógico genérico</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                              <input type="number" value={fc.umbralAlerta || 10} disabled={!fc.activo}
                                onChange={e => updateFuelConfig(d.id, { umbralAlerta: Number(e.target.value) })}
                                min="5" max="50"
                                style={{ width:50, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background: fc.activo ? "var(--bg0)" : "var(--bg2)", color:"var(--text)", fontSize:12 }}/>
                              <span style={{ fontSize:11, color:"var(--muted)" }}>%</span>
                            </div>
                          </td>
                          <td>
                            {!fc.activo
                              ? <span style={{ color:"var(--muted)", fontSize:11 }}>—</span>
                              : fuelPct != null
                                ? <div style={{ minWidth:90 }}>
                                    <FuelGauge pct={fuelPct} litros={fc.capacidadLitros ? fuelPct/100*fc.capacidadLitros : null} capacidad={fc.capacidadLitros}/>
                                  </div>
                                : <span style={{ color:"var(--muted)", fontSize:11 }}>Sin datos del sensor</span>
                            }
                          </td>
                          <td>
                            {!fc.activo ? null
                              : tieneAlerta
                                ? <Bdg c="br" t="🚨 Alerta"/>
                                : fuelPct != null
                                  ? <Bdg c={fuelPct > 25 ? "bg" : "by"} t={fuelPct > 25 ? "✅ Normal" : "⚠️ Bajo"}/>
                                  : <Bdg c="bm" t="Sin señal"/>
                            }
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
              <div style={{ marginTop:14, padding:"12px 16px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)", fontSize:12 }}>
                <strong>💡 ¿Cómo funciona?</strong> Cuando el GPS GT06N tiene conectado el sensor de combustible, envía el nivel como atributo en cada reporte. Fleet Pro monitorea cambios bruscos de nivel — si el tanque baja más del umbral configurado sin que haya una carga registrada, se dispara la alerta de extracción. La configuración se guarda localmente por dispositivo.
              </div>
            </div>
          )}

          {/* ── VINCULAR ── */}
          {tabGps === "vincular" && (
            <div>
              <div style={{ padding:"10px 14px", background:"rgba(0,153,204,.08)", border:"1px solid var(--cyan)", borderRadius:8, fontSize:12, marginBottom:14 }}>
                💡 Vincula cada dispositivo GPS con una unidad de Fleet Pro para sincronizar kilometraje y ver el nombre del camión en el mapa.
              </div>
              <table>
                <thead><tr><th>Dispositivo Traccar</th><th>Status</th><th>Vincular con Unidad Fleet Pro</th><th>Km GPS</th><th>Sensor combustible</th></tr></thead>
                <tbody>{devices.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign:"center", color:"var(--muted)", padding:24 }}>Sin dispositivos</td></tr>
                  : devices.map(d => {
                    const pos = positions[d.id];
                    const st  = getVehicleStatus(pos);
                    const kmGps = pos?.attributes?.totalDistance ? Math.round(pos.attributes.totalDistance / 1000) : null;
                    return (
                      <tr key={d.id}>
                        <td><div style={{ fontWeight:700 }}>{d.name}</div><div style={{ fontSize:10, color:"var(--muted)" }}>IMEI: {d.uniqueId}</div></td>
                        <td><span style={{ color:st.color, fontSize:12, fontWeight:600 }}>{st.icon} {st.lbl}</span></td>
                        <td>
                          <select value={vinculaciones[d.id] || ""} onChange={e => setVinculaciones(v => ({ ...v, [d.id]: e.target.value || null }))}
                            style={{ padding:"6px 10px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:12, minWidth:180 }}>
                            <option value="">— Sin vincular —</option>
                            {units.map(u => <option key={u.id} value={u.id}>{u.num} — {u.placas} ({u.marca} {u.modelo})</option>)}
                          </select>
                        </td>
                        <td style={{ fontWeight:700, color:"var(--cyan)" }}>{kmGps != null ? `${kmGps.toLocaleString()} km` : "—"}</td>
                        <td>
                          <Bdg c={fuelConfigs[d.id]?.activo ? "bo" : "bm"} t={fuelConfigs[d.id]?.activo ? "⛽ Activo" : "No activo"}/>
                        </td>
                      </tr>
                    );
                  })
                }</tbody>
              </table>
            </div>
          )}
          {/* ── GEOCERCAS ── */}
          {tabGps === "geocercas" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:12,color:"var(--muted)"}}>🛡️ Define zonas en el mapa. Asigna dispositivos y recibe alertas cuando entren o salgan.</div>
                <button className="btn btn-cyan btn-sm" onClick={()=>{setEditGeocerca(null);setShowGeocercaModal(true);}}>➕ Nueva Geocerca</button>
              </div>
              {geocercas.length === 0
                ? <div className="empty"><div className="empty-icon">🛡️</div><p>Sin geocercas. Crea la primera para empezar a monitorear zonas.</p></div>
                : <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {geocercas.map(gc => {
                      const asignados = devices.filter(d => gc.deviceIds?.includes(d.id));
                      const alertasGc = historialGeo.filter(h => h.geocercaId===gc.id).slice(-3);
                      return (
                        <div key={gc.id} style={{padding:"14px 16px",background:"var(--bg2)",borderRadius:10,border:`2px solid ${gc.color||"var(--cyan)"}33`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                                <div style={{width:12,height:12,borderRadius:"50%",background:gc.color||"var(--cyan)",flexShrink:0}}/>
                                <strong style={{fontSize:14}}>{gc.nombre}</strong>
                                <Bdg c="bb" t={`Radio: ${gc.radio} m`}/>
                                {gc.alertEntrada && <Bdg c="bg" t="⬇️ Alerta entrada"/>}
                                {gc.alertSalida  && <Bdg c="br" t="⬆️ Alerta salida"/>}
                              </div>
                              <div style={{fontSize:11,color:"var(--muted)",marginBottom:6}}>📍 {gc.lat?.toFixed(4)}, {gc.lng?.toFixed(4)}</div>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                {asignados.length===0
                                  ? <span style={{fontSize:11,color:"var(--muted)"}}>Sin unidades asignadas</span>
                                  : asignados.map(d=><Bdg key={d.id} c="bb" t={`🚛 ${d.name}`}/>)
                                }
                              </div>
                              {alertasGc.length>0 && (
                                <div style={{marginTop:8,fontSize:11,color:"var(--muted)"}}>
                                  Último evento: <strong style={{color:alertasGc[alertasGc.length-1].tipo==="entrada"?"var(--green)":"var(--orange)"}}>{alertasGc[alertasGc.length-1].tipo==="entrada"?"⬇️ Entrada":"⬆️ Salida"}</strong> — {alertasGc[alertasGc.length-1].deviceName}
                                </div>
                              )}
                            </div>
                            <div style={{display:"flex",gap:6,flexShrink:0}}>
                              <button className="btn btn-ghost btn-sm" onClick={()=>{setEditGeocerca(gc);setShowGeocercaModal(true);}}>✏️</button>
                              <button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}} onClick={()=>setGeocercas(g=>g.filter(x=>x.id!==gc.id))}>🗑️</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>
          )}

          {/* ── HISTORIAL ── */}
          {tabGps === "historial" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,alignItems:"center"}}>
                <div style={{fontSize:12,color:"var(--muted)"}}>📜 Registro de eventos de entrada/salida de geocercas y alertas de combustible.</div>
                {historialGeo.length>0 && <button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}} onClick={()=>setHistorialGeo([])}>🗑️ Limpiar historial</button>}
              </div>
              {historialGeo.length === 0
                ? <div className="empty"><div className="empty-icon">📜</div><p>Sin eventos registrados. Los eventos aparecerán aquí cuando las unidades crucen geocercas.</p></div>
                : <table>
                    <thead><tr><th>Hora</th><th>Unidad</th><th>Geocerca</th><th>Evento</th></tr></thead>
                    <tbody>
                      {[...historialGeo].reverse().map((h,i) => (
                        <tr key={i}>
                          <td style={{fontSize:11,color:"var(--muted)"}}>{new Date(h.ts).toLocaleString("es-MX",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}</td>
                          <td><strong>{h.deviceName}</strong></td>
                          <td>{h.geocercaNombre}</td>
                          <td><Bdg c={h.tipo==="entrada"?"bg":"bo"} t={h.tipo==="entrada"?"⬇️ Entró":"⬆️ Salió"}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          )}

          {/* ── CONTROL REMOTO ── */}
          {tabGps === "control" && (
            <div>
              <div style={{padding:"10px 16px",background:"rgba(220,50,50,.08)",border:"1px solid var(--red)",borderRadius:8,fontSize:12,marginBottom:14}}>
                ⚡ <strong>Control Remoto — Requiere relé de corte instalado en el vehículo y configurado en Traccar.</strong> El GT06N soporta comandos de corte/encendido de motor vía relay. Úsalo con precaución.
              </div>
              <table>
                <thead><tr><th>Dispositivo</th><th>Status actual</th><th>Ignición</th><th>Velocidad</th><th>Acción remota</th><th>Notas</th></tr></thead>
                <tbody>
                  {devices.length===0
                    ? <tr><td colSpan={6} style={{textAlign:"center",color:"var(--muted)",padding:24}}>Sin dispositivos conectados</td></tr>
                    : devices.map(d => {
                      const pos = positions[d.id];
                      const st  = getVehicleStatus(pos);
                      const ign = pos?.attributes?.ignition;
                      const vel = Math.round(pos?.speed||0);
                      const enMovimiento = vel > 5;
                      const handleCmd = async (cmd) => {
                        if (!traccarConfig) return;
                        if (cmd==="engineStop" && !confirm(`⚠️ ¿Confirmas enviar CORTE DE MOTOR a ${d.name}? Úsalo solo cuando el vehículo esté detenido.`)) return;
                        try {
                          const r = await fetch(`${baseUrl}/api/commands/send`, {
                            method:"POST",
                            headers:{"Authorization":authHeader,"Content-Type":"application/json"},
                            body:JSON.stringify({deviceId:d.id,type:cmd})
                          });
                          if (r.ok) alert(`✅ Comando "${cmd}" enviado a ${d.name}`);
                          else alert(`❌ Error enviando comando. Verifica que el dispositivo soporte esta función.`);
                        } catch(e) { alert(`❌ Error de conexión: ${e.message}`); }
                      };
                      return (
                        <tr key={d.id}>
                          <td><div style={{fontWeight:700}}>{d.name}</div><div style={{fontSize:10,color:"var(--muted)"}}>ID: {d.id}</div></td>
                          <td><span style={{color:st.color,fontWeight:600,fontSize:12}}>{st.icon} {st.lbl}</span></td>
                          <td>{ign!=null?<Bdg c={ign?"bg":"br"} t={ign?"🔑 ON":"⬛ OFF"}/>:<span style={{color:"var(--muted)",fontSize:11}}>—</span>}</td>
                          <td style={{fontWeight:700,color:vel>0?"var(--green)":"var(--muted)"}}>{vel} km/h</td>
                          <td>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              <button
                                className="btn btn-sm"
                                style={{background:"rgba(220,50,50,.15)",color:"var(--red)",border:"1px solid var(--red)",fontSize:11}}
                                onClick={()=>handleCmd("engineStop")}
                                disabled={!pos}
                                title={enMovimiento?"⚠️ Vehículo en movimiento — úsalo con precaución":"Cortar motor"}>
                                {enMovimiento?"⚠️":"🔴"} Cortar motor
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{background:"rgba(0,200,100,.12)",color:"var(--green)",border:"1px solid var(--green)",fontSize:11}}
                                onClick={()=>handleCmd("engineResume")}
                                disabled={!pos}
                                title="Habilitar motor">
                                🟢 Habilitar motor
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={()=>handleCmd("positionSingle")}
                                disabled={!pos}
                                title="Solicitar posición actualizada">
                                📍 Ping
                              </button>
                            </div>
                          </td>
                          <td style={{fontSize:11,color:"var(--muted)"}}>
                            {enMovimiento
                              ? <span style={{color:"var(--orange)"}}>⚠️ En movimiento</span>
                              : ign===false
                                ? <span style={{color:"var(--green)"}}>✅ Motor apagado</span>
                                : <span>Motor encendido</span>
                            }
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Modal Geocerca */}
      {showGeocercaModal && (
        <GeocercaModal
          geocerca={editGeocerca}
          devices={devices}
          onSave={gc => {
            if (editGeocerca) setGeocercas(g=>g.map(x=>x.id===gc.id?gc:x));
            else setGeocercas(g=>[...g,gc]);
            setShowGeocercaModal(false); setEditGeocerca(null);
          }}
          onClose={()=>{setShowGeocercaModal(false);setEditGeocerca(null);}}
        />
      )}

      {selectedDevice && (
        <GpsUnitModal
          device={selectedDevice}
          position={positions[selectedDevice.id]}
          unit={selectedUnit}
          fuelConfig={fuelConfigs[selectedDevice.id]}
          fuelHistory={fuelHistory[selectedDevice.id]}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}



// ══════════════════════════════════════════════════════════════════════════════
// MÓDULO COTIZACIONES — Tabulador de tarifas + Cotizador + PDF/WhatsApp
// ══════════════════════════════════════════════════════════════════════════════

const D_TABULADOR = [
  { id:"t1", tipo:"3.5 Toneladas",       icono:"🚐", tarifa_km:18,  tarifa_viaje:1800,  tarifa_dia:2200,  activo:true,  notas:"Ideal para cargas ligeras hasta 3.5 ton" },
  { id:"t2", tipo:"Rabón",               icono:"🚚", tarifa_km:22,  tarifa_viaje:2800,  tarifa_dia:3400,  activo:true,  notas:"Carga media, zona metropolitana y foráneo corto" },
  { id:"t3", tipo:"Tortón",              icono:"🚛", tarifa_km:28,  tarifa_viaje:4200,  tarifa_dia:5000,  activo:true,  notas:"Carga general foránea, hasta 8 ton" },
  { id:"t4", tipo:"Semirremolque 48'",   icono:"🚛", tarifa_km:35,  tarifa_viaje:6500,  tarifa_dia:7500,  activo:true,  notas:"Carga completa nacional" },
  { id:"t5", tipo:"Full / Doblecaja",    icono:"🚛", tarifa_km:42,  tarifa_viaje:9000,  tarifa_dia:10500, activo:true,  notas:"Máxima capacidad, rutas largas" },
  { id:"t6", tipo:"Plataforma",          icono:"🚛", tarifa_km:32,  tarifa_viaje:5500,  tarifa_dia:6500,  activo:true,  notas:"Maquinaria, estructuras metálicas" },
];

const D_EXTRAS_TABULADOR = [
  { id:"e1", concepto:"Maniobras de carga",     precio:500,  activo:true,  notas:"Por evento" },
  { id:"e2", concepto:"Maniobras de descarga",  precio:500,  activo:true,  notas:"Por evento" },
  { id:"e3", concepto:"Rampa hidráulica",        precio:800,  activo:true,  notas:"Por uso" },
  { id:"e4", concepto:"Segunda manija (ayudante)", precio:650, activo:true, notas:"Por viaje" },
  { id:"e5", concepto:"Hora de espera",          precio:280,  activo:true,  notas:"Por hora" },
  { id:"e6", concepto:"Seguro de carga adicional",precio:350, activo:true,  notas:"Por viaje" },
  { id:"e7", concepto:"Peaje estimado",          precio:0,    activo:true,  notas:"Se cotiza por ruta" },
];

const D_NOTAS_COT = [
  "* EL PRECIO DEL SERVICIO ES LIBRE DE MANIOBRAS Y ESTADIAS",
  "* SOLICITAR EL SERVICIO MÍNIMO CON DOS DÍAS DE ANTICIPACIÓN",
  "* VIGENCIA DE COTIZACIÓN 10 DÍAS DESPUÉS DE LA FECHA EMITIDA",
];

const D_COTIZACIONES = [];

// IVA / Retención según tipo de persona
// Moral: IVA 16% + RET IVA 4% del subtotal → neto a pagar = subtotal + 12%
// Física: IVA 16%, SIN retención
function calcFiscal(subtotal, tipoPersona) {
  const iva = subtotal * 0.16;
  const ret = tipoPersona === "moral" ? subtotal * 0.04 : 0;
  return { iva, ret, total: subtotal + iva - ret };
}

// ── Tabulador de tarifas (configuración) ──────────────────────────────────────
function TabuladorPage({ tabulador, extrasTabulador, onSaveTabulador, onSaveExtras, branding, clientes, cotizaciones, onSaveCotizaciones }) {
  const [tab, setTab] = useState("tarifas");

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <h2 style={{ fontFamily:"var(--font-hd)", fontSize:22, fontWeight:800, marginBottom:2 }}>📋 Cotizaciones y Tabulador</h2>
          <div style={{ color:"var(--muted)", fontSize:13 }}>Tarifas base, extras y generador de cotizaciones</div>
        </div>
        {tab === "cotizaciones" && (
          <button className="btn btn-cyan" onClick={() => {}}>➕ Nueva Cotización</button>
        )}
      </div>

      <div className="ftabs" style={{ marginBottom:16 }}>
        <button className={`ftab${tab==="cotizaciones"?" on":""}`} onClick={() => setTab("cotizaciones")}>📄 Cotizaciones</button>
        <button className={`ftab${tab==="tarifas"?" on":""}`} onClick={() => setTab("tarifas")}>🚛 Tarifas por Unidad</button>
        <button className={`ftab${tab==="extras"?" on":""}`} onClick={() => setTab("extras")}>➕ Extras y Cargos</button>
      </div>

      {tab === "tarifas" && <TarifasTab tabulador={tabulador} onSave={onSaveTabulador} />}
      {tab === "extras"  && <ExtrasTab  extras={extrasTabulador} onSave={onSaveExtras} />}
      {tab === "cotizaciones" && (
        <CotizacionesTab
          cotizaciones={cotizaciones}
          clientes={clientes}
          tabulador={tabulador}
          extrasTabulador={extrasTabulador}
          branding={branding}
          onSave={onSaveCotizaciones}
        />
      )}
    </div>
  );
}

function TarifasTab({ tabulador, onSave }) {
  const [rows, setRows] = useState(tabulador.map(r => ({...r})));
  const [editId, setEditId] = useState(null);
  const dirty = JSON.stringify(rows) !== JSON.stringify(tabulador);

  const upd = (id, field, val) => setRows(r => r.map(x => x.id===id ? {...x,[field]:val} : x));
  const addRow = () => {
    const nr = { id:"t"+Date.now(), tipo:"Nueva unidad", icono:"🚛", tarifa_km:0, tarifa_viaje:0, tarifa_dia:0, activo:true, notas:"" };
    setRows(r => [...r, nr]);
    setEditId(nr.id);
  };
  const del = id => setRows(r => r.filter(x => x.id !== id));

  return (
    <div>
      <div className="card">
        <div className="card-hdr">
          <h3>🚛 Tarifas por Tipo de Unidad</h3>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={addRow}>➕ Agregar tipo</button>
            {dirty && <button className="btn btn-cyan btn-sm" onClick={() => onSave(rows)}>💾 Guardar cambios</button>}
          </div>
        </div>
        <div className="card-body" style={{ padding:0 }}>
          <table>
            <thead>
              <tr>
                <th>Ícono</th><th>Tipo de Unidad</th>
                <th>Ciudad Origen</th><th>Ciudad Destino</th>
                <th style={{textAlign:"right"}}>$/km</th>
                <th style={{textAlign:"right"}}>$/viaje fijo</th>
                <th style={{textAlign:"right"}}>$/día</th>
                <th>Notas</th><th style={{textAlign:"center"}}>Activo</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{ background: editId===r.id ? "rgba(0,153,204,.05)" : "" }}>
                  <td>
                    {editId===r.id
                      ? <input value={r.icono} onChange={e=>upd(r.id,"icono",e.target.value)} style={{ width:44, padding:"4px 6px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:18, textAlign:"center" }}/>
                      : <span style={{ fontSize:22 }}>{r.icono}</span>
                    }
                  </td>
                  <td>
                    {editId===r.id
                      ? <input value={r.tipo} onChange={e=>upd(r.id,"tipo",e.target.value)} style={{ width:180, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:13 }}/>
                      : <strong>{r.tipo}</strong>
                    }
                  </td>
                  <td>
                    {editId===r.id
                      ? <input value={r.ciudad_origen||""} onChange={e=>upd(r.id,"ciudad_origen",e.target.value)} placeholder="Cualquier origen" style={{ width:130, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:12 }}/>
                      : <span style={{ fontSize:12, color:"var(--muted)" }}>{r.ciudad_origen||<span style={{fontStyle:"italic",color:"var(--muted)"}}>—</span>}</span>
                    }
                  </td>
                  <td>
                    {editId===r.id
                      ? <input value={r.ciudad_destino||""} onChange={e=>upd(r.id,"ciudad_destino",e.target.value)} placeholder="Cualquier destino" style={{ width:130, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:12 }}/>
                      : <span style={{ fontSize:12, color:"var(--muted)" }}>{r.ciudad_destino||<span style={{fontStyle:"italic",color:"var(--muted)"}}>—</span>}</span>
                    }
                  </td>
                  {["tarifa_km","tarifa_viaje","tarifa_dia"].map(f => (
                    <td key={f} style={{ textAlign:"right" }}>
                      {editId===r.id
                        ? <input type="number" value={r[f]} onChange={e=>upd(r.id,f,Number(e.target.value))} style={{ width:80, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:13, textAlign:"right" }}/>
                        : <span style={{ fontWeight:700, color:"var(--cyan)" }}>${r[f].toLocaleString("es-MX")}</span>
                      }
                    </td>
                  ))}
                  <td>
                    {editId===r.id
                      ? <input value={r.notas||""} onChange={e=>upd(r.id,"notas",e.target.value)} style={{ width:200, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:12 }}/>
                      : <span style={{ fontSize:12, color:"var(--muted)" }}>{r.notas}</span>
                    }
                  </td>
                  <td style={{ textAlign:"center" }}>
                    <input type="checkbox" checked={r.activo} onChange={e=>upd(r.id,"activo",e.target.checked)} style={{ width:16, height:16, accentColor:"var(--cyan)" }}/>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="btn btn-ghost btn-xs" onClick={() => setEditId(editId===r.id ? null : r.id)}>{editId===r.id?"✅":"✏️"}</button>
                      <button className="btn btn-ghost btn-xs" style={{ color:"var(--red)" }} onClick={() => del(r.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop:12, padding:"10px 16px", background:"rgba(0,153,204,.07)", borderRadius:8, border:"1px solid var(--cyan)", fontSize:12, color:"var(--muted)" }}>
        💡 Las tarifas son tu base de referencia. En cada cotización podrás ajustar el precio final manualmente.
      </div>
    </div>
  );
}

function ExtrasTab({ extras, onSave }) {
  const [rows, setRows] = useState(extras.map(r => ({...r})));
  const dirty = JSON.stringify(rows) !== JSON.stringify(extras);
  const upd = (id, f, v) => setRows(r => r.map(x => x.id===id ? {...x,[f]:v} : x));
  const addRow = () => setRows(r => [...r, { id:"e"+Date.now(), concepto:"Nuevo cargo", precio:0, activo:true, notas:"" }]);
  const del = id => setRows(r => r.filter(x => x.id !== id));

  return (
    <div className="card">
      <div className="card-hdr">
        <h3>➕ Extras y Cargos Adicionales</h3>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={addRow}>➕ Agregar</button>
          {dirty && <button className="btn btn-cyan btn-sm" onClick={() => onSave(rows)}>💾 Guardar</button>}
        </div>
      </div>
      <div className="card-body" style={{ padding:0 }}>
        <table>
          <thead><tr><th>Concepto</th><th style={{textAlign:"right"}}>Precio $</th><th>Notas</th><th style={{textAlign:"center"}}>Activo</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td><input value={r.concepto} onChange={e=>upd(r.id,"concepto",e.target.value)} style={{ width:"100%", padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:13 }}/></td>
                <td style={{ textAlign:"right" }}><input type="number" value={r.precio} onChange={e=>upd(r.id,"precio",Number(e.target.value))} style={{ width:90, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:13, textAlign:"right" }}/></td>
                <td><input value={r.notas||""} onChange={e=>upd(r.id,"notas",e.target.value)} style={{ width:"100%", padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:12 }}/></td>
                <td style={{ textAlign:"center" }}><input type="checkbox" checked={r.activo} onChange={e=>upd(r.id,"activo",e.target.checked)} style={{ width:16, height:16, accentColor:"var(--cyan)" }}/></td>
                <td><button className="btn btn-ghost btn-xs" style={{ color:"var(--red)" }} onClick={() => del(r.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Lista de cotizaciones ─────────────────────────────────────────────────────
function CotizacionesTab({ cotizaciones, clientes, tabulador, extrasTabulador, branding, onSave }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [preview, setPreview]     = useState(null);
  const [showFolioConfig, setShowFolioConfig] = useState(false);
  const [folioPrefix, setFolioPrefix]   = useState("");
  const [folioInicio, setFolioInicio]   = useState("");

  const del = id => onSave(cotizaciones.filter(c => c.id !== id));

  // Calcular siguiente folio automático
  const getSigFolio = () => {
    const base = folioInicio ? Number(folioInicio) : 4187;
    if (cotizaciones.length === 0) return folioPrefix ? `${folioPrefix}-${base}` : String(base);
    const nums = cotizaciones.map(c => {
      const raw = String(c.folio).replace(/^[A-Za-z]+-?/, "");
      return Number(raw) || 0;
    });
    const next = Math.max(...nums) + 1;
    return folioPrefix ? `${folioPrefix}-${next}` : String(next);
  };

  const estatus_color = { pendiente:"var(--yellow)", aceptada:"var(--green)", rechazada:"var(--red)", vencida:"var(--muted)" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowFolioConfig(f=>!f)}>⚙️ Configurar folio</button>
          {showFolioConfig && (
            <div style={{ display:"flex", gap:8, alignItems:"center", padding:"6px 12px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <label style={{ fontSize:10, color:"var(--muted)", fontWeight:700 }}>PREFIJO (ej: COT, JL, 2026)</label>
                <input value={folioPrefix} onChange={e=>setFolioPrefix(e.target.value.toUpperCase())} placeholder="ej: JL"
                  style={{ width:70, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:12 }}/>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <label style={{ fontSize:10, color:"var(--muted)", fontWeight:700 }}>INICIO DESDE</label>
                <input type="number" value={folioInicio} onChange={e=>setFolioInicio(e.target.value)} placeholder="ej: 4187"
                  style={{ width:80, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:12 }}/>
              </div>
              <div style={{ fontSize:11, color:"var(--cyan)", fontWeight:700, marginTop:14 }}>
                → Próximo: {getSigFolio()}
              </div>
            </div>
          )}
        </div>
        <button className="btn btn-cyan" onClick={() => { setEditing(null); setShowModal(true); }}>➕ Nueva Cotización</button>
      </div>

      {cotizaciones.length === 0 ? (
        <div className="empty"><div className="empty-icon">📄</div><p>Sin cotizaciones. Crea la primera.</p></div>
      ) : (
        <table>
          <thead><tr><th>Folio</th><th>Fecha</th><th>Cliente</th><th>Tipo Persona</th><th>Servicio</th><th style={{textAlign:"right"}}>Total</th><th>Estatus</th><th></th></tr></thead>
          <tbody>
            {[...cotizaciones].reverse().map(c => {
              const cli = clientes.find(x => x.id === c.clienteId);
              const fiscal = calcFiscal(c.subtotal || 0, c.tipoPersona);
              return (
                <tr key={c.id}>
                  <td><strong style={{ color:"var(--cyan)" }}>#{c.folio}</strong></td>
                  <td style={{ fontSize:12 }}>{c.fecha}</td>
                  <td>
                    <div style={{ fontWeight:700 }}>{cli?.nombre || c.clienteNombre || "—"}</div>
                    <div style={{ fontSize:10, color:"var(--muted)" }}>{c.atencion}</div>
                  </td>
                  <td><Bdg c={c.tipoPersona==="moral"?"bb":"bg"} t={c.tipoPersona==="moral"?"Moral":"Física"}/></td>
                  <td style={{ fontSize:12 }}>{c.servicio} · {c.origen} → {c.destino}</td>
                  <td style={{ textAlign:"right", fontWeight:700, color:"var(--green)" }}>${fiscal.total.toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
                  <td>
                    <select value={c.estatus||"pendiente"} onChange={e => onSave(cotizaciones.map(x => x.id===c.id ? {...x,estatus:e.target.value} : x))}
                      style={{ padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color: estatus_color[c.estatus||"pendiente"] || "var(--text)", fontSize:11, fontWeight:700 }}>
                      <option value="pendiente">⏳ Pendiente</option>
                      <option value="aceptada">✅ Aceptada</option>
                      <option value="rechazada">❌ Rechazada</option>
                      <option value="vencida">⏰ Vencida</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="btn btn-cyan btn-xs" title="Ver / Imprimir" onClick={() => setPreview(c)}>🖨️</button>
                      <button className="btn btn-ghost btn-xs" title="Editar" onClick={() => { setEditing(c); setShowModal(true); }}>✏️</button>
                      <button className="btn btn-ghost btn-xs" style={{ color:"var(--red)" }} title="Eliminar" onClick={() => del(c.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <CotizacionModal
          cotizacion={editing}
          clientes={clientes}
          tabulador={tabulador}
          extrasTabulador={extrasTabulador}
          folioSig={getSigFolio()}
          onSave={c => {
            if (editing) onSave(cotizaciones.map(x => x.id===c.id ? c : x));
            else onSave([...cotizaciones, c]);
            setShowModal(false); setEditing(null);
          }}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}

      {preview && (
        <CotizacionPreviewModal
          cotizacion={preview}
          branding={branding}
          clientes={clientes}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

// ── Modal Nueva/Editar Cotización ─────────────────────────────────────────────
function CotizacionModal({ cotizacion, clientes, tabulador, extrasTabulador, folioSig, onSave, onClose }) {
  const hoy = new Date().toISOString().slice(0,10);

  const [form, setForm] = useState(cotizacion ? {...cotizacion} : {
    id: "cot_"+Date.now(),
    folio: String(folioSig),
    fecha: hoy,
    clienteId: "",
    clienteNombre: "",
    atencion: "",
    tipoPersona: "moral",
    servicio: "",
    unidadTipo: "",
    material: "",
    origen: "",
    destino: "",
    km: "",
    modalidadTarifa: "viaje",
    conceptos: [{ id:"c1", cant:1, desc:"Servicio de transporte", precioUnit:0, precioTotal:0 }],
    extras: [],
    observaciones: "",
    notasImportantes: [...D_NOTAS_COT],
    estatus: "pendiente",
  });

  const upd = (field, v) => setForm(p => ({...p, [field]:v}));

  // Calcular subtotal desde conceptos + extras
  const subtotalConceptos = form.conceptos.reduce((s,c) => s + (c.precioTotal||0), 0);
  const subtotalExtras    = form.extras.reduce((s,e) => s + (e.precioTotal||0), 0);
  const subtotal = subtotalConceptos + subtotalExtras;
  const fiscal = calcFiscal(subtotal, form.tipoPersona);

  // Actualizar concepto
  const updConcepto = (id, field, val) => {
    setForm(p => ({...p, conceptos: p.conceptos.map(c => {
      if (c.id !== id) return c;
      const updated = {...c, [field]: field==="cant"||field==="precioUnit" ? Number(val) : val};
      if (field==="cant"||field==="precioUnit") updated.precioTotal = updated.cant * updated.precioUnit;
      if (field==="precioTotal") { updated.precioTotal = Number(val); }
      return updated;
    })}));
  };
  const addConcepto = () => setForm(p => ({...p, conceptos:[...p.conceptos, { id:"c"+Date.now(), cant:1, desc:"", precioUnit:0, precioTotal:0 }]}));
  const delConcepto = id => setForm(p => ({...p, conceptos: p.conceptos.filter(c => c.id!==id)}));

  // Autocompletar precio desde tabulador
  const aplicarTarifa = () => {
    const row = tabulador.find(r => r.tipo === form.unidadTipo);
    if (!row) return;
    let precio = 0;
    if (form.modalidadTarifa==="km" && form.km) precio = row.tarifa_km * Number(form.km);
    else if (form.modalidadTarifa==="dia") precio = row.tarifa_dia;
    else precio = row.tarifa_viaje;
    setForm(p => ({...p, conceptos: p.conceptos.map((c,i) => i===0 ? {...c, precioUnit:precio, precioTotal:c.cant*precio} : c)}));
  };

  // Manejar extras
  const toggleExtra = (extra) => {
    const ya = form.extras.find(e => e.id===extra.id);
    if (ya) setForm(p => ({...p, extras: p.extras.filter(e => e.id!==extra.id)}));
    else setForm(p => ({...p, extras:[...p.extras, { ...extra, precioTotal: extra.precio }]}));
  };
  const updExtraPrecio = (id, val) => setForm(p => ({...p, extras: p.extras.map(e => e.id===id ? {...e, precioTotal:Number(val)} : e)}));

  // Notas importantes
  const updNota = (i, v) => setForm(p => ({...p, notasImportantes: p.notasImportantes.map((n,j)=>j===i?v:n)}));
  const addNota = () => setForm(p => ({...p, notasImportantes:[...p.notasImportantes, "* "]}));
  const delNota = i => setForm(p => ({...p, notasImportantes: p.notasImportantes.filter((_,j)=>j!==i)}));

  const handleClienteChange = (id) => {
    const cli = clientes.find(c => c.id===id);
    upd("clienteId", id);
    if (cli) {
      upd("clienteNombre", cli.nombre);
      upd("tipoPersona", cli.tipoPersona || "moral");
    }
  };

  const handleSave = () => {
    const final = { ...form, subtotal };
    onSave(final);
  };

  const F = ({ label, children, required }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase" }}>{label}{required&&<span style={{color:"var(--red)"}}>*</span>}</label>
      {children}
    </div>
  );
  const inp = { padding:"8px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:13, width:"100%", boxSizing:"border-box", outline:"none" };

  return (
    <div className="modal-ov" onMouseDown={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal wide" style={{ maxWidth:720, maxHeight:"92vh", overflowY:"auto" }} onMouseDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
        <div className="mhdr">
          <h3>📄 {cotizacion ? "Editar" : "Nueva"} Cotización — Folio #{form.folio}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody" style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Fila 1: Fecha, folio, tipo persona */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <F label="Fecha"><input type="date" value={form.fecha} onChange={e=>upd("fecha",e.target.value)} style={inp}/></F>
            <F label="Folio"><input value={form.folio} onChange={e=>upd("folio",e.target.value)} style={inp}/></F>
            <F label="Tipo de Persona">
              <select value={form.tipoPersona} onChange={e=>upd("tipoPersona",e.target.value)} style={inp}>
                <option value="moral">🏢 Persona Moral (RET 4%)</option>
                <option value="fisica">👤 Persona Física (Sin RET)</option>
              </select>
            </F>
          </div>

          {/* Fila 2: Cliente */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <F label="Cliente">
              <select value={form.clienteId} onChange={e=>handleClienteChange(e.target.value)} style={inp}>
                <option value="">— Seleccionar cliente —</option>
                {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                <option value="__nuevo__">✏️ Escribir nombre manual</option>
              </select>
            </F>
            <F label="Nombre cliente (manual o de catálogo)">
              <input value={form.clienteNombre} onChange={e=>upd("clienteNombre",e.target.value)} placeholder="Nombre del cliente" style={inp}/>
            </F>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <F label="Atención (nombre del contacto)"><input value={form.atencion} onChange={e=>upd("atencion",e.target.value)} placeholder="Ing. / Lic. ..." style={inp}/></F>
            <F label="Servicio"><input value={form.servicio} onChange={e=>upd("servicio",e.target.value)} placeholder="Transporte de..." style={inp}/></F>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12 }}>
            <F label="Tipo de Unidad">
              <select value={form.unidadTipo} onChange={e=>upd("unidadTipo",e.target.value)} style={inp}>
                <option value="">— Tipo —</option>
                {tabulador.filter(r=>r.activo).map(r=><option key={r.id} value={r.tipo}>{r.icono} {r.tipo}</option>)}
              </select>
            </F>
            <F label="Material / Carga"><input value={form.material} onChange={e=>upd("material",e.target.value)} style={inp}/></F>
            <F label="Origen"><input value={form.origen} onChange={e=>upd("origen",e.target.value)} style={inp}/></F>
            <F label="Destino"><input value={form.destino} onChange={e=>upd("destino",e.target.value)} style={inp}/></F>
          </div>

          {/* Auto-precio desde tabulador */}
          <div style={{ padding:"12px 16px", background:"rgba(0,153,204,.07)", borderRadius:10, border:"1px solid var(--cyan)", display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--cyan)", flex:"0 0 100%" }}>⚡ Aplicar tarifa desde tabulador</div>
            <F label="Modalidad">
              <select value={form.modalidadTarifa} onChange={e=>upd("modalidadTarifa",e.target.value)} style={{ ...inp, width:130 }}>
                <option value="viaje">Por viaje</option>
                <option value="km">Por km</option>
                <option value="dia">Por día</option>
              </select>
            </F>
            {form.modalidadTarifa==="km" && (
              <F label="Distancia (km)">
                <input type="number" value={form.km} onChange={e=>upd("km",e.target.value)} placeholder="km" style={{ ...inp, width:90 }}/>
              </F>
            )}
            <button className="btn btn-cyan btn-sm" onClick={aplicarTarifa} disabled={!form.unidadTipo}>
              ⚡ Autocompletar precio
            </button>
            {form.unidadTipo && tabulador.find(r=>r.tipo===form.unidadTipo) && (
              <div style={{ fontSize:11, color:"var(--muted)" }}>
                {form.unidadTipo}: ${tabulador.find(r=>r.tipo===form.unidadTipo)?.tarifa_viaje?.toLocaleString()} /viaje · ${tabulador.find(r=>r.tipo===form.unidadTipo)?.tarifa_km} /km · ${tabulador.find(r=>r.tipo===form.unidadTipo)?.tarifa_dia?.toLocaleString()} /día
              </div>
            )}
          </div>

          {/* Conceptos */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <label style={{ fontSize:12, fontWeight:700, color:"var(--muted)", textTransform:"uppercase" }}>Conceptos</label>
              <button className="btn btn-ghost btn-xs" onClick={addConcepto}>➕ Agregar línea</button>
            </div>
            <table style={{ marginBottom:0 }}>
              <thead><tr><th style={{width:60}}>Cant.</th><th>Descripción</th><th style={{textAlign:"right",width:120}}>Precio Unit.</th><th style={{textAlign:"right",width:120}}>Total</th><th style={{width:36}}></th></tr></thead>
              <tbody>
                {form.conceptos.map(c => (
                  <tr key={c.id}>
                    <td><input type="number" value={c.cant} onChange={e=>updConcepto(c.id,"cant",e.target.value)} style={{ width:56, padding:"5px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", textAlign:"center" }}/></td>
                    <td><input value={c.desc} onChange={e=>updConcepto(c.id,"desc",e.target.value)} style={{ width:"100%", padding:"5px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", fontSize:13 }}/></td>
                    <td><input type="number" value={c.precioUnit} onChange={e=>updConcepto(c.id,"precioUnit",e.target.value)} style={{ width:110, padding:"5px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", textAlign:"right" }}/></td>
                    <td style={{ textAlign:"right" }}>
                      <input type="number" value={c.precioTotal} onChange={e=>updConcepto(c.id,"precioTotal",e.target.value)} style={{ width:110, padding:"5px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--cyan)", fontWeight:700, textAlign:"right" }}/>
                    </td>
                    <td><button className="btn btn-ghost btn-xs" style={{color:"var(--red)"}} onClick={()=>delConcepto(c.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extras */}
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", display:"block", marginBottom:8 }}>Extras y Cargos Adicionales</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:8 }}>
              {extrasTabulador.filter(e=>e.activo).map(e => {
                const activo = form.extras.some(x=>x.id===e.id);
                return (
                  <button key={e.id} onClick={()=>toggleExtra(e)}
                    style={{ padding:"6px 12px", borderRadius:8, border:`1.5px solid ${activo?"var(--cyan)":"var(--border)"}`, background:activo?"rgba(0,153,204,.12)":"var(--bg2)", color:activo?"var(--cyan)":"var(--text)", fontSize:12, cursor:"pointer", fontWeight:activo?700:400 }}>
                    {activo?"✅ ":""}{e.concepto} {e.precio>0?`$${e.precio.toLocaleString()}`:"(cotizar)"}
                  </button>
                );
              })}
            </div>
            {form.extras.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {form.extras.map(e => (
                  <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 12px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                    <span style={{ flex:1, fontSize:13 }}>{e.concepto}</span>
                    <input type="number" value={e.precioTotal} onChange={ev=>updExtraPrecio(e.id,ev.target.value)} style={{ width:100, padding:"4px 8px", borderRadius:6, border:"1px solid var(--border)", background:"var(--bg0)", color:"var(--text)", textAlign:"right" }}/>
                    <button className="btn btn-ghost btn-xs" style={{color:"var(--red)"}} onClick={()=>toggleExtra(e)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totales fiscales */}
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ minWidth:300, padding:"16px 20px", background:"var(--bg2)", borderRadius:12, border:"1px solid var(--border)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                <span style={{ color:"var(--muted)" }}>SUB TOTAL</span>
                <strong>${subtotal.toLocaleString("es-MX",{minimumFractionDigits:2})}</strong>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                <span style={{ color:"var(--muted)" }}>IVA (16%)</span>
                <strong>${fiscal.iva.toLocaleString("es-MX",{minimumFractionDigits:2})}</strong>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:13 }}>
                <span style={{ color: form.tipoPersona==="moral" ? "var(--orange)" : "var(--muted)" }}>
                  RET. IVA (4%) {form.tipoPersona==="fisica" && <span style={{fontSize:10}}>(Persona Física — no aplica)</span>}
                </span>
                <strong style={{ color: form.tipoPersona==="moral" ? "var(--orange)" : "var(--muted)" }}>
                  {form.tipoPersona==="moral" ? `-$${fiscal.ret.toLocaleString("es-MX",{minimumFractionDigits:2})}` : "$0.00"}
                </strong>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, borderTop:"2px solid var(--border)", fontSize:17, fontWeight:900 }}>
                <span>TOTAL</span>
                <span style={{ color:"var(--cyan)" }}>${fiscal.total.toLocaleString("es-MX",{minimumFractionDigits:2})}</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <F label="Observaciones">
            <textarea value={form.observaciones} onChange={e=>upd("observaciones",e.target.value)} rows={2} placeholder="Condiciones especiales, aclaraciones..." style={{ ...inp, resize:"vertical" }}/>
          </F>

          {/* Notas importantes editables */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <label style={{ fontSize:12, fontWeight:700, color:"var(--muted)", textTransform:"uppercase" }}>Notas Importantes</label>
              <button className="btn btn-ghost btn-xs" onClick={addNota}>➕ Agregar nota</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {form.notasImportantes.map((n,i) => (
                <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input value={n} onChange={e=>updNota(i,e.target.value)} style={{ ...inp, fontSize:12 }}/>
                  <button className="btn btn-ghost btn-xs" style={{color:"var(--red)",flexShrink:0}} onClick={()=>delNota(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>

        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-cyan" onClick={handleSave}>💾 Guardar Cotización</button>
        </div>
      </div>
    </div>
  );
}

// ── Preview / Imprimir / WhatsApp ─────────────────────────────────────────────
function CotizacionPreviewModal({ cotizacion: c, branding, clientes, onClose }) {
  const cli = clientes.find(x => x.id === c.clienteId);
  const fiscal = calcFiscal(c.subtotal || 0, c.tipoPersona);
  const fmtMXN = n => "$" + (n||0).toLocaleString("es-MX",{minimumFractionDigits:2});

  const htmlContent = () => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Cotización #${c.folio}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #222; background:#fff; padding:24px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; border-bottom:3px solid #1a6fa0; padding-bottom:12px; }
  .logo-area h1 { font-size:20px; font-weight:900; color:#1a6fa0; }
  .logo-area p  { font-size:10px; color:#666; margin-top:2px; }
  .folio-area { text-align:right; }
  .folio-area .fecha { font-size:11px; color:#444; }
  .folio-area .folio { font-size:15px; font-weight:900; color:#1a6fa0; margin-top:4px; }
  .info-box { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; padding:10px 14px; background:#f4f8fb; border:1px solid #d0e4f0; border-radius:6px; }
  .info-box .lbl { font-size:10px; color:#888; font-weight:700; text-transform:uppercase; }
  .info-box .val { font-size:12px; font-weight:700; margin-top:1px; }
  table { width:100%; border-collapse:collapse; margin-bottom:14px; }
  thead th { background:#1a6fa0; color:#fff; padding:7px 10px; text-align:left; font-size:11px; }
  thead th.right { text-align:right; }
  tbody td { padding:6px 10px; border-bottom:1px solid #e8e8e8; vertical-align:middle; }
  tbody td.right { text-align:right; font-weight:700; }
  .totales { float:right; width:280px; border:1px solid #d0e4f0; border-radius:6px; overflow:hidden; margin-bottom:14px; }
  .totales .row { display:flex; justify-content:space-between; padding:7px 14px; font-size:12px; border-bottom:1px solid #e8e8e8; }
  .totales .row.total { background:#1a6fa0; color:#fff; font-size:15px; font-weight:900; border-bottom:none; }
  .totales .row.ret { color:#e07000; }
  .obs { clear:both; margin-bottom:14px; }
  .obs p { color:#555; font-size:11px; }
  .notas { background:#fffbe6; border:1px solid #e0c84a; border-radius:6px; padding:10px 14px; }
  .notas strong { font-size:11px; color:#7a6000; display:block; margin-bottom:6px; }
  .notas p { font-size:10px; color:#555; margin-bottom:3px; }
  .tipo-persona { display:inline-block; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:700; background:${c.tipoPersona==="moral"?"#dbeafe":"#dcfce7"}; color:${c.tipoPersona==="moral"?"#1d4ed8":"#166534"}; margin-left:6px; }
  @media print { body { padding:12px; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo-area">
    ${branding.logo ? `<img src="${branding.logo}" style="max-height:52px; max-width:180px; object-fit:contain;" alt="logo"/>` : `<h1>${branding.nombre||"JL Transportaciones"}</h1>`}
    <p>${branding.slogan||""}</p>
  </div>
  <div class="folio-area">
    <div class="fecha">Fecha: ${c.fecha}</div>
    <div class="folio">Folio: ${c.folio}</div>
    <div class="tipo-persona">${c.tipoPersona==="moral"?"Persona Moral":"Persona Física"}</div>
  </div>
</div>

<div class="info-box">
  <div><div class="lbl">Cliente</div><div class="val">${c.clienteNombre||cli?.nombre||"—"}</div></div>
  <div><div class="lbl">Atención</div><div class="val">${c.atencion||"—"}</div></div>
  <div><div class="lbl">Servicio</div><div class="val">${c.servicio||"—"}</div></div>
  <div><div class="lbl">Unidad</div><div class="val">${c.unidadTipo||"—"}</div></div>
  <div><div class="lbl">Origen</div><div class="val">${c.origen||"—"}</div></div>
  <div><div class="lbl">Destino</div><div class="val">${c.destino||"—"}</div></div>
  ${c.material ? `<div><div class="lbl">Material</div><div class="val">${c.material}</div></div>` : ""}
</div>

<table>
  <thead><tr><th style="width:50px">Cant.</th><th>Descripción</th><th class="right" style="width:130px">Precio Unitario</th><th class="right" style="width:130px">Precio Total</th></tr></thead>
  <tbody>
    ${(c.conceptos||[]).map(row=>`<tr><td style="text-align:center">${row.cant}</td><td>${row.desc}</td><td class="right">${fmtMXN(row.precioUnit)}</td><td class="right">${fmtMXN(row.precioTotal)}</td></tr>`).join("")}
    ${(c.extras||[]).map(e=>`<tr><td style="text-align:center">1</td><td>${e.concepto}</td><td class="right">${fmtMXN(e.precioTotal)}</td><td class="right">${fmtMXN(e.precioTotal)}</td></tr>`).join("")}
  </tbody>
</table>

<div class="totales">
  <div class="row"><span>SUB TOTAL</span><span>${fmtMXN(c.subtotal)}</span></div>
  <div class="row"><span>IVA (16%)</span><span>${fmtMXN(fiscal.iva)}</span></div>
  <div class="row ret"><span>RET. IVA (4%)${c.tipoPersona==="fisica"?' <small style="font-weight:400;font-size:9px">N/A Física</small>':""}</span><span>${c.tipoPersona==="moral"?"-"+fmtMXN(fiscal.ret):"$0.00"}</span></div>
  <div class="row total"><span>TOTAL</span><span>${fmtMXN(fiscal.total)}</span></div>
</div>

${c.observaciones ? `<div class="obs" style="clear:both; padding-top:8px"><strong style="font-size:10px;color:#888;text-transform:uppercase;">Observaciones:</strong><p>${c.observaciones}</p></div>` : `<div style="clear:both"></div>`}

${c.notasImportantes&&c.notasImportantes.length>0 ? `
<div class="notas">
  <strong>NOTAS IMPORTANTES:</strong>
  ${c.notasImportantes.map(n=>`<p>${n}</p>`).join("")}
</div>` : ""}

<script>window.onload=()=>{window.print();}</script>
</body>
</html>`;

  const handleImprimir = () => {
    const w = window.open("","_blank","width=800,height=700");
    w.document.write(htmlContent());
    w.document.close();
  };

  const handleWhatsApp = () => {
    const fiscal2 = calcFiscal(c.subtotal||0, c.tipoPersona);
    const fmx = n => "$"+Number(n).toLocaleString("es-MX",{minimumFractionDigits:2});
    const lineas = (c.conceptos||[]).map(x=>`• ${x.cant}x ${x.desc}: ${fmx(x.precioTotal)}`).join("\n");
    const extras = (c.extras||[]).map(x=>`• ${x.concepto}: ${fmx(x.precioTotal)}`).join("\n");
    const msg =
`📋 *COTIZACIÓN #${c.folio}*
📅 Fecha: ${c.fecha}
🏢 Cliente: ${c.clienteNombre || "—"}
${c.atencion ? `👤 Atención: ${c.atencion}` : ""}

🚛 *Servicio:* ${c.servicio||"—"}
📦 Unidad: ${c.unidadTipo||"—"}
📍 ${c.origen||"—"} → ${c.destino||"—"}
${c.material?"📦 Material: "+c.material:""}

*Conceptos:*
${lineas}
${extras ? "\n*Extras:*\n"+extras : ""}

━━━━━━━━━━━━━━
💰 Subtotal: ${fmx(c.subtotal)}
📊 IVA 16%: ${fmx(fiscal2.iva)}
${c.tipoPersona==="moral"?`📉 Ret. IVA 4%: -${fmx(fiscal2.ret)}\n`:""}✅ *TOTAL: ${fmx(fiscal2.total)}*
_(${c.tipoPersona==="moral"?"Persona Moral — aplica retención 4%":"Persona Física — sin retención"})_

${c.notasImportantes&&c.notasImportantes.length>0 ? c.notasImportantes.join("\n") : ""}

_${branding?.nombre||"JL Transportaciones"}_`;
    const url = "https://wa.me/?text=" + encodeURIComponent(msg);
    window.open(url, "_blank");
  };

  const fiscal2 = calcFiscal(c.subtotal||0, c.tipoPersona);
  const fmx = n => "$"+Number(n||0).toLocaleString("es-MX",{minimumFractionDigits:2});

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" style={{ maxWidth:640, maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div className="mhdr" style={{ borderBottom:"3px solid #1a6fa0" }}>
          <h3>📄 Cotización #{c.folio}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="mbody" style={{ fontFamily:"Arial, sans-serif", fontSize:13 }}>

          {/* Mini preview */}
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, padding:"12px 16px", background:"#f4f8fb", borderRadius:8, border:"1px solid #d0e4f0" }}>
            <div>
              <div style={{ fontSize:11, color:"#888" }}>CLIENTE</div>
              <div style={{ fontWeight:700 }}>{c.clienteNombre||"—"}</div>
              {c.atencion && <div style={{ fontSize:11, color:"#555" }}>Atención: {c.atencion}</div>}
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"#888" }}>FECHA · FOLIO</div>
              <div style={{ fontWeight:700 }}>{c.fecha}</div>
              <div style={{ color:"#1a6fa0", fontWeight:900, fontSize:15 }}>#{c.folio}</div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            {[["Servicio",c.servicio],["Unidad",c.unidadTipo],["Origen",c.origen],["Destino",c.destino],["Material",c.material],["Tipo Persona",c.tipoPersona==="moral"?"🏢 Moral":"👤 Física"]].filter(([,v])=>v).map(([l,v])=>(
              <div key={l} style={{ padding:"8px 12px", background:"var(--bg2)", borderRadius:6, border:"1px solid var(--border)" }}>
                <div style={{ fontSize:10, color:"var(--muted)" }}>{l}</div>
                <div style={{ fontWeight:700, fontSize:12 }}>{v}</div>
              </div>
            ))}
          </div>

          <table style={{ marginBottom:12 }}>
            <thead><tr><th>Cant.</th><th>Descripción</th><th style={{textAlign:"right"}}>Total</th></tr></thead>
            <tbody>
              {(c.conceptos||[]).map(x=><tr key={x.id}><td style={{textAlign:"center"}}>{x.cant}</td><td>{x.desc}</td><td style={{textAlign:"right",fontWeight:700}}>{fmx(x.precioTotal)}</td></tr>)}
              {(c.extras||[]).map(x=><tr key={x.id}><td style={{textAlign:"center"}}>1</td><td>{x.concepto}</td><td style={{textAlign:"right",fontWeight:700}}>{fmx(x.precioTotal)}</td></tr>)}
            </tbody>
          </table>

          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
            <div style={{ minWidth:260, padding:"12px 16px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
              {[["SUB TOTAL",fmx(c.subtotal),"var(--text)"],["IVA (16%)",fmx(fiscal2.iva),"var(--text)"],["RET. IVA (4%)",c.tipoPersona==="moral"?`-${fmx(fiscal2.ret)}`:"N/A (Física)",c.tipoPersona==="moral"?"var(--orange)":"var(--muted)"]].map(([l,v,col])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12 }}>
                  <span style={{ color:"var(--muted)" }}>{l}</span><strong style={{ color:col }}>{v}</strong>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"2px solid var(--border)", fontWeight:900, fontSize:16, color:"var(--cyan)" }}>
                <span>TOTAL</span><span>{fmx(fiscal2.total)}</span>
              </div>
            </div>
          </div>

          {c.observaciones && (
            <div style={{ padding:"8px 12px", background:"var(--bg2)", borderRadius:6, marginBottom:10, fontSize:12 }}>
              <strong>Observaciones:</strong> {c.observaciones}
            </div>
          )}

          {c.notasImportantes?.length > 0 && (
            <div style={{ padding:"10px 14px", background:"rgba(255,220,0,.08)", border:"1px solid var(--yellow)", borderRadius:8, fontSize:11 }}>
              <strong style={{ display:"block", marginBottom:6 }}>NOTAS IMPORTANTES:</strong>
              {c.notasImportantes.map((n,i)=><div key={i}>{n}</div>)}
            </div>
          )}
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-ghost" style={{ color:"var(--green)", border:"1px solid var(--green)" }} onClick={handleWhatsApp}>💬 WhatsApp</button>
          <button className="btn btn-cyan" onClick={handleImprimir}>🖨️ Imprimir / PDF</button>
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// HELP PAGE — Centro de ayuda del sistema
// ══════════════════════════════════════════════════════════════════════════════
const AYUDA_DATA = [
  {
    id: "inicio", icono: "🚀", titulo: "Primeros pasos",
    color: "var(--cyan)",
    preguntas: [
      { q: "¿Cómo empiezo a usar el sistema?",
        a: "El flujo básico es: 1) Registra tus unidades en Flota → Unidades. 2) Da de alta conductores en Flota → Conductores. 3) Asigna conductores a unidades. 4) Registra viajes en Flota → Viajes. 5) Controla combustible y mantenimientos en el módulo Control." },
      { q: "¿Cómo configuro el logo y nombre de mi empresa?",
        a: "Haz clic en el logo de la empresa en la parte superior del sidebar (aparece el ícono ✏️). Ahí puedes subir tu logo, cambiar el nombre de empresa y slogan. El logo aparece en documentos impresos y cotizaciones." },
      { q: "¿Los datos se guardan automáticamente?",
        a: "Sí. Cada registro se guarda automáticamente en Firebase y sincroniza en tiempo real entre todos los dispositivos conectados. No necesitas hacer copias manuales." },
      { q: "¿Puedo usar el sistema en múltiples computadoras al mismo tiempo?",
        a: "Sí. Firebase sincroniza los datos en tiempo real. Si alguien registra un viaje desde una PC, aparece de inmediato en los demás dispositivos sin recargar la página." },
      { q: "¿Cómo instalo la app en mi computadora o celular?",
        a: "En Chrome, busca el ícono de instalación en la barra de URL (⊕) y haz clic en 'Instalar'. En iPhone: desde Safari, presiona Compartir → 'Agregar a pantalla de inicio'. Funciona como app nativa sin necesidad de tiendas." },
      { q: "¿Qué hago si olvidé mi contraseña?",
        a: "Pide al Administrador del sistema que la resetee desde Gestión de Usuarios → botón 🔒 Reset en tu fila." },
    ]
  },
  {
    id: "flota", icono: "🚛", titulo: "Flota y Unidades",
    color: "var(--orange)",
    preguntas: [
      { q: "¿Cómo registro una unidad nueva?",
        a: "Ve a Flota → Unidades → '➕ Nueva Unidad'. Llena número económico, placas, tipo, marca, modelo y año. También puedes cargar una fotografía. Los KM actuales y el intervalo de mantenimiento se usan para calcular cuándo toca el próximo servicio." },
      { q: "¿Cómo agrego un nuevo tipo de unidad?",
        a: "Al crear o editar una unidad, en el campo 'Tipo' hay un selector con tipos predefinidos. Selecciona '✏️ Agregar tipo nuevo...' al final del menú, escribe el nombre y presiona Enter o haz clic fuera del campo. El tipo nuevo queda guardado y disponible para todas las unidades." },
      { q: "¿Cómo asigno un conductor a una unidad?",
        a: "En el formulario de la unidad, busca el campo 'Operador' y selecciona el conductor del menú desplegable. También puedes hacerlo desde el perfil del conductor en Flota → Conductores." },
      { q: "¿Cómo registro un viaje?",
        a: "Ve a Flota → Viajes → '➕ Nuevo Viaje'. Selecciona unidad o logística externa, origen, destino, cliente y tarifa. Una vez completado, cambia el status a COMPLETADO para que se refleje en reportes y nóminas." },
      { q: "¿Qué es la Hoja de Viaje?",
        a: "Es un documento con instrucciones para el operador: ruta, cliente, datos de contacto, observaciones. Se genera desde Flota → Conductores o desde el viaje. Puedes descargarla como HTML o enviarla por WhatsApp." },
      { q: "¿Qué diferencia hay entre un viaje propio y logística externa?",
        a: "Un viaje propio usa tus unidades y conductores. La logística externa es subcontratada a un tercero. Los viajes externos no se cuentan en las nóminas de tus operadores pero sí en tus ingresos y en las gráficas de rentabilidad." },
    ]
  },
  {
    id: "conductores", icono: "👤", titulo: "Conductores",
    color: "var(--cyan)",
    preguntas: [
      { q: "¿Cómo registro un conductor?",
        a: "Ve a Flota → Conductores → '➕ Nuevo Conductor'. Los datos básicos son: nombre, licencia (tipo y vigencia), teléfono. En la sección de Nómina define el sueldo base y % de comisión por viaje." },
      { q: "¿Qué es la Hoja de Viaje del conductor?",
        a: "Es un resumen de los viajes asignados al conductor con detalles de ruta, cliente y observaciones. Se genera desde el botón '🗺️ H.Viaje' en la lista de conductores. Se puede descargar o enviar por WhatsApp." },
      { q: "¿Cómo configuro el sueldo y comisión de un operador?",
        a: "Abre el perfil del conductor en Flota → Conductores y busca la sección '💵 Nómina'. Define sueldo base mensual y porcentaje de comisión por viaje completado." },
    ]
  },
  {
    id: "mantenimiento", icono: "🔧", titulo: "Mantenimientos",
    color: "var(--yellow)",
    preguntas: [
      { q: "¿Cómo programo un mantenimiento?",
        a: "Ve a Control → Mantenimientos → '➕ Nuevo'. Selecciona la unidad, tipo de servicio (preventivo/correctivo), fecha programada y proveedor. Cuando se realice, cambia el status a COMPLETADO e ingresa el costo real." },
      { q: "¿Cómo sé qué unidades necesitan mantenimiento pronto?",
        a: "El Dashboard muestra alertas de mantenimientos próximos. En el módulo Alertas (🔔 en el sidebar) verás todas las unidades con mantenimiento vencido o por vencer." },
      { q: "¿Cómo funciona el seguimiento por KM?",
        a: "En cada unidad defines los KM actuales y el intervalo de mantenimiento (ej: 5,000 km). Al registrar combustible con los KM recorridos, el sistema calcula automáticamente cuántos KM faltan para el próximo servicio." },
      { q: "¿Puedo registrar mantenimientos correctivos (emergencias)?",
        a: "Sí. Al crear el mantenimiento, selecciona tipo 'Correctivo' y prioridad 'ALTA'. Puedes dejar la fecha programada como el mismo día del incidente." },
    ]
  },
  {
    id: "documentos", icono: "📄", titulo: "Documentos y Vigencias",
    color: "var(--purple)",
    preguntas: [
      { q: "¿Qué documentos puedo rastrear?",
        a: "Cualquier documento con fecha de vencimiento: verificaciones, seguros, permisos SCT, licencias de conductores, tarjetas de circulación, etc. El sistema alerta 30 días antes del vencimiento." },
      { q: "¿Con cuántos días de anticipación me avisa el sistema?",
        a: "Las alertas se activan 30 días antes del vencimiento. Aparecen en el módulo Alertas, en el Dashboard y en el badge de la campana en el sidebar." },
      { q: "¿Puedo subir el PDF o imagen del documento?",
        a: "Actualmente el sistema guarda los datos y fechas del documento. La funcionalidad de adjuntar archivos está en el roadmap de próximas versiones." },
    ]
  },
  {
    id: "combustible", icono: "⛽", titulo: "Combustible",
    color: "var(--orange)",
    preguntas: [
      { q: "¿Cómo registro una carga de combustible?",
        a: "Ve a Control → Combustible → '➕ Registrar'. Selecciona la unidad, fecha, litros cargados, precio por litro y estación. El sistema calcula el costo total y el rendimiento (km/L) automáticamente si ingresas los KM recorridos." },
      { q: "¿Cómo veo el rendimiento de mis unidades?",
        a: "En el módulo Combustible, cada registro muestra el rendimiento en km/L. En Gráficas → Combustible puedes ver el rendimiento histórico por unidad y comparar qué unidades consumen más." },
    ]
  },
  {
    id: "facturacion", icono: "🧾", titulo: "Facturación y Clientes",
    color: "var(--green)",
    preguntas: [
      { q: "¿Cómo creo una factura?",
        a: "Ve a Finanzas → Facturación → '➕ Nueva Factura'. Selecciona el cliente, agrega los conceptos y el monto. La factura queda en status PENDIENTE hasta que la marques como cobrada con el botón '✓ Pagar'." },
      { q: "¿Cómo timbro una factura (CFDI)?",
        a: "El sistema está integrado con Facturapi para timbrado CFDI 4.0 con Complemento Carta Porte 3.1. Solo el Administrador puede timbrar. Configura tu API Key de Facturapi en Ajustes → Facturapi. Sin key real, puedes hacer pruebas en modo simulación." },
      { q: "¿Qué es el Complemento Carta Porte?",
        a: "Es el complemento fiscal obligatorio en México para facturas de servicios de transporte de carga. El sistema lo genera automáticamente con datos del viaje: origen, destino, unidad, operador y mercancía." },
      { q: "¿Cómo registro un cliente nuevo?",
        a: "Ve a Finanzas → Clientes → '➕ Nuevo Cliente'. Ingresa nombre, RFC, régimen fiscal, dirección fiscal y email. Estos datos se usan automáticamente al facturar." },
      { q: "¿Puedo ver el historial de facturas por cliente?",
        a: "Sí. En Finanzas → Clientes, cada cliente muestra el total facturado, el saldo pendiente y el % del límite de crédito usado." },
      { q: "¿Cómo marco una factura como pagada?",
        a: "En Finanzas → Facturación, las facturas con status PENDIENTE muestran el botón '✓ Pagar'. Al hacer clic, se marca como PAGADA y se actualiza el saldo del cliente." },
    ]
  },
  {
    id: "cotizaciones", icono: "📋", titulo: "Cotizaciones y Tabulador",
    color: "var(--cyan)",
    preguntas: [
      { q: "¿Cómo creo una cotización?",
        a: "Ve a Finanzas → Cotizaciones → pestaña 'Cotizaciones' → '➕ Nueva Cotización'. Selecciona el cliente, tipo de unidad del tabulador, origen, destino y los extras que apliquen. El sistema calcula el total automáticamente." },
      { q: "¿Qué es el Tabulador?",
        a: "Es tu catálogo de tarifas por tipo de unidad: tarifa por viaje, tarifa por km y tarifa por día. Se configura en Finanzas → Cotizaciones → pestaña 'Tabulador'. Las cotizaciones toman automáticamente estas tarifas." },
      { q: "¿Cómo envío una cotización al cliente?",
        a: "En la lista de cotizaciones, el botón '📄 PDF' abre la vista de impresión. El botón '📲 WhatsApp' genera un mensaje de texto listo para enviar con el resumen de la cotización." },
      { q: "¿Cómo configuro el folio de las cotizaciones?",
        a: "En Finanzas → Cotizaciones → pestaña Cotizaciones, en la parte superior hay un campo 'Prefijo de Folio'. Puedes escribir algo como 'COT-2026-' y el sistema numerará las cotizaciones a partir del número que definas." },
      { q: "¿Puedo agregar servicios adicionales a una cotización?",
        a: "Sí. En la sección 'Extras' del formulario de cotización aparecen los servicios adicionales configurados en el Tabulador (pestaña Extras). Puedes marcar cuáles aplican a esa cotización específica." },
    ]
  },
  {
    id: "nominas", icono: "💰", titulo: "Nóminas",
    color: "var(--cyan)",
    preguntas: [
      { q: "¿Cómo funciona la nómina de operadores?",
        a: "Ve a Finanzas → Nóminas → pestaña Operadores. Haz clic en un conductor para generar su recibo. El sistema calcula sueldo base más comisión por viajes completados (según % configurado en el perfil). Puedes editar los montos antes de imprimir." },
      { q: "¿Qué es la nómina administrativa?",
        a: "Es para personal de oficina: secretarias, gerentes, supervisores, contadores, etc. No tiene cálculo de viajes ni comisiones, solo sueldo base, bonos y deducciones. Se gestiona en Finanzas → Nóminas → pestaña Administrativos." },
      { q: "¿Cómo agrego personal administrativo?",
        a: "En Finanzas → Nóminas → Administrativos → '➕ Agregar Empleado'. El puesto es campo libre, puedes escribir cualquier cargo." },
      { q: "¿Puedo imprimir los recibos de nómina?",
        a: "Sí. Ambas nóminas tienen botón '🖨️ Imprimir Recibo' que genera un PDF listo para imprimir con el logo de tu empresa." },
    ]
  },
  {
    id: "gastos", icono: "💵", titulo: "Gastos y Proveedores",
    color: "var(--orange)",
    preguntas: [
      { q: "¿Cuál es la diferencia entre Gastos Generales y Costos de Viaje?",
        a: "Los Gastos Generales (renta, telefonía, servicios) se registran en Control → Gastos. Los costos de viaje (casetas, estadías, combustible específico de un viaje) se registran directamente en el viaje al editarlo." },
      { q: "¿Cómo registro un proveedor?",
        a: "Ve a Control → Proveedores → '➕ Nuevo Proveedor'. Ingresa nombre, RFC, tipo de servicio que ofrece y datos de contacto. Luego puedes asignarlo a mantenimientos, gastos y logística externa." },
      { q: "¿Cómo registro un pago a proveedor?",
        a: "En Control → Proveedores, abre el perfil del proveedor y usa el botón '💳 Registrar Pago'. Puedes adjuntar referencia, forma de pago y notas." },
    ]
  },
  {
    id: "reportes", icono: "📊", titulo: "Gráficas y Reportes",
    color: "var(--purple)",
    preguntas: [
      { q: "¿Qué gráficas tiene el sistema?",
        a: "Finanzas → Gráficas incluye 10 vistas: Utilidades vs Gastos mensuales, Desglose de gastos, Split propio/externo, Viajes por unidad, Costos por unidad, Rendimiento de combustible, Top clientes, Resumen de nóminas, Análisis de proveedores y Análisis de conducores." },
      { q: "¿Qué muestran los KPIs del Dashboard?",
        a: "El Dashboard muestra en tiempo real: unidades activas, viajes del mes, facturación, combustible, mantenimientos pendientes y alertas. La mayoría son clickeables para ver el detalle directamente." },
    ]
  },
  {
    id: "gps", icono: "📡", titulo: "GPS en Vivo",
    color: "var(--green)",
    preguntas: [
      { q: "¿Cómo activo el módulo GPS?",
        a: "Ve a GPS en Vivo en el sidebar. Haz clic en '⚙️ Configurar Traccar'. Necesitas una cuenta en Traccar (traccar.org) o un servidor propio. Ingresa la URL, usuario y contraseña de tu servidor Traccar." },
      { q: "¿Qué información muestra el módulo GPS?",
        a: "Muestra la posición en tiempo real de cada dispositivo GPS registrado en Traccar, velocidad actual, última actualización y el mapa con las posiciones." },
      { q: "¿Traccar es gratis?",
        a: "Traccar es una plataforma open source. Puedes usar el servidor público traccar.org gratis con limitaciones, o instalar tu propio servidor en un VPS para mayor privacidad y control." },
    ]
  },
  {
    id: "usuarios", icono: "👥", titulo: "Usuarios y Permisos",
    color: "var(--red)",
    preguntas: [
      { q: "¿Cómo agrego un nuevo usuario?",
        a: "Solo el Administrador puede hacerlo. Ve al sidebar inferior → '👥 Usuarios' → pestaña '➕ Nuevo Usuario'. Define nombre, email, contraseña y rol." },
      { q: "¿Cuáles son los roles disponibles?",
        a: "Por defecto hay 3 roles: Administrador (acceso total), Supervisor (operaciones + reportes básicos) y Capturista (solo captura viajes y combustible). El Administrador puede crear roles personalizados desde la pestaña '🎭 Roles'." },
      { q: "¿Cómo creo un rol personalizado?",
        a: "En Gestión de Usuarios → pestaña Roles → '➕ Nuevo Rol'. Define nombre, ícono, color y activa exactamente los permisos que necesita ese rol. El rol queda disponible para asignar a usuarios." },
      { q: "¿Puedo darle un permiso específico a un usuario sin cambiarle el rol?",
        a: "Sí. En la lista de usuarios, el botón '🔑 Permisos' abre un panel donde puedes activar o desactivar permisos individuales para ese usuario específico, sobreescribiendo lo que dicta su rol." },
      { q: "¿Qué pasa si desactivo un usuario?",
        a: "El usuario no puede iniciar sesión, pero todos sus datos e historial se conservan. Puedes reactivarlo en cualquier momento." },
    ]
  },
];


function AlertsPage({ units, docs, maints }) {
  const alerts = [];
  docs.forEach(d => { const u = units.find(u => u.id === d.unidadId); const dy = daysUntil(d.vence); if (dy === null) return; if (dy < 0) alerts.push({ l: "r", title: `DOC VENCIDO — ${d.nombre}`, body: `${u?.num} ${u?.placas}: venció hace ${Math.abs(dy)} días (${d.vence})` }); else if (dy <= 30) alerts.push({ l: "y", title: `DOC PRÓXIMO A VENCER — ${d.nombre}`, body: `${u?.num} ${u?.placas}: vence en ${dy} días (${d.vence})` }) });
  maints.filter(m => m.realizado === "NO" && m.prioridad === "ALTA").forEach(m => { const u = units.find(u => u.id === m.unidadId); alerts.push({ l: "r", title: "MANTENIMIENTO ALTA PRIORIDAD PENDIENTE", body: `${u?.num} ${u?.placas}: ${m.desc} — Prog: ${m.fechaProg}` }) });
  units.filter(u => u.estado !== "ACTIVA").forEach(u => { alerts.push({ l: u.estado === "EN TALLER" ? "y" : "r", title: `UNIDAD ${u.estado}`, body: `${u.num} ${u.placas}` }) });
  return (
    <div>
      <div className="stats" style={{ marginBottom: 18 }}>
        <div className="stat" style={{ "--c": "var(--red)" }}><div className="stat-icon">🚨</div><div className="stat-val">{alerts.filter(a => a.l === "r").length}</div><div className="stat-lbl">Alertas Críticas</div></div>
        <div className="stat" style={{ "--c": "var(--yellow)" }}><div className="stat-icon">⚠️</div><div className="stat-val">{alerts.filter(a => a.l === "y").length}</div><div className="stat-lbl">Preventivas</div></div>
        <div className="stat" style={{ "--c": "var(--green)" }}><div className="stat-icon">✅</div><div className="stat-val">{units.filter(u => u.estado === "ACTIVA").length}</div><div className="stat-lbl">Unidades OK</div></div>
      </div>
      {alerts.length === 0 ? <div className="card"><div className="empty"><div className="empty-icon">✅</div><p style={{ fontSize: 16 }}>Sin alertas. ¡Flota en orden!</p></div></div> :
        <div>{alerts.sort((a, b) => (a.l === "r" ? 0 : 1) - (b.l === "r" ? 0 : 1)).map((a, i) => (
          <div key={i} className={`ab ab-${a.l}`}><span style={{ fontSize: 19, flexShrink: 0 }}>{a.l === "r" ? "🚨" : "⚠️"}</span><div><div style={{ fontWeight: 700, fontSize: 13 }}>{a.title}</div><div style={{ opacity: .9, marginTop: 3, fontSize: 12 }}>{a.body}</div></div></div>
        ))}</div>}
    </div>
  );
}

function ClientesPage({ clientes, facturas, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const [tf, setTf] = useState("TODOS");
  const [sf, setSf] = useState("TODOS");

  const fil = clientes.filter(c => {
    const match = (c.nombre + c.rfc + (c.nombreCorto||"")).toLowerCase().includes(q.toLowerCase());
    const tipoMatch = tf === "TODOS" || c.tipo === tf;
    const statusMatch = sf === "TODOS" || c.status === sf;
    return match && tipoMatch && statusMatch;
  });

  const getClienteStats = (clienteId) => {
    const facsCli = facturas.filter(f => f.clienteId === clienteId);
    const pendientes = facsCli.filter(f => f.status === "PENDIENTE");
    const totalPendiente = pendientes.reduce((a, f) => a + (Number(f.total) || 0), 0);
    const totalFacturado = facsCli.reduce((a, f) => a + (Number(f.total) || 0), 0);
    return { totalFacturado, totalPendiente, numFacturas: facsCli.length };
  };

  const totales = {
    activos: clientes.filter(c => c.status === "ACTIVO").length,
    morales: clientes.filter(c => c.tipo === "MORAL").length,
    fisicas: clientes.filter(c => c.tipo === "FISICA").length,
  };

  return (
    <div>
      <div className="card">
        <div className="card-hdr">
          <h3>👥 Clientes ({clientes.length})</h3>
          <div className="row-gap">
            <div className="sw">
              <span style={{ color: "var(--muted)" }}>🔍</span>
              <input placeholder="Buscar cliente..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <button className="btn btn-cyan" onClick={onAdd}>+ Nuevo Cliente</button>
          </div>
        </div>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div className="ftabs">
            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>TIPO:</span>
            {["TODOS", "FISICA", "MORAL"].map(t => (
              <button key={t} className={`ftab${tf === t ? " on" : ""}`} onClick={() => setTf(t)}>{t}</button>
            ))}
          </div>
          <div className="ftabs">
            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>STATUS:</span>
            {["TODOS", "ACTIVO", "SUSPENDIDO", "BLOQUEADO"].map(s => (
              <button key={s} className={`ftab${sf === s ? " on" : ""}`} onClick={() => setSf(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="sbar">
          <span>Total: <strong>{fil.length}</strong></span>
          <span>Activos: <strong style={{ color: "var(--green)" }}>{totales.activos}</strong></span>
          <span>Morales: <strong>{totales.morales}</strong></span>
          <span>Físicas: <strong>{totales.fisicas}</strong></span>
        </div>
        <div className="card-body">
          {fil.length === 0 ? (
            <div className="empty"><div className="empty-icon">👥</div><p>Sin clientes encontrados</p></div>
          ) : (
            <table>
              <thead><tr>
                <th>Cliente</th><th>RFC</th><th>Tipo</th><th>Contacto</th>
                <th>Crédito</th><th>Límite</th><th>Facturado</th><th>Pendiente</th><th>Status</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {fil.map(c => {
                  const stats = getClienteStats(c.id);
                  const pctUsado = c.limiteCredito > 0 ? ((stats.totalPendiente / c.limiteCredito) * 100).toFixed(0) : 0;
                  const colorLimite = pctUsado > 80 ? "var(--red)" : pctUsado > 60 ? "var(--yellow)" : "var(--green)";
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nombreCorto || c.nombre}</div>
                        {c.nombreCorto && <div style={{ fontSize: 10, color: "var(--muted)" }}>{c.nombre}</div>}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>{c.rfc}</td>
                      <td><Bdg c={c.tipo === "MORAL" ? "bp" : "bb"} t={c.tipo} /></td>
                      <td style={{ fontSize: 11 }}>
                        <div>{c.telefono || "—"}</div>
                        <div style={{ color: "var(--muted)" }}>{c.email || "—"}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{c.diasCreditoDefault} días</td>
                      <td>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmt$(c.limiteCredito)}</div>
                        {c.limiteCredito > 0 && stats.totalPendiente > 0 && (
                          <div style={{ fontSize: 10, color: colorLimite, fontWeight: 600 }}>{pctUsado}% usado</div>
                        )}
                      </td>
                      <td style={{ color: "var(--cyan)", fontWeight: 700 }}>{fmt$(stats.totalFacturado)}</td>
                      <td style={{ color: stats.totalPendiente > 0 ? "var(--orange)" : "var(--muted)", fontWeight: 700 }}>{fmt$(stats.totalPendiente)}</td>
                      <td><Bdg c={c.status === "ACTIVO" ? "bg" : c.status === "SUSPENDIDO" ? "by" : "br"} t={c.status} /></td>
                      <td>
                        <div className="acts">
                          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(c)}>✏️</button>
                          <button className="btn btn-red btn-sm" onClick={() => onDelete(c.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function FacturacionPage({ facturas, clientes, viajes, onAdd, onEdit, onDelete, onMarcarPagada }) {
  const [q, setQ] = useState("");
  const [sf, setSf] = useState("TODOS");
  const [cf, setCf] = useState("TODOS");

  const fil = facturas.filter(f => {
    const matchQ = (f.folio || f.serie + "-" + f.numeroFactura + (f.cliente||"") + (f.rfcCliente||"")).toLowerCase().includes(q.toLowerCase());
    const matchS = sf === "TODOS" || f.status === sf;
    const matchC = cf === "TODOS" || f.clienteId === cf;
    return matchQ && matchS && matchC;
  });

  const pendientes = facturas.filter(f => f.status === "PENDIENTE");
  const vencidas = facturas.filter(f => f.status === "VENCIDA");
  const porVencer = pendientes.filter(f => { const days = daysUntil(f.fechaVencimiento); return days !== null && days >= 0 && days <= 5; });
  const pagadas = facturas.filter(f => f.status === "PAGADA");
  const totalPendiente = pendientes.reduce((a, f) => a + (Number(f.total) || 0), 0);
  const totalVencido = vencidas.reduce((a, f) => a + (Number(f.total) || 0), 0);
  const totalCobrado = pagadas.reduce((a, f) => a + (Number(f.total) || 0), 0);
  const facturasConPago = pagadas.filter(f => f.fechaPago && f.fechaEmision);
  const diasCobranza = facturasConPago.length > 0
    ? facturasConPago.reduce((a, f) => { const dias = daysUntil(f.fechaEmision) * -1 - daysUntil(f.fechaPago) * -1; return a + dias; }, 0) / facturasConPago.length
    : 0;

  return (
    <div>
      <div className="stats">
        <div className="stat" style={{ "--c": "var(--yellow)" }}><div className="stat-icon">🧾</div><div className="stat-val sm">{pendientes.length}</div><div className="stat-lbl">Pendientes</div><div className="stat-sub">{fmt$(totalPendiente)}</div></div>
        <div className="stat" style={{ "--c": "var(--red)" }}><div className="stat-icon">⏰</div><div className="stat-val sm">{vencidas.length}</div><div className="stat-lbl">Vencidas</div><div className="stat-sub">{fmt$(totalVencido)}</div></div>
        <div className="stat" style={{ "--c": "var(--orange)" }}><div className="stat-icon">📅</div><div className="stat-val sm">{porVencer.length}</div><div className="stat-lbl">Por Vencer (5d)</div><div className="stat-sub">{porVencer.reduce((a, f) => a + (f.total||0), 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</div></div>
        <div className="stat" style={{ "--c": "var(--green)" }}><div className="stat-icon">💰</div><div className="stat-val sm">{pagadas.length}</div><div className="stat-lbl">Pagadas</div><div className="stat-sub">{fmt$(totalCobrado)}</div></div>
        <div className="stat" style={{ "--c": "var(--cyan)" }}><div className="stat-icon">💳</div><div className="stat-val">{Math.round(diasCobranza)}</div><div className="stat-lbl">Días Prom. Cobranza</div><div className="stat-sub">DSO</div></div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <h3>🧾 Facturación ({facturas.length})</h3>
          <div className="row-gap">
            <div className="sw"><span style={{ color: "var(--muted)" }}>🔍</span><input placeholder="Buscar factura..." value={q} onChange={e => setQ(e.target.value)} /></div>
            <button className="btn btn-cyan" onClick={onAdd}>+ Nueva Factura</button>
          </div>
        </div>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div className="ftabs">
            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>STATUS:</span>
            {["TODOS", "PENDIENTE", "VENCIDA", "PAGADA", "CANCELADA"].map(s => (
              <button key={s} className={`ftab${sf === s ? " on" : ""}`} onClick={() => setSf(s)}>{s}</button>
            ))}
          </div>
          <div className="ftabs">
            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>CLIENTE:</span>
            <button className={`ftab${cf === "TODOS" ? " on" : ""}`} onClick={() => setCf("TODOS")}>TODOS</button>
            {clientes.slice(0, 5).map(c => (
              <button key={c.id} className={`ftab${cf === c.id ? " on" : ""}`} onClick={() => setCf(c.id)}>{c.nombreCorto || c.nombre}</button>
            ))}
          </div>
        </div>
        <div className="sbar">
          <span>Total: <strong>{fil.length}</strong></span>
          <span>Pendiente: <strong style={{ color: "var(--orange)" }}>{fmt$(totalPendiente)}</strong></span>
          <span>Vencido: <strong style={{ color: "var(--red)" }}>{fmt$(totalVencido)}</strong></span>
          <span>Cobrado: <strong style={{ color: "var(--green)" }}>{fmt$(totalCobrado)}</strong></span>
        </div>
        <div className="card-body">
          {fil.length === 0 ? (
            <div className="empty"><div className="empty-icon">🧾</div><p>Sin facturas encontradas</p></div>
          ) : (
            <table>
              <thead><tr>
                <th>Folio</th><th>Cliente</th><th>Tipo</th><th>Emisión</th><th>Vencimiento</th>
                <th>Subtotal</th><th>IVA</th><th>Ret. IVA</th><th>Total</th><th>Status</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {fil.map(f => {
                  const days = daysUntil(f.fechaVencimiento);
                  const statusColor = f.status === "PAGADA" ? "var(--green)" : f.status === "VENCIDA" ? "var(--red)" : (days !== null && days <= 5) ? "var(--orange)" : "var(--yellow)";
                  return (
                    <tr key={f.id}>
                      <td style={{ fontFamily: "var(--font-hd)", fontSize: 14, fontWeight: 700 }}>{f.serie}-{f.numeroFactura}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{f.cliente}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{f.rfcCliente}</div>
                      </td>
                      <td><Bdg c={f.tipoCliente === "MORAL" ? "bp" : "bb"} t={f.tipoCliente} /></td>
                      <td style={{ fontSize: 12 }}>{f.fechaEmision}</td>
                      <td style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{f.fechaVencimiento}</td>
                      <td style={{ color: "var(--text)" }}>{fmt$(f.subtotal)}</td>
                      <td style={{ color: "var(--cyan)" }}>{fmt$(f.iva)}</td>
                      <td style={{ color: "var(--orange)" }}>{f.retIva > 0 ? fmt$(f.retIva) : "—"}</td>
                      <td style={{ fontWeight: 700, color: "var(--text)" }}>{fmt$(f.total)}</td>
                      <td><Bdg c={f.status === "PAGADA" ? "bg" : f.status === "VENCIDA" ? "br" : f.status === "CANCELADA" ? "bm" : "by"} t={f.status} /></td>
                      <td>
                        <div className="acts">
                          {f.status === "PENDIENTE" && <button className="btn btn-green btn-xs" onClick={() => onMarcarPagada(f)}>✓ Pagar</button>}
                          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(f)}>✏️</button>
                          <button className="btn btn-red btn-sm" onClick={() => onDelete(f.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


function HelpPage({ currentUser }) {
  const [busqueda, setBusqueda] = useState("");
  const [seccionAbierta, setSeccionAbierta] = useState("inicio");
  const [preguntaAbierta, setPreguntaAbierta] = useState(null);

  const busquedaLower = busqueda.toLowerCase().trim();

  // Filtrar por búsqueda
  const seccionesFiltradas = busquedaLower
    ? AYUDA_DATA.map(s => ({
        ...s,
        preguntas: s.preguntas.filter(p =>
          p.q.toLowerCase().includes(busquedaLower) ||
          p.a.toLowerCase().includes(busquedaLower)
        )
      })).filter(s => s.preguntas.length > 0)
    : AYUDA_DATA;

  const totalPreguntas = AYUDA_DATA.reduce((a, s) => a + s.preguntas.length, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,var(--bg2),var(--bg1))", border:"1px solid var(--border)", borderRadius:14, padding:"28px 32px", marginBottom:20, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:24, top:16, fontSize:72, opacity:.07 }}>❓</div>
        <div style={{ fontFamily:"var(--font-hd)", fontSize:26, fontWeight:700, marginBottom:6 }}>
          Centro de Ayuda
        </div>
        <div style={{ color:"var(--muted)", fontSize:13, marginBottom:18 }}>
          {totalPreguntas} respuestas para las dudas más frecuentes del sistema
        </div>
        {/* Buscador */}
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"var(--bg0)", border:"2px solid var(--border)", borderRadius:10, padding:"10px 16px", maxWidth:500, transition:"border-color .2s" }}
          onFocus={e=>{ e.currentTarget.style.borderColor="var(--cyan)"; }}
          onBlur={e=>{ e.currentTarget.style.borderColor="var(--border)"; }}>
          <span style={{ fontSize:18 }}>🔍</span>
          <input
            value={busqueda}
            onChange={e=>{ setBusqueda(e.target.value); if(e.target.value) setSeccionAbierta(null); }}
            placeholder="Busca tu duda... ej: 'cómo registro un viaje', 'nómina', 'factura'..."
            style={{ flex:1, background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:14 }}
          />
          {busqueda && <button onClick={()=>setBusqueda("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:16 }}>✕</button>}
        </div>
        {busqueda && (
          <div style={{ marginTop:10, fontSize:12, color:"var(--muted)" }}>
            {seccionesFiltradas.reduce((a,s)=>a+s.preguntas.length,0)} resultado(s) para "{busqueda}"
          </div>
        )}
      </div>

      {/* Chips de sección (solo sin búsqueda) */}
      {!busqueda && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
          {AYUDA_DATA.map(s => (
            <button key={s.id} onClick={()=>setSeccionAbierta(s.id)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:20,
                background: seccionAbierta===s.id ? `${s.color}22` : "var(--bg1)",
                border: `1.5px solid ${seccionAbierta===s.id ? s.color : "var(--border)"}`,
                color: seccionAbierta===s.id ? s.color : "var(--muted)",
                cursor:"pointer", fontSize:12, fontWeight: seccionAbierta===s.id ? 700 : 400,
                transition:"all .15s" }}>
              <span>{s.icono}</span> {s.titulo}
              <span style={{ fontSize:10, padding:"1px 6px", borderRadius:10, background:"var(--bg2)" }}>{s.preguntas.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Secciones y preguntas */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {seccionesFiltradas.map(seccion => {
          const estaAbierta = busqueda || seccionAbierta === seccion.id;
          return (
            <div key={seccion.id} style={{ background:"var(--bg1)", border:`1.5px solid ${estaAbierta ? seccion.color+"55" : "var(--border)"}`, borderRadius:12, overflow:"hidden", transition:"border-color .2s" }}>
              {/* Header de sección */}
              <button onClick={()=>{ setSeccionAbierta(estaAbierta && !busqueda ? null : seccion.id); setPreguntaAbierta(null); }}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"14px 18px",
                  background: estaAbierta ? `${seccion.color}11` : "transparent",
                  border:"none", cursor:"pointer", textAlign:"left", transition:"background .15s" }}>
                <span style={{ fontSize:22 }}>{seccion.icono}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color: estaAbierta ? seccion.color : "var(--text)" }}>{seccion.titulo}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:1 }}>{seccion.preguntas.length} preguntas frecuentes</div>
                </div>
                <span style={{ fontSize:16, color:"var(--muted)", transform: estaAbierta?"rotate(180deg)":"none", transition:"transform .2s" }}>▾</span>
              </button>

              {/* Preguntas */}
              {estaAbierta && (
                <div style={{ borderTop:`1px solid ${seccion.color}33`, padding:"8px 0" }}>
                  {seccion.preguntas.map((pq, i) => {
                    const abierta = preguntaAbierta === `${seccion.id}-${i}`;
                    return (
                      <div key={i} style={{ margin:"2px 12px", borderRadius:8, overflow:"hidden", border:`1px solid ${abierta ? seccion.color+"44" : "transparent"}`, transition:"border-color .15s" }}>
                        <button onClick={()=>setPreguntaAbierta(abierta ? null : `${seccion.id}-${i}`)}
                          style={{ width:"100%", display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px",
                            background: abierta ? `${seccion.color}0A` : "transparent",
                            border:"none", cursor:"pointer", textAlign:"left" }}>
                          <span style={{ fontSize:14, marginTop:1, color: seccion.color, fontWeight:700, minWidth:18 }}>
                            {abierta ? "▾" : "▸"}
                          </span>
                          <span style={{ fontSize:13, fontWeight: abierta ? 700 : 500, color: abierta ? "var(--text)" : "var(--text)", lineHeight:1.4 }}>
                            {/* Resaltar búsqueda */}
                            {busqueda && pq.q.toLowerCase().includes(busquedaLower)
                              ? <span dangerouslySetInnerHTML={{ __html: pq.q.replace(new RegExp(`(${busquedaLower})`, "gi"), `<mark style="background:${seccion.color}44;border-radius:3px;padding:0 2px">$1</mark>`) }} />
                              : pq.q
                            }
                          </span>
                        </button>
                        {abierta && (
                          <div style={{ padding:"0 14px 14px 42px", fontSize:13, color:"var(--muted)", lineHeight:1.7, borderTop:`1px dashed ${seccion.color}33` }}>
                            <div style={{ paddingTop:10 }}>
                              {/* Destacar pasos numerados */}
                              {pq.a.split(/(\d+\))/).map((parte, idx) =>
                                /^\d+\)$/.test(parte)
                                  ? <strong key={idx} style={{ color: seccion.color }}>{parte} </strong>
                                  : <span key={idx}>{parte}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer de ayuda */}
      <div style={{ marginTop:24, padding:"16px 20px", background:"var(--bg2)", borderRadius:12, border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:16 }}>
        <span style={{ fontSize:32 }}>💬</span>
        <div>
          <div style={{ fontWeight:700, marginBottom:3 }}>¿No encontraste tu respuesta?</div>
          <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.6 }}>
            Contacta a tu administrador del sistema o al soporte técnico. También puedes consultar la documentación completa en el manual de usuario (próximamente disponible en PDF).
          </div>
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [units, setUnits] = useState([]);
  const [branding, setBranding] = useState({ nombre: "Mi Empresa", slogan: "Sistema de Flota", logo: "" });
  const [drivers, setDrivers] = useState([]);
  const [docs, setDocs] = useState([]);
  const [maints, setMaints] = useState([]);
  const [fuels, setFuels] = useState([]);
  const [trips, setTrips] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [externos, setExternos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [tiposPersonalizados, setTiposPersonalizados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // null = no logueado
  const [usuarios, setUsuarios] = useState([]);
  const [facturApiKey, setFacturApiKey] = useState("");
  const [nominasAdmin, setNominasAdmin] = useState([]);
  const [roles, setRoles] = useState([]);
  const [traccarConfig, setTraccarConfig] = useState(null);
  const [modalGpsConfig, setModalGpsConfig] = useState(false);
  const [tema, setTema] = useState("light");

  // Apply theme to document
  useEffect(() => {
    if (tema === "light") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", tema);
    fsSet("fp6:tema", tema).catch(()=>{});
  }, [tema]);
  const [tabulador, setTabulador] = useState([]);
  const [extrasTabulador, setExtrasTabulador] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);

  // Helper de permisos basado en el usuario actual
  const isAdmin = currentUser?.rol === "admin";
  const isSupervisor = currentUser?.rol === "supervisor" || isAdmin;
  const userCan = (perm) => {
    if (!currentUser) return false;
    const perms = getPerms(currentUser, roles);
    return !!perms[perm];
  };

  useEffect(() => {
    (async () => {
      const pairs = [
        [setUnits,               "fp6:units",          D_UNITS],
        [setDrivers,             "fp6:drivers",         D_DRIVERS],
        [setDocs,                "fp6:docs",            D_DOCS],
        [setMaints,              "fp6:maints",          D_MAINTS],
        [setFuels,               "fp6:fuels",           D_FUELS],
        [setTrips,               "fp6:trips",           D_TRIPS],
        [setGastos,              "fp6:gastos",          D_GASTOS],
        [setExternos,            "fp6:externos",        D_EXTERNOS],
        [setClientes,            "fp6:clientes",        D_CLIENTES],
        [setFacturas,            "fp6:facturas",        D_FACTURAS],
        [setProveedores,         "fp6:proveedores",     D_PROVEEDORES],
        [setTiposPersonalizados, "fp6:tipos",           []],
        [setBranding,            "fp6:branding",        { nombre: "Mi Empresa", slogan: "Sistema de Flota", logo: "" }],
        [setNominasAdmin,        "fp6:nominasAdmin",    D_NOMINAS_ADMIN],
        [setRoles,               "fp6:roles",           D_ROLES],
        [setTraccarConfig,       "fp6:traccarConfig",   null],
        [setUsuarios,            "fp6:usuarios",        D_USUARIOS],
        [setFacturApiKey,        "fp6:facturApiKey",    ""],
        [setTabulador,           "fp6:tabulador",       D_TABULADOR],
        [setExtrasTabulador,     "fp6:extrasTabulador", D_EXTRAS_TABULADOR],
        [setCotizaciones,        "fp6:cotizaciones",    []]
      ];
      // Cargar tema
      try {
        const temaVal = await fsGet("fp6:tema");
        if (temaVal) { setTema(temaVal); if (temaVal==="light") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme",temaVal); }
      } catch(e){}
      // Cargar datos desde Firebase
      await Promise.all(pairs.map(async ([setter, key, defaultVal]) => {
        try {
          const val = await fsGet(key);
          if (val !== null && val !== undefined) setter(val);
          else setter(defaultVal);
        } catch { setter(defaultVal); }
      }));
      setLoading(false);
      // Escuchar cambios en tiempo real
      const unsubs = pairs.map(([setter, key]) => fsListen(key, (val) => { if (val !== null && val !== undefined) setter(val); }));
      return () => unsubs.forEach(u => u && u());
    })();
  }, []);

  const sv = useCallback(async (k, v) => { try { await fsSet(k, v); } catch { } }, []);
  const notify = (msg, type = "success") => setToast({ msg, type });

  const uRef = useRef(units); uRef.current = units;
  const dRef = useRef(drivers); dRef.current = drivers;
  const dcRef = useRef(docs); dcRef.current = docs;
  const mRef = useRef(maints); mRef.current = maints;
  const fRef = useRef(fuels); fRef.current = fuels;
  const tRef = useRef(trips); tRef.current = trips;
  const gRef = useRef(gastos); gRef.current = gastos;
  const eRef = useRef(externos); eRef.current = externos;
  const cliRef = useRef(clientes); cliRef.current = clientes;
  const facRef = useRef(facturas); facRef.current = facturas;
  const pvRef = useRef(proveedores); pvRef.current = proveedores;
  const tpRef = useRef(tiposPersonalizados); tpRef.current = tiposPersonalizados;

  const mkCRUD = (getRef, setter, key) => ({
    save: async item => { const cur = getRef(); const next = cur.find(x => x.id === item.id) ? cur.map(x => x.id === item.id ? item : x) : [...cur, item]; setter(next); await sv(key, next); setModal(null); notify("Guardado ✓") },
    del: id => setConfirm({ msg: "¿Eliminar este registro?", onOk: async () => { const next = getRef().filter(x => x.id !== id); setter(next); await sv(key, next); setConfirm(null); notify("Eliminado") } })
  });

  const UC = mkCRUD(() => uRef.current, setUnits, "fp6:units");
  const DC = mkCRUD(() => dRef.current, setDrivers, "fp6:drivers");
  const DoC = mkCRUD(() => dcRef.current, setDocs, "fp6:docs");
  const MC = mkCRUD(() => mRef.current, setMaints, "fp6:maints");
  const FC = mkCRUD(() => fRef.current, setFuels, "fp6:fuels");
  const TC = mkCRUD(() => tRef.current, setTrips, "fp6:trips");
  const GC = mkCRUD(() => gRef.current, setGastos, "fp6:gastos");
  const EC = mkCRUD(() => eRef.current, setExternos, "fp6:externos");
  const CliC = mkCRUD(() => cliRef.current, setClientes, "fp6:clientes");
  const FacC = mkCRUD(() => facRef.current, setFacturas, "fp6:facturas");
  const PVC = mkCRUD(() => pvRef.current, setProveedores, "fp6:proveedores");

  const saveExternoWithTipo = async (item) => {
    if (item.tipoUnidad && !TIPOS.includes(item.tipoUnidad) && !tiposPersonalizados.includes(item.tipoUnidad)) {
      const newTipos = [...tiposPersonalizados, item.tipoUnidad];
      setTiposPersonalizados(newTipos);
      await sv("fp6:tipos", newTipos);
    }
    EC.save(item);
  };

  const marcarPagada = (fac) => {
    const hoy = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
    const updated = { ...fac, status: "PAGADA", fechaPago: hoy };
    FacC.save(updated);
  };

  const resetAll = () => setConfirm({
    msg: "¿Restaurar datos de ejemplo? Se perderán los cambios actuales.", onOk: async () => {
      const pairs = [
        [D_UNITS, "fp6:units", setUnits], [D_DRIVERS, "fp6:drivers", setDrivers],
        [D_DOCS, "fp6:docs", setDocs], [D_MAINTS, "fp6:maints", setMaints],
        [D_FUELS, "fp6:fuels", setFuels], [D_TRIPS, "fp6:trips", setTrips],
        [D_GASTOS, "fp6:gastos", setGastos], [D_EXTERNOS, "fp6:externos", setExternos],
        [D_CLIENTES, "fp6:clientes", setClientes], [D_FACTURAS, "fp6:facturas", setFacturas],
        [[], "fp6:tipos", setTiposPersonalizados]
      ];
      for (const [d, k, s] of pairs) { s(d); await sv(k, d); }
      setConfirm(null); notify("Datos restaurados", "info");
    }
  });

  const exportExcel = () => {
    const rows = (hdrs, data) => [hdrs, ...data].map(r => r.map(v => String(v).replace(/\t/g, " ")).join("\t")).join("\n");
    const content = [
      "=== UNIDADES ===\n" + rows(["No.", "Eco", "Operador", "Placas", "Tipo", "Marca", "Modelo", "Año", "VIN", "Estado", "KM Actual", "Rend.Esperado", "Deprec.Anual"],
        units.map(u => { const d = drivers.find(d => d.id === u.operador); return [u.num, u.eco, d?.nombre || "", u.placas, u.tipo, u.marca, u.modelo, u.anio, u.vin, u.estado, u.kmActual, u.rendEsperado, u.deprecAnual] })),
      "\n=== CONDUCTORES ===\n" + rows(["Nombre", "Licencia", "Vence", "Tel", "Status", "% Viaje"],
        drivers.map(d => [d.nombre, d.licencia, d.licVence, d.tel, d.status, d.porcentajeViaje])),
      "\n=== CLIENTES ===\n" + rows(["Nombre", "RFC", "Tipo", "Email", "Días Crédito", "Status"],
        clientes.map(c => [c.nombre, c.rfc, c.tipo, c.email, c.diasCreditoDefault, c.status])),
      "\n=== FACTURAS ===\n" + rows(["Folio", "Cliente", "Emisión", "Vencimiento", "Subtotal", "IVA", "Ret.IVA", "Total", "Status"],
        facturas.map(f => [f.serie + "-" + f.numeroFactura, f.cliente, f.fechaEmision, f.fechaVencimiento, f.subtotal, f.iva, f.retencionIVA, f.total, f.status])),
      "\n=== VIAJES PROPIOS ===\n" + rows(["Unidad", "Origen", "Destino", "Salida", "Regreso", "KM", "Cliente", "Status", "Precio Cliente", "Gastos Extras", "Estadías"],
        trips.filter(t => !t.esExterno).map(t => { const u = units.find(u => u.id === t.unidadId); const d = (Number(t.kmLlegada) || 0) - (Number(t.kmSalida) || 0); return [u?.num, t.origen, t.destino, t.fecha, t.fechaReg, d, t.cliente, t.status, t.costoOfrecido, t.gastosExtras, t.costoEstadias] })),
      "\n=== GASTOS GENERALES ===\n" + rows(["Fecha", "Tipo", "Descripción", "Monto", "Responsable"],
        gastos.map(g => [g.fecha, g.tipo, g.descripcion, g.monto, g.responsable])),
    ].join("\n");
    const blob = new Blob([content], { type: "text/tab-separated-values" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `FleetPro_v6_${new Date().toISOString().slice(0, 10)}.tsv`; a.click();
  };

  const alertCount = (() => {
    let n = 0;
    docs.forEach(d => { const dy = daysUntil(d.vence); if (dy !== null && dy <= 30) n++ });
    maints.filter(m => m.realizado === "NO" && m.prioridad === "ALTA").forEach(() => n++);
    units.forEach(u => { const kmR = (u.kmUltMant + u.intervaloMant) - u.kmActual; if (kmR <= 500) n++ });
    facturas.filter(f => f.status === "VENCIDA").forEach(() => n++);
    return n;
  })();

  const icons = {
    dashboard: "📊", alerts: "🚨", units: "🚛", drivers: "👨‍✈️",
    trips: "🗺️", maints: "🔧", fuels: "⛽", docs: "📄",
    charts: "📈", gastos: "💵", clientes: "👥", facturacion: "🧾", proveedores: "🏪", nominas: "💰", ayuda: "❓", gps: "📡", cotizaciones: "📋"
  };
  const titles = {
    dashboard: "Dashboard", alerts: "Alertas", units: "Unidades",
    drivers: "Conductores", trips: "Viajes & Logística", maints: "Mantenimientos",
    fuels: "Combustible", docs: "Documentos", charts: "Gráficas & Reportes",
    gastos: "Gastos Generales", clientes: "Clientes", facturacion: "Facturación",
    proveedores: "Proveedores", nominas: "Nóminas", ayuda: "Ayuda", gps: "GPS en Vivo", cotizaciones: "Cotizaciones y Tabulador"
  };

  const navSecs = [
    { lbl: "PRINCIPAL", items: [{ id: "dashboard" }, { id: "alerts", badge: alertCount }, { id: "gps" }, { id: "ayuda" }] },
    { lbl: "FLOTA", items: [{ id: "units" }, { id: "drivers" }, { id: "trips" }] },
    { lbl: "CONTROL", items: [
      { id: "maints" },
      { id: "fuels" },
      { id: "docs" },
      ...(isSupervisor ? [{ id: "gastos" }, { id: "proveedores" }] : []),
    ]},
    // FINANZAS unificado: muestra solo los ítems que el usuario puede ver
    ...(() => {
      const finItems = [
        ...(userCan("verFacturacion") ? [{ id: "cotizaciones" }, { id: "clientes" }, { id: "facturacion" }] : []),
        ...(userCan("verNominas") || userCan("verNominasAdmin") ? [{ id: "nominas" }] : []),
        ...(userCan("verReportes") ? [{ id: "charts" }] : []),
      ];
      return finItems.length > 0 ? [{ lbl: "FINANZAS 🔒", items: finItems }] : [];
    })(),
  ];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg0)", color: "var(--muted)", fontFamily: "var(--font-hd)", fontSize: 22, letterSpacing: ".1em" }}>
      <style>{CSS}</style>⟳ Cargando Fleet Pro v6.0...
    </div>
  );

  // ── RENDER CONDICIONAL: LOGIN o APP ─────────────────────────────────────────
  if (!currentUser) {
    return (
      <>
        <style>{CSS}</style>
        <LoginScreen
          usuarios={usuarios}
          branding={branding}
          onLogin={(usuarioActualizado, uid_login, tipo) => {
            if (tipo === "fallido") {
              // Solo actualizar contador de intentos fallidos
              const nuevos = usuarios.map(u => u.id === uid_login
                ? { ...u, intentosFallidos: (u.intentosFallidos || 0) + 1 }
                : u
              );
              setUsuarios(nuevos);
              sv("fp6:usuarios", nuevos);
              return;
            }
            if (tipo === "exitoso" && usuarioActualizado) {
              // Actualizar usuario con datos de acceso y loguear
              const nuevos = usuarios.map(u => u.id === uid_login ? usuarioActualizado : u);
              setUsuarios(nuevos);
              sv("fp6:usuarios", nuevos);
              setCurrentUser(usuarioActualizado);
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="sidebar">
          <div
            className="sb-logo"
            style={{ cursor: "pointer", position: "relative" }}
            onClick={() => setModal({ type: "branding" })}
            title="Clic para configurar logo y empresa"
          >
            {branding.logo
              ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <img
                    src={branding.logo}
                    style={{ maxHeight: 44, maxWidth: 160, objectFit: "contain" }}
                    alt="Logo"
                  />
                  {branding.slogan && (
                    <div className="sb-logo-sub">{branding.slogan}</div>
                  )}
                </div>
              )
              : (
                <>
                  <div className="sb-logo-title">{branding.nombre || "FLEET PRO"}</div>
                  <div className="sb-logo-sub">{branding.slogan || "Sistema Integral de Flota"}</div>
                </>
              )
            }
            <div style={{
              position: "absolute",
              top: 6,
              right: 8,
              fontSize: 10,
              color: "var(--muted)",
              opacity: 0.6
            }}>
              ✏️
            </div>
          </div>
          {navSecs.map(s => {
            if (s.adminOnly && !isAdmin) return null;
            return (
              <div key={s.lbl}>
                <div className="sb-sect">{s.lbl}</div>
                {s.items.map(n => (
                  <div key={n.id} className={`nav-btn${tab === n.id ? " on" : ""}`} onClick={() => setTab(n.id)}>
                    <span className="nav-icon">{icons[n.id]}</span>
                    <span style={{ flex: 1 }}>{titles[n.id]}</span>
                    {(n.badge || 0) > 0 && <span style={{ background: "var(--red)", color: "#fff", borderRadius: 12, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{n.badge}</span>}
                  </div>
                ))}
              </div>
            );
          })}
          <div className="sb-footer">
            {/* Info usuario actual */}
            <div style={{ padding:"8px 10px", background:"var(--bg2)", borderRadius:8, marginBottom:8, border:"1px solid var(--border)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--text)", marginBottom:2 }}>
                {currentUser.rol === "admin" ? "🔒" : currentUser.rol === "supervisor" ? "🔧" : "✏️"} {currentUser.nombre}
              </div>
              <div style={{ fontSize:10, color:"var(--muted)" }}>{currentUser.email}</div>
              <div style={{ marginTop:4 }}>
                <Bdg c={currentUser.rol==="admin"?"br":currentUser.rol==="supervisor"?"bo":"bb"} t={currentUser.rol.toUpperCase()} />
              </div>
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 8, fontWeight: 500 }}>
              {units.length} unidades · {drivers.length} conductores · {clientes.length} clientes
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginBottom: 6 }} onClick={exportExcel}>📊 Exportar Excel</button>
            {isAdmin && <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", fontSize: 11, marginBottom: 6 }} onClick={resetAll}>↺ Restaurar datos</button>}
            {isAdmin && <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", fontSize: 11, marginBottom: 6 }} onClick={() => setModal({ type: "usuarios" })}>👥 Usuarios</button>}
            {/* Theme selector */}
            <div style={{ marginBottom:6 }}>
              <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>🎨 Tema</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4 }}>
                {[
                  { id:"light", icon:"☀️", lbl:"Claro" },
                  { id:"dark",  icon:"🌙", lbl:"Oscuro" },
                  { id:"blue",  icon:"🌌", lbl:"Noche" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTema(t.id)}
                    style={{ padding:"5px 4px", borderRadius:7, border:`1.5px solid ${tema===t.id?"var(--cyan)":"var(--border)"}`, background:tema===t.id?"rgba(0,153,204,.15)":"var(--bg2)", color:tema===t.id?"var(--cyan)":"var(--muted)", fontSize:10, fontWeight:tema===t.id?700:400, cursor:"pointer", textAlign:"center", lineHeight:1.4 }}>
                    <div style={{ fontSize:14 }}>{t.icon}</div>
                    <div>{t.lbl}</div>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", fontSize: 11, color:"var(--red)" }} onClick={() => { setCurrentUser(null); setTab("dashboard"); }}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{icons[tab]} {titles[tab]}</div>
              <div className="topbar-sub">{new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            {alertCount > 0 && <span style={{ fontSize: 12, color: "var(--red)", background: "rgba(230,57,70,.1)", border: "1px solid rgba(230,57,70,.25)", borderRadius: 8, padding: "5px 12px", fontWeight: 600 }}>🚨 {alertCount} alerta{alertCount > 1 ? "s" : ""} activa{alertCount > 1 ? "s" : ""}</span>}
            <span style={{ fontSize: 11, color: "var(--muted)", padding: "5px 10px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
              {currentUser.rol === "admin" ? "🔒" : currentUser.rol === "supervisor" ? "🔧" : "✏️"} {currentUser.nombre}
            </span>
          </div>

          {tab === "dashboard" && <Dashboard units={units} drivers={drivers} docs={docs} maints={maints} fuels={fuels} trips={trips} gastos={gastos} externos={externos} facturas={facturas} clientes={clientes} proveedores={proveedores} isAdmin={isAdmin} />}
          {tab === "alerts" && <AlertsPage units={units} docs={docs} maints={maints} />}
          {tab === "units" && <UnitsPage units={units} drivers={drivers} docs={docs} maints={maints} fuels={fuels} trips={trips}
            onAdd={isAdmin ? () => setModal({ type: "unit", data: null }) : null}
            onEdit={isAdmin ? u => setModal({ type: "unit", data: u }) : null}
            onDelete={isAdmin ? UC.del : null}
            onChangeDriver={isAdmin ? u => setModal({ type: "changeDriver", data: u }) : null}
            isAdmin={isAdmin}
            branding={branding} />}
          {tab === "drivers" && <DriversPage drivers={drivers} units={units} trips={trips}
            onAdd={isAdmin ? () => setModal({ type: "driver", data: null }) : null}
            onEdit={isAdmin ? d => setModal({ type: "driver", data: d }) : null}
            onDelete={isAdmin ? DC.del : null}
            onHojaViaje={userCan("hojaViaje") ? d => setModal({ type: "hojaViaje", data: d }) : null}
            onNomina={userCan("verNominas") ? d => setModal({ type: "nomina", data: d }) : null}
            branding={branding} />}
          {tab === "docs" && <DocsPage units={units} drivers={drivers} docs={docs}
            onAdd={() => setModal({ type: "doc", data: null })}
            onEdit={d => setModal({ type: "doc", data: d })}
            onDelete={DoC.del} />}
          {tab === "maints" && <MaintPage units={units} maints={maints} proveedores={proveedores}
            onAdd={userCan("crearMantenimientos") ? () => setModal({ type: "maint", data: null }) : null}
            onEdit={isSupervisor ? m => setModal({ type: "maint", data: m }) : null}
            onDelete={isAdmin ? MC.del : null} />}
          {tab === "fuels" && <FuelPage units={units} fuels={fuels}
            onAdd={() => setModal({ type: "fuel", data: null })}
            onEdit={f => setModal({ type: "fuel", data: f })}
            onDelete={FC.del} />}
          {tab === "trips" && <TripsPage trips={trips} units={units} externos={externos} maints={maints} fuels={fuels}
            onAdd={() => setModal({ type: "trip", data: null })}
            onEdit={t => setModal({ type: "trip", data: t })}
            onDelete={TC.del}
            onAddExt={() => setModal({ type: "externo", data: null })}
            onEditExt={e => setModal({ type: "externo", data: e })}
            onDeleteExt={EC.del}
            onPagoExt={e => setModal({ type: "pagoTransp", data: e })}
            isAdmin={isAdmin}
            branding={branding} />}
          {tab === "clientes" && userCan("verFacturacion") && <ClientesPage
            clientes={clientes}
            facturas={facturas}
            onAdd={() => setModal({ type: "cliente", data: null })}
            onEdit={c => setModal({ type: "cliente", data: c })}
            onDelete={CliC.del}
          />}
          {tab === "cotizaciones" && userCan("verFacturacion") && (
            <TabuladorPage
              tabulador={tabulador}
              extrasTabulador={extrasTabulador}
              cotizaciones={cotizaciones}
              clientes={clientes}
              branding={branding}
              onSaveTabulador={async t => { setTabulador(t); await sv("fp6:tabulador", t); }}
              onSaveExtras={async e => { setExtrasTabulador(e); await sv("fp6:extrasTabulador", e); }}
              onSaveCotizaciones={async c => { setCotizaciones(c); await sv("fp6:cotizaciones", c); }}
            />
          )}
          {tab === "facturacion" && userCan("verFacturacion") && <FacturacionPage
            facturas={facturas}
            clientes={clientes}
            viajes={trips}
            onAdd={() => setModal({ type: "factura", data: null })}
            onEdit={f => FacC.save(f)}
            onDelete={FacC.del}
            onMarcarPagada={marcarPagada}
          />}
          {tab === "gastos" && isSupervisor && <GastosPage gastos={gastos} proveedores={proveedores}
            onAdd={() => setModal({ type: "gasto", data: null })}
            onEdit={g => setModal({ type: "gasto", data: g })}
            onDelete={GC.del} />}
          {tab === "nominas" && (userCan("verNominas") || userCan("verNominasAdmin")) && (
            <NominaPage
              drivers={userCan("verNominas") ? drivers : []}
              units={units}
              trips={trips}
              onOpenNomina={d => setModal({ type: "nomina", data: d })}
              nominasAdmin={userCan("verNominasAdmin") ? nominasAdmin : []}
              onSaveNominasAdmin={async list => { setNominasAdmin(list); await sv("fp6:nominasAdmin", list); }}
            />
          )}
          {tab === "proveedores" && isSupervisor && <ProveedoresPage
            proveedores={proveedores}
            maints={maints}
            gastos={gastos}
            externos={externos}
            trips={trips}
            branding={branding}
            onAdd={() => setModal({ type: "proveedor", data: null })}
            onEdit={p => setModal({ type: "proveedor", data: p })}
            onDelete={PVC.del}
            onSaveExterno={async e => { EC.save(e); }}
            onSavePagoProveedor={async (updated, tipo) => {
              if (tipo === "mantenimiento") MC.save(updated);
              else if (tipo === "gasto") GC.save(updated);
            }}
          />}
          {tab === "charts" && (isAdmin || userCan("verReportes")) && <ChartsPage units={units} maints={maints} fuels={fuels} gastos={gastos} trips={trips} facturas={facturas} clientes={clientes} drivers={drivers} proveedores={proveedores} externos={externos} nominasAdmin={nominasAdmin} />}
          {tab === "gps" && (
            <GpsPage
              units={units}
              traccarConfig={traccarConfig}
              onOpenConfig={() => setModalGpsConfig(true)}
            />
          )}
          {tab === "ayuda" && <HelpPage currentUser={currentUser} />}
        </div>
      </div>

      {/* MODALES */}
      {modal?.type === "branding" && <BrandingModal branding={branding} onSave={async b => { setBranding(b); await sv("fp6:branding", b); }} onClose={() => setModal(null)} />}
      {modalGpsConfig && <TraccarConfigModal config={traccarConfig || { serverUrl:"", email:"", password:"", intervalo:"30" }} onSave={async c => { setTraccarConfig(c); await sv("fp6:traccarConfig", c); }} onClose={() => setModalGpsConfig(false)} />}
      {modal?.type === "usuarios" && isAdmin && <UsuariosModal usuarios={usuarios} roles={roles} onSave={async u => { setUsuarios(u); await sv("fp6:usuarios", u); }} onSaveRoles={async r => { setRoles(r); await sv("fp6:roles", r); }} onClose={() => setModal(null)} />}
      {modal?.type === "facturapi" && isAdmin && (() => {
        const fac = modal.data;
        const cli = clientes.find(c => c.id === fac.clienteId);
        const vj  = trips.find(t => t.id === fac.viajeId);
        const un  = vj ? units.find(u => u.id === vj.unidadId) : null;
        const dr  = un ? drivers.find(d => d.id === un.operador) : null;
        return <FacturapiModal
          factura={fac} cliente={cli} viaje={vj} unit={un} driver={dr}
          apiKey={facturApiKey}
          onSuccess={async f => {
            FacC.save(f);
            await sv("fp6:facturApiKey", facturApiKey);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />;
      })()}
      {modal?.type === "unit" && <UnitModal unit={modal.data} drivers={drivers} tiposPersonalizados={tiposPersonalizados} onAddTipo={async (t) => { const newTipos = [...tiposPersonalizados, t]; setTiposPersonalizados(newTipos); await sv("fp6:tipos", newTipos); }} onSave={u => UC.save({ ...u, id: u.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "doc" && <DocModal doc={modal.data} units={units} drivers={drivers} onSave={d => DoC.save({ ...d, id: d.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "maint" && <MaintModal maint={modal.data} units={units} proveedores={proveedores} onSave={m => MC.save({ ...m, id: m.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "fuel" && <FuelModal fuel={modal.data} units={units} onSave={f => FC.save({ ...f, id: f.id || uid() })} onClose={() => setModal(null)} onUpdateUnit={UC.save} />}
      {modal?.type === "trip" && <TripModal trip={modal.data} units={units} onSave={t => TC.save({ ...t, id: t.id || uid(), esExterno: false })} onClose={() => setModal(null)} />}
      {modal?.type === "gasto" && <GastoModal gasto={modal.data} proveedores={proveedores} onSave={g => GC.save({ ...g, id: g.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "pagoTransp" && (
        <PagoTransportistaModal
          externo={modal.data}
          proveedor={proveedores.find(p=>p.id===modal.data?.proveedorId)}
          branding={branding}
          trips={trips}
          maints={maints}
          onSave={async e => { await EC.save(e); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "externo" && <ExternoModal externo={modal.data} tiposPersonalizados={tiposPersonalizados} proveedores={proveedores} onNuevoProveedor={p=>{PVC.save(p);}} onSave={e => saveExternoWithTipo({ ...e, id: e.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "changeDriver" && <ChangeDriverModal unit={modal.data} drivers={drivers} onSave={u => UC.save(u)} onClose={() => setModal(null)} />}
      {modal?.type === "cliente" && <ClienteModal cliente={modal.data} onSave={c => CliC.save({ ...c, id: c.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "factura" && <FacturaModal factura={modal.data} clientes={clientes} viajes={trips} onSave={f => FacC.save(f)} onClose={() => setModal(null)} />}
      {modal?.type === "proveedor" && <ProveedorModal proveedor={modal.data} onSave={p => PVC.save({ ...p, id: p.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "hojaViaje" && <HojaViajeModal units={units} drivers={drivers} onClose={() => setModal(null)} companyLogo={branding.logo} companyName={branding.nombre} />}
      {modal?.type === "nomina" && <NominaModal driver={modal.data} trips={trips} units={units} onClose={() => setModal(null)} companyLogo={branding.logo} companyName={branding.nombre} />}
      {confirm && <Confirm msg={confirm.msg} onOk={confirm.onOk} onCancel={() => setConfirm(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
