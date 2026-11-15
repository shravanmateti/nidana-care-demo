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
 admin:[["funnel","Funnel",0],["onboard","Onboarding",0],["verify","Verification",1],["cat","Catalogue",2],["revenue","Revenue",0],["settings","Settings",0]]};
const ROLES=[["patient","Patient"],["doctor","Doctor"],["supplier","Supplier"],["clinic","Clinic"],["admin","Admin"]];
const AUDIT=["State clinic registration displayed","Qualified BAMS physician present during therapies","Therapist training records on file","Medicines sourced from licensed makers, batch records kept","Written consent taken before each therapy","Therapy rooms, linen and equipment cleaning log kept","Adverse-event register maintained","Emergency contact and referral protocol posted","Patient records kept for every visit","Price list displayed, no cure claims in any advertising"];
/* demo-only password hash. Accounts live in this browser's localStorage. Do not use a real password. */
function hpw(e,p){let h=5381;const t=String(e).toLowerCase()+"|"+p;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return "d"+(h>>>0).toString(36)}
const DEMO_PW="Demo@1234";
function seedUsers(){const u=(id,role,ref,name,email)=>({id,role,ref,name,email,ph:hpw(email,DEMO_PW),demo:true});
 return [u("u1","patient","","Asha (sample patient)","asha@nidana.demo"),u("u2","doctor","d1","Dr. Meera Nair","meera@nidana.demo"),u("u3","doctor","d2","Dr. Ravi Teja","ravi@nidana.demo"),
 u("u4","supplier","s1","Sahyadri Herbals","sahyadri@nidana.demo"),u("u5","supplier","s2","Deccan Ayurved Pharma","deccan@nidana.demo"),
 u("u6","clinic","c1","Vaidyashala Wellness","kochi@nidana.demo"),u("u7","clinic","c2","Charak Ayurveda Centre","hyderabad@nidana.demo"),u("u8","admin","","Admin","admin@nidana.demo")]}
function seed(){
 return {
  users:seedUsers(),session:null,
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
function load(){try{const s=localStorage.getItem(LS);if(s){const d=JSON.parse(s);if(!d.users)d.users=seedUsers();if(d.session===undefined)d.session=null;return d}}catch(e){}return seed()}
function save(){try{localStorage.setItem(LS,JSON.stringify(DB))}catch(e){}}
DB=load();
try{if(/[?&]demo=1/.test(location.search)&&!DB.session)DB.session={demo:true}}catch(e){}
const S={auth:{tab:"login",err:"",fails:0,until:0},cred:null,role:"patient",tab:"assess",stage:4,doc:"d1",sup:"s1",cli:"c1",caseId:null,pick:{},draft:null,fold:{}};
const $=id=>document.getElementById(id);
const doc=id=>DB.doctors.find(x=>x.id===id),sup=id=>DB.suppliers.find(x=>x.id===id),prod=id=>DB.products.find(x=>x.id===id),cli=id=>DB.clinics.find(x=>x.id===id);
const lastA=()=>DB.assessments[DB.assessments.length-1];
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("on"),2200)}
window.toast=toast;
function setStage(n){S.stage=n;render()}
function setRole(r){const U=realUser();if(U&&r!==U.role)return;S.role=r;S.tab=TABS[r][0][0];S.caseId=null;render()}
function setTab(t){S.tab=t;S.caseId=null;render()}
function goto(r,t){const U=realUser();if(U&&r!==U.role)return;S.role=r;S.tab=t;S.caseId=null;render();scrollTo(0,0)}
const minOf=(role,tab)=>TABS[role].find(x=>x[0]===tab)[2];
function lockCard(n){const s=STAGES[n];return `<div class="card lock"><h3>Unlocks in Stage ${n}: ${E(s.t)}</h3><p class="mu">${E(s.d)}</p><p class="mu">This part of the demo is switched off at the current rollout stage.</p><button class="btn s" onclick="NC.setStage(${n})">Turn on Stage ${n}</button></div>`}
function ctxSel(){
 if(realUser())return "";
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
function nextBar(){const n=nextStep();if(!n)return "";const U=realUser();if(U&&n.r!==U.role)return "";return `<div class="nxt"><span><b>What to do now:</b> ${E(n.m)}</span><button class="btn s" onclick="NC.nextGo()">${E(n.l)}</button></div>`}
function refreshNext(){const e=$("nxtSlot");if(e)e.innerHTML=nextBar()}
function nextGo(){const n=nextStep();if(!n)return;const U=realUser();if(U&&n.r!==U.role)return;if(n.r==="clinic"){S.cli=(DB.tbook.find(b=>b.status==="booked")||{clinic:S.cli}).clinic}const c=n.c;goto(n.r,n.t);if(c&&n.r==="doctor"){openCase(c)}}
function setCtx(k,v){S[k]=v;S.caseId=null;render()}
/* ---------- login, registration, session (prototype: no server, accounts stay in this browser) ---------- */
const roleName=r=>(ROLES.find(x=>x[0]===r)||[0,r])[1];
function realUser(){const ss=DB.session;return ss&&!ss.demo?DB.users.find(u=>u.id===ss.uid)||null:null}
function enterAs(U){S.role=U.role;S.tab=TABS[U.role][0][0];S.caseId=null;if(U.role==="doctor"&&U.ref)S.doc=U.ref;if(U.role==="supplier"&&U.ref)S.sup=U.ref;if(U.role==="clinic"&&U.ref)S.cli=U.ref}
const okEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const okPhone=p=>/^[0-9+\- ]{8,15}$/.test(p);
const okPw=p=>p.length>=8&&/[A-Za-z]/.test(p)&&/[0-9]/.test(p);
function authTab(t){S.auth.tab=t;S.auth.err="";render()}
function authErr(m){S.auth.err=m;const e=$("authErr");if(e){e.textContent=m;e.hidden=!m}else render();const f=$("authErr");if(f)f.focus&&f.focus()}
function authHtml(){
 const a=S.auth,reg=a.tab==="register";
 const demoRows=DB.users.filter(u=>u.demo).map(u=>`<tr><td>${E(roleName(u.role))}</td><td class="sm">${E(u.name)}</td><td class="sm">${E(u.email)}</td></tr>`).join("");
 return `<div class="top"><div class="brand"><b>Nidana Care</b><span class="badge">Prototype · sample data · no real payments · not for clinical use</span></div></div>
 <div class="auth"><h1>${reg?"Create your patient account":"Log in"}</h1>
 <div class="pills" role="tablist"><button class="${reg?"":"on"}" onclick="NC.authTab('login')">Log in</button><button class="${reg?"on":""}" onclick="NC.authTab('register')">Register as a patient</button></div>
 <div class="card" style="margin-top:12px">
 ${reg?`<label class="sm">Full name<br><input id="rg_n" autocomplete="name" placeholder="Full name"></label>
 <label class="sm">Mobile number<br><input id="rg_p" inputmode="tel" autocomplete="tel" placeholder="Mobile number"></label>`:""}
 <label class="sm">Email<br><input id="${reg?"rg_e":"lg_e"}" type="email" autocomplete="email" placeholder="Email address"></label>
 <label class="sm">Password${reg?" (8 or more characters, letters and a number)":""}<br><input id="${reg?"rg_w":"lg_w"}" type="password" autocomplete="${reg?"new-password":"current-password"}" placeholder="Password"></label>
 ${reg?`<label class="sm">Confirm password<br><input id="rg_w2" type="password" autocomplete="new-password" placeholder="Confirm password"></label>
 <label class="ck"><input type="checkbox" id="rg_a"><span>I am 18 or older, or I am registering with a parent or guardian.</span></label>
 <label class="ck"><input type="checkbox" id="rg_c"><span>I understand this is a prototype. My account stays in this browser only, and I will not enter real health details or a password I use elsewhere.</span></label>`:""}
 <p id="authErr" class="warn sm" role="alert" tabindex="-1" ${a.err?"":"hidden"}>${E(a.err)}</p>
 <button class="btn" style="width:100%" onclick="NC.${reg?"doRegister":"doLogin"}()">${reg?"Create account":"Log in"}</button>
 <p class="mu sm" style="margin-top:10px">Doctors, suppliers and clinics do not register here. The admin onboards them and gives each a login.</p></div>
 <div class="card"><h3>Just looking around?</h3><p class="mu sm">Demo mode uses sample data and lets you switch between all five roles.</p><button class="btn g" style="width:100%" onclick="NC.demoMode()">Explore the demo</button></div>
 <details class="card"><summary><h3 style="display:inline">Sample logins for the demo</h3></summary><p class="mu sm">Password for all sample accounts: <b>${DEMO_PW}</b>. These are made-up accounts for this prototype only.</p><table><tr><th>Role</th><th>Name</th><th>Email</th></tr>${demoRows}</table></details></div>`}
function doLogin(){
 const a=S.auth;if(Date.now()<a.until){authErr("Too many attempts. Please wait a little and try again.");return}
 const e=($("lg_e").value||"").trim().toLowerCase(),w=$("lg_w").value||"";
 if(!e||!w){authErr("Enter your email and password.");return}
 const U=DB.users.find(u=>u.email===e&&u.ph===hpw(e,w));
 if(!U){a.fails++;if(a.fails>=5){a.until=Date.now()+30000;a.fails=0}authErr("Email or password is not correct.");return}
 a.fails=0;a.err="";DB.session={uid:U.id};save();enterAs(U);render();scrollTo(0,0);toast("Welcome, "+U.name)
}
function doRegister(){
 const n=($("rg_n").value||"").trim(),p=($("rg_p").value||"").trim(),e=($("rg_e").value||"").trim().toLowerCase(),w=$("rg_w").value||"",w2=$("rg_w2").value||"";
 if(n.length<2){authErr("Enter your full name.");return}
 if(!okPhone(p)){authErr("Enter a valid mobile number (8 to 15 digits).");return}
 if(!okEmail(e)){authErr("Enter a valid email address.");return}
 if(!okPw(w)){authErr("Password needs 8 or more characters with letters and a number.");return}
 if(w!==w2){authErr("The two passwords do not match.");return}
 if(!$("rg_a").checked||!$("rg_c").checked){authErr("Please tick both boxes to continue.");return}
 if(DB.users.some(u=>u.email===e)){authErr("An account with this email already exists. Log in instead.");return}
 const U={id:uid(),role:"patient",ref:"",name:n,email:e,ph:hpw(e,w)};DB.users.push(U);
 DB.patient={name:n,phone:p};DB.session={uid:U.id};S.auth.err="";save();enterAs(U);render();scrollTo(0,0);toast("Account created")
}
function demoMode(){DB.session={demo:true};save();S.auth.err="";render()}
function logout(){DB.session=null;S.auth={tab:"login",err:"",fails:0,until:0};S.cred=null;save();render();scrollTo(0,0)}
function render(){
 const root=$("root");
 if(DB.session&&!DB.session.demo&&!realUser())DB.session=null;
 if(!DB.session){root.innerHTML=authHtml();labelAll(root);return}
 const U=realUser();
 if(U&&S.role!==U.role)enterAs(U);
 const tabs=TABS[S.role];
 root.innerHTML=`<div class="top"><div class="brand"><b>Nidana Care</b><span class="badge">Prototype · sample data · no real payments · not for clinical use</span></div>
 <div class="acct">${U?`<span>Signed in as <b>${E(U.name)}</b> (${E(roleName(U.role))})</span> <button class="btn g s" onclick="NC.logout()">Log out</button>`:`<span>Demo mode: you can switch between all roles.</span> <button class="btn g s" onclick="NC.logout()">Log in or register</button>`}</div>
 ${U?"":`<div class="pills" role="tablist">${ROLES.map(r=>`<button class="${r[0]===S.role?"on":""}" onclick="NC.setRole('${r[0]}')">${r[1]}</button>`).join("")}${ctxSel()}</div>`}
 ${U&&U.role!=="admin"?"":`<details class="stg"><summary>Demo setting: rollout stage ${S.stage} · ${E(STAGES[S.stage].t)}</summary><div class="stgb">${STAGES.map(s=>`<button class="${s.n===S.stage?"on":""}" title="${E(s.t)}" onclick="NC.setStage(${s.n})">${s.n}</button>`).join("")}<span class="sm">${E(STAGES[S.stage].d)}</span></div></details>`}
 <div class="pills" style="margin-top:8px">${tabs.map(t=>`<button class="${t[0]===S.tab?"on":""} ${t[2]>S.stage?"lk":""}" onclick="NC.setTab('${t[0]}')">${E(t[1])}${t[2]>S.stage?" (Stage "+t[2]+")":""}</button>`).join("")}</div></div>
 <div id="nxtSlot">${nextBar()}</div><div id="view" style="margin-top:14px"></div>`;
 const v=$("view");
 const min=minOf(S.role,S.tab);
 if(min>S.stage){v.innerHTML=lockCard(min);return}
 const f=VIEWS[S.role+"."+S.tab];
 if(S.role==="patient"&&S.tab==="assess"){mountAssess(v);return}
 v.innerHTML=f?f():"";
 stackTables(v);labelAll(root);
 if(S.role==="admin"&&S.tab==="revenue")sim();
}
/* mobile: label cells so CSS can stack wide tables (3+ columns with a header row) */
/* collapsible card; open state is remembered in S.fold so a re-render does not collapse it again. Closed by default on phones unless open===true */
function fold(k,t,b,open){const op=(k in S.fold)?S.fold[k]:(innerWidth>700||open===true);return `<details class="card" ${op?"open":""} ontoggle="NC.foldSet('${k}',this.open)"><summary><h3 style="display:inline">${t}</h3></summary>${b}</details>`}
function foldSet(k,o){S.fold[k]=o}
/* give every unlabelled field an accessible name */
function labelAll(r){r.querySelectorAll("input,select,textarea").forEach(e=>{if(e.type==="checkbox"||e.type==="radio"||e.type==="hidden")return;if((e.labels&&e.labels.length)||e.getAttribute("aria-label"))return;const t=e.placeholder||(e.tagName==="SELECT"&&e.options[0]&&e.options[0].text)||e.title||e.name||e.id;if(t)e.setAttribute("aria-label",t)})}
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
