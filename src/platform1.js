/* ===== Nidana Care prototype platform (sample data, no real payments) ===== */
const NC=(()=>{
const LS="ncDB_v2";
const uid=()=>Math.random().toString(36).slice(2,8);
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const inr=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const fd=d=>new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"});
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x.toISOString()};
const STAGES=[
 {n:0,t:"Assess and request",d:"Patients complete the assessment and ask a doctor to call. Doctors get leads with the summary."},
 {n:1,t:"Doctors and follow-up",d:"Online booking, case sheet, e-prescription, records and follow-up tracking. Revenue: small commission per consultation."},
 {n:2,t:"Verified medicines",d:"Only licensed, GMP-verified products, sold against a prescription. Revenue: commission on orders."},
 {n:3,t:"Clinic treatments",d:"Book physical therapies at partner clinics that pass periodic SOP audits. Revenue: per-booking fee and audit fee."},
 {n:4,t:"Subscriptions",d:"Paid plans for doctors, clinics and suppliers, plus the revenue dashboard."}];
const TABS={
 patient:[["assess","Assess",0],["book","Book a doctor",1],["care","My care",1],["meds","Medicines",2],["clinic","Clinic treatment",3],["follow","Follow-up",1]],
 doctor:[["inbox","Requests",0],["appts","Appointments",1],["cat","Catalogue",2],["plan","My plan",4]],
 supplier:[["products","Products",2],["orders","Orders",2],["plan","My plan",4]],
 clinic:[["bookings","Bookings",3],["audit","SOP audit",3],["plan","My plan",4]],
 admin:[["funnel","Funnel",0],["verify","Verification",1],["cat","Catalogue",2],["revenue","Revenue",0],["settings","Settings",0]]};
const ROLES=[["patient","Patient"],["doctor","Doctor"],["supplier","Supplier"],["clinic","Clinic"],["admin","Admin"]];
const AUDIT=["State clinic registration displayed","Qualified BAMS physician present during therapies","Therapist training records on file","Medicines sourced from licensed makers, batch records kept","Written consent taken before each therapy","Therapy rooms, linen and equipment cleaning log kept","Adverse-event register maintained","Emergency contact and referral protocol posted","Patient records kept for every visit","Price list displayed, no cure claims in any advertising"];
function seed(){
 return {
  patient:{name:"Asha (sample patient)",phone:""},
  doctors:[
   {id:"d1",name:"Dr. Meera Nair",qual:"BAMS, MD (Kayachikitsa)",exp:12,langs:"English, Malayalam, Hindi",fee:500,slots:["Mon 10:00","Mon 11:00","Wed 17:00","Fri 16:00"],reg:"verified",regno:"SAMPLE-KL-1001"},
   {id:"d2",name:"Dr. Ravi Teja",qual:"BAMS",exp:7,langs:"English, Telugu, Hindi",fee:350,slots:["Tue 09:30","Tue 18:00","Thu 18:00","Sat 11:00"],reg:"verified",regno:"SAMPLE-TS-2044"},
   {id:"d3",name:"Dr. Kavitha Sundar",qual:"BAMS, MD (Shalakya Tantra)",exp:15,langs:"English, Tamil",fee:600,slots:["Mon 18:00","Wed 10:00","Thu 10:00"],reg:"verified",regno:"SAMPLE-TN-3310"},
   {id:"d4",name:"Dr. Imran Khan",qual:"BAMS",exp:3,langs:"English, Hindi",fee:300,slots:["Fri 10:00","Sat 16:00"],reg:"pending",regno:"SAMPLE-MH-4102"}],
  suppliers:[
   {id:"s1",name:"Sahyadri Herbals (sample)",licence:"SAMPLE-LIC-KL-77",gmp:"WHO-GMP style certificate, valid to 2027-03",report:true,status:"verified"},
   {id:"s2",name:"Deccan Ayurved Pharma (sample)",licence:"SAMPLE-LIC-TS-52",gmp:"GMP certificate, valid to 2026-12",report:true,status:"verified"},
   {id:"s3",name:"Newleaf Naturals (sample)",licence:"",gmp:"",report:false,status:"pending"}],
  products:CAT_PRODUCTS(),
  clinics:CAT_CLINICS(addDays),
  audits:[],
  assessments:[],leads:[],appts:[],cases:{},rx:[],orders:[],tbook:[],follow:[],
  metrics:{started:0},
  subs:{},
  settings:{commConsult:10,commOrder:8,feeBook:8,auditFee:5000,
   plans:{doctor:[["Free",0],["Pro",999]],supplier:[["Listing",2999],["Premium",7999]],clinic:[["Partner",4999],["Partner plus",8999]]}}
 };
}
let DB;
function load(){try{const s=localStorage.getItem(LS);if(s)return JSON.parse(s)}catch(e){}return seed()}
function save(){try{localStorage.setItem(LS,JSON.stringify(DB))}catch(e){}}
DB=load();
const S={role:"patient",tab:"assess",stage:4,doc:"d1",sup:"s1",cli:"c1",caseId:null,pick:{},draft:null};
const $=id=>document.getElementById(id);
const doc=id=>DB.doctors.find(x=>x.id===id),sup=id=>DB.suppliers.find(x=>x.id===id),prod=id=>DB.products.find(x=>x.id===id),cli=id=>DB.clinics.find(x=>x.id===id);
const lastA=()=>DB.assessments[DB.assessments.length-1];
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("on"),2200)}
window.toast=toast;
function setStage(n){S.stage=n;render()}
function setRole(r){S.role=r;S.tab=TABS[r][0][0];S.caseId=null;render()}
function setTab(t){S.tab=t;S.caseId=null;render()}
function goto(r,t){S.role=r;S.tab=t;S.caseId=null;render();scrollTo(0,0)}
const minOf=(role,tab)=>TABS[role].find(x=>x[0]===tab)[2];
function lockCard(n){const s=STAGES[n];return `<div class="card lock"><h3>Unlocks in Stage ${n}: ${E(s.t)}</h3><p class="mu">${E(s.d)}</p><p class="mu">This part of the demo is switched off at the current rollout stage.</p><button class="btn s" onclick="NC.setStage(${n})">Turn on Stage ${n}</button></div>`}
function ctxSel(){
 if(S.role==="doctor")return `<select onchange="NC.setCtx('doc',this.value)" aria-label="Doctor">${DB.doctors.map(d=>`<option value="${d.id}" ${d.id===S.doc?"selected":""}>${E(d.name)}</option>`).join("")}</select>`;
 if(S.role==="supplier")return `<select onchange="NC.setCtx('sup',this.value)" aria-label="Supplier">${DB.suppliers.map(d=>`<option value="${d.id}" ${d.id===S.sup?"selected":""}>${E(d.name)}</option>`).join("")}</select>`;
 if(S.role==="clinic")return `<select onchange="NC.setCtx('cli',this.value)" aria-label="Clinic">${DB.clinics.map(d=>`<option value="${d.id}" ${d.id===S.cli?"selected":""}>${E(d.name)}</option>`).join("")}</select>`;
 return "";
}
function nextStep(){
 const st=S.stage,a=lastA(),ap=DB.appts.slice().reverse().find(x=>true),rx=ap&&DB.rx.find(r=>r.appt===ap.id);
 const go=(m,l,r,t,c)=>({m,l,r,t,c});
 if(!a)return S.role==="patient"&&S.tab==="assess"?null:go("Start here: answer a few questions about your health problem.","Start the assessment","patient","assess");
 if(st<1)return null;
 if(!ap)return S.role==="patient"&&S.tab==="book"?null:go("Assessment done. Now book a doctor.","Book a doctor","patient","book");
 if(ap.status!=="done"){
  if(S.role==="doctor"&&S.caseId)return null;
  return S.role==="doctor"?go("A patient has booked you. Open the case sheet to review and prescribe.","Open case sheet","doctor","appts",ap.id):go("Booked. The doctor sees you next. For this demo, continue as the doctor.","Continue as doctor","doctor","appts",ap.id)}
 if(rx.meds.length&&st>=2&&!DB.orders.some(o=>o.rx===rx.id))return S.role==="patient"&&S.tab==="meds"?null:go("Prescription issued. Now order your medicines.","Order medicines","patient","meds");
 if(rx.treat.length&&st>=3&&!DB.tbook.some(b=>b.rx===rx.id))return S.role==="patient"&&S.tab==="clinic"?null:go("Your doctor advised a clinic treatment. Now pick a clinic and a date.","Book clinic treatment","patient","clinic");
 const tb=DB.tbook.find(b=>b.rx===rx.id&&b.status==="booked");
 if(tb)return S.role==="clinic"&&S.tab==="bookings"?null:go("Treatment booked. For this demo, continue as the clinic to mark sessions done.","Continue as clinic","clinic","bookings");
 return null;
}
function nextBar(){const n=nextStep();if(!n)return "";return `<div class="nxt"><span><b>What to do now:</b> ${E(n.m)}</span><button class="btn s" onclick="NC.nextGo()">${E(n.l)}</button></div>`}
function refreshNext(){const e=$("nxtSlot");if(e)e.innerHTML=nextBar()}
function nextGo(){const n=nextStep();if(!n)return;if(n.r==="clinic"){S.cli=(DB.tbook.find(b=>b.status==="booked")||{clinic:S.cli}).clinic}const c=n.c;goto(n.r,n.t);if(c&&n.r==="doctor"){openCase(c)}}
function setCtx(k,v){S[k]=v;S.caseId=null;render()}
function render(){
 const root=$("root");
 const tabs=TABS[S.role];
 root.innerHTML=`<div class="top"><div class="brand"><b>Nidana Care</b><span class="badge">Prototype · sample data · no real payments · not for clinical use</span></div>
 <div class="pills" role="tablist">${ROLES.map(r=>`<button class="${r[0]===S.role?"on":""}" onclick="NC.setRole('${r[0]}')">${r[1]}</button>`).join("")}${ctxSel()}</div>
 <details class="stg"><summary>Demo setting: rollout stage ${S.stage} · ${E(STAGES[S.stage].t)}</summary><div class="stgb">${STAGES.map(s=>`<button class="${s.n===S.stage?"on":""}" title="${E(s.t)}" onclick="NC.setStage(${s.n})">${s.n}</button>`).join("")}<span class="sm">${E(STAGES[S.stage].d)}</span></div></details>
 <div class="pills" style="margin-top:8px">${tabs.map(t=>`<button class="${t[0]===S.tab?"on":""} ${t[2]>S.stage?"lk":""}" onclick="NC.setTab('${t[0]}')">${E(t[1])}${t[2]>S.stage?" (Stage "+t[2]+")":""}</button>`).join("")}</div></div>
 <div id="nxtSlot">${nextBar()}</div><div id="view" style="margin-top:14px"></div>`;
 const v=$("view");
 const min=minOf(S.role,S.tab);
 if(min>S.stage){v.innerHTML=lockCard(min);return}
 const f=VIEWS[S.role+"."+S.tab];
 if(S.role==="patient"&&S.tab==="assess"){mountAssess(v);return}
 v.innerHTML=f?f():"";
 stackTables(v);
 if(S.role==="admin"&&S.tab==="revenue")sim();
}
/* mobile: label cells so CSS can stack wide tables (3+ columns with a header row) */
function stackTables(root){
 root.querySelectorAll("table").forEach(t=>{
  const h=t.rows[0];if(!h||!h.cells.length||![...h.cells].every(c=>c.tagName==="TH")||h.cells.length<3)return;
  const L=[...h.cells].map(c=>c.textContent.trim());t.classList.add("stk");t.setAttribute("role","table");[...t.rows].forEach((r,ri)=>{r.setAttribute("role","row");[...r.cells].forEach(c=>c.setAttribute("role",ri?"cell":"columnheader"))});
  [...t.rows].slice(1).forEach(r=>[...r.cells].forEach((c,i)=>{if(L[i])c.setAttribute("data-l",L[i])}));
 });
}
/* ---------- patient: assessment hooks ---------- */
let startedThisRun=false;
function mountAssess(v){
 v.innerHTML=`<div class="intake"><div id="alBar"></div><main id="app" style="padding:0"></main></div>`;
 app=document.getElementById("app");
 alRender();
}
window.onAssessmentStart=()=>{if(!startedThisRun){startedThisRun=true;DB.metrics.started++;save()}};
window.onAssessmentDone=sum=>{
 const l=lastA();
 if(l&&l.sum.sig===sum.sig){l.sum=sum;save();refreshNext();return}
 DB.assessments.push({id:uid(),when:new Date().toISOString(),sum});startedThisRun=false;save();refreshNext();
};
window.onResultHtml=sum=>{
 const a=lastA();const lead=a&&DB.leads.find(l=>l.assess===a.id);
 if(S.stage===0){
  if(lead)return `<div class="good">Request sent. A doctor will call you on ${E(lead.phone)}.</div>`;
  return `<div class="card"><h3>Ask a doctor to call you</h3><p class="mu">Your summary goes to one doctor only if you tick the box.</p>
  <div class="fl"><input id="ph" placeholder="Mobile number" inputmode="tel" value="${E(DB.patient.phone)}"></div>
  <label class="ck"><input type="checkbox" id="cn"><span>I agree to share this assessment summary with the doctor who calls me.</span></label>
  <button class="btn" style="width:100%" onclick="NC.reqLead()">Request a call</button></div>`;
 }
 return `<div class="card"><h3>Next: see a doctor</h3><p class="mu">A registered Vaidya reviews your summary, confirms or corrects the pattern and prescribes.</p>
 <button class="btn" style="width:100%" onclick="NC.goto('patient','book')">Book a doctor</button></div>`;
};
function reqLead(){
 const ph=$("ph").value.trim(),cn=$("cn").checked;
 if(!/^[0-9+\- ]{8,15}$/.test(ph)){toast("Enter a valid mobile number");return}
 if(!cn){toast("Please tick the consent box");return}
 const a=lastA();DB.patient.phone=ph;
 DB.leads.push({id:uid(),when:new Date().toISOString(),phone:ph,assess:a.id,doctor:"d1",status:"new"});save();toast("Request sent");result();
}
