import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   FLEET PRO v4.0 — Sistema Integral de Gestión de Flota
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
.km-alert{display:flex;align-items:flex-start;gap:11px;padding:12px 16px;border-radius:10px;margin-bottom:10px;font-size:12px;border:1px solid;background:#FFF9E6;border-color:#FFE699;color:#997404}
.km-alert.critical{background:#FFF0F2;border-color:#FFD0D5;color:var(--red)}

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
.sw{display:flex;align-items:center;gap:10px;background:var(--bg1);border:1px solid var(--border);border-radius:8px;padding:0 12px;min-width:200px;transition:all .2s}
.sw:focus-within{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,153,204,.1)}
.sw input{background:none;border:none;outline:none;color:var(--text);font-family:var(--font-bd);font-size:12px;padding:9px 0;width:100%}
.ftabs{display:flex;gap:6px;flex-wrap:wrap}
.ftab{padding:6px 14px;border-radius:20px;border:1px solid var(--border);background:var(--bg1);color:var(--muted);cursor:pointer;font-size:11px;font-weight:600;transition:all .2s}
.ftab.on{background:var(--cyan);color:#fff;border-color:var(--cyan);box-shadow:0 2px 6px rgba(0,153,204,.25)}
.ftab:hover:not(.on){border-color:var(--cyan);color:var(--cyan)}
.sbar{display:flex;gap:16px;padding:10px 16px;background:var(--bg2);border-bottom:1px solid var(--border);flex-wrap:wrap}
.sbar span{font-size:11px;color:var(--muted);font-weight:500}
.sbar strong{color:var(--text);margin-left:4px;font-weight:700}
.empty{text-align:center;padding:48px;color:var(--muted)}
.empty-icon{font-size:36px;opacity:.4;margin-bottom:12px}
.acts{display:flex;gap:5px;align-items:center}
.ab{display:flex;align-items:flex-start;gap:11px;padding:12px 16px;border-radius:10px;margin-bottom:10px;font-size:12px;border:1px solid}
.ab-r{background:#FFF0F2;border-color:#FFD0D5;color:var(--red)}
.ab-y{background:#FFF9E6;border-color:#FFE699;color:#997404}
.ab-g{background:#E8F9F3;border-color:#B8EDCA;color:#00864E}
.photo-box{width:100%;height:140px;background:var(--bg2);border:2px dashed var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
.photo-box.sm{height:100px}
.photo-box:hover{border-color:var(--cyan);background:var(--bg1)}
.photo-box img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:10px}
.chart-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.chart-lbl{width:90px;font-size:10px;color:var(--muted);text-align:right;flex-shrink:0;font-weight:600}
.bar-bg{flex:1;height:18px;background:var(--bg3);border-radius:9px;overflow:hidden;display:flex}
.bar-fill{height:100%;transition:width .5s ease;display:flex;align-items:center;justify-content:flex-end;padding-right:6px}
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:10px;padding:14px}
.doc-card{background:var(--bg1);border:1px solid var(--border);border-radius:10px;padding:13px 15px;position:relative;transition:all .2s;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.doc-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}
.doc-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:10px 0 0 10px;background:var(--dc)}
.doc-name{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
.doc-date{font-size:14px;font-weight:700;color:var(--text)}
.km-meter{height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;margin-top:4px;width:70px}
.km-fill{height:100%;border-radius:3px;transition:width .3s}
.toast{position:fixed;top:20px;right:20px;z-index:9999;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:600;animation:mUp .25s ease;max-width:320px;box-shadow:0 10px 30px rgba(0,0,0,.15);display:flex;align-items:center;gap:10px;border:1px solid}
.t-ok{background:#E8F9F3;border-color:#B8EDCA;color:#00864E}
.t-err{background:#FFF0F2;border-color:#FFD0D5;color:var(--red)}
.t-info{background:#D4EDFF;border-color:#99DBFF;color:#006699}
.row-gap{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.lock-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:rgba(255,184,0,.2);color:var(--yellow);font-size:10px;margin-left:6px}
.profit-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:16px 18px;margin-bottom:12px}
.profit-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)}
.profit-row:last-child{border:none;font-weight:700;font-size:16px;margin-top:6px;padding-top:12px;border-top:2px solid var(--cyan)}
.profit-lbl{font-size:12px;color:var(--muted);font-weight:500}
.profit-val{font-family:var(--font-hd);font-size:17px;font-weight:700}
.percentage-card{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg1);border:1px solid var(--border);border-radius:10px;margin-bottom:10px}
.perc-circle{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-hd);font-size:22px;font-weight:700;position:relative;flex-shrink:0}
.perc-info{flex:1}
.perc-lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:4px}
.perc-val{font-family:var(--font-hd);font-size:24px;font-weight:700}
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

const addDays = (dateStr, days) => {
  const iso = toISO(dateStr);
  if (!iso) return "";
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
};


const TIPOS = ["CAMIÓN", "TRACTOCAMIÓN", "CAJA SECA", "PLATAFORMA", "RABÓN", "TORTÓN", "PIPA", "PLATAFORMA 20 PIES", "CAJA SECA 20 PIES", "PLATAFORMA 10 PIES", "CAJA SECA 18 PIES", "PLATAFORMA 48 PIES", "CAJA SECA 48 PIES", "CAJA SECA 53 PIES", "ESTAQUITA", "VAN", "LOWBOY", "CAMA BAJA", "OTRO"];
const ESTADOS = ["ACTIVA", "EN TALLER", "BAJA TEMPORAL", "BAJA DEFINITIVA", "INACTIVA"];
const SERVS = ["PREVENTIVO", "CORRECTIVO", "EMERGENCIA", "REVISIÓN"];
const PRIOS = ["ALTA", "MEDIA", "BAJA"];
const DOCS_LIST = ["Seguro", "Verificación", "Licencia Operador", "Permiso SCT", "Tarjeta Circulación", "Revista Vehicular", "Póliza GPS", "IMSS Operador"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const GASTO_TIPOS = ["Telefonía e Internet", "Renta de Instalaciones", "Servicios Públicos", "Papelería", "Mantenimiento Oficina", "Seguros Generales", "Software y Licencias", "Publicidad", "Honorarios", "Impuestos", "Otro"];
const HERRAMIENTAS = ["Torreta Mata Chispas", "Extintor", "Cadenas", "Gata", "Bandas", "Tacones", "Llave de Cruz", "Triángulos Seguridad", "Botiquín", "Conos", "Cables Pasa Corriente", "Señalamientos", "Otro"];

const FORMAS_PAGO = {
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
  { id: "op1", nombre: "Juan Pérez Soto", licencia: "LIC-2345678", licTipo: "E", licVence: "31/12/2026", tel: "8112345678", email: "juan@empresa.com", antiguedad: "2018", status: "ACTIVO", foto: "", notas: "", porcentajeViaje: 10 },
  { id: "op2", nombre: "Carlos Mendoza", licencia: "LIC-3456789", licTipo: "E", licVence: "15/06/2025", tel: "8123456789", email: "carlos@empresa.com", antiguedad: "2020", status: "ACTIVO", foto: "", notas: "", porcentajeViaje: 10 },
  { id: "op3", nombre: "Luis Torres", licencia: "LIC-4567890", licTipo: "D", licVence: "30/09/2026", tel: "8134567890", email: "luis@empresa.com", antiguedad: "2015", status: "ACTIVO", foto: "", notas: "", porcentajeViaje: 10 },
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
  { id: "ex1", fecha: "05/02/2026", empresa: "Transportes del Norte", contacto: "Roberto Garza", tel: "8198765432", tipoUnidad: "TRACTOCAMIÓN KENWORTH", placas: "XYZ-9876", color: "Blanco", eco: "TN-505", operador: "Miguel Hernández", seguroOp: "SEG-OP-2025", seguroVeh: "SEG-VEH-2025", herramientas: ["Extintor", "Cadenas", "Gata"], origen: "Guadalajara", destino: "Tijuana", cliente: "Exportadora Pacífico", carga: "Electrónicos", costoPagar: 18000, precioCliente: 24000, costoEstadias: 1500, status: "COMPLETADO", notas: "Viaje completado sin novedad", evidencias: [] },
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
// MODALES
// ══════════════════════════════════════════════════════════════

function UnitModal({ unit, drivers, onSave, onClose }) {
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
    intervaloMant: 5000,
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
              <div className="fg"><div className="field"><label>N° Unidad *</label><input value={f.num} onChange={ch("num")} placeholder="001" /></div><div className="field"><label>Eco.</label><input value={f.eco} onChange={ch("eco")} placeholder="ECO-01" /></div></div>
              <div className="field"><label>Operador</label><select value={f.operador} onChange={ch("operador")}><option value="">— Sin asignar —</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></div>
              <div className="field"><label>Placas *</label><input value={f.placas} onChange={ch("placas")} placeholder="ABC-1234" /></div>
            </div>
          </div>
          <div className="sec-lbl">Datos Técnicos</div>
          <div className="fg">
            <div className="field"><label>Tipo</label><select value={f.tipo} onChange={ch("tipo")}>{TIPOS.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="field"><label>Marca</label><input value={f.marca} onChange={ch("marca")} /></div>
            <div className="field"><label>Modelo</label><input value={f.modelo} onChange={ch("modelo")} /></div>
            <div className="field"><label>Año</label><input value={f.anio} onChange={ch("anio")} type="number" /></div>
            <div className="field s2"><label>VIN / No. Serie</label><input value={f.vin} onChange={ch("vin")} /></div>
          </div>
          <div className="sec-lbl">Estado & Operación</div>
          <div className="fg">
            <div className="field"><label>Estado</label><select value={f.estado} onChange={ch("estado")}>{ESTADOS.map(e => <option key={e}>{e}</option>)}</select></div>
            <div className="field"><label>Ruta Asignada</label><input value={f.ruta} onChange={ch("ruta")} /></div>
            <div className="field"><label>KM Actual</label><input value={f.kmActual} onChange={ch("kmActual")} type="number" /></div>
            <div className="field"><label>KM Último Mantenimiento</label><input value={f.kmUltMant} onChange={ch("kmUltMant")} type="number" /></div>
            <div className="field"><label>Intervalo de Mantenimiento (km)</label><input value={f.intervaloMant} onChange={ch("intervaloMant")} type="number" placeholder="5000" /></div>
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2} /></div>
          </div>
          {f.kmActual && f.kmUltMant && f.intervaloMant && (
            <div className={`km-alert${kmRestantes <= 0 ? " critical" : ""}`}>
              <span style={{ fontSize: 20 }}>{kmRestantes <= 0 ? "🚨" : kmRestantes <= 500 ? "⚠️" : "✓"}</span>
              <div>
                <strong>Próximo mantenimiento:</strong> {fmtN(kmProximo)} km
                <div style={{ fontSize: 11, marginTop: 2 }}>{kmRestantes > 0 ? `Faltan ${fmtN(kmRestantes)} km` : `¡ATENCIÓN! Pasado por ${fmtN(Math.abs(kmRestantes))} km`}</div>
              </div>
            </div>
          )}
          <div className="sec-lbl">🔒 Financiero</div>
          <div className="fg">
            <div className="field"><label>Depreciación Anual ($)</label><input value={f.deprecAnual} onChange={ch("deprecAnual")} type="number" /></div>
            <div className="field"><label>Rendimiento Esperado (km/L)</label><input value={f.rendEsperado} onChange={ch("rendEsperado")} type="number" step="0.1" /></div>
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}



function DriverModal({ driver, units, onSave, onClose }) {
  const [f, setF] = useState(driver || { 
    nombre: "", licencia: "", licTipo: "E", licVence: "", tel: "", email: "", 
    antiguedad: "", status: "ACTIVO", foto: "", notas: "", porcentajeViaje: 10
  });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const ok = () => { if (!f.nombre) return alert("Nombre requerido"); onSave({ ...f, id: f.id || uid() }) };
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar Conductor" : "👨‍✈️ Nuevo Conductor"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <PhotoInput value={f.foto} onChange={v => setF(p => ({ ...p, foto: v }))} label="Foto del Conductor" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="field"><label>Nombre Completo *</label><input value={f.nombre} onChange={ch("nombre")} /></div>
              <div className="field"><label>Teléfono</label><input value={f.tel} onChange={ch("tel")} /></div>
              <div className="field"><label>Status</label><select value={f.status} onChange={ch("status")}><option>ACTIVO</option><option>INACTIVO</option><option>VACACIONES</option><option>BAJA</option></select></div>
            </div>
          </div>
          <div className="sec-lbl">Documentos</div>
          <div className="fg">
            <div className="field"><label>N° Licencia</label><input value={f.licencia} onChange={ch("licencia")} /></div>
            <div className="field"><label>Tipo Lic.</label><select value={f.licTipo} onChange={ch("licTipo")}><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option></select></div>
            <div className="field"><label>Vence Licencia</label><input value={f.licVence} onChange={ch("licVence")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>Email</label><input value={f.email} onChange={ch("email")} type="email" /></div>
            <div className="field"><label>Año Ingreso</label><input value={f.antiguedad} onChange={ch("antiguedad")} type="number" /></div>
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2} /></div>
          </div>
          <div className="sec-lbl">🔒 Nómina por Viajes</div>
          <div className="fg">
            <div className="field"><label>Porcentaje del Viaje (%)</label><input value={f.porcentajeViaje} onChange={ch("porcentajeViaje")} type="number" step="0.1" min="0" max="100" placeholder="10" /></div>
            <div className="field">
              <div style={{ padding: "12px 16px", background: "#E8F5FA", borderRadius: 8, fontSize: 11, border: "1px solid #B3E0F2", marginTop: 18 }}>
                <strong style={{ color: "var(--cyan)" }}>ℹ️ Cálculo:</strong>
                <div style={{ marginTop: 4, color: "var(--muted)" }}>Comisión = Costo del viaje × {f.porcentajeViaje}%</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}



function DocModal({ doc, units, onSave, onClose }) {
  const [f, setF] = useState(doc || { unidadId: "", nombre: DOCS_LIST[0], numero: "", vence: "", empresa: "", notas: "", foto: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const ok = () => { if (!f.unidadId || !f.nombre) return alert("Unidad y documento requeridos"); onSave({ ...f, id: f.id || uid() }) };
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar" : "📄 Nuevo Documento"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2"><label>Unidad *</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u => <option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            <div className="field"><label>Tipo *</label><select value={f.nombre} onChange={ch("nombre")}>{DOCS_LIST.map(d => <option key={d}>{d}</option>)}</select></div>
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

function MaintModal({ maint, units, onSave, onClose }) {
  const [f, setF] = useState(maint || { unidadId: "", tipo: "PREVENTIVO", desc: "", prioridad: "MEDIA", fechaProg: "", fechaEjec: "", realizado: "NO", taller: "", km: "", costoRef: 0, costoMO: 0, obs: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
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
            <div className="field"><label>Taller</label><input value={f.taller} onChange={ch("taller")} /></div>
            <div className="field"><label>KM Servicio</label><input value={f.km} onChange={ch("km")} type="number" /></div>
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

function FuelModal({ fuel, units, onSave, onClose, onUpdateUnit }) {
  const [f, setF] = useState(fuel || { unidadId: "", fecha: "", km: "", litros: "", precio: "", estacion: "", ticket: "", kmRec: "", obs: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const costo = (Number(f.litros) || 0) * (Number(f.precio) || 0);
  const rend = f.kmRec && f.litros ? (Number(f.kmRec) / Number(f.litros)).toFixed(2) : null;
  const ok = () => { 
    if (!f.unidadId || !f.litros) return alert("Unidad y litros requeridos");
    if (onUpdateUnit) {
      const unit = units.find(u => u.id === f.unidadId);
      if (unit && f.km && Number(f.km) > Number(unit.kmActual)) {
        onUpdateUnit({ ...unit, kmActual: Number(f.km) });
      }
    }
    onSave({ ...f, id: f.id || uid() });
  };
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar Carga" : "⛽ Nueva Carga"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2"><label>Unidad *</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u => <option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            <div className="field"><label>Fecha</label><input value={f.fecha} onChange={ch("fecha")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>KM al Cargar</label><input value={f.km} onChange={ch("km")} type="number" /></div>
            <div className="field"><label>Litros *</label><input value={f.litros} onChange={ch("litros")} type="number" step="0.01" /></div>
            <div className="field"><label>Precio/Litro ($)</label><input value={f.precio} onChange={ch("precio")} type="number" step="0.01" /></div>
            <div className="field"><label>KM Recorridos</label><input value={f.kmRec} onChange={ch("kmRec")} type="number" /></div>
            <div className="field"><label>Estación</label><input value={f.estacion} onChange={ch("estacion")} /></div>
            <div className="field"><label>Ticket / Factura</label><input value={f.ticket} onChange={ch("ticket")} /></div>
            <div className="field s2"><label>Observaciones</label><textarea value={f.obs} onChange={ch("obs")} rows={2} /></div>
          </div>
          {costo > 0 && <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--bg2)", borderRadius: 10, display: "flex", gap: 24 }}>
            <div><div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, fontWeight: 700 }}>COSTO TOTAL</div><div style={{ fontFamily: "var(--font-hd)", fontSize: 24, fontWeight: 700, color: "var(--orange)" }}>{fmt$(costo)}</div></div>
            {rend && <div><div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, fontWeight: 700 }}>RENDIMIENTO</div><div style={{ fontFamily: "var(--font-hd)", fontSize: 24, fontWeight: 700, color: "var(--cyan)" }}>{rend} km/L</div></div>}
          </div>}
          {f.unidadId && f.km && (
            <div style={{ padding: "10px 14px", background: "#E8F9F3", border: "1px solid #B8EDCA", borderRadius: 8, marginTop: 12, fontSize: 11, color: "#00864E" }}>
              <strong>✓ Actualización automática:</strong> El KM actual de la unidad se actualizará a {fmtN(f.km)} km
            </div>
          )}
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

function ExternoModal({ externo, onSave, onClose, tiposPersonalizados = [] }) {
  const [f, setF] = useState(externo || { fecha: "", empresa: "", contacto: "", tel: "", tipoUnidad: "", placas: "", color: "", eco: "", operador: "", seguroOp: "", seguroVeh: "", herramientas: [], origen: "", destino: "", cliente: "", carga: "", costoPagar: 0, precioCliente: 0, costoEstadias: 0, status: "EN RUTA", notas: "", evidencias: [] });
  const [nuevoTipo, setNuevoTipo] = useState("");
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const toggleHerr = h => setF(p => ({ ...p, herramientas: p.herramientas.includes(h) ? p.herramientas.filter(x => x !== h) : [...p.herramientas, h] }));
  const addTipo = () => { if (nuevoTipo.trim()) { setF(p => ({ ...p, tipoUnidad: nuevoTipo.trim() })); setNuevoTipo("") } };
  const ok = () => { if (!f.empresa || !f.origen) return alert("Empresa y origen requeridos"); onSave({ ...f, id: f.id || uid() }) };
  const utilidad = (Number(f.precioCliente) || 0) - (Number(f.costoPagar) || 0) - (Number(f.costoEstadias) || 0);
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal xwide" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id ? "✏️ Editar" : "🚚 Nuevo Viaje Externo"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="sec-lbl">Empresa Transportista</div>
          <div className="fg">
            <div className="field"><label>Fecha</label><input value={f.fecha} onChange={ch("fecha")} placeholder="dd/mm/aaaa" /></div>
            <div className="field"><label>Empresa *</label><input value={f.empresa} onChange={ch("empresa")} /></div>
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

function GastoModal({ gasto, onSave, onClose }) {
  const [f, setF] = useState(gasto || { fecha: "", tipo: GASTO_TIPOS[0], descripcion: "", monto: 0, responsable: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const ok = () => { if (!f.tipo || !f.monto) return alert("Tipo y monto requeridos"); onSave({ ...f, id: f.id || uid() }) };
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

function printUnitSheet({ unit, driver, docs, maints, fuels, trips, showFinancial = true }) {
  const w = window.open("", "_blank");
  const totalM = maints.filter(m => m.unidadId === unit.id).reduce((a, m) => a + (Number(m.costoRef) || 0) + (Number(m.costoMO) || 0), 0);
  const totalF = fuels.filter(f => f.unidadId === unit.id).reduce((a, f) => a + (Number(f.litros) || 0) * (Number(f.precio) || 0), 0);
  const op = driver || {};
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

function printDriverSheet({ driver, unit }) {
  const w = window.open("", "_blank");
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

function printTripsReport({ trips, units, externos = [] }) {
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>Reporte de Viajes</title><style>
  body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:20px}
  h1{font-size:18px;border-bottom:2px solid #0099CC;padding-bottom:6px;margin-bottom:14px;color:#0099CC}
  table{width:100%;border-collapse:collapse;margin:12px 0}
  th{background:#0099CC;color:#fff;padding:6px 9px;text-align:left;font-size:10px}
  td{padding:6px 9px;border-bottom:1px solid #eee;font-size:10px}
  @media print{@page{size:A4 landscape;margin:10mm}}
  </style></head><body>`);
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

  return (
    <div>
      {/* KPIs PRINCIPALES */}
      <div className="stats">
        {/* KPIs Operacionales - Siempre visibles */}
        <div className="stat" style={{ "--c": "var(--cyan)" }}>
          <div className="stat-icon">🚛</div>
          <div className="stat-val">{units.length}</div>
          <div className="stat-lbl">Unidades Totales</div>
          <div className="stat-sub">{activas} activas · {enTaller} en taller</div>
        </div>

        <div className="stat" style={{ "--c": "var(--green)" }}>
          <div className="stat-icon">🗺️</div>
          <div className="stat-val">{enRuta}</div>
          <div className="stat-lbl">En Ruta Ahora</div>
          <div className="stat-sub">{viajesPropios.length + viajesExternos.length} completados</div>
        </div>

        <div className="stat" style={{ "--c": alta > 0 ? "var(--red)" : "var(--orange)" }}>
          <div className="stat-icon">🔧</div>
          <div className="stat-val">{maints.filter(m => m.realizado === "NO").length}</div>
          <div className="stat-lbl">Mant. Pendientes</div>
          <div className="stat-sub">{alta} alta prioridad</div>
        </div>

        {/* NUEVO: Alerta de mantenimiento por KM */}
        <div className="stat" style={{ "--c": alertasKmCriticas > 0 ? "var(--red)" : "var(--yellow)" }}>
          <div className="stat-icon">{alertasKmCriticas > 0 ? "🚨" : "⚠️"}</div>
          <div className="stat-val">{alertasKm}</div>
          <div className="stat-lbl">Mant. por KM</div>
          <div className="stat-sub">
            {alertasKmCriticas > 0 
              ? `${alertasKmCriticas} críticas` 
              : "≤500 km restantes"}
          </div>
        </div>

        <div className="stat" style={{ "--c": docAlert > 0 ? "var(--yellow)" : "var(--green)" }}>
          <div className="stat-icon">📄</div>
          <div className="stat-val">{docAlert}</div>
          <div className="stat-lbl">Docs por Vencer</div>
          <div className="stat-sub">próximos 30 días</div>
        </div>

        {/* KPIs Financieros - Solo Admin */}
        {isAdmin && (
          <>
            <div className="stat" style={{ "--c": "var(--yellow)" }}>
              <div className="stat-icon">🧾</div>
              <div className="stat-val sm">{facturasPendientes.length}</div>
              <div className="stat-lbl">
                Facturas Pendientes
                <span className="lock-icon">🔒</span>
              </div>
              <div className="stat-sub">{fmt$(totalPendiente)}</div>
            </div>

            <div className="stat" style={{ "--c": "var(--red)" }}>
              <div className="stat-icon">⏰</div>
              <div className="stat-val sm">{facturasVencidas.length}</div>
              <div className="stat-lbl">
                Facturas Vencidas
                <span className="lock-icon">🔒</span>
              </div>
              <div className="stat-sub">{fmt$(totalVencido)}</div>
            </div>

            <div className="stat" style={{ "--c": "var(--green)" }}>
              <div className="stat-icon">💰</div>
              <div className="stat-val sm">{fmt$(totalCobrado)}</div>
              <div className="stat-lbl">
                Cobrado
                <span className="lock-icon">🔒</span>
              </div>
              <div className="stat-sub">{facturasPagadas.length} facturas</div>
            </div>

            <div className="stat" style={{ "--c": "var(--cyan)" }}>
              <div className="stat-icon">💳</div>
              <div className="stat-val">{diasCobranza}</div>
              <div className="stat-lbl">
                Días Prom. Cobranza
                <span className="lock-icon">🔒</span>
              </div>
              <div className="stat-sub">DSO</div>
            </div>

            <div className="stat" style={{ "--c": "var(--purple)" }}>
              <div className="stat-icon">📈</div>
              <div className="stat-val">{tasaCobranza}%</div>
              <div className="stat-lbl">
                Tasa de Cobranza
                <span className="lock-icon">🔒</span>
              </div>
              <div className="stat-sub">últimos pagos</div>
            </div>
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



function UnitsPage({ units, drivers, docs, maints, fuels, trips, onAdd, onEdit, onDelete, onChangeDriver, isAdmin }) {
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
                    <button className="btn btn-ghost btn-sm" onClick={() => printUnitSheet({ unit: u, driver: drv, docs, maints, fuels, trips, showFinancial: isAdmin })} title="Imprimir ficha">🖨️</button>
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

function DriversPage({ drivers, units, onAdd, onEdit, onDelete }) {
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
            <thead><tr><th>Foto</th><th>Nombre</th><th>Licencia</th><th>Vence</th><th>Unidad</th><th>Tel</th><th>Status</th><th>Acciones</th></tr></thead>
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
                  <td><Bdg c={d.status === "ACTIVO" ? "bg" : "bm"} t={d.status} /></td>
                  <td><div className="acts">
                    <button className="btn btn-ghost btn-xs" onClick={() => printDriverSheet({ driver: d, unit })} title="Imprimir hoja">🖨️</button>
                    <button className="btn btn-green btn-xs" onClick={() => printNominaOperador({ driver: d, weeks: 4 })} title="Nómina 4 sem">💵</button>
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

function DocsPage({ units, docs, onAdd, onEdit, onDelete }) {
  const [uf, setUf] = useState("TODOS");
  const fd = docs.filter(d => uf === "TODOS" || d.unidadId === uf);
  return (
    <div className="card">
      <div className="card-hdr"><h3>📄 Documentos y Vencimientos ({docs.length})</h3>
        <div className="row-gap">
          <div className="ftabs"><button className={`ftab${uf === "TODOS" ? " on" : ""}`} onClick={() => setUf("TODOS")}>Todas</button>{units.map(u => <button key={u.id} className={`ftab${uf === u.id ? " on" : ""}`} onClick={() => setUf(u.id)}>{u.num} {u.placas}</button>)}</div>
          <button className="btn btn-cyan btn-sm" onClick={onAdd}>+ Agregar</button>
        </div>
      </div>
      {units.filter(u => uf === "TODOS" || u.id === uf).map(u => {
        const ud = fd.filter(d => d.unidadId === u.id);
        return (
          <div key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
            <div style={{ padding: "10px 16px 4px", fontSize: 13, fontWeight: 700, color: "var(--cyan)" }}>🚛 {u.num} — {u.placas}</div>
            <div className="doc-grid">
              {ud.map(d => { const dy = daysUntil(d.vence); const dc = dy === null ? "var(--muted)" : dy < 0 ? "var(--red)" : dy <= 30 ? "var(--yellow)" : "var(--green)"; return (
                <div key={d.id} className="doc-card" style={{ "--dc": dc }}>
                  <div className="doc-name">{d.nombre}</div>
                  <div className="doc-date">{d.vence || "Sin fecha"}</div>
                  <div style={{ marginTop: 5 }}>{docBdg(dy)}</div>
                  {d.numero && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{d.numero}</div>}
                  {d.empresa && <div style={{ fontSize: 10, color: "var(--muted)" }}>{d.empresa}</div>}
                  {d.foto && <div style={{ marginTop: 8 }}><img src={d.foto} style={{ width: "100%", height: 65, objectFit: "cover", borderRadius: 5, border: "1px solid var(--border)" }} alt="doc" /></div>}
                  <div className="acts" style={{ marginTop: 8 }}><button className="btn btn-ghost btn-xs" onClick={() => onEdit(d)}>✏️</button><button className="btn btn-red btn-xs" onClick={() => onDelete(d.id)}>🗑</button></div>
                </div>
              )})}
              {ud.length === 0 && <div style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>Sin documentos registrados</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TripsPage({ trips, units, externos, maints, fuels, onAdd, onEdit, onDelete, onAddExt, onEditExt, onDeleteExt, isAdmin }) {
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
          <button className="btn btn-ghost btn-sm" onClick={() => printTripsReport({ trips: fil, units, externos })}>📊 Imprimir Reporte</button>
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


function GastosPage({ gastos, onAdd, onEdit, onDelete }) {
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
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Monto</th><th>Responsable</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(g => (
              <tr key={g.id}>
                <td style={{ fontSize: 12 }}>{g.fecha || "—"}</td>
                <td><Bdg c="bo" t={g.tipo} /></td>
                <td style={{ fontSize: 12 }}>{g.descripcion || "—"}</td>
                <td style={{ color: "var(--red)", fontWeight: 700 }}>{fmt$(g.monto)}</td>
                <td style={{ fontSize: 12 }}>{g.responsable || "—"}</td>
                <td><div className="acts"><button className="btn btn-ghost btn-sm" onClick={() => onEdit(g)}>✏️</button><button className="btn btn-red btn-sm" onClick={() => onDelete(g.id)}>🗑</button></div></td>
              </tr>
            ))}</tbody>
          </table>}
      </div>
    </div>
  );
}

function MaintPage({ units, maints, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState(""); const [pf, setPf] = useState("TODOS"); const [rf, setRf] = useState("TODOS");
  const fil = maints.filter(m => { const u = units.find(u => u.id === m.unidadId) || {}; return (m.desc + m.taller + (u.placas || "") + (u.num || "")).toLowerCase().includes(q.toLowerCase()) && (pf === "TODOS" || m.prioridad === pf) && (rf === "TODOS" || m.realizado === rf) });
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
            <thead><tr><th>Unidad</th><th>Tipo</th><th>Descripción</th><th>Prioridad</th><th>F.Prog</th><th>F.Ejec</th><th>Realizado</th><th>Costo Total</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(m => { const u = units.find(u => u.id === m.unidadId); const ct = (Number(m.costoRef) || 0) + (Number(m.costoMO) || 0); return (
              <tr key={m.id}>
                <td><strong>{u?.num || "?"}</strong> <span style={{ fontSize: 11, color: "var(--muted)" }}>{u?.placas}</span></td>
                <td><Bdg c="bb" t={m.tipo} /></td>
                <td style={{ maxWidth: 200, fontSize: 12 }}>{m.desc}</td>
                <td>{prioBdg(m.prioridad)}</td>
                <td style={{ fontSize: 12 }}>{m.fechaProg || "—"}</td>
                <td style={{ fontSize: 12, color: m.fechaEjec ? "var(--green)" : "var(--muted)", fontWeight: 600 }}>{m.fechaEjec || "Pendiente"}</td>
                <td>{realBdg(m.realizado)}</td>
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

function ChartsPage({ units, maints, fuels, gastos, trips, facturas, clientes }) {
  
  // ──────────────────────────────────────────────────────────────
  // DATOS MENSUALES - COSTOS
  // ──────────────────────────────────────────────────────────────
  
  const mFuel = Array(12).fill(0).map((_, i) => 
    fuels.filter(f => { 
      const iso = toISO(f.fecha); 
      return iso && new Date(iso).getMonth() === i 
    }).reduce((a, f) => a + (Number(f.litros) || 0) * (Number(f.precio) || 0), 0)
  );
  
  const mMaint = Array(12).fill(0).map((_, i) => 
    maints.filter(m => { 
      const iso = toISO(m.fechaEjec); 
      return iso && new Date(iso).getMonth() === i 
    }).reduce((a, m) => a + (Number(m.costoRef) || 0) + (Number(m.costoMO) || 0), 0)
  );
  
  const mGastos = Array(12).fill(0).map((_, i) => 
    gastos.filter(g => { 
      const iso = toISO(g.fecha); 
      return iso && new Date(iso).getMonth() === i 
    }).reduce((a, g) => a + (Number(g.monto) || 0), 0)
  );

  // ──────────────────────────────────────────────────────────────
  // DATOS MENSUALES - INGRESOS Y UTILIDADES
  // ──────────────────────────────────────────────────────────────
  
  const mIngresosPropios = Array(12).fill(0).map((_, i) => 
    trips.filter(t => { 
      const iso = toISO(t.fechaReg); 
      return !t.esExterno && iso && new Date(iso).getMonth() === i && t.status === "COMPLETADO" 
    }).reduce((a, t) => a + (Number(t.costoOfrecido) || 0), 0)
  );
  
  const mIngresosExternos = Array(12).fill(0).map((_, i) => 
    trips.filter(t => { 
      const iso = toISO(t.fechaReg); 
      return t.esExterno && iso && new Date(iso).getMonth() === i && t.status === "COMPLETADO" 
    }).reduce((a, t) => a + (Number(t.costoOfrecido) || 0), 0)
  );
  
  const mIngresos = mIngresosPropios.map((v, i) => v + mIngresosExternos[i]);
  
  const mCostosPropios = Array(12).fill(0).map((_, i) => 
    trips.filter(t => { 
      const iso = toISO(t.fechaReg); 
      return !t.esExterno && iso && new Date(iso).getMonth() === i && t.status === "COMPLETADO" 
    }).reduce((a, t) => a + (Number(t.gastosExtras) || 0) + (Number(t.costoEstadias) || 0), 0)
  );
  
  const mCostosExternos = Array(12).fill(0).map((_, i) => 
    trips.filter(t => { 
      const iso = toISO(t.fechaReg); 
      return t.esExterno && iso && new Date(iso).getMonth() === i && t.status === "COMPLETADO" 
    }).reduce((a, t) => a + (Number(t.costoPagar) || 0) + (Number(t.costoEstadias) || 0), 0)
  );

  // ──────────────────────────────────────────────────────────────
  // DATOS MENSUALES - FACTURACIÓN
  // ──────────────────────────────────────────────────────────────
  
  const mFacturado = Array(12).fill(0).map((_, i) => 
    facturas.filter(f => { 
      const iso = toISO(f.fechaEmision); 
      return iso && new Date(iso).getMonth() === i 
    }).reduce((a, f) => a + (Number(f.total) || 0), 0)
  );
  
  const mCobrado = Array(12).fill(0).map((_, i) => 
    facturas.filter(f => { 
      const iso = toISO(f.fechaPago); 
      return f.status === "PAGADA" && iso && new Date(iso).getMonth() === i 
    }).reduce((a, f) => a + (Number(f.total) || 0), 0)
  );

  const maxM = Math.max(...mFuel, ...mMaint, ...mGastos, ...mIngresos, ...mFacturado, 1);

  // ──────────────────────────────────────────────────────────────
  // COMPONENTE DE BARRA
  // ──────────────────────────────────────────────────────────────
  
  const BarRow = ({ lbl, bars, maxV }) => (
    <div className="chart-row">
      <div className="chart-lbl" style={{ fontSize: 10 }}>{lbl}</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {bars.map((b, i) => (
          <div key={i} className="bar-bg" style={{ height: 16 }}>
            <div 
              className="bar-fill" 
              style={{ 
                width: `${(b.v / maxV) * 100}%`, 
                background: b.c 
              }}
            >
              {b.v > 0 && (
                <span style={{ 
                  fontSize: 10, 
                  color: "#fff", 
                  whiteSpace: "nowrap", 
                  fontWeight: 700 
                }}>
                  {fmt$(b.v)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  // ANTIGÜEDAD DE SALDOS
  // ──────────────────────────────────────────────────────────────
  
  const pendientes = facturas.filter(f => f.status === "PENDIENTE" || f.status === "VENCIDA");
  
  const antiguedad = {
    corriente: 0,    // 0-30 días
    vencido30: 0,    // 31-60 días
    vencido60: 0,    // 61-90 días
    vencido90: 0     // >90 días
  };

  pendientes.forEach(f => {
    const days = Math.abs(daysUntil(f.fechaVencimiento) || 0);
    const total = Number(f.total) || 0;
    
    if (days <= 30) antiguedad.corriente += total;
    else if (days <= 60) antiguedad.vencido30 += total;
    else if (days <= 90) antiguedad.vencido60 += total;
    else antiguedad.vencido90 += total;
  });

  const totalAntiguedad = Object.values(antiguedad).reduce((a, b) => a + b, 0);

  // ──────────────────────────────────────────────────────────────
  // TOP 10 CLIENTES
  // ──────────────────────────────────────────────────────────────
  
  const clientesFacturacion = clientes.map(c => {
    const total = facturas
      .filter(f => f.clienteId === c.id)
      .reduce((a, f) => a + (Number(f.total) || 0), 0);
    return { ...c, totalFacturado: total };
  })
  .filter(c => c.totalFacturado > 0)
  .sort((a, b) => b.totalFacturado - a.totalFacturado)
  .slice(0, 10);

  const maxCliente = Math.max(...clientesFacturacion.map(c => c.totalFacturado), 1);

  // ──────────────────────────────────────────────────────────────
  // INDICADOR DE SALUD FINANCIERA
  // ──────────────────────────────────────────────────────────────
  
  const carteraTotal = facturas
    .filter(f => f.status === "PENDIENTE" || f.status === "VENCIDA")
    .reduce((a, f) => a + (Number(f.total) || 0), 0);
  
  const carteraVencida = facturas
    .filter(f => f.status === "VENCIDA")
    .reduce((a, f) => a + (Number(f.total) || 0), 0);

  const pctVencido = carteraTotal > 0 
    ? ((carteraVencida / carteraTotal) * 100).toFixed(1) 
    : 0;

  const saludColor = 
    pctVencido < 10 ? "var(--green)" :
    pctVencido < 20 ? "var(--yellow)" : "var(--red)";

  const saludTexto = 
    pctVencido < 10 ? "EXCELENTE" :
    pctVencido < 20 ? "ACEPTABLE" : "CRÍTICO";

  const saludEmoji = 
    pctVencido < 10 ? "🟢" :
    pctVencido < 20 ? "🟡" : "🔴";

  return (
    <div>
      {/* GRÁFICA 1: Utilidades vs Gastos Mensuales */}
      <div className="card">
        <div className="card-hdr">
          <h3>💰 Utilidades vs Gastos Mensuales (Año Completo) 🔒</h3>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {MESES.map((m, i) => {
            const ing = mIngresos[i];
            const gT = mFuel[i] + mMaint[i] + mGastos[i] + mCostosPropios[i] + mCostosExternos[i];
            const util = ing - gT;
            
            return (
              <BarRow 
                key={m} 
                lbl={m} 
                maxV={maxM} 
                bars={[
                  { v: ing, c: "var(--green)" },
                  { v: gT, c: "var(--red)" },
                  { v: Math.abs(util), c: util >= 0 ? "var(--cyan)" : "var(--orange)" }
                ]} 
              />
            );
          })}
          <div style={{ 
            display: "flex", 
            gap: 16, 
            marginTop: 10, 
            paddingLeft: 100, 
            flexWrap: "wrap" 
          }}>
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
              💵 Ingresos
            </span>
            <span style={{ fontSize: 11, color: "var(--red)", fontWeight: 600 }}>
              📉 Gastos Totales
            </span>
            <span style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 600 }}>
              💰 Utilidad
            </span>
          </div>
        </div>
      </div>

      {/* GRÁFICA 2: Desglose de Gastos Mensuales */}
      <div className="card">
        <div className="card-hdr">
          <h3>📊 Desglose de Gastos Mensuales 🔒</h3>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {MESES.map((m, i) => (
            <BarRow 
              key={m} 
              lbl={m} 
              maxV={maxM} 
              bars={[
                { v: mFuel[i], c: "var(--cyan)" },
                { v: mMaint[i], c: "var(--orange)" },
                { v: mGastos[i], c: "var(--purple)" }
              ]} 
            />
          ))}
          <div style={{ 
            display: "flex", 
            gap: 16, 
            marginTop: 10, 
            paddingLeft: 100 
          }}>
            <span style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 600 }}>
              ⛽ Combustible
            </span>
            <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600 }}>
              🔧 Mantenimiento
            </span>
            <span style={{ fontSize: 11, color: "var(--purple)", fontWeight: 600 }}>
              📋 Gastos Generales
            </span>
          </div>
        </div>
      </div>

      {/* GRÁFICA 3: Split Unidades Propias vs Logística Externa */}
      <div className="card">
        <div className="card-hdr">
          <h3>🚛 Split: Unidades Propias vs Logística Externa 🔒</h3>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {MESES.map((m, i) => (
            <BarRow 
              key={m} 
              lbl={m} 
              maxV={maxM} 
              bars={[
                { v: mIngresosPropios[i], c: "var(--cyan)" },
                { v: mIngresosExternos[i], c: "var(--purple)" }
              ]} 
            />
          ))}
          <div style={{ 
            display: "flex", 
            gap: 16, 
            marginTop: 10, 
            paddingLeft: 100 
          }}>
            <span style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 600 }}>
              🚛 Ingresos Unidades Propias
            </span>
            <span style={{ fontSize: 11, color: "var(--purple)", fontWeight: 600 }}>
              🚚 Ingresos Logística Externa
            </span>
          </div>
        </div>
      </div>

      {/* GRÁFICA 4: Facturación vs Cobranza */}
      <div className="card">
        <div className="card-hdr">
          <h3>🧾 Facturación vs Cobranza (12 meses) 🔒</h3>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {MESES.map((m, i) => {
            const diferencia = mFacturado[i] - mCobrado[i];
            return (
              <BarRow 
                key={m} 
                lbl={m} 
                maxV={maxM} 
                bars={[
                  { v: mFacturado[i], c: "var(--cyan)" },
                  { v: mCobrado[i], c: "var(--green)" },
                  { v: Math.abs(diferencia), c: diferencia >= 0 ? "var(--yellow)" : "var(--red)" }
                ]} 
              />
            );
          })}
          <div style={{ 
            display: "flex", 
            gap: 16, 
            marginTop: 10, 
            paddingLeft: 100 
          }}>
            <span style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 600 }}>
              🧾 Facturado
            </span>
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
              💰 Cobrado
            </span>
            <span style={{ fontSize: 11, color: "var(--yellow)", fontWeight: 600 }}>
              ⏳ Pendiente
            </span>
          </div>
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
        gap: 16 
      }}>
        {/* GRÁFICA 5: Antigüedad de Saldos */}
        <div className="card">
          <div className="card-hdr">
            <h3>📅 Antigüedad de Saldos 🔒</h3>
          </div>
          <div style={{ padding: "20px 24px" }}>
            {totalAntiguedad > 0 ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  {[
                    { 
                      lbl: "Corriente (0-30 días)", 
                      val: antiguedad.corriente, 
                      color: "var(--green)" 
                    },
                    { 
                      lbl: "Vencido (31-60 días)", 
                      val: antiguedad.vencido30, 
                      color: "var(--yellow)" 
                    },
                    { 
                      lbl: "Vencido (61-90 días)", 
                      val: antiguedad.vencido60, 
                      color: "var(--orange)" 
                    },
                    { 
                      lbl: "Vencido (>90 días)", 
                      val: antiguedad.vencido90, 
                      color: "var(--red)" 
                    }
                  ].map((item, i) => {
                    const pct = ((item.val / totalAntiguedad) * 100).toFixed(1);
                    return (
                      <div 
                        key={i} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: i < 3 ? "1px solid var(--border)" : "none"
                        }}
                      >
                        <div style={{ fontSize: 12 }}>
                          <span style={{ 
                            display: "inline-block",
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            background: item.color,
                            marginRight: 8
                          }} />
                          {item.lbl}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ 
                            fontFamily: "var(--font-hd)", 
                            fontSize: 16, 
                            fontWeight: 700,
                            color: item.color
                          }}>
                            {fmt$(item.val)}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>
                            {pct}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{
                  padding: "12px 16px",
                  background: "var(--bg2)",
                  borderRadius: 8,
                  marginTop: 12
                }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                    CARTERA TOTAL
                  </div>
                  <div style={{
                    fontFamily: "var(--font-hd)",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "var(--cyan)"
                  }}>
                    {fmt$(totalAntiguedad)}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty">
                <div className="empty-icon">📅</div>
                <p>Sin saldos pendientes</p>
              </div>
            )}
          </div>
        </div>

        {/* GRÁFICA 6: Indicador de Salud Financiera */}
        <div className="card">
          <div className="card-hdr">
            <h3>🏥 Salud Financiera 🔒</h3>
          </div>
          <div style={{ padding: "20px 24px", textAlign: "center" }}>
            <div style={{
              width: 120,
              height: 120,
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: saludColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48
            }}>
              {saludEmoji}
            </div>
            
            <div style={{
              fontFamily: "var(--font-hd)",
              fontSize: 32,
              fontWeight: 700,
              color: saludColor,
              marginBottom: 8
            }}>
              {saludTexto}
            </div>
            
            <div style={{ 
              fontSize: 14, 
              color: "var(--muted)",
              marginBottom: 20
            }}>
              {pctVencido}% de cartera vencida
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 20
            }}>
              <div style={{
                padding: "12px",
                background: "var(--bg2)",
                borderRadius: 8
              }}>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  Cartera Total
                </div>
                <div style={{
                  fontFamily: "var(--font-hd)",
                  fontSize: 16,
                  fontWeight: 700
                }}>
                  {fmt$(carteraTotal)}
                </div>
              </div>
              
              <div style={{
                padding: "12px",
                background: "var(--bg2)",
                borderRadius: 8
              }}>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  Vencida
                </div>
                <div style={{
                  fontFamily: "var(--font-hd)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--red)"
                }}>
                  {fmt$(carteraVencida)}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 20,
              padding: "12px 16px",
              background: pctVencido < 10 ? "#E8F9F3" : pctVencido < 20 ? "#FFF9E6" : "#FFE5E8",
              border: `1px solid ${pctVencido < 10 ? "#B8EDCA" : pctVencido < 20 ? "#FFE699" : "#FFD0D5"}`,
              borderRadius: 8,
              fontSize: 11,
              textAlign: "left"
            }}>
              <strong>Referencia:</strong>
              <div style={{ marginTop: 6, lineHeight: 1.6 }}>
                🟢 Excelente: &lt;10% vencido<br/>
                🟡 Aceptable: 10-20% vencido<br/>
                🔴 Crítico: &gt;20% vencido
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Clientes */}
      {clientesFacturacion.length > 0 && (
        <div className="card">
          <div className="card-hdr">
            <h3>🏆 Top 10 Clientes por Facturación 🔒</h3>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {clientesFacturacion.map((c, idx) => (
              <div 
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: idx < clientesFacturacion.length - 1 ? "1px solid var(--border)" : "none"
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: idx < 3 
                    ? "linear-gradient(135deg, var(--cyan), var(--purple))" 
                    : "var(--bg2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-hd)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: idx < 3 ? "#fff" : "var(--muted)",
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {c.nombreCorto || c.nombre}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    {c.tipo} · RFC: {c.rfc}
                  </div>
                </div>

                <div style={{ width: "40%", marginRight: 12 }}>
                  <div className="bar-bg" style={{ height: 24 }}>
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${(c.totalFacturado / maxCliente) * 100}%`,
                        background: "linear-gradient(90deg, var(--cyan), var(--purple))"
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  fontFamily: "var(--font-hd)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--cyan)",
                  minWidth: 100,
                  textAlign: "right"
                }}>
                  {fmt$(c.totalFacturado)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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

// ──────────────────────────────────────────────────────────────
// PÁGINA DE CLIENTES
// ──────────────────────────────────────────────────────────────

function ClientesPage({ clientes, facturas, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const [tf, setTf] = useState("TODOS");
  const [sf, setSf] = useState("TODOS");

  const fil = clientes.filter(c => {
    const match = (c.nombre + c.rfc + c.nombreCorto).toLowerCase().includes(q.toLowerCase());
    const tipoMatch = tf === "TODOS" || c.tipo === tf;
    const statusMatch = sf === "TODOS" || c.status === sf;
    return match && tipoMatch && statusMatch;
  });

  // Calcular estadísticas por cliente
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
              <input 
                placeholder="Buscar cliente..." 
                value={q} 
                onChange={e => setQ(e.target.value)} 
              />
            </div>
            <button className="btn btn-cyan" onClick={onAdd}>
              + Nuevo Cliente
            </button>
          </div>
        </div>

        <div style={{ 
          padding: "10px 16px", 
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <div className="ftabs">
            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>
              TIPO:
            </span>
            {["TODOS", "FISICA", "MORAL"].map(t => (
              <button 
                key={t} 
                className={`ftab${tf === t ? " on" : ""}`} 
                onClick={() => setTf(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="ftabs">
            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>
              STATUS:
            </span>
            {["TODOS", "ACTIVO", "SUSPENDIDO", "BLOQUEADO"].map(s => (
              <button 
                key={s} 
                className={`ftab${sf === s ? " on" : ""}`} 
                onClick={() => setSf(s)}
              >
                {s}
              </button>
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
            <div className="empty">
              <div className="empty-icon">👥</div>
              <p>Sin clientes encontrados</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>RFC</th>
                  <th>Tipo</th>
                  <th>Contacto</th>
                  <th>Crédito</th>
                  <th>Límite</th>
                  <th>Facturado</th>
                  <th>Pendiente</th>
                  <th>Status</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fil.map(c => {
                  const stats = getClienteStats(c.id);
                  const pctUsado = c.limiteCredito > 0 
                    ? ((stats.totalPendiente / c.limiteCredito) * 100).toFixed(0) 
                    : 0;
                  const colorLimite = pctUsado > 80 ? "var(--red)" : pctUsado > 60 ? "var(--yellow)" : "var(--green)";

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {c.nombreCorto || c.nombre}
                        </div>
                        {c.nombreCorto && (
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>
                            {c.nombre}
                          </div>
                        )}
                      </td>
                      <td style={{ 
                        fontFamily: "monospace", 
                        fontSize: 11,
                        color: "var(--muted)" 
                      }}>
                        {c.rfc}
                      </td>
                      <td>
                        <Bdg 
                          c={c.tipo === "MORAL" ? "bp" : "bb"} 
                          t={c.tipo} 
                        />
                      </td>
                      <td style={{ fontSize: 11 }}>
                        <div>{c.telefono || "—"}</div>
                        <div style={{ color: "var(--muted)" }}>
                          {c.email || "—"}
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {c.diasCreditoDefault} días
                      </td>
                      <td>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          {fmt$(c.limiteCredito)}
                        </div>
                        {c.limiteCredito > 0 && stats.totalPendiente > 0 && (
                          <div style={{ 
                            fontSize: 10, 
                            color: colorLimite,
                            fontWeight: 600 
                          }}>
                            {pctUsado}% usado
                          </div>
                        )}
                      </td>
                      <td style={{ 
                        fontWeight: 600,
                        color: "var(--cyan)" 
                      }}>
                        {fmt$(stats.totalFacturado)}
                        <div style={{ 
                          fontSize: 10, 
                          color: "var(--muted)",
                          fontWeight: 400 
                        }}>
                          {stats.numFacturas} facturas
                        </div>
                      </td>
                      <td style={{ 
                        fontWeight: 600,
                        color: stats.totalPendiente > 0 ? "var(--orange)" : "var(--muted)"
                      }}>
                        {fmt$(stats.totalPendiente)}
                      </td>
                      <td>
                        <Bdg 
                          c={
                            c.status === "ACTIVO" ? "bg" : 
                            c.status === "SUSPENDIDO" ? "by" : "br"
                          } 
                          t={c.status} 
                        />
                      </td>
                      <td>
                        <div className="acts">
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => onEdit(c)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-red btn-sm" 
                            onClick={() => onDelete(c.id)}
                            title="Eliminar"
                          >
                            🗑
                          </button>
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

      {/* Estadísticas resumidas */}
      <div className="stats">
        <div className="stat" style={{ "--c": "var(--cyan)" }}>
          <div className="stat-icon">👥</div>
          <div className="stat-val">{clientes.length}</div>
          <div className="stat-lbl">Total Clientes</div>
          <div className="stat-sub">
            {totales.activos} activos
          </div>
        </div>

        <div className="stat" style={{ "--c": "var(--purple)" }}>
          <div className="stat-icon">🏢</div>
          <div className="stat-val">{totales.morales}</div>
          <div className="stat-lbl">Personas Morales</div>
          <div className="stat-sub">
            Con retención 4%
          </div>
        </div>

        <div className="stat" style={{ "--c": "var(--green)" }}>
          <div className="stat-icon">👤</div>
          <div className="stat-val">{totales.fisicas}</div>
          <div className="stat-lbl">Personas Físicas</div>
          <div className="stat-sub">
            IVA completo
          </div>
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
                {viajes.filter(v => v.status === "COMPLETADO").map(v => (
                    <option key={v.id} value={v.id}>
                      {v.origen} → {v.destino} ({v.fecha}) - {fmt$(v.costoOfrecido)}
                    </option>
                  ))}
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
                {Object.entries(FORMAS_PAGO).map(([k, v]) => (
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

// ──────────────────────────────────────────────────────────────
// PÁGINA DE FACTURACIÓN
// ──────────────────────────────────────────────────────────────

function FacturacionPage({ facturas, clientes, viajes, onAdd, onEdit, onDelete, onMarcarPagada }) {
  const [q, setQ] = useState("");
  const [sf, setSf] = useState("TODOS");
  const [cf, setCf] = useState("TODOS");

  // Actualizar status basado en vencimiento
  useEffect(() => {
    facturas.forEach(f => {
      if (f.status === "PENDIENTE") {
        const days = daysUntil(f.fechaVencimiento);
        if (days !== null && days < 0) {
          // Auto-cambiar a VENCIDA
          onEdit({ ...f, status: "VENCIDA" });
        }
      }
    });
  }, [facturas, onEdit]);

  const fil = facturas.filter(f => {
    const cli = clientes.find(c => c.id === f.clienteId);
    const match = (f.numeroFactura + f.cliente + f.rfcCliente).toLowerCase().includes(q.toLowerCase());
    const statusMatch = sf === "TODOS" || f.status === sf;
    const clienteMatch = cf === "TODOS" || f.clienteId === cf;
    return match && statusMatch && clienteMatch;
  });

  // Calcular estadísticas
  const pendientes = facturas.filter(f => f.status === "PENDIENTE");
  const vencidas = facturas.filter(f => f.status === "VENCIDA");
  const porVencer = pendientes.filter(f => {
    const days = daysUntil(f.fechaVencimiento);
    return days !== null && days >= 0 && days <= 5;
  });
  const pagadas = facturas.filter(f => f.status === "PAGADA");

  const totalPendiente = pendientes.reduce((a, f) => a + (Number(f.total) || 0), 0);
  const totalVencido = vencidas.reduce((a, f) => a + (Number(f.total) || 0), 0);
  const totalCobrado = pagadas.reduce((a, f) => a + (Number(f.total) || 0), 0);

  // Calcular días promedio de cobranza
  const facturasConPago = pagadas.filter(f => f.fechaPago && f.fechaEmision);
  const diasCobranza = facturasConPago.length > 0
    ? facturasConPago.reduce((a, f) => {
        const dias = daysUntil(f.fechaEmision) * -1 - daysUntil(f.fechaPago) * -1;
        return a + dias;
      }, 0) / facturasConPago.length
    : 0;

  return (
    <div>
      {/* KPIs */}
      <div className="stats">
        <div className="stat" style={{ "--c": "var(--yellow)" }}>
          <div className="stat-icon">🧾</div>
          <div className="stat-val sm">{pendientes.length}</div>
          <div className="stat-lbl">Pendientes</div>
          <div className="stat-sub">{fmt$(totalPendiente)}</div>
        </div>

        <div className="stat" style={{ "--c": "var(--red)" }}>
          <div className="stat-icon">⏰</div>
          <div className="stat-val sm">{vencidas.length}</div>
          <div className="stat-lbl">Vencidas</div>
          <div className="stat-sub">{fmt$(totalVencido)}</div>
        </div>

        <div className="stat" style={{ "--c": "var(--orange)" }}>
          <div className="stat-icon">📅</div>
          <div className="stat-val sm">{porVencer.length}</div>
          <div className="stat-lbl">Por Vencer (5d)</div>
          <div className="stat-sub">
            {porVencer.reduce((a, f) => a + f.total, 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          </div>
        </div>

        <div className="stat" style={{ "--c": "var(--green)" }}>
          <div className="stat-icon">💰</div>
          <div className="stat-val sm">{pagadas.length}</div>
          <div className="stat-lbl">Pagadas</div>
          <div className="stat-sub">{fmt$(totalCobrado)}</div>
        </div>

        <div className="stat" style={{ "--c": "var(--cyan)" }}>
          <div className="stat-icon">💳</div>
          <div className="stat-val">{Math.round(diasCobranza)}</div>
          <div className="stat-lbl">Días Prom. Cobranza</div>
          <div className="stat-sub">DSO</div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="card">
        <div className="card-hdr">
          <h3>🧾 Facturación ({facturas.length})</h3>
          <div className="row-gap">
            <div className="sw">
              <span style={{ color: "var(--muted)" }}>🔍</span>
              <input 
                placeholder="Buscar factura..." 
                value={q} 
                onChange={e => setQ(e.target.value)} 
              />
            </div>
            <button className="btn btn-cyan" onClick={onAdd}>
              + Nueva Factura
            </button>
          </div>
        </div>

        <div style={{ 
          padding: "10px 16px", 
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: 20,
          flexWrap: "wrap"
        }}>
          <div className="ftabs">
            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>
              STATUS:
            </span>
            {["TODOS", "PENDIENTE", "VENCIDA", "PAGADA", "CANCELADA"].map(s => (
              <button 
                key={s} 
                className={`ftab${sf === s ? " on" : ""}`} 
                onClick={() => setSf(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ftabs">
            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 4, fontWeight: 700 }}>
              CLIENTE:
            </span>
            <button className={`ftab${cf === "TODOS" ? " on" : ""}`} onClick={() => setCf("TODOS")}>
              TODOS
            </button>
            {clientes.slice(0, 5).map(c => (
              <button 
                key={c.id} 
                className={`ftab${cf === c.id ? " on" : ""}`} 
                onClick={() => setCf(c.id)}
              >
                {c.nombreCorto || c.nombre}
              </button>
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
            <div className="empty">
              <div className="empty-icon">🧾</div>
              <p>Sin facturas encontradas</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Emisión</th>
                  <th>Vencimiento</th>
                  <th>Subtotal</th>
                  <th>IVA</th>
                  <th>Ret. IVA</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fil.map(f => {
                  const days = daysUntil(f.fechaVencimiento);
                  const statusColor = 
                    f.status === "PAGADA" ? "var(--green)" :
                    f.status === "VENCIDA" ? "var(--red)" :
                    days <= 5 ? "var(--orange)" : "var(--yellow)";

                  return (
                    <tr key={f.id}>
                      <td style={{ 
                        fontFamily: "var(--font-hd)", 
                        fontSize: 14,
                        fontWeight: 700 
                      }}>
                        {f.serie}-{f.numeroFactura}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>
                          {f.cliente}
                        </div>
                        <div style={{ 
                          fontSize: 10, 
                          color: "var(--muted)",
                          fontFamily: "monospace" 
                        }}>
                          {f.rfcCliente}
                        </div>
                      </td>
                      <td>
                        <Bdg 
                          c={f.tipoCliente === "MORAL" ? "bp" : "bb"} 
                          t={f.tipoCliente} 
                        />
                      </td>
                      <td style={{ fontSize: 12 }}>{f.fechaEmision}</td>
                      <td style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>
                        {f.fechaVencimiento}
                        {days !== null && f.status === "PENDIENTE" && (
                          <div style={{ fontSize: 10 }}>
                            {days >= 0 ? `${days}d restantes` : `${Math.abs(days)}d vencida`}
                          </div>
                        )}
                      </td>
                      <td>{fmt$(f.subtotal)}</td>
                      <td style={{ color: "var(--green)" }}>+{fmt$(f.iva)}</td>
                      <td style={{ color: "var(--red)" }}>
                        {f.retencionIVA > 0 ? `-${fmt$(f.retencionIVA)}` : "—"}
                      </td>
                      <td style={{ 
                        fontWeight: 700,
                        fontSize: 13,
                        fontFamily: "var(--font-hd)" 
                      }}>
                        {fmt$(f.total)}
                      </td>
                      <td>
                        <Bdg 
                          c={
                            f.status === "PAGADA" ? "bg" :
                            f.status === "VENCIDA" ? "br" :
                            f.status === "CANCELADA" ? "bm" : "by"
                          } 
                          t={f.status} 
                        />
                      </td>
                      <td>
                        <div className="acts">
                          {f.status === "PENDIENTE" && (
                            <button 
                              className="btn btn-green btn-xs" 
                              onClick={() => onMarcarPagada(f)}
                              title="Marcar como pagada"
                            >
                              ✓
                            </button>
                          )}
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => onEdit(f)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-red btn-sm" 
                            onClick={() => onDelete(f.id)}
                            title="Eliminar"
                          >
                            🗑
                          </button>
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


// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [units, setUnits] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [docs, setDocs] = useState([]);
  const [maints, setMaints] = useState([]);
  const [fuels, setFuels] = useState([]);
  const [trips, setTrips] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [externos, setExternos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [tiposPersonalizados, setTiposPersonalizados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    (async () => {
      const pairs = [
        [setUnits, "fp5:units", D_UNITS],
        [setDrivers, "fp5:drivers", D_DRIVERS],
        [setDocs, "fp5:docs", D_DOCS],
        [setMaints, "fp5:maints", D_MAINTS],
        [setFuels, "fp5:fuels", D_FUELS],
        [setTrips, "fp5:trips", D_TRIPS],
        [setGastos, "fp5:gastos", D_GASTOS],
        [setExternos, "fp5:externos", D_EXTERNOS],
        [setClientes, "fp5:clientes", D_CLIENTES],
        [setFacturas, "fp5:facturas", D_FACTURAS],
        [setTiposPersonalizados, "fp5:tipos", []]
      ];
      await Promise.all(pairs.map(async ([s, k, d]) => {
        try { const r = await window.storage.get(k); s(r ? JSON.parse(r.value) : d) } catch { s(d) }
      }));
      setLoading(false);
    })();
  }, []);

  const sv = useCallback(async (k, v) => { try { await window.storage.set(k, JSON.stringify(v)) } catch { } }, []);
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
  const tpRef = useRef(tiposPersonalizados); tpRef.current = tiposPersonalizados;

  const mkCRUD = (getRef, setter, key) => ({
    save: async item => { const cur = getRef(); const next = cur.find(x => x.id === item.id) ? cur.map(x => x.id === item.id ? item : x) : [...cur, item]; setter(next); await sv(key, next); setModal(null); notify("Guardado ✓") },
    del: id => setConfirm({ msg: "¿Eliminar este registro?", onOk: async () => { const next = getRef().filter(x => x.id !== id); setter(next); await sv(key, next); setConfirm(null); notify("Eliminado") } })
  });

  const UC = mkCRUD(() => uRef.current, setUnits, "fp5:units");
  const DC = mkCRUD(() => dRef.current, setDrivers, "fp5:drivers");
  const DoC = mkCRUD(() => dcRef.current, setDocs, "fp5:docs");
  const MC = mkCRUD(() => mRef.current, setMaints, "fp5:maints");
  const FC = mkCRUD(() => fRef.current, setFuels, "fp5:fuels");
  const TC = mkCRUD(() => tRef.current, setTrips, "fp5:trips");
  const GC = mkCRUD(() => gRef.current, setGastos, "fp5:gastos");
  const EC = mkCRUD(() => eRef.current, setExternos, "fp5:externos");
  const CliC = mkCRUD(() => cliRef.current, setClientes, "fp5:clientes");
  const FacC = mkCRUD(() => facRef.current, setFacturas, "fp5:facturas");

  const marcarPagada = (fac) => {
    const hoy = new Date().toLocaleDateString("es-MX");
    FacC.save({ ...fac, status: "PAGADA", fechaPago: hoy });
  };

  const saveExternoWithTipo = async (item) => {
    if (item.tipoUnidad && !TIPOS.includes(item.tipoUnidad) && !tiposPersonalizados.includes(item.tipoUnidad)) {
      const newTipos = [...tiposPersonalizados, item.tipoUnidad];
      setTiposPersonalizados(newTipos);
      await sv("fp5:tipos", newTipos);
    }
    EC.save(item);
  };

  const resetAll = () => setConfirm({
    msg: "¿Restaurar datos de ejemplo? Se perderán los cambios actuales.", onOk: async () => {
      const pairs = [[D_UNITS, "fp5:units", setUnits], [D_DRIVERS, "fp5:drivers", setDrivers], [D_DOCS, "fp5:docs", setDocs], [D_MAINTS, "fp5:maints", setMaints], [D_FUELS, "fp5:fuels", setFuels], [D_TRIPS, "fp5:trips", setTrips], [D_GASTOS, "fp5:gastos", setGastos], [D_EXTERNOS, "fp5:externos", setExternos], [[], "fp5:tipos", setTiposPersonalizados]];
      for (const [d, k, s] of pairs) { s(d); await sv(k, d); }
      setConfirm(null); notify("Datos restaurados", "info");
    }
  });

  const exportExcel = () => {
    const rows = (hdrs, data) => [hdrs, ...data].map(r => r.map(v => String(v).replace(/\t/g, " ")).join("\t")).join("\n");
    const content = [
      "=== UNIDADES ===\n" + rows(["No.", "Eco", "Operador", "Placas", "Tipo", "Marca", "Modelo", "Año", "VIN", "Estado", "KM Actual", "Rend.Esperado", "Deprec.Anual"],
        units.map(u => { const d = drivers.find(d => d.id === u.operador); return [u.num, u.eco, d?.nombre || "", u.placas, u.tipo, u.marca, u.modelo, u.anio, u.vin, u.estado, u.kmActual, u.rendEsperado, u.deprecAnual] })),
      "\n=== CONDUCTORES ===\n" + rows(["Nombre", "Licencia", "Vence", "Tel", "Status", "Salario Semanal"],
        drivers.map(d => [d.nombre, d.licencia, d.licVence, d.tel, d.status, d.salarioSemanal])),
      "\n=== VIAJES PROPIOS ===\n" + rows(["Unidad", "Origen", "Destino", "Salida", "Regreso", "KM", "Cliente", "Status", "Precio Cliente", "Gastos Extras", "Estadías"],
        trips.filter(t => !t.esExterno).map(t => { const u = units.find(u => u.id === t.unidadId); const d = (Number(t.kmLlegada) || 0) - (Number(t.kmSalida) || 0); return [u?.num, t.origen, t.destino, t.fecha, t.fechaReg, d, t.cliente, t.status, t.costoOfrecido, t.gastosExtras, t.costoEstadias] })),
      "\n=== VIAJES EXTERNOS ===\n" + rows(["Empresa", "Origen", "Destino", "Fecha", "Cliente", "Status", "Precio Cliente", "Costo Pagar", "Estadías", "Utilidad"],
        trips.filter(t => t.esExterno).map(t => { const util = (Number(t.costoOfrecido) || 0) - (Number(t.costoPagar) || 0) - (Number(t.costoEstadias) || 0); const ext = externos.find(e => e.id === t.unidadId); return [ext?.empresa, t.origen, t.destino, t.fecha, t.cliente, t.status, t.costoOfrecido, t.costoPagar, t.costoEstadias, util] })),
      "\n=== GASTOS GENERALES ===\n" + rows(["Fecha", "Tipo", "Descripción", "Monto", "Responsable"],
        gastos.map(g => [g.fecha, g.tipo, g.descripcion, g.monto, g.responsable])),
    ].join("\n");
    const blob = new Blob([content], { type: "text/tab-separated-values" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `FleetPro_v4_${new Date().toISOString().slice(0, 10)}.tsv`; a.click();
  };

  const alertCount = (() => { 
    let n = 0; 
    docs.forEach(d => { const dy = daysUntil(d.vence); if (dy !== null && dy <= 30) n++ }); 
    maints.filter(m => m.realizado === "NO" && m.prioridad === "ALTA").forEach(() => n++);
    units.forEach(u => { const kmRestantes = (u.kmUltMant + u.intervaloMant) - u.kmActual; if (kmRestantes <= 500) n++; });
    facturas.forEach(f => {
      if (f.status === "VENCIDA") n++;
      if (f.status === "PENDIENTE") { const days = daysUntil(f.fechaVencimiento); if (days !== null && days >= 0 && days <= 5) n++; }
    });
    return n; 
  })();

  const icons = { dashboard: "📊", alerts: "🚨", units: "🚛", drivers: "👨‍✈️", trips: "🗺️", maints: "🔧", fuels: "⛽", docs: "📄", clientes: "👥", facturacion: "🧾", charts: "📈", gastos: "💵" };
  const titles = { dashboard: "Dashboard", alerts: "Alertas", units: "Unidades", drivers: "Conductores", trips: "Viajes & Logística", maints: "Mantenimientos", fuels: "Combustible", docs: "Documentos", clientes: "Clientes", facturacion: "Facturación", charts: "Gráficas & Reportes", gastos: "Gastos Generales" };

  const navSecs = [
    { lbl: "PRINCIPAL", items: [{ id: "dashboard" }, { id: "alerts", badge: alertCount }] },
    { lbl: "FLOTA", items: [{ id: "units" }, { id: "drivers" }, { id: "trips" }] },
    { lbl: "CONTROL", items: [{ id: "maints" }, { id: "fuels" }, { id: "docs" }] },
    { lbl: "FINANZAS 🔒", items: [{ id: "clientes" }, { id: "facturacion" }, { id: "gastos" }, { id: "charts" }], adminOnly: true },
  ];

  if (loading) return (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg0)", color: "var(--muted)", fontFamily: "var(--font-hd)", fontSize: 22, letterSpacing: ".1em" }}><style>{CSS}</style>⟳ Cargando Fleet Pro v5.0...</div>);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-title">FLEET PRO</div>
            <div className="sb-logo-sub">v5.0 • Sistema Integral</div>
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
            <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 8, fontWeight: 500 }}>
              {units.length} unidades • {drivers.length} conductores
              {isAdmin && <span className="lock-icon" style={{ marginLeft: 4 }}>🔒</span>}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginBottom: 6 }} onClick={exportExcel}>📊 Exportar Excel</button>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", fontSize: 11, marginBottom: 6 }} onClick={resetAll}>↺ Restaurar datos</button>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", fontSize: 11 }} onClick={() => setIsAdmin(!isAdmin)}>
              {isAdmin ? "🔓 Modo Usuario" : "🔒 Modo Admin"}
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
          </div>

          {tab === "dashboard" && <Dashboard units={units} drivers={drivers} docs={docs} maints={maints} fuels={fuels} trips={trips} gastos={gastos} externos={externos} facturas={facturas} clientes={clientes} isAdmin={isAdmin} />}
          {tab === "alerts" && <AlertsPage units={units} docs={docs} maints={maints} />}
          {tab === "units" && <UnitsPage units={units} drivers={drivers} docs={docs} maints={maints} fuels={fuels} trips={trips}
            onAdd={() => setModal({ type: "unit", data: null })}
            onEdit={u => setModal({ type: "unit", data: u })}
            onDelete={UC.del}
            onChangeDriver={u => setModal({ type: "changeDriver", data: u })}
            isAdmin={isAdmin} />}
          {tab === "drivers" && <DriversPage drivers={drivers} units={units}
            onAdd={() => setModal({ type: "driver", data: null })}
            onEdit={d => setModal({ type: "driver", data: d })}
            onDelete={DC.del} />}
          {tab === "docs" && <DocsPage units={units} docs={docs}
            onAdd={() => setModal({ type: "doc", data: null })}
            onEdit={d => setModal({ type: "doc", data: d })}
            onDelete={DoC.del} />}
          {tab === "maints" && <MaintPage units={units} maints={maints}
            onAdd={() => setModal({ type: "maint", data: null })}
            onEdit={m => setModal({ type: "maint", data: m })}
            onDelete={MC.del} />}
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
            isAdmin={isAdmin} />}
          {tab === "gastos" && isAdmin && <GastosPage gastos={gastos}
            onAdd={() => setModal({ type: "gasto", data: null })}
            onEdit={g => setModal({ type: "gasto", data: g })}
            onDelete={GC.del} />}
          {tab === "clientes" && isAdmin && <ClientesPage
            clientes={clientes}
            facturas={facturas}
            onAdd={() => setModal({ type: "cliente", data: null })}
            onEdit={c => setModal({ type: "cliente", data: c })}
            onDelete={CliC.del}
          />}
          {tab === "facturacion" && isAdmin && <FacturacionPage
            facturas={facturas}
            clientes={clientes}
            viajes={trips}
            onAdd={() => setModal({ type: "factura", data: null })}
            onEdit={f => FacC.save(f)}
            onDelete={FacC.del}
            onMarcarPagada={marcarPagada}
          />}
          {tab === "charts" && isAdmin && <ChartsPage units={units} maints={maints} fuels={fuels} gastos={gastos} trips={trips} facturas={facturas} clientes={clientes} />}
        </div>
      </div>

      {/* MODALES */}
      {modal?.type === "unit" && <UnitModal unit={modal.data} drivers={drivers} onSave={u => UC.save({ ...u, id: u.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "driver" && <DriverModal driver={modal.data} units={units} onSave={d => DC.save({ ...d, id: d.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "doc" && <DocModal doc={modal.data} units={units} onSave={d => DoC.save({ ...d, id: d.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "maint" && <MaintModal maint={modal.data} units={units} onSave={m => MC.save({ ...m, id: m.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "fuel" && <FuelModal fuel={modal.data} units={units} onSave={f => FC.save({ ...f, id: f.id || uid() })} onClose={() => setModal(null)} onUpdateUnit={UC.save} />}
      {modal?.type === "trip" && <TripModal trip={modal.data} units={units} onSave={t => TC.save({ ...t, id: t.id || uid(), esExterno: false })} onClose={() => setModal(null)} />}
      {modal?.type === "gasto" && <GastoModal gasto={modal.data} onSave={g => GC.save({ ...g, id: g.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "externo" && <ExternoModal externo={modal.data} tiposPersonalizados={tiposPersonalizados} onSave={e => saveExternoWithTipo({ ...e, id: e.id || uid() })} onClose={() => setModal(null)} />}
      {modal?.type === "changeDriver" && <ChangeDriverModal unit={modal.data} drivers={drivers} onSave={u => UC.save(u)} onClose={() => setModal(null)} />}
      {modal?.type === "cliente" && <ClienteModal
        cliente={modal.data}
        onSave={c => CliC.save({ ...c, id: c.id || uid() })}
        onClose={() => setModal(null)}
      />}
      {modal?.type === "factura" && <FacturaModal
        factura={modal.data}
        clientes={clientes}
        viajes={trips}
        onSave={f => FacC.save(f)}
        onClose={() => setModal(null)}
      />}
      {confirm && <Confirm msg={confirm.msg} onOk={confirm.onOk} onCancel={() => setConfirm(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

