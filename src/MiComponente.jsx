import { useState, useEffect, useCallback, useRef } from "react";

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
${FONT_LINK}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg0:#080F1A;--bg1:#0D1825;--bg2:#122033;--bg3:#192C42;--bg4:#1F3550;
  --cyan:#00D4FF;--cyan2:#0099CC;--orange:#FF6B2B;--green:#00E5A0;
  --red:#FF3B5C;--yellow:#FFD60A;--purple:#7B61FF;
  --text:#EDF2F7;--muted:#6B8CAE;--border:#1A3040;
  --font-hd:'Rajdhani',sans-serif;--font-bd:'DM Sans',sans-serif;
}
body{background:var(--bg0);color:var(--text);font-family:var(--font-bd);font-size:13px;min-height:100vh}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg0)}
::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:3px}
.app{display:flex;min-height:100vh}
.sidebar{width:228px;min-height:100vh;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;z-index:200;overflow-y:auto}
.main{margin-left:228px;flex:1;padding:20px 24px;min-height:100vh}
.sb-logo{padding:16px 14px 12px;border-bottom:1px solid var(--border);flex-shrink:0}
.sb-logo-title{font-family:var(--font-hd);font-size:22px;font-weight:700;letter-spacing:.06em;background:linear-gradient(135deg,var(--cyan),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sb-logo-sub{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;margin-top:1px}
.sb-sect{padding:8px 12px 3px;font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}
.nav-btn{display:flex;align-items:center;gap:9px;padding:8px 14px;cursor:pointer;border-left:3px solid transparent;border-radius:0 6px 6px 0;margin:1px 8px 1px 0;transition:all .15s;color:var(--muted);font-size:13px;font-weight:500}
.nav-btn:hover{background:var(--bg2);color:var(--text)}
.nav-btn.on{border-left-color:var(--cyan);background:var(--bg2);color:var(--cyan)}
.nav-icon{font-size:15px;width:18px;text-align:center;flex-shrink:0}
.sb-footer{padding:10px 12px;border-top:1px solid var(--border);flex-shrink:0}
.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:12px;flex-wrap:wrap}
.topbar-title{font-family:var(--font-hd);font-size:26px;font-weight:700;letter-spacing:.04em}
.topbar-sub{font-size:11px;color:var(--muted);margin-top:1px}
.card{background:var(--bg1);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.card-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);background:var(--bg2);gap:10px;flex-wrap:wrap}
.card-hdr h3{font-family:var(--font-hd);font-size:16px;font-weight:600;letter-spacing:.03em;white-space:nowrap}
.card-body{overflow-x:auto}
.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:18px}
.stat{background:var(--bg1);border:1px solid var(--border);border-radius:10px;padding:13px 15px;position:relative;overflow:hidden}
.stat::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c)}
.stat-icon{font-size:20px;margin-bottom:5px}
.stat-val{font-family:var(--font-hd);font-size:28px;font-weight:700;line-height:1}
.stat-val.sm{font-size:17px}
.stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-top:4px}
.stat-sub{font-size:11px;color:var(--muted);margin-top:2px}
table{width:100%;border-collapse:collapse}
thead tr{background:var(--bg2)}
th{padding:9px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);white-space:nowrap;border-bottom:1px solid var(--border)}
td{padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;vertical-align:middle}
tr:last-child td{border-bottom:none}
tbody tr:hover{background:rgba(255,255,255,.02)}
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.04em;white-space:nowrap}
.bg{background:rgba(0,229,160,.12);color:#00E5A0}
.br{background:rgba(255,59,92,.12);color:#FF3B5C}
.by{background:rgba(255,214,10,.12);color:#FFD60A}
.bb{background:rgba(0,212,255,.12);color:#00D4FF}
.bp{background:rgba(123,97,255,.12);color:#7B61FF}
.bm{background:rgba(107,140,174,.1);color:#6B8CAE}
.bo{background:rgba(255,107,43,.12);color:#FF6B2B}
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:7px;border:none;cursor:pointer;font-family:var(--font-bd);font-size:12px;font-weight:600;transition:all .15s;white-space:nowrap;line-height:1}
.btn:active{transform:scale(.97)}
.btn-cyan{background:var(--cyan);color:var(--bg0)}
.btn-cyan:hover{background:#33DDFF;box-shadow:0 4px 14px rgba(0,212,255,.3)}
.btn-orange{background:var(--orange);color:#fff}
.btn-orange:hover{background:#FF8042}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--bg2);color:var(--text)}
.btn-red{background:rgba(255,59,92,.15);color:#FF3B5C;border:1px solid rgba(255,59,92,.25)}
.btn-red:hover{background:rgba(255,59,92,.25)}
.btn-sm{padding:4px 9px;font-size:11px}
.btn-xs{padding:2px 7px;font-size:10px}
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(5px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:var(--bg1);border:1px solid var(--border);border-radius:14px;width:100%;max-width:680px;max-height:92vh;overflow-y:auto;animation:mUp .2s ease}
.modal.wide{max-width:860px}
@keyframes mUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.mhdr{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border);background:var(--bg2);position:sticky;top:0;z-index:2}
.mhdr h3{font-family:var(--font-hd);font-size:18px;font-weight:600}
.mbody{padding:20px}
.mftr{padding:12px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;background:var(--bg2);position:sticky;bottom:0}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fg .s2{grid-column:1/-1}
.field{display:flex;flex-direction:column;gap:5px}
.field label{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}
.field input,.field select,.field textarea{background:var(--bg0);border:1px solid var(--border);color:var(--text);padding:8px 11px;border-radius:7px;font-family:var(--font-bd);font-size:12px;transition:border-color .15s}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,212,255,.07)}
.field select option{background:var(--bg1)}
.field textarea{resize:vertical;min-height:68px}
.sec-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);padding:13px 0 7px;border-bottom:1px solid var(--border);margin-bottom:12px}
.sw{display:flex;align-items:center;gap:8px;background:var(--bg0);border:1px solid var(--border);border-radius:7px;padding:0 11px;min-width:190px}
.sw input{background:none;border:none;outline:none;color:var(--text);font-family:var(--font-bd);font-size:12px;padding:8px 0;width:100%}
.ftabs{display:flex;gap:4px;flex-wrap:wrap}
.ftab{padding:4px 11px;border-radius:20px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;font-size:11px;font-weight:500;transition:all .15s}
.ftab.on{background:var(--cyan);color:var(--bg0);border-color:var(--cyan);font-weight:700}
.ftab:hover:not(.on){border-color:var(--muted);color:var(--text)}
.sbar{display:flex;gap:14px;padding:8px 14px;background:var(--bg2);border-bottom:1px solid var(--border);flex-wrap:wrap}
.sbar span{font-size:11px;color:var(--muted)}
.sbar strong{color:var(--text);margin-left:3px}
.empty{text-align:center;padding:36px;color:var(--muted)}
.empty-icon{font-size:32px;opacity:.3;margin-bottom:8px}
.acts{display:flex;gap:4px;align-items:center}
.ab{display:flex;align-items:flex-start;gap:9px;padding:10px 13px;border-radius:8px;margin-bottom:8px;font-size:12px}
.ab-r{background:rgba(255,59,92,.1);border:1px solid rgba(255,59,92,.25);color:#FF3B5C}
.ab-y{background:rgba(255,214,10,.1);border:1px solid rgba(255,214,10,.25);color:#FFD60A}
.ab-g{background:rgba(0,229,160,.1);border:1px solid rgba(0,229,160,.25);color:#00E5A0}
.photo-box{width:100%;height:130px;background:var(--bg0);border:2px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;cursor:pointer;transition:border-color .15s;position:relative;overflow:hidden}
.photo-box:hover{border-color:var(--cyan)}
.photo-box img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.chart-row{display:flex;align-items:center;gap:9px;margin-bottom:9px}
.chart-lbl{width:85px;font-size:10px;color:var(--muted);text-align:right;flex-shrink:0}
.bar-bg{flex:1;height:16px;background:var(--bg3);border-radius:4px;overflow:hidden;display:flex}
.bar-fill{height:100%;transition:width .4s ease;display:flex;align-items:center;justify-content:flex-end;padding-right:5px}
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:9px;padding:12px 14px}
.doc-card{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:11px 13px;position:relative}
.doc-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:8px 0 0 8px;background:var(--dc)}
.doc-name{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
.doc-date{font-size:13px;font-weight:600}
.km-meter{height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;margin-top:3px;width:65px}
.km-fill{height:100%;border-radius:2px;transition:width .3s}
.toast{position:fixed;top:16px;right:16px;z-index:9999;padding:10px 15px;border-radius:9px;font-size:13px;font-weight:500;animation:mUp .2s ease;max-width:300px;box-shadow:0 8px 30px rgba(0,0,0,.4);display:flex;align-items:center;gap:8px}
.t-ok{background:rgba(0,229,160,.15);border:1px solid rgba(0,229,160,.4);color:#00E5A0}
.t-err{background:rgba(255,59,92,.15);border:1px solid rgba(255,59,92,.4);color:#FF3B5C}
.t-info{background:rgba(0,212,255,.12);border:1px solid rgba(0,212,255,.3);color:#00D4FF}
.row-gap{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
`;

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt$ = v => v > 0 ? `$${Number(v).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";
const fmtN = v => v ? Number(v).toLocaleString("es-MX") : "—";
const toISO = s => { if (!s) return ""; if (s.includes("-")) return s; const [d, m, y] = s.split("/"); return y && m && d ? `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}` : ""; };
const daysUntil = s => { const iso = toISO(s); if (!iso) return null; return Math.ceil((new Date(iso) - new Date()) / 86400000); };
const TIPOS = ["CAMIÓN", "TRACTOCAMIÓN", "CAJA SECA", "PLATAFORMA", "RABÓN", "TORTÓN", "PIPA", "OTRO"];
const ESTADOS = ["ACTIVA", "EN TALLER", "BAJA TEMPORAL", "BAJA DEFINITIVA"];
const SERVS = ["PREVENTIVO", "CORRECTIVO", "EMERGENCIA", "REVISIÓN"];
const PRIOS = ["ALTA", "MEDIA", "BAJA"];
const DOCS_LIST = ["Seguro", "Verificación", "Licencia Operador", "Permiso SCT", "Tarjeta Circulación", "Revista Vehicular", "Póliza GPS"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const D_UNITS = [
  { id:"u1",num:"001",operador:"op1",placas:"ABC-1234",eco:"ECO-01",tipo:"TRACTOCAMIÓN",marca:"KENWORTH",modelo:"T680",anio:"2021",vin:"1XKAD49X8LJ123456",ruta:"Monterrey-CDMX",estado:"ACTIVA",kmActual:145200,kmUltMant:143500,proxMant:"15/04/2026",notas:"",foto:"" },
  { id:"u2",num:"002",operador:"op2",placas:"DEF-5678",eco:"ECO-02",tipo:"CAMIÓN",marca:"FREIGHTLINER",modelo:"M2 106",anio:"2019",vin:"1FVHG5BX3KHAB7890",ruta:"GDL-Tijuana",estado:"EN TALLER",kmActual:87300,kmUltMant:85000,proxMant:"20/02/2026",notas:"Frenos",foto:"" },
  { id:"u3",num:"003",operador:"op3",placas:"GHI-9012",eco:"ECO-03",tipo:"PLATAFORMA",marca:"DINA",modelo:"T682",anio:"2018",vin:"8T1BF4D55EU123789",ruta:"MTY-Laredo",estado:"ACTIVA",kmActual:201500,kmUltMant:199800,proxMant:"08/03/2026",notas:"",foto:"" },
];
const D_DRIVERS = [
  { id:"op1",nombre:"Juan Pérez Soto",licencia:"LIC-2345678",licTipo:"E",licVence:"31/12/2026",tel:"8112345678",email:"juan@empresa.com",antiguedad:"2018",status:"ACTIVO",foto:"",notas:"" },
  { id:"op2",nombre:"Carlos Mendoza",licencia:"LIC-3456789",licTipo:"E",licVence:"15/06/2025",tel:"8123456789",email:"carlos@empresa.com",antiguedad:"2020",status:"ACTIVO",foto:"",notas:"" },
  { id:"op3",nombre:"Luis Torres",licencia:"LIC-4567890",licTipo:"D",licVence:"30/09/2026",tel:"8134567890",email:"luis@empresa.com",antiguedad:"2015",status:"ACTIVO",foto:"",notas:"" },
];
const D_DOCS = [
  { id:"d1",unidadId:"u1",nombre:"Seguro",numero:"SEG-001",vence:"31/12/2026",empresa:"GNP",notas:"" },
  { id:"d2",unidadId:"u1",nombre:"Verificación",numero:"VER-001",vence:"30/06/2026",empresa:"Gob NL",notas:"" },
  { id:"d3",unidadId:"u1",nombre:"Permiso SCT",numero:"SCT-001",vence:"15/03/2026",empresa:"SCT",notas:"" },
  { id:"d4",unidadId:"u2",nombre:"Seguro",numero:"SEG-002",vence:"28/02/2026",empresa:"AXA",notas:"" },
  { id:"d5",unidadId:"u3",nombre:"Seguro",numero:"SEG-003",vence:"31/01/2026",empresa:"HDI",notas:"" },
];
const D_MAINTS = [
  { id:"m1",unidadId:"u1",tipo:"PREVENTIVO",desc:"Cambio aceite motor y filtros",prioridad:"BAJA",fechaProg:"05/02/2026",fechaEjec:"05/02/2026",realizado:"SI",taller:"Taller Expreso",km:145200,costoRef:1200,costoMO:1600,obs:"Aceite 15W40" },
  { id:"m2",unidadId:"u2",tipo:"CORRECTIVO",desc:"Reparación frenos delanteros",prioridad:"ALTA",fechaProg:"10/02/2026",fechaEjec:"",realizado:"NO",taller:"Taller Norma",km:87300,costoRef:4500,costoMO:2000,obs:"En espera refacciones" },
  { id:"m3",unidadId:"u3",tipo:"PREVENTIVO",desc:"Afinación motor completa",prioridad:"MEDIA",fechaProg:"15/02/2026",fechaEjec:"",realizado:"NO",taller:"Servicio Integral",km:201500,costoRef:3200,costoMO:1800,obs:"Bujías + filtros" },
];
const D_FUELS = [
  { id:"f1",unidadId:"u1",fecha:"01/02/2026",km:145000,litros:400,precio:24.50,estacion:"PEMEX Carretera",ticket:"T-001258",kmRec:800,obs:"" },
  { id:"f2",unidadId:"u2",fecha:"03/02/2026",km:86800,litros:350,precio:24.50,estacion:"OXXO Gas",ticket:"T-002341",kmRec:700,obs:"" },
  { id:"f3",unidadId:"u1",fecha:"05/02/2026",km:145800,litros:380,precio:24.80,estacion:"PEMEX Autopista",ticket:"T-003456",kmRec:760,obs:"" },
  { id:"f4",unidadId:"u3",fecha:"06/02/2026",km:201200,litros:420,precio:24.50,estacion:"REPSOL MTY",ticket:"T-004567",kmRec:840,obs:"" },
];
const D_TRIPS = [
  { id:"t1",unidadId:"u1",origen:"Monterrey, NL",destino:"CDMX",fecha:"01/02/2026",fechaReg:"03/02/2026",kmSalida:144200,kmLlegada:145200,carga:"Electrónicos",cliente:"TechMex SA",status:"COMPLETADO",notas:"" },
  { id:"t2",unidadId:"u3",origen:"Monterrey, NL",destino:"Nuevo Laredo",fecha:"06/02/2026",fechaReg:"07/02/2026",kmSalida:200700,kmLlegada:201500,carga:"Autopartes",cliente:"Exportadora NL",status:"COMPLETADO",notas:"" },
];

const Bdg = ({ c, t }) => <span className={`badge ${c}`}>{t}</span>;
const estadoBdg = e => <Bdg c={{ "ACTIVA":"bg","EN TALLER":"by","BAJA TEMPORAL":"br","BAJA DEFINITIVA":"bm" }[e]||"bm"} t={`● ${e}`} />;
const prioBdg = p => <Bdg c={{ ALTA:"br",MEDIA:"by",BAJA:"bg" }[p]||"bm"} t={p} />;
const realBdg = r => r==="SI" ? <Bdg c="bg" t="✓ SI"/> : <Bdg c="by" t="✗ NO"/>;
const docBdg = days => {
  if(days===null) return <Bdg c="bm" t="Sin fecha"/>;
  if(days<0) return <Bdg c="br" t="VENCIDO"/>;
  if(days<=30) return <Bdg c="by" t={`⚠ ${days}d`}/>;
  return <Bdg c="bg" t={`✓ ${days}d`}/>;
};

function Toast({msg,type,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,3000);return()=>clearTimeout(t)},[]);
  return <div className={`toast ${{success:"t-ok",error:"t-err",info:"t-info"}[type]||"t-ok"}`}><span>{{success:"✓",error:"✕",info:"ℹ"}[type]}</span>{msg}</div>;
}
function Confirm({msg,onOk,onCancel}){
  return(
    <div className="modal-ov" onClick={onCancel}>
      <div className="modal" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><h3>⚠️ Confirmar</h3></div>
        <div className="mbody"><p style={{lineHeight:1.6}}>{msg}</p></div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onCancel}>Cancelar</button><button className="btn btn-red" onClick={onOk}>Eliminar</button></div>
      </div>
    </div>
  );
}
function PhotoInput({value,onChange,label="Foto"}){
  const ref=useRef();
  const handle=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onChange(ev.target.result);r.readAsDataURL(f)};
  return(
    <div className="field">
      <label>{label}</label>
      <div className="photo-box" onClick={()=>ref.current.click()}>
        {value?<img src={value} alt=""/>:<><span style={{fontSize:26,opacity:.3}}>📷</span><span style={{fontSize:11,color:"var(--muted)"}}>Clic para subir</span></>}
        <input ref={ref} type="file" accept="image/*" onChange={handle} style={{display:"none"}}/>
      </div>
    </div>
  );
}

function UnitModal({unit,drivers,onSave,onClose}){
  const[f,setF]=useState(unit||{num:"",operador:"",placas:"",eco:"",tipo:"CAMIÓN",marca:"",modelo:"",anio:"",vin:"",ruta:"",estado:"ACTIVA",kmActual:"",kmUltMant:"",proxMant:"",notas:"",foto:""});
  const ch=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const ok=()=>{if(!f.num||!f.placas)return alert("Número y placas requeridos");onSave({...f,id:f.id||uid()})};
  return(
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id?"✏️ Editar Unidad":"🚛 Nueva Unidad"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <PhotoInput value={f.foto} onChange={v=>setF(p=>({...p,foto:v}))} label="Fotografía de la Unidad"/>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <div className="fg"><div className="field"><label>N° Unidad *</label><input value={f.num} onChange={ch("num")} placeholder="001"/></div><div className="field"><label>Eco.</label><input value={f.eco} onChange={ch("eco")} placeholder="ECO-01"/></div></div>
              <div className="field"><label>Operador</label><select value={f.operador} onChange={ch("operador")}><option value="">— Sin asignar —</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}</select></div>
              <div className="field"><label>Placas *</label><input value={f.placas} onChange={ch("placas")} placeholder="ABC-1234"/></div>
            </div>
          </div>
          <div className="sec-lbl">Datos Técnicos</div>
          <div className="fg">
            <div className="field"><label>Tipo</label><select value={f.tipo} onChange={ch("tipo")}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="field"><label>Marca</label><input value={f.marca} onChange={ch("marca")}/></div>
            <div className="field"><label>Modelo</label><input value={f.modelo} onChange={ch("modelo")}/></div>
            <div className="field"><label>Año</label><input value={f.anio} onChange={ch("anio")} type="number"/></div>
            <div className="field s2"><label>VIN / No. Serie</label><input value={f.vin} onChange={ch("vin")}/></div>
          </div>
          <div className="sec-lbl">Estado & Operación</div>
          <div className="fg">
            <div className="field"><label>Estado</label><select value={f.estado} onChange={ch("estado")}>{ESTADOS.map(e=><option key={e}>{e}</option>)}</select></div>
            <div className="field"><label>Ruta Asignada</label><input value={f.ruta} onChange={ch("ruta")}/></div>
            <div className="field"><label>KM Actual</label><input value={f.kmActual} onChange={ch("kmActual")} type="number"/></div>
            <div className="field"><label>KM Último Mant.</label><input value={f.kmUltMant} onChange={ch("kmUltMant")} type="number"/></div>
            <div className="field"><label>Próx. Mantenimiento</label><input value={f.proxMant} onChange={ch("proxMant")} placeholder="dd/mm/aaaa"/></div>
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2}/></div>
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function DriverModal({driver,onSave,onClose}){
  const[f,setF]=useState(driver||{nombre:"",licencia:"",licTipo:"E",licVence:"",tel:"",email:"",antiguedad:"",status:"ACTIVO",foto:"",notas:""});
  const ch=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const ok=()=>{if(!f.nombre)return alert("Nombre requerido");onSave({...f,id:f.id||uid()})};
  return(
    <div className="modal-ov" onClick={onClose}>
      <div className="modal wide" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id?"✏️ Editar Conductor":"👨‍✈️ Nuevo Conductor"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <PhotoInput value={f.foto} onChange={v=>setF(p=>({...p,foto:v}))} label="Foto del Conductor"/>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <div className="field"><label>Nombre Completo *</label><input value={f.nombre} onChange={ch("nombre")}/></div>
              <div className="field"><label>Teléfono</label><input value={f.tel} onChange={ch("tel")}/></div>
              <div className="field"><label>Status</label><select value={f.status} onChange={ch("status")}><option>ACTIVO</option><option>INACTIVO</option><option>VACACIONES</option><option>BAJA</option></select></div>
            </div>
          </div>
          <div className="sec-lbl">Documentos</div>
          <div className="fg">
            <div className="field"><label>N° Licencia</label><input value={f.licencia} onChange={ch("licencia")}/></div>
            <div className="field"><label>Tipo Lic.</label><select value={f.licTipo} onChange={ch("licTipo")}><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option></select></div>
            <div className="field"><label>Vence Licencia</label><input value={f.licVence} onChange={ch("licVence")} placeholder="dd/mm/aaaa"/></div>
            <div className="field"><label>Email</label><input value={f.email} onChange={ch("email")} type="email"/></div>
            <div className="field"><label>Año Ingreso</label><input value={f.antiguedad} onChange={ch("antiguedad")} type="number"/></div>
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2}/></div>
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function DocModal({doc,units,onSave,onClose}){
  const[f,setF]=useState(doc||{unidadId:"",nombre:DOCS_LIST[0],numero:"",vence:"",empresa:"",notas:""});
  const ch=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const ok=()=>{if(!f.unidadId||!f.nombre)return alert("Unidad y documento requeridos");onSave({...f,id:f.id||uid()})};
  return(
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id?"✏️ Editar":"📄 Nuevo Documento"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2"><label>Unidad *</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u=><option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            <div className="field"><label>Tipo *</label><select value={f.nombre} onChange={ch("nombre")}>{DOCS_LIST.map(d=><option key={d}>{d}</option>)}</select></div>
            <div className="field"><label>Número / Folio</label><input value={f.numero} onChange={ch("numero")}/></div>
            <div className="field"><label>Fecha Vencimiento</label><input value={f.vence} onChange={ch("vence")} placeholder="dd/mm/aaaa"/></div>
            <div className="field"><label>Empresa / Emisor</label><input value={f.empresa} onChange={ch("empresa")}/></div>
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2}/></div>
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function MaintModal({maint,units,onSave,onClose}){
  const[f,setF]=useState(maint||{unidadId:"",tipo:"PREVENTIVO",desc:"",prioridad:"MEDIA",fechaProg:"",fechaEjec:"",realizado:"NO",taller:"",km:"",costoRef:0,costoMO:0,obs:""});
  const ch=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const ok=()=>{if(!f.unidadId||!f.desc)return alert("Unidad y descripción requeridos");onSave({...f,id:f.id||uid()})};
  return(
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id?"✏️ Editar":"🔧 Nuevo Mantenimiento"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2"><label>Unidad *</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u=><option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            <div className="field"><label>Tipo</label><select value={f.tipo} onChange={ch("tipo")}>{SERVS.map(s=><option key={s}>{s}</option>)}</select></div>
            <div className="field"><label>Prioridad</label><select value={f.prioridad} onChange={ch("prioridad")}>{PRIOS.map(p=><option key={p}>{p}</option>)}</select></div>
            <div className="field s2"><label>Descripción *</label><textarea value={f.desc} onChange={ch("desc")} rows={2}/></div>
            <div className="field"><label>F. Programada</label><input value={f.fechaProg} onChange={ch("fechaProg")} placeholder="dd/mm/aaaa"/></div>
            <div className="field"><label>F. Ejecución</label><input value={f.fechaEjec} onChange={ch("fechaEjec")} placeholder="dd/mm/aaaa"/></div>
            <div className="field"><label>Realizado</label><select value={f.realizado} onChange={ch("realizado")}><option>NO</option><option>SI</option></select></div>
            <div className="field"><label>Taller</label><input value={f.taller} onChange={ch("taller")}/></div>
            <div className="field"><label>KM Servicio</label><input value={f.km} onChange={ch("km")} type="number"/></div>
            <div className="field"><label>Costo Refac. ($)</label><input value={f.costoRef} onChange={ch("costoRef")} type="number"/></div>
            <div className="field"><label>Costo M.O. ($)</label><input value={f.costoMO} onChange={ch("costoMO")} type="number"/></div>
            <div className="field s2"><label>Observaciones</label><textarea value={f.obs} onChange={ch("obs")} rows={2}/></div>
          </div>
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function FuelModal({fuel,units,onSave,onClose}){
  const[f,setF]=useState(fuel||{unidadId:"",fecha:"",km:"",litros:"",precio:"",estacion:"",ticket:"",kmRec:"",obs:""});
  const ch=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const costo=(Number(f.litros)||0)*(Number(f.precio)||0);
  const rend=f.kmRec&&f.litros?(Number(f.kmRec)/Number(f.litros)).toFixed(2):null;
  const ok=()=>{if(!f.unidadId||!f.litros)return alert("Unidad y litros requeridos");onSave({...f,id:f.id||uid()})};
  return(
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id?"✏️ Editar Carga":"⛽ Nueva Carga"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2"><label>Unidad *</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u=><option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            <div className="field"><label>Fecha</label><input value={f.fecha} onChange={ch("fecha")} placeholder="dd/mm/aaaa"/></div>
            <div className="field"><label>KM al Cargar</label><input value={f.km} onChange={ch("km")} type="number"/></div>
            <div className="field"><label>Litros *</label><input value={f.litros} onChange={ch("litros")} type="number" step="0.01"/></div>
            <div className="field"><label>Precio/Litro ($)</label><input value={f.precio} onChange={ch("precio")} type="number" step="0.01"/></div>
            <div className="field"><label>KM Recorridos</label><input value={f.kmRec} onChange={ch("kmRec")} type="number"/></div>
            <div className="field"><label>Estación</label><input value={f.estacion} onChange={ch("estacion")}/></div>
            <div className="field"><label>Ticket / Factura</label><input value={f.ticket} onChange={ch("ticket")}/></div>
            <div className="field s2"><label>Observaciones</label><textarea value={f.obs} onChange={ch("obs")} rows={2}/></div>
          </div>
          {costo>0&&<div style={{marginTop:12,padding:"10px 14px",background:"var(--bg3)",borderRadius:8,display:"flex",gap:20}}>
            <div><div style={{fontSize:10,color:"var(--muted)",marginBottom:2}}>COSTO TOTAL</div><div style={{fontFamily:"var(--font-hd)",fontSize:22,fontWeight:700,color:"var(--orange)"}}>{fmt$(costo)}</div></div>
            {rend&&<div><div style={{fontSize:10,color:"var(--muted)",marginBottom:2}}>RENDIMIENTO</div><div style={{fontFamily:"var(--font-hd)",fontSize:22,fontWeight:700,color:"var(--cyan)"}}>{rend} km/L</div></div>}
          </div>}
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function TripModal({trip,units,onSave,onClose}){
  const[f,setF]=useState(trip||{unidadId:"",origen:"",destino:"",fecha:"",fechaReg:"",kmSalida:"",kmLlegada:"",carga:"",cliente:"",status:"EN RUTA",notas:""});
  const ch=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const dist=f.kmLlegada&&f.kmSalida?Number(f.kmLlegada)-Number(f.kmSalida):null;
  const ok=()=>{if(!f.unidadId||!f.origen)return alert("Unidad y origen requeridos");onSave({...f,id:f.id||uid()})};
  return(
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><h3>{f.id?"✏️ Editar Viaje":"🗺️ Nuevo Viaje"}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg">
            <div className="field s2"><label>Unidad *</label><select value={f.unidadId} onChange={ch("unidadId")}><option value="">— Seleccionar —</option>{units.map(u=><option key={u.id} value={u.id}>{u.num} — {u.placas}</option>)}</select></div>
            <div className="field"><label>Origen *</label><input value={f.origen} onChange={ch("origen")} placeholder="Ciudad, Estado"/></div>
            <div className="field"><label>Destino</label><input value={f.destino} onChange={ch("destino")} placeholder="Ciudad, Estado"/></div>
            <div className="field"><label>F. Salida</label><input value={f.fecha} onChange={ch("fecha")} placeholder="dd/mm/aaaa"/></div>
            <div className="field"><label>F. Regreso</label><input value={f.fechaReg} onChange={ch("fechaReg")} placeholder="dd/mm/aaaa"/></div>
            <div className="field"><label>KM Salida</label><input value={f.kmSalida} onChange={ch("kmSalida")} type="number"/></div>
            <div className="field"><label>KM Llegada</label><input value={f.kmLlegada} onChange={ch("kmLlegada")} type="number"/></div>
            <div className="field"><label>Carga / Mercancía</label><input value={f.carga} onChange={ch("carga")}/></div>
            <div className="field"><label>Cliente</label><input value={f.cliente} onChange={ch("cliente")}/></div>
            <div className="field"><label>Status</label><select value={f.status} onChange={ch("status")}><option>EN RUTA</option><option>COMPLETADO</option><option>CANCELADO</option></select></div>
            <div className="field s2"><label>Notas</label><textarea value={f.notas} onChange={ch("notas")} rows={2}/></div>
          </div>
          {dist&&<div style={{marginTop:10,padding:"8px 14px",background:"var(--bg3)",borderRadius:8}}>
            <span style={{fontSize:11,color:"var(--muted)"}}>DISTANCIA: </span>
            <span style={{fontFamily:"var(--font-hd)",fontSize:20,fontWeight:700,color:"var(--cyan)"}}>{fmtN(dist)} km</span>
          </div>}
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-cyan" onClick={ok}>💾 Guardar</button></div>
      </div>
    </div>
  );
}

function PrintSheet({unit,driver,docs,maints,fuels}){
  const doPrint=()=>{
    const w=window.open("","_blank");
    const totalM=maints.filter(m=>m.unidadId===unit.id).reduce((a,m)=>a+(Number(m.costoRef)||0)+(Number(m.costoMO)||0),0);
    const totalF=fuels.filter(f=>f.unidadId===unit.id).reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0);
    w.document.write(`<!DOCTYPE html><html><head><title>Ficha ${unit.num}</title><style>
    body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px;max-width:850px;margin:0 auto}
    h1{font-size:20px;border-bottom:3px solid #1565C0;padding-bottom:6px;margin-bottom:16px;color:#1565C0}
    h2{font-size:13px;background:#E3F2FD;padding:5px 10px;margin:14px 0 8px;border-left:4px solid #1565C0;color:#0D47A1}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px}
    .field{border:1px solid #ddd;padding:6px 10px;border-radius:4px}
    .field label{font-size:9px;font-weight:700;display:block;color:#666;text-transform:uppercase}
    table{width:100%;border-collapse:collapse;margin-bottom:8px}
    th{background:#1565C0;color:#fff;padding:5px 8px;text-align:left;font-size:10px}
    td{padding:5px 8px;border-bottom:1px solid #eee;font-size:11px}
    .header-row{display:flex;gap:16px;align-items:flex-start;margin-bottom:14px}
    .photo{width:150px;height:110px;object-fit:cover;border:1px solid #ccc;border-radius:6px}
    .totals{display:flex;gap:24px;padding:10px 14px;background:#f5f5f5;border-radius:8px;margin-top:8px}
    @media print{@page{size:A4;margin:12mm}}
    </style></head><body>`);
    const op=driver||{};
    w.document.write(`
      <div class="header-row">
        ${unit.foto?`<img src="${unit.foto}" class="photo" alt=""/>`:`<div style="width:150px;height:110px;background:#e0e0e0;border:1px solid #ccc;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:36px">🚛</div>`}
        <div style="flex:1">
          <h1>FICHA TÉCNICA — UNIDAD ${unit.num}</h1>
          <div class="grid">
            <div class="field"><label>Placas</label>${unit.placas}</div>
            <div class="field"><label>No. Económico</label>${unit.eco||"—"}</div>
            <div class="field"><label>Marca / Modelo / Año</label>${unit.marca} ${unit.modelo} ${unit.anio}</div>
            <div class="field"><label>Tipo</label>${unit.tipo}</div>
            <div class="field"><label>VIN</label>${unit.vin||"—"}</div>
            <div class="field"><label>Estado</label>${unit.estado}</div>
          </div>
        </div>
      </div>
      <h2>👨‍✈️ Operador</h2>
      <div class="grid">
        <div class="field"><label>Nombre</label>${op.nombre||"Sin asignar"}</div>
        <div class="field"><label>Licencia</label>${op.licencia||"—"} Tipo ${op.licTipo||"—"}</div>
        <div class="field"><label>Vence Licencia</label>${op.licVence||"—"}</div>
        <div class="field"><label>Teléfono</label>${op.tel||"—"}</div>
      </div>
      <h2>📏 Kilometraje</h2>
      <div class="grid">
        <div class="field"><label>KM Actual</label>${fmtN(unit.kmActual)} km</div>
        <div class="field"><label>KM Último Mant.</label>${fmtN(unit.kmUltMant)} km</div>
        <div class="field"><label>KM desde último mant.</label>${fmtN((Number(unit.kmActual)||0)-(Number(unit.kmUltMant)||0))} km</div>
        <div class="field"><label>Próx. Mantenimiento</label>${unit.proxMant||"—"}</div>
      </div>
      <h2>📄 Documentos</h2>
      <table><thead><tr><th>Documento</th><th>Número</th><th>Empresa</th><th>Vence</th><th>Estado</th></tr></thead><tbody>
      ${docs.filter(d=>d.unidadId===unit.id).map(d=>{const dy=daysUntil(d.vence);const lbl=dy===null?"Sin fecha":dy<0?`VENCIDO (${Math.abs(dy)}d)`:dy<=30?`Por vencer (${dy}d)`:`OK (${dy}d)`;return`<tr><td>${d.nombre}</td><td>${d.numero||"—"}</td><td>${d.empresa||"—"}</td><td>${d.vence||"—"}</td><td>${lbl}</td></tr>`}).join("")}
      </tbody></table>
      <h2>🔧 Mantenimientos</h2>
      <table><thead><tr><th>Tipo</th><th>Descripción</th><th>F.Programada</th><th>Realizado</th><th>Taller</th><th>Costo</th></tr></thead><tbody>
      ${maints.filter(m=>m.unidadId===unit.id).map(m=>`<tr><td>${m.tipo}</td><td>${m.desc}</td><td>${m.fechaProg}</td><td>${m.realizado}</td><td>${m.taller||"—"}</td><td>$${((Number(m.costoRef)||0)+(Number(m.costoMO)||0)).toLocaleString("es-MX")}</td></tr>`).join("")}
      </tbody></table>
      <h2>⛽ Combustible</h2>
      <table><thead><tr><th>Fecha</th><th>Litros</th><th>Precio/L</th><th>Costo</th><th>KM Rec.</th><th>Rendimiento</th></tr></thead><tbody>
      ${fuels.filter(f=>f.unidadId===unit.id).map(f=>{const c=(Number(f.litros)||0)*(Number(f.precio)||0);const r=f.kmRec&&f.litros?(Number(f.kmRec)/Number(f.litros)).toFixed(2):"—";return`<tr><td>${f.fecha}</td><td>${f.litros} L</td><td>$${Number(f.precio).toFixed(2)}</td><td>$${c.toLocaleString("es-MX",{minimumFractionDigits:2})}</td><td>${f.kmRec?fmtN(f.kmRec)+" km":"—"}</td><td>${r!=="—"?r+" km/L":"—"}</td></tr>`}).join("")}
      </tbody></table>
      <div class="totals">
        <span><b>Gasto Mantenimientos:</b> ${fmt$(totalM)}</span>
        <span><b>Gasto Combustible:</b> ${fmt$(totalF)}</span>
        <span><b>TOTAL GENERAL:</b> ${fmt$(totalM+totalF)}</span>
      </div>
      <p style="margin-top:14px;font-size:10px;color:#999">Generado: ${new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
    `);
    w.document.write("</body></html>");w.document.close();w.focus();setTimeout(()=>w.print(),500);
  };
  return <button className="btn btn-ghost btn-sm" onClick={doPrint} title="Imprimir Ficha Técnica">🖨️</button>;
}

function exportExcel(units,drivers,docs,maints,fuels,trips){
  const rows=(hdrs,data)=>[hdrs,...data].map(r=>r.map(v=>String(v).replace(/\t/g," ")).join("\t")).join("\n");
  const content=[
    "=== FLOTA — UNIDADES ===\n"+rows(["No.","Eco","Operador","Placas","Tipo","Marca","Modelo","Año","VIN","Ruta","Estado","KM Actual","KM Ult.Mant","Prox.Mant"],
      units.map(u=>{const d=drivers.find(d=>d.id===u.operador);return[u.num,u.eco,d?.nombre||"",u.placas,u.tipo,u.marca,u.modelo,u.anio,u.vin,u.ruta,u.estado,u.kmActual,u.kmUltMant,u.proxMant]})),
    "\n=== CONDUCTORES ===\n"+rows(["Nombre","Licencia","Tipo","Vence","Tel","Email","Ingreso","Status"],
      drivers.map(d=>[d.nombre,d.licencia,d.licTipo,d.licVence,d.tel,d.email,d.antiguedad,d.status])),
    "\n=== DOCUMENTOS ===\n"+rows(["Unidad","Placas","Doc","Número","Empresa","Vence","Días Restantes"],
      docs.map(d=>{const u=units.find(u=>u.id===d.unidadId);const dy=daysUntil(d.vence);return[u?.num,u?.placas,d.nombre,d.numero,d.empresa,d.vence,dy===null?"":dy<0?"VENCIDO":dy]})),
    "\n=== MANTENIMIENTOS ===\n"+rows(["Unidad","Placas","Tipo","Descripción","Prioridad","F.Prog","F.Ejec","Realizado","Taller","KM","Costo Ref","Costo MO","Total","Obs"],
      maints.map(m=>{const u=units.find(u=>u.id===m.unidadId);return[u?.num,u?.placas,m.tipo,m.desc,m.prioridad,m.fechaProg,m.fechaEjec,m.realizado,m.taller,m.km,m.costoRef,m.costoMO,(Number(m.costoRef)||0)+(Number(m.costoMO)||0),m.obs]})),
    "\n=== COMBUSTIBLE ===\n"+rows(["Unidad","Placas","Fecha","KM Carga","Litros","Precio/L","Costo","KM Rec","Rendimiento","Estación","Ticket"],
      fuels.map(f=>{const u=units.find(u=>u.id===f.unidadId);const c=(Number(f.litros)||0)*(Number(f.precio)||0);const r=f.kmRec&&f.litros?(Number(f.kmRec)/Number(f.litros)).toFixed(2):"";return[u?.num,u?.placas,f.fecha,f.km,f.litros,f.precio,c.toFixed(2),f.kmRec,r,f.estacion,f.ticket]})),
    "\n=== VIAJES ===\n"+rows(["Unidad","Placas","Origen","Destino","Salida","Regreso","KM Sal","KM Lleg","Distancia","Carga","Cliente","Status"],
      trips.map(t=>{const u=units.find(u=>u.id===t.unidadId);const d=t.kmLlegada&&t.kmSalida?Number(t.kmLlegada)-Number(t.kmSalida):"";return[u?.num,u?.placas,t.origen,t.destino,t.fecha,t.fechaReg,t.kmSalida,t.kmLlegada,d,t.carga,t.cliente,t.status]})),
  ].join("\n");
  const blob=new Blob([content],{type:"text/tab-separated-values"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=`FleetPro_${new Date().toISOString().slice(0,10)}.tsv`;a.click();
}

function ChartsPage({units,maints,fuels}){
  const mFuel=Array(12).fill(0).map((_,i)=>fuels.filter(f=>{const iso=toISO(f.fecha);return iso&&new Date(iso).getMonth()===i}).reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0));
  const mMaint=Array(12).fill(0).map((_,i)=>maints.filter(m=>{const iso=toISO(m.fechaEjec);return iso&&new Date(iso).getMonth()===i}).reduce((a,m)=>a+(Number(m.costoRef)||0)+(Number(m.costoMO)||0),0));
  const maxM=Math.max(...mFuel,...mMaint,1);
  const byUnit=units.map(u=>{const c=fuels.filter(f=>f.unidadId===u.id).reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0);const m=maints.filter(x=>x.unidadId===u.id).reduce((a,x)=>a+(Number(x.costoRef)||0)+(Number(x.costoMO)||0),0);return{lbl:`${u.num} ${u.placas}`,c,m,t:c+m}}).sort((a,b)=>b.t-a.t);
  const maxU=Math.max(...byUnit.map(b=>b.t),1);
  const rendByUnit=units.map(u=>{const ff=fuels.filter(f=>f.unidadId===u.id&&f.kmRec&&f.litros);const avg=ff.length?ff.reduce((a,f)=>a+Number(f.kmRec)/Number(f.litros),0)/ff.length:0;return{lbl:`${u.num} ${u.placas}`,val:avg}});
  const maxR=Math.max(...rendByUnit.map(r=>r.val),1);
  const BarRow=({lbl,bars,maxV})=>(<div className="chart-row"><div className="chart-lbl" style={{fontSize:9}}>{lbl}</div><div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>{bars.map((b,i)=>(<div key={i} className="bar-bg" style={{height:14}}><div className="bar-fill" style={{width:`${(b.v/maxV)*100}%`,background:b.c}}>{b.v>0&&<span style={{fontSize:9,color:b.tc||"#fff",whiteSpace:"nowrap"}}>{fmt$(b.v)}</span>}</div></div>))}</div></div>);
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div className="card" style={{gridColumn:"1/-1"}}>
        <div className="card-hdr"><h3>📈 Gasto Mensual — Combustible vs Mantenimiento</h3></div>
        <div style={{padding:"14px 16px"}}>
          {MESES.map((m,i)=><BarRow key={m} lbl={m} maxV={maxM} bars={[{v:mFuel[i],c:"var(--cyan)",tc:"var(--bg0)"},{v:mMaint[i],c:"var(--orange)"}]}/>)}
          <div style={{display:"flex",gap:14,marginTop:8,paddingLeft:94}}><span style={{fontSize:11,color:"var(--cyan)"}}>⛽ Combustible</span><span style={{fontSize:11,color:"var(--orange)"}}>🔧 Mantenimiento</span></div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><h3>💰 Gasto Total por Unidad</h3></div>
        <div style={{padding:"14px 16px"}}>
          {byUnit.map(b=><BarRow key={b.lbl} lbl={b.lbl} maxV={maxU} bars={[{v:b.c,c:"var(--cyan)",tc:"var(--bg0)"},{v:b.m,c:"var(--orange)"}]}/>)}
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><h3>🎯 Rendimiento Promedio (km/L)</h3></div>
        <div style={{padding:"14px 16px"}}>
          {rendByUnit.map(r=>(
            <div key={r.lbl} className="chart-row">
              <div className="chart-lbl" style={{fontSize:9}}>{r.lbl}</div>
              <div className="bar-bg"><div className="bar-fill" style={{width:`${(r.val/maxR)*100}%`,background:r.val>6?"var(--green)":"var(--yellow)"}}>{r.val>0&&<span style={{fontSize:9,color:"var(--bg0)"}}>{r.val.toFixed(2)} km/L</span>}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertsPage({units,docs,maints}){
  const alerts=[];
  docs.forEach(d=>{const u=units.find(u=>u.id===d.unidadId);const dy=daysUntil(d.vence);if(dy===null)return;if(dy<0)alerts.push({l:"r",title:`DOC VENCIDO — ${d.nombre}`,body:`${u?.num} ${u?.placas}: venció hace ${Math.abs(dy)} días (${d.vence})`});else if(dy<=30)alerts.push({l:"y",title:`DOC PRÓXIMO A VENCER — ${d.nombre}`,body:`${u?.num} ${u?.placas}: vence en ${dy} días (${d.vence})`})});
  maints.filter(m=>m.realizado==="NO"&&m.prioridad==="ALTA").forEach(m=>{const u=units.find(u=>u.id===m.unidadId);alerts.push({l:"r",title:"MANTENIMIENTO ALTA PRIORIDAD PENDIENTE",body:`${u?.num} ${u?.placas}: ${m.desc} — Prog: ${m.fechaProg}`})});
  units.filter(u=>u.estado!=="ACTIVA").forEach(u=>{alerts.push({l:u.estado==="EN TALLER"?"y":"r",title:`UNIDAD ${u.estado}`,body:`${u.num} ${u.placas}`})});
  return(
    <div>
      <div className="stats" style={{marginBottom:16}}>
        <div className="stat" style={{"--c":"var(--red)"}}><div className="stat-icon">🚨</div><div className="stat-val">{alerts.filter(a=>a.l==="r").length}</div><div className="stat-lbl">Alertas Críticas</div></div>
        <div className="stat" style={{"--c":"var(--yellow)"}}><div className="stat-icon">⚠️</div><div className="stat-val">{alerts.filter(a=>a.l==="y").length}</div><div className="stat-lbl">Preventivas</div></div>
        <div className="stat" style={{"--c":"var(--green)"}}><div className="stat-icon">✅</div><div className="stat-val">{units.filter(u=>u.estado==="ACTIVA").length}</div><div className="stat-lbl">Unidades OK</div></div>
      </div>
      {alerts.length===0?<div className="card"><div className="empty"><div className="empty-icon">✅</div><p style={{fontSize:15}}>Sin alertas. ¡Flota en orden!</p></div></div>:
        <div>{alerts.sort((a,b)=>(a.l==="r"?0:1)-(b.l==="r"?0:1)).map((a,i)=>(
          <div key={i} className={`ab ab-${a.l}`}><span style={{fontSize:17,flexShrink:0}}>{a.l==="r"?"🚨":"⚠️"}</span><div><div style={{fontWeight:700,fontSize:12}}>{a.title}</div><div style={{opacity:.85,marginTop:2,fontSize:12}}>{a.body}</div></div></div>
        ))}</div>}
    </div>
  );
}

function DocsPage({units,docs,onAdd,onEdit,onDelete}){
  const[uf,setUf]=useState("TODOS");
  const fd=docs.filter(d=>uf==="TODOS"||d.unidadId===uf);
  return(
    <div className="card">
      <div className="card-hdr"><h3>📄 Documentos y Vencimientos ({docs.length})</h3>
        <div className="row-gap">
          <div className="ftabs"><button className={`ftab${uf==="TODOS"?" on":""}`} onClick={()=>setUf("TODOS")}>Todas</button>{units.map(u=><button key={u.id} className={`ftab${uf===u.id?" on":""}`} onClick={()=>setUf(u.id)}>{u.num} {u.placas}</button>)}</div>
          <button className="btn btn-cyan btn-sm" onClick={onAdd}>+ Agregar</button>
        </div>
      </div>
      {units.filter(u=>uf==="TODOS"||u.id===uf).map(u=>{
        const ud=fd.filter(d=>d.unidadId===u.id);
        return(
          <div key={u.id} style={{borderBottom:"1px solid var(--border)"}}>
            <div style={{padding:"9px 14px 3px",fontSize:12,fontWeight:600,color:"var(--cyan)"}}>🚛 {u.num} — {u.placas}</div>
            <div className="doc-grid">
              {ud.map(d=>{const dy=daysUntil(d.vence);const dc=dy===null?"var(--muted)":dy<0?"var(--red)":dy<=30?"var(--yellow)":"var(--green)";return(
                <div key={d.id} className="doc-card" style={{"--dc":dc}}>
                  <div className="doc-name">{d.nombre}</div>
                  <div className="doc-date">{d.vence||"Sin fecha"}</div>
                  <div style={{marginTop:4}}>{docBdg(dy)}</div>
                  {d.numero&&<div style={{fontSize:10,color:"var(--muted)",marginTop:3}}>{d.numero}</div>}
                  {d.empresa&&<div style={{fontSize:10,color:"var(--muted)"}}>{d.empresa}</div>}
                  <div className="acts" style={{marginTop:7}}><button className="btn btn-ghost btn-xs" onClick={()=>onEdit(d)}>✏️</button><button className="btn btn-red btn-xs" onClick={()=>onDelete(d.id)}>🗑</button></div>
                </div>
              )})}
              {ud.length===0&&<div style={{padding:"10px 14px",color:"var(--muted)",fontSize:12}}>Sin documentos registrados</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Dashboard({units,drivers,docs,maints,fuels,trips}){
  const activas=units.filter(u=>u.estado==="ACTIVA").length;
  const enTaller=units.filter(u=>u.estado==="EN TALLER").length;
  const alta=maints.filter(m=>m.realizado==="NO"&&m.prioridad==="ALTA").length;
  const totalC=fuels.reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0);
  const totalM=maints.reduce((a,m)=>a+(Number(m.costoRef)||0)+(Number(m.costoMO)||0),0);
  const docAlert=docs.filter(d=>{const dy=daysUntil(d.vence);return dy!==null&&dy<=30}).length;
  const enRuta=trips.filter(t=>t.status==="EN RUTA").length;
  const byUnit=units.map(u=>{const c=fuels.filter(f=>f.unidadId===u.id).reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0);const m=maints.filter(x=>x.unidadId===u.id).reduce((a,x)=>a+(Number(x.costoRef)||0)+(Number(x.costoMO)||0),0);return{lbl:`${u.num} ${u.placas}`,c,m,t:c+m}});
  const maxB=Math.max(...byUnit.map(b=>b.t),1);
  return(
    <div>
      <div className="stats">
        {[
          {icon:"🚛",val:units.length,lbl:"Unidades Totales",sub:`${activas} activas · ${enTaller} en taller`,c:"var(--cyan)"},
          {icon:"🗺️",val:enRuta,lbl:"En Ruta Ahora",sub:`${trips.filter(t=>t.status==="COMPLETADO").length} completados`,c:"var(--green)"},
          {icon:"🔧",val:maints.filter(m=>m.realizado==="NO").length,lbl:"Mant. Pendientes",sub:`${alta} alta prioridad`,c:alta>0?"var(--red)":"var(--orange)"},
          {icon:"📄",val:docAlert,lbl:"Docs por Vencer",sub:"próximos 30 días",c:docAlert>0?"var(--yellow)":"var(--green)"},
          {icon:"⛽",val:fmt$(totalC),lbl:"Gasto Combustible",sub:`${fuels.length} cargas`,c:"var(--orange)",sm:true},
          {icon:"💰",val:fmt$(totalC+totalM),lbl:"Gasto Total Flota",sub:`Mant: ${fmt$(totalM)}`,c:"var(--purple)",sm:true},
        ].map((s,i)=>(
          <div key={i} className="stat" style={{"--c":s.c}}>
            <div className="stat-icon">{s.icon}</div>
            <div className={`stat-val${s.sm?" sm":""}`}>{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div className="card">
          <div className="card-hdr"><h3>💰 Gastos por Unidad</h3></div>
          <div style={{padding:"13px 15px"}}>
            {byUnit.map((b,i)=>(
              <div key={i} className="chart-row">
                <div className="chart-lbl" style={{fontSize:9}}>{b.lbl}</div>
                <div style={{flex:1}}>
                  <div className="bar-bg"><div style={{width:`${(b.c/maxB)*100}%`,background:"var(--cyan)",height:"100%"}}/><div style={{width:`${(b.m/maxB)*100}%`,background:"var(--orange)",height:"100%"}}/></div>
                  <div style={{display:"flex",gap:8,marginTop:2}}><span style={{fontSize:9,color:"var(--cyan)"}}>⛽{fmt$(b.c)}</span><span style={{fontSize:9,color:"var(--orange)"}}>🔧{fmt$(b.m)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-hdr"><h3>🚨 Alertas</h3></div>
          <div style={{padding:"10px 14px",maxHeight:280,overflowY:"auto"}}>
            {(()=>{
              const al=[];
              docs.filter(d=>{const dy=daysUntil(d.vence);return dy!==null&&dy<=30}).forEach(d=>{const u=units.find(u=>u.id===d.unidadId);const dy=daysUntil(d.vence);al.push({l:dy<0?"r":"y",msg:`${d.nombre}: ${u?.num} ${u?.placas} — ${dy<0?"VENCIDO":`vence ${dy}d`}`})});
              maints.filter(m=>m.realizado==="NO"&&m.prioridad==="ALTA").forEach(m=>{const u=units.find(u=>u.id===m.unidadId);al.push({l:"r",msg:`Mant ALTA: ${u?.num} ${u?.placas} — ${m.desc.slice(0,40)}`})});
              if(al.length===0)return<div className="empty"><div className="empty-icon">✅</div><p>Sin alertas</p></div>;
              return al.map((a,i)=><div key={i} className={`ab ab-${a.l}`} style={{marginBottom:6}}><span>{a.l==="r"?"🚨":"⚠️"}</span><span style={{fontSize:12}}>{a.msg}</span></div>);
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function UnitsPage({units,drivers,docs,maints,fuels,onAdd,onEdit,onDelete}){
  const[q,setQ]=useState(""); const[ef,setEf]=useState("TODOS");
  const fil=units.filter(u=>{const d=drivers.find(d=>d.id===u.operador);return(u.num+u.placas+u.eco+(d?.nombre||"")).toLowerCase().includes(q.toLowerCase())&&(ef==="TODOS"||u.estado===ef)});
  return(
    <div className="card">
      <div className="card-hdr"><h3>🚛 Unidades ({units.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{color:"var(--muted)"}}>🔍</span><input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="btn btn-cyan" onClick={onAdd}>+ Nueva</button>
        </div>
      </div>
      <div style={{padding:"7px 14px",borderBottom:"1px solid var(--border)",display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:"var(--muted)"}}>ESTADO:</span>
        <div className="ftabs">{["TODOS",...ESTADOS].map(e=><button key={e} className={`ftab${ef===e?" on":""}`} onClick={()=>setEf(e)}>{e}</button>)}</div>
      </div>
      <div className="card-body">
        {fil.length===0?<div className="empty"><div className="empty-icon">🚛</div><p>Sin resultados</p></div>:
          <table>
            <thead><tr><th>Foto</th><th>No.</th><th>Eco</th><th>Operador</th><th>Placas</th><th>Tipo/Marca</th><th>Estado</th><th>KM</th><th>Docs</th><th>Mant.Pend</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(u=>{
              const drv=drivers.find(d=>d.id===u.operador);
              const kd=(Number(u.kmActual)||0)-(Number(u.kmUltMant)||0);
              const pct=Math.min((kd/20000)*100,100);
              const uDocAl=docs.filter(d=>{const dy=daysUntil(d.vence);return d.unidadId===u.id&&dy!==null&&dy<=30}).length;
              const upend=maints.filter(m=>m.unidadId===u.id&&m.realizado==="NO").length;
              return(
                <tr key={u.id}>
                  <td style={{width:46}}>{u.foto?<img src={u.foto} style={{width:42,height:34,objectFit:"cover",borderRadius:5,border:"1px solid var(--border)"}} alt=""/>:<div style={{width:42,height:34,background:"var(--bg3)",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🚛</div>}</td>
                  <td><strong>{u.num}</strong></td>
                  <td><Bdg c="bb" t={u.eco||"—"}/></td>
                  <td style={{fontSize:12}}>{drv?.nombre||<span style={{color:"var(--muted)"}}>Sin asignar</span>}</td>
                  <td style={{fontWeight:600,letterSpacing:".05em",fontFamily:"var(--font-hd)",fontSize:13}}>{u.placas}</td>
                  <td style={{fontSize:11}}><div>{u.tipo}</div><div style={{color:"var(--muted)"}}>{u.marca} {u.modelo} {u.anio}</div></td>
                  <td>{estadoBdg(u.estado)}</td>
                  <td><div style={{fontSize:11}}>{fmtN(u.kmActual)} km</div><div className="km-meter"><div className="km-fill" style={{width:pct+"%",background:pct>80?"var(--orange)":"var(--cyan)"}}/></div></td>
                  <td>{uDocAl>0?<Bdg c="by" t={`⚠ ${uDocAl}`}/>:<Bdg c="bg" t="OK"/>}</td>
                  <td>{upend>0?<Bdg c="br" t={`${upend} pend.`}/>:<Bdg c="bg" t="OK"/>}</td>
                  <td><div className="acts"><PrintSheet unit={u} driver={drv} docs={docs} maints={maints} fuels={fuels}/><button className="btn btn-ghost btn-sm" onClick={()=>onEdit(u)}>✏️</button><button className="btn btn-red btn-sm" onClick={()=>onDelete(u.id)}>🗑</button></div></td>
                </tr>
              );
            })}</tbody>
          </table>}
      </div>
    </div>
  );
}

function DriversPage({drivers,units,onAdd,onEdit,onDelete}){
  const[q,setQ]=useState("");
  const fil=drivers.filter(d=>(d.nombre+d.licencia).toLowerCase().includes(q.toLowerCase()));
  return(
    <div className="card">
      <div className="card-hdr"><h3>👨‍✈️ Conductores ({drivers.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{color:"var(--muted)"}}>🔍</span><input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="btn btn-cyan" onClick={onAdd}>+ Nuevo</button>
        </div>
      </div>
      <div className="card-body">
        {fil.length===0?<div className="empty"><div className="empty-icon">👨‍✈️</div><p>Sin conductores</p></div>:
          <table>
            <thead><tr><th>Foto</th><th>Nombre</th><th>Licencia</th><th>Tipo</th><th>Vence</th><th>Unidad</th><th>Tel</th><th>Status</th><th>Ingreso</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(d=>{
              const unit=units.find(u=>u.operador===d.id);
              const dy=daysUntil(d.licVence);
              return(
                <tr key={d.id}>
                  <td>{d.foto?<img src={d.foto} style={{width:34,height:34,objectFit:"cover",borderRadius:"50%",border:"2px solid var(--border)"}} alt=""/>:<div style={{width:34,height:34,background:"var(--bg3)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>👤</div>}</td>
                  <td style={{fontWeight:600}}>{d.nombre}</td>
                  <td style={{fontSize:11}}>{d.licencia||"—"}</td>
                  <td>{d.licTipo?<Bdg c="bb" t={`Tipo ${d.licTipo}`}/>:"—"}</td>
                  <td><span style={{color:dy===null?"var(--muted)":dy<0?"var(--red)":dy<=30?"var(--yellow)":"var(--green)",fontSize:12}}>{d.licVence||"—"}</span></td>
                  <td>{unit?<Bdg c="bb" t={`${unit.num} ${unit.placas}`}/>:<span style={{color:"var(--muted)",fontSize:11}}>Sin unidad</span>}</td>
                  <td style={{fontSize:12}}>{d.tel||"—"}</td>
                  <td><Bdg c={d.status==="ACTIVO"?"bg":"bm"} t={d.status}/></td>
                  <td style={{fontSize:11,color:"var(--muted)"}}>{d.antiguedad?`Desde ${d.antiguedad}`:"—"}</td>
                  <td><div className="acts"><button className="btn btn-ghost btn-sm" onClick={()=>onEdit(d)}>✏️</button><button className="btn btn-red btn-sm" onClick={()=>onDelete(d.id)}>🗑</button></div></td>
                </tr>
              );
            })}</tbody>
          </table>}
      </div>
    </div>
  );
}

function TripsPage({trips,units,onAdd,onEdit,onDelete}){
  const[q,setQ]=useState(""); const[sf,setSf]=useState("TODOS");
  const fil=trips.filter(t=>{const u=units.find(u=>u.id===t.unidadId)||{};return(t.origen+t.destino+t.carga+t.cliente+(u.placas||"")).toLowerCase().includes(q.toLowerCase())&&(sf==="TODOS"||t.status===sf)});
  const totKm=fil.reduce((a,t)=>a+((Number(t.kmLlegada)||0)-(Number(t.kmSalida)||0)),0);
  return(
    <div className="card">
      <div className="card-hdr"><h3>🗺️ Viajes ({trips.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{color:"var(--muted)"}}>🔍</span><input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="btn btn-cyan" onClick={onAdd}>+ Nuevo Viaje</button>
        </div>
      </div>
      <div style={{padding:"7px 14px",borderBottom:"1px solid var(--border)"}}>
        <div className="ftabs">{["TODOS","EN RUTA","COMPLETADO","CANCELADO"].map(s=><button key={s} className={`ftab${sf===s?" on":""}`} onClick={()=>setSf(s)}>{s}</button>)}</div>
      </div>
      <div className="sbar"><span>Registros: <strong>{fil.length}</strong></span><span>En Ruta: <strong style={{color:"var(--cyan)"}}>{fil.filter(t=>t.status==="EN RUTA").length}</strong></span><span>KM totales: <strong style={{color:"var(--green)"}}>{fmtN(totKm)} km</strong></span></div>
      <div className="card-body">
        {fil.length===0?<div className="empty"><div className="empty-icon">🗺️</div><p>Sin viajes</p></div>:
          <table>
            <thead><tr><th>Unidad</th><th>Origen → Destino</th><th>Salida</th><th>Regreso</th><th>Distancia</th><th>Carga</th><th>Cliente</th><th>Status</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(t=>{
              const u=units.find(u=>u.id===t.unidadId);
              const dist=t.kmLlegada&&t.kmSalida?Number(t.kmLlegada)-Number(t.kmSalida):null;
              return(
                <tr key={t.id}>
                  <td><strong>{u?.num||"?"}</strong> <span style={{fontSize:11,color:"var(--muted)"}}>{u?.placas}</span></td>
                  <td style={{fontSize:12}}><span style={{color:"var(--cyan)"}}>📍{t.origen}</span><span style={{color:"var(--muted)",margin:"0 4px"}}>→</span><span>{t.destino||"—"}</span></td>
                  <td style={{fontSize:12}}>{t.fecha||"—"}</td>
                  <td style={{fontSize:12,color:t.fechaReg?"var(--text)":"var(--muted)"}}>{t.fechaReg||"Pendiente"}</td>
                  <td style={{color:"var(--cyan)",fontFamily:"var(--font-hd)",fontWeight:600}}>{dist?`${fmtN(dist)} km`:"—"}</td>
                  <td style={{fontSize:11}}>{t.carga||"—"}</td>
                  <td style={{fontSize:12}}>{t.cliente||"—"}</td>
                  <td><Bdg c={t.status==="COMPLETADO"?"bg":t.status==="EN RUTA"?"bb":"bm"} t={t.status}/></td>
                  <td><div className="acts"><button className="btn btn-ghost btn-sm" onClick={()=>onEdit(t)}>✏️</button><button className="btn btn-red btn-sm" onClick={()=>onDelete(t.id)}>🗑</button></div></td>
                </tr>
              );
            })}</tbody>
          </table>}
      </div>
    </div>
  );
}

function MaintPage({units,maints,onAdd,onEdit,onDelete}){
  const[q,setQ]=useState(""); const[pf,setPf]=useState("TODOS"); const[rf,setRf]=useState("TODOS");
  const fil=maints.filter(m=>{const u=units.find(u=>u.id===m.unidadId)||{};return(m.desc+m.taller+(u.placas||"")+(u.num||"")).toLowerCase().includes(q.toLowerCase())&&(pf==="TODOS"||m.prioridad===pf)&&(rf==="TODOS"||m.realizado===rf)});
  const total=fil.reduce((a,m)=>a+(Number(m.costoRef)||0)+(Number(m.costoMO)||0),0);
  return(
    <div className="card">
      <div className="card-hdr"><h3>🔧 Mantenimientos ({maints.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{color:"var(--muted)"}}>🔍</span><input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="btn btn-cyan" onClick={onAdd}>+ Nuevo</button>
        </div>
      </div>
      <div style={{padding:"7px 14px",borderBottom:"1px solid var(--border)",display:"flex",gap:14,flexWrap:"wrap"}}>
        <div className="ftabs"><span style={{fontSize:10,color:"var(--muted)",marginRight:4}}>PRIORIDAD:</span>{["TODOS",...PRIOS].map(p=><button key={p} className={`ftab${pf===p?" on":""}`} onClick={()=>setPf(p)}>{p}</button>)}</div>
        <div className="ftabs"><span style={{fontSize:10,color:"var(--muted)",marginRight:4}}>ESTADO:</span>{[["TODOS","Todos"],["SI","Realizado"],["NO","Pendiente"]].map(([v,l])=><button key={v} className={`ftab${rf===v?" on":""}`} onClick={()=>setRf(v)}>{l}</button>)}</div>
      </div>
      <div className="sbar"><span>Total: <strong>{fil.length}</strong></span><span>Pendientes: <strong style={{color:"var(--yellow)"}}>{fil.filter(m=>m.realizado==="NO").length}</strong></span><span>Alta prio: <strong style={{color:"var(--red)"}}>{fil.filter(m=>m.prioridad==="ALTA"&&m.realizado==="NO").length}</strong></span><span>Costo: <strong style={{color:"var(--orange)"}}>{fmt$(total)}</strong></span></div>
      <div className="card-body">
        {fil.length===0?<div className="empty"><div className="empty-icon">🔧</div><p>Sin resultados</p></div>:
          <table>
            <thead><tr><th>Unidad</th><th>Tipo</th><th>Descripción</th><th>Prioridad</th><th>F.Prog</th><th>F.Ejec</th><th>Realizado</th><th>Taller</th><th>Costo Total</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(m=>{const u=units.find(u=>u.id===m.unidadId);const ct=(Number(m.costoRef)||0)+(Number(m.costoMO)||0);return(
              <tr key={m.id}>
                <td><strong>{u?.num||"?"}</strong> <span style={{fontSize:11,color:"var(--muted)"}}>{u?.placas}</span></td>
                <td><Bdg c="bb" t={m.tipo}/></td>
                <td style={{maxWidth:190,fontSize:12}}>{m.desc}</td>
                <td>{prioBdg(m.prioridad)}</td>
                <td style={{fontSize:12}}>{m.fechaProg||"—"}</td>
                <td style={{fontSize:12,color:m.fechaEjec?"var(--green)":"var(--muted)"}}>{m.fechaEjec||"Pendiente"}</td>
                <td>{realBdg(m.realizado)}</td>
                <td style={{fontSize:12,color:"var(--muted)"}}>{m.taller||"—"}</td>
                <td style={{color:ct>0?"var(--orange)":"var(--muted)",fontWeight:600}}>{ct>0?fmt$(ct):"—"}</td>
                <td><div className="acts"><button className="btn btn-ghost btn-sm" onClick={()=>onEdit(m)}>✏️</button><button className="btn btn-red btn-sm" onClick={()=>onDelete(m.id)}>🗑</button></div></td>
              </tr>
            )})}</tbody>
          </table>}
      </div>
    </div>
  );
}

function FuelPage({units,fuels,onAdd,onEdit,onDelete}){
  const[q,setQ]=useState(""); const[uf,setUf]=useState("TODOS");
  const fil=fuels.filter(f=>{const u=units.find(u=>u.id===f.unidadId)||{};return(f.estacion+f.ticket+(u.placas||"")).toLowerCase().includes(q.toLowerCase())&&(uf==="TODOS"||f.unidadId===uf)});
  const totL=fil.reduce((a,f)=>a+(Number(f.litros)||0),0);
  const totC=fil.reduce((a,f)=>a+(Number(f.litros)||0)*(Number(f.precio)||0),0);
  const vr=fil.filter(f=>f.kmRec&&f.litros);
  const avgR=vr.length?vr.reduce((a,f)=>a+Number(f.kmRec)/Number(f.litros),0)/vr.length:0;
  return(
    <div className="card">
      <div className="card-hdr"><h3>⛽ Combustible ({fuels.length})</h3>
        <div className="row-gap">
          <div className="sw"><span style={{color:"var(--muted)"}}>🔍</span><input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="btn btn-orange" onClick={onAdd}>+ Nueva Carga</button>
        </div>
      </div>
      <div style={{padding:"7px 14px",borderBottom:"1px solid var(--border)"}}>
        <div className="ftabs"><button className={`ftab${uf==="TODOS"?" on":""}`} onClick={()=>setUf("TODOS")}>Todas</button>{units.map(u=><button key={u.id} className={`ftab${uf===u.id?" on":""}`} onClick={()=>setUf(u.id)}>{u.num} {u.placas}</button>)}</div>
      </div>
      <div className="sbar"><span>Cargas: <strong>{fil.length}</strong></span><span>Litros: <strong style={{color:"var(--cyan)"}}>{totL.toLocaleString("es-MX",{maximumFractionDigits:1})} L</strong></span><span>Gasto: <strong style={{color:"var(--orange)"}}>{fmt$(totC)}</strong></span>{avgR>0&&<span>Rend. Prom.: <strong style={{color:"var(--green)"}}>{avgR.toFixed(2)} km/L</strong></span>}</div>
      <div className="card-body">
        {fil.length===0?<div className="empty"><div className="empty-icon">⛽</div><p>Sin registros</p></div>:
          <table>
            <thead><tr><th>Unidad</th><th>Fecha</th><th>KM Carga</th><th>Litros</th><th>Precio/L</th><th>Costo Total</th><th>KM Rec.</th><th>Rendimiento</th><th>Estación</th><th>Acciones</th></tr></thead>
            <tbody>{fil.map(f=>{const u=units.find(u=>u.id===f.unidadId);const c=(Number(f.litros)||0)*(Number(f.precio)||0);const r=f.kmRec&&f.litros?(Number(f.kmRec)/Number(f.litros)):null;return(
              <tr key={f.id}>
                <td><strong>{u?.num||"?"}</strong> <span style={{fontSize:11,color:"var(--muted)"}}>{u?.placas}</span></td>
                <td style={{fontSize:12}}>{f.fecha||"—"}</td>
                <td style={{fontSize:12}}>{fmtN(f.km)}</td>
                <td style={{color:"var(--cyan)",fontWeight:600}}>{Number(f.litros).toLocaleString("es-MX")} L</td>
                <td style={{fontSize:12}}>{f.precio?`$${Number(f.precio).toFixed(2)}`:"—"}</td>
                <td style={{color:"var(--orange)",fontWeight:700}}>{c>0?fmt$(c):"—"}</td>
                <td style={{fontSize:12}}>{f.kmRec?fmtN(f.kmRec)+" km":"—"}</td>
                <td style={{color:r?(r>6?"var(--green)":"var(--yellow)"):"var(--muted)",fontWeight:600}}>{r?`${r.toFixed(2)} km/L`:"—"}</td>
                <td style={{fontSize:12,color:"var(--muted)"}}>{f.estacion||"—"}</td>
                <td><div className="acts"><button className="btn btn-ghost btn-sm" onClick={()=>onEdit(f)}>✏️</button><button className="btn btn-red btn-sm" onClick={()=>onDelete(f.id)}>🗑</button></div></td>
              </tr>
            )})}</tbody>
          </table>}
      </div>
    </div>
  );
}

export default function App(){
  const[tab,setTab]=useState("dashboard");
  const[units,setUnits]=useState([]);
  const[drivers,setDrivers]=useState([]);
  const[docs,setDocs]=useState([]);
  const[maints,setMaints]=useState([]);
  const[fuels,setFuels]=useState([]);
  const[trips,setTrips]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(null);
  const[confirm,setConfirm]=useState(null);
  const[toast,setToast]=useState(null);

  useEffect(()=>{
    (async()=>{
      const pairs=[[setUnits,"fp2:units",D_UNITS],[setDrivers,"fp2:drivers",D_DRIVERS],[setDocs,"fp2:docs",D_DOCS],[setMaints,"fp2:maints",D_MAINTS],[setFuels,"fp2:fuels",D_FUELS],[setTrips,"fp2:trips",D_TRIPS]];
      await Promise.all(pairs.map(async([s,k,d])=>{try{const r=await window.storage.get(k);s(r?JSON.parse(r.value):d)}catch{s(d)}}));
      setLoading(false);
    })();
  },[]);

  const sv=useCallback(async(k,v)=>{try{await window.storage.set(k,JSON.stringify(v))}catch{}},[]);
  const notify=(msg,type="success")=>setToast({msg,type});
  const uRef=useRef(units);uRef.current=units;
  const dRef=useRef(drivers);dRef.current=drivers;
  const dcRef=useRef(docs);dcRef.current=docs;
  const mRef=useRef(maints);mRef.current=maints;
  const fRef=useRef(fuels);fRef.current=fuels;
  const tRef=useRef(trips);tRef.current=trips;

  const mkCRUD=(getRef,setter,key)=>({
    save:async item=>{const cur=getRef();const next=cur.find(x=>x.id===item.id)?cur.map(x=>x.id===item.id?item:x):[...cur,item];setter(next);await sv(key,next);setModal(null);notify("Guardado ✓")},
    del:id=>setConfirm({msg:"¿Eliminar este registro?",onOk:async()=>{const next=getRef().filter(x=>x.id!==id);setter(next);await sv(key,next);setConfirm(null);notify("Eliminado")}})
  });

  const UC=mkCRUD(()=>uRef.current,setUnits,"fp2:units");
  const DC=mkCRUD(()=>dRef.current,setDrivers,"fp2:drivers");
  const DoC=mkCRUD(()=>dcRef.current,setDocs,"fp2:docs");
  const MC=mkCRUD(()=>mRef.current,setMaints,"fp2:maints");
  const FC=mkCRUD(()=>fRef.current,setFuels,"fp2:fuels");
  const TC=mkCRUD(()=>tRef.current,setTrips,"fp2:trips");

  const resetAll=()=>setConfirm({msg:"¿Restaurar datos de ejemplo? Se perderán los cambios actuales.",onOk:async()=>{
    const pairs=[[D_UNITS,"fp2:units",setUnits],[D_DRIVERS,"fp2:drivers",setDrivers],[D_DOCS,"fp2:docs",setDocs],[D_MAINTS,"fp2:maints",setMaints],[D_FUELS,"fp2:fuels",setFuels],[D_TRIPS,"fp2:trips",setTrips]];
    for(const[d,k,s]of pairs){s(d);await sv(k,d);}
    setConfirm(null);notify("Datos restaurados","info");
  }});

  const alertCount=(()=>{let n=0;docs.forEach(d=>{const dy=daysUntil(d.vence);if(dy!==null&&dy<=30)n++});maints.filter(m=>m.realizado==="NO"&&m.prioridad==="ALTA").forEach(()=>n++);return n})();
  const icons={dashboard:"📊",alerts:"🚨",units:"🚛",drivers:"👨‍✈️",trips:"🗺️",maints:"🔧",fuels:"⛽",docs:"📄",charts:"📈"};
  const titles={dashboard:"Dashboard",alerts:"Alertas",units:"Unidades",drivers:"Conductores",trips:"Viajes",maints:"Mantenimientos",fuels:"Combustible",docs:"Documentos",charts:"Gráficas de Gastos"};
  const navSecs=[
    {lbl:"PRINCIPAL",items:[{id:"dashboard"},{id:"alerts",badge:alertCount}]},
    {lbl:"FLOTA",items:[{id:"units"},{id:"drivers"},{id:"trips"}]},
    {lbl:"CONTROL",items:[{id:"maints"},{id:"fuels"},{id:"docs"}]},
    {lbl:"ANÁLISIS",items:[{id:"charts"}]},
  ];

  if(loading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080F1A",color:"#6B8CAE",fontFamily:"Rajdhani,sans-serif",fontSize:20,letterSpacing:".1em"}}><style>{CSS}</style>⟳ Cargando Fleet Pro...</div>);

  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-title">FLEET PRO</div>
            <div className="sb-logo-sub">Gestión de Transporte</div>
          </div>
          {navSecs.map(s=>(
            <div key={s.lbl}>
              <div className="sb-sect">{s.lbl}</div>
              {s.items.map(n=>(
                <div key={n.id} className={`nav-btn${tab===n.id?" on":""}`} onClick={()=>setTab(n.id)}>
                  <span className="nav-icon">{icons[n.id]}</span>
                  <span style={{flex:1}}>{titles[n.id]}</span>
                  {(n.badge||0)>0&&<span style={{background:"var(--red)",color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700}}>{n.badge}</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-footer">
            <div style={{fontSize:10,color:"var(--muted)",marginBottom:7}}>Fleet Pro v2.0 · {units.length} unidades</div>
            <button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center",marginBottom:5}} onClick={()=>exportExcel(units,drivers,docs,maints,fuels,trips)}>📊 Exportar Excel</button>
            <button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center",fontSize:11}} onClick={resetAll}>↺ Restaurar datos</button>
          </div>
        </div>
        <div className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{icons[tab]} {titles[tab]}</div>
              <div className="topbar-sub">{new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
            </div>
            {alertCount>0&&<span style={{fontSize:12,color:"var(--red)",background:"rgba(255,59,92,.1)",border:"1px solid rgba(255,59,92,.25)",borderRadius:6,padding:"4px 10px"}}>🚨 {alertCount} alerta{alertCount>1?"s":""} activa{alertCount>1?"s":""}</span>}
          </div>
          {tab==="dashboard"&&<Dashboard units={units} drivers={drivers} docs={docs} maints={maints} fuels={fuels} trips={trips}/>}
          {tab==="alerts"&&<AlertsPage units={units} docs={docs} maints={maints}/>}
          {tab==="units"&&<UnitsPage units={units} drivers={drivers} docs={docs} maints={maints} fuels={fuels} onAdd={()=>setModal({type:"unit",data:null})} onEdit={u=>setModal({type:"unit",data:u})} onDelete={UC.del}/>}
          {tab==="drivers"&&<DriversPage drivers={drivers} units={units} onAdd={()=>setModal({type:"driver",data:null})} onEdit={d=>setModal({type:"driver",data:d})} onDelete={DC.del}/>}
          {tab==="docs"&&<DocsPage units={units} docs={docs} onAdd={()=>setModal({type:"doc",data:null})} onEdit={d=>setModal({type:"doc",data:d})} onDelete={DoC.del}/>}
          {tab==="maints"&&<MaintPage units={units} maints={maints} onAdd={()=>setModal({type:"maint",data:null})} onEdit={m=>setModal({type:"maint",data:m})} onDelete={MC.del}/>}
          {tab==="fuels"&&<FuelPage units={units} fuels={fuels} onAdd={()=>setModal({type:"fuel",data:null})} onEdit={f=>setModal({type:"fuel",data:f})} onDelete={FC.del}/>}
          {tab==="trips"&&<TripsPage trips={trips} units={units} onAdd={()=>setModal({type:"trip",data:null})} onEdit={t=>setModal({type:"trip",data:t})} onDelete={TC.del}/>}
          {tab==="charts"&&<ChartsPage units={units} maints={maints} fuels={fuels}/>}
        </div>
      </div>
      {modal?.type==="unit"&&<UnitModal unit={modal.data} drivers={drivers} onSave={u=>UC.save({...u,id:u.id||uid()})} onClose={()=>setModal(null)}/>}
      {modal?.type==="driver"&&<DriverModal driver={modal.data} onSave={d=>DC.save({...d,id:d.id||uid()})} onClose={()=>setModal(null)}/>}
      {modal?.type==="doc"&&<DocModal doc={modal.data} units={units} onSave={d=>DoC.save({...d,id:d.id||uid()})} onClose={()=>setModal(null)}/>}
      {modal?.type==="maint"&&<MaintModal maint={modal.data} units={units} onSave={m=>MC.save({...m,id:m.id||uid()})} onClose={()=>setModal(null)}/>}
      {modal?.type==="fuel"&&<FuelModal fuel={modal.data} units={units} onSave={f=>FC.save({...f,id:f.id||uid()})} onClose={()=>setModal(null)}/>}
      {modal?.type==="trip"&&<TripModal trip={modal.data} units={units} onSave={t=>TC.save({...t,id:t.id||uid()})} onClose={()=>setModal(null)}/>}
      {confirm&&<Confirm msg={confirm.msg} onOk={confirm.onOk} onCancel={()=>setConfirm(null)}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </>
  );
}