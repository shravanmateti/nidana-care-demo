/* ---------- DOCTOR ---------- */
const patName=()=>E(DB.patient.name);
VIEWS["doctor.inbox"]=()=>{
 const ls=DB.leads.filter(l=>l.doctor===S.doc).slice().reverse();
 return `<h2>Requests from patients</h2><p class="mu">Stage 0: patients who finished the assessment and asked for a call. Call them back and note how often the pattern is right.</p>
 ${ls.length?ls.map(l=>{const a=aById(l.assess);return `<div class="card"><h3>${patName()} · ${fd(l.when)} <span class="tag ${l.status==="new"?"a":"g"}">${l.status}</span></h3><p class="sm">Phone: <b>${E(l.phone)}</b></p>${a?sumHtml(a.sum):""}${l.status==="new"?`<button class="btn s" onclick="NC.markLead('${l.id}')">Mark as called</button>`:""}</div>`}).join(""):`<div class="card"><p class="mu">No requests yet. Switch to Patient, finish the assessment at Stage 0 and request a call.</p></div>`}`;
};
function markLead(id){DB.leads.find(l=>l.id===id).status="contacted";save();render()}
function flagsFor(ap){
 const r=DB.rx.find(x=>x.appt===ap.id);if(!r)return "";const lg=DB.follow.filter(f=>f.rx===r.id);let o="";
 if(lg.some(l=>l.side))o+=`<span class="tag w">Side effects reported</span> `;
 if(lg.length>=3&&lg[lg.length-1].hair>lg[0].hair)o+=`<span class="tag w">Shedding above baseline</span> `;
 return o;
}
VIEWS["doctor.appts"]=()=>{
 if(S.caseId)return caseSheet();
 const ls=DB.appts.filter(a=>a.doctor===S.doc).slice().reverse();
 return `<h2>Appointments</h2>${ls.length?ls.map(ap=>`<div class="card"><h3>${patName()} · ${E(ap.slot)} ${ap.review?`<span class="tag a">review</span> `:""}<span class="tag ${ap.status==="done"?"g":"a"}">${ap.status}</span></h3>${flagsFor(ap)}<p class="sm">Fee ${inr(ap.fee)}</p><button class="btn s" onclick="NC.openCase('${ap.id}')">${ap.status==="done"?"View case":"Open case sheet"}</button></div>`).join(""):`<div class="card"><p class="mu">No bookings yet. Switch to Patient and book this doctor.</p></div>`}`;
};
function openCase(id){S.caseId=id;S.draft={agree:"",pattern:"",err:"",other:"",tests:[],meds:[],treat:[],fdays:28,advice:""};render();scrollTo(0,0)}
function closeCase(){S.caseId=null;render()}
function dr(k,v){S.draft[k]=v}
function pickAgree(v,el){S.draft.agree=v;S.draft.err="";[...el.parentNode.children].forEach(b=>b.classList.toggle("on",b===el));const e=$("agErr");if(e)e.remove()}
function testsFor(aid){
 const g=ALG[(AL.find(x=>x.id===aid)||{}).g];
 if(aid==="hair"||g==="Hair")return ["TSH","Ferritin","Haemoglobin","Vitamin B12","Vitamin D","Scalp check by a dermatologist"];
 const m={"Skin":["Complete blood count","TSH","Skin check by a dermatologist"],"Digestive":["Haemoglobin","Stool examination","Liver function tests","H. pylori test"],"Metabolic":["Fasting glucose","HbA1c","Lipid profile","TSH"],"Joints and muscles":["ESR and CRP","Uric acid","Vitamin D","X-ray of the affected area"],"Mental wellness":["TSH","Vitamin B12","Haemoglobin"],"Women's health":["Haemoglobin","TSH","Pelvic ultrasound","Prolactin"],"Lifestyle and preventive care":["Fasting glucose","Lipid profile","Complete blood count"]};
 return m[g]||["Complete blood count","TSH"];
}
function drTest(t,on){const a=S.draft.tests;const i=a.indexOf(t);if(on&&i<0)a.push(t);if(!on&&i>=0)a.splice(i,1)}
function drAddMed(){
 const pid=$("mp").value,dose=$("md").value.trim(),q=parseInt($("mq").value,10)||1;
 if(!pid||!dose){toast("Choose a product and write the dose and duration");return}
 S.draft.meds.push({pid,dose,qty:q});render();
}
function drOtherTest(){const v=$("tother").value.trim();if(v&&!S.draft.tests.includes(v))S.draft.tests.push(v);render()}
function drDelMed(i){S.draft.meds.splice(i,1);render()}
function drAddTreat(){const n=$("tp").value,s=Math.min(14,Math.max(1,parseInt($("ts").value,10)||1));
 const ap=DB.appts.find(x=>x.id===S.caseId);if(ap&&catPreg(aById(ap.assess))&&PROC_INFO[n]&&PROC_INFO[n].sh){toast("Shodhana is not allowed when pregnancy or recent delivery is reported");return}
 S.draft.treat.push({name:n,sessions:s});render()}
function drDelTreat(i){S.draft.treat.splice(i,1);render()}
function caseSheet(){
 const ap=DB.appts.find(x=>x.id===S.caseId),a=aById(ap.assess),d=S.draft,done=ap.status==="done",aid=catAid(a),preg=catPreg(a);
 const back=`<button class="btn g s" onclick="NC.closeCase()">Back to appointments</button>`;
 if(done){const r=DB.rx.find(x=>x.appt===ap.id),c=DB.cases[ap.id]||{};return `${back}<h2>Case · ${patName()}</h2><div class="card"><h3>Patient summary</h3>${a?sumHtml(a.sum):""}</div>
 <div class="card"><h3>Your assessment</h3><p class="sm">Tool's pattern: <b>${c.agree==="yes"?"agreed":c.agree==="partly"?"partly agreed":"disagreed"}</b> · your pattern: <b>${E(c.pattern||"-")}</b></p>${r?`<p class="sm">Tests: ${E(r.tests.join(", ")||"none")}<br>Medicines: ${r.meds.map(m=>E(prod(m.pid).name)+" ("+E(m.dose)+")").join("; ")||"none"}<br>Treatment: ${r.treat.map(t=>E(t.name)+" × "+t.sessions).join("; ")||"none"}<br>Follow-up ${fd(r.follow)}</p>`:""}</div>`}
 const vp=DB.products.filter(p=>p.status==="approved"&&sup(p.sup).status==="verified");
 return `${back}<h2>Case sheet · ${patName()}</h2>
 <div class="card"><h3>1. Patient summary from the assessment</h3>${a?sumHtml(a.sum).replace("<details>","<details open>"):"<p>No assessment.</p>"}
 ${a&&a.sum.herbLock?`<div class="note sm"><b>Herb list was hidden from the patient</b>The tool hid herbs because of pregnancy, recent delivery, a medicine or thyroid disorder. Prescribe only after you have checked interactions.</div>`:""}</div>
 <div class="card"><h3>2. Your assessment (the tool does not diagnose)</h3>
 <p class="sm">Does the tool's pattern match your clinical judgement?</p>
 <div class="chips" id="agBox">${[["yes","Agree"],["partly","Partly"],["no","Disagree"]].map(x=>`<button class="${d.agree===x[0]?"on":""}" onclick="NC.pickAgree('${x[0]}',this)">${x[1]}</button>`).join("")}</div>
 ${d.err?`<p class="err" id="agErr">${E(d.err)}</p>`:""}<label class="sm">Your pattern<br><select onchange="NC.dr('pattern',this.value)"><option value="">Select</option>${["Vata","Pitta","Kapha","Vata-Pitta","Pitta-Kapha","Vata-Kapha","Needs tests first","Other"].map(x=>`<option ${d.pattern===x?"selected":""}>${x}</option>`).join("")}</select></label>
 <p class="sm" style="margin-top:8px">Tests advised</p><div>${testsFor(aid).concat(d.tests.filter(t=>!testsFor(aid).includes(t))).map(t=>`<label class="ck"><input type="checkbox" ${d.tests.includes(t)?"checked":""} onchange="NC.drTest('${t}',this.checked)"><span>${t}</span></label>`).join("")}<div class="fl" style="margin-top:6px"><input id="tother" placeholder="Another test" style="flex:1"><button class="btn g s" onclick="NC.drOtherTest()">Add test</button></div></div></div>
 ${S.stage>=2?fold("cs_med","3. Medicines (verified catalogue only)",`<p class="mu sm">You write the dose and duration. The tool never suggests a dose.</p>
 ${d.meds.length?`<table><tr><th>Product</th><th>Dose and duration</th><th>Qty</th><th></th></tr>${d.meds.map((m,i)=>`<tr><td>${E(prod(m.pid).name)}</td><td>${E(m.dose)}</td><td>${m.qty}</td><td><button class="btn g s" onclick="NC.drDelMed(${i})">Remove</button></td></tr>`).join("")}</table>`:""}
 <div class="fl"><select id="mp"><option value="">Product</option>${catOpts(vp,aid,p=>p.name+" · "+inr(p.price)+(p.hm?" (herbo-mineral)":""))}</select><input id="md" placeholder="Dose and duration" style="flex:1;min-width:150px"><label class="sm">Qty <input id="mq" type="number" min="1" value="1" style="width:70px"></label><button class="btn s" onclick="NC.drAddMed()">Add</button></div>`,true):`<div class="note sm"><b>Medicines</b>Locked until Stage 2.</div>`}
 ${S.stage>=3?fold("cs_treat","4. Clinic treatment (optional)",`${preg?`<div class="warn sm"><b>Pregnancy or recent delivery reported</b>Shodhana procedures (Vamana, Virechana, Basti, Nasya, Raktamokshana) are disabled in the list. The doctor decides what is safe.</div>`:""}${d.treat.length?`<ul class="sm">${d.treat.map((t,i)=>`<li>${E(t.name)} × ${t.sessions} <button class="btn g s" onclick="NC.drDelTreat(${i})">Remove</button></li>`).join("")}</ul>`:""}
 <div class="fl"><select id="tp">${procOpts(aid,preg)}</select><label class="sm">Sessions <input id="ts" type="number" min="1" max="14" value="3" style="width:70px"></label><button class="btn s" onclick="NC.drAddTreat()">Add</button></div>`,preg||d.treat.length>0):`<div class="note sm"><b>Clinic treatment</b>Locked until Stage 3.</div>`}
 ${fold("cs_advice","5. Advice and follow-up",`<textarea oninput="NC.dr('advice',this.value)" placeholder="Diet, lifestyle and care advice for the patient">${E(d.advice)}</textarea>
 <div class="fl"><label class="sm">Review after <select onchange="NC.dr('fdays',+this.value)">${[14,28,42,84].map(n=>`<option value="${n}" ${d.fdays===n?"selected":""}>${n} days</option>`).join("")}</select></label></div>`,d.advice.length>0)}
 <div class="rxbar"><button class="btn" style="width:100%" onclick="NC.issueRx()">Issue prescription and complete consult</button></div>`;
}
function issueRx(){
 const ap=DB.appts.find(x=>x.id===S.caseId),d=S.draft;
 if(!d.agree){d.err="Choose Agree, Partly or Disagree before you issue the prescription.";render();const b=$("agBox");if(b)b.scrollIntoView({block:"center",behavior:"smooth"});return}
 const pa=aById(ap.assess);
 if(catPreg(pa)&&d.treat.some(t=>PROC_INFO[t.name]&&PROC_INFO[t.name].sh)){d.err="Remove the Shodhana treatment: pregnancy or recent delivery was reported.";render();return}
 if(d.meds.some(m=>{const p=prod(m.pid);return !p||p.status!=="approved"||sup(p.sup).status!=="verified"})){d.err="A medicine in the list is no longer approved. Remove it before issuing.";render();return}
 DB.cases[ap.id]={agree:d.agree,pattern:d.pattern};
 DB.rx.push({id:uid(),appt:ap.id,doctor:ap.doctor,when:new Date().toISOString(),tests:d.tests.slice(),meds:d.meds.slice(),treat:d.treat.slice(),advice:d.advice,follow:addDays(new Date(),d.fdays)});
 ap.status="done";S.caseId=null;save();toast("Prescription issued");render();
}
/* ---------- plans (stage 4) ---------- */
function planView(role,id){
 const plans=DB.settings.plans[role],cur=DB.subs[id]||plans[0][0];
 const feat={doctor:["Listing and up to 10 consults a month","Unlimited consults, case records, follow-up alerts, WhatsApp reminders"],supplier:["Up to 10 products listed, quarterly batch re-check","Unlimited products, priority listing, sales reports"],clinic:["Partner listing, one SOP audit a year","Priority listing, quarterly audits, booking dashboard"]}[role];
 return `<h2>My plan</h2><div class="note"><b>Placeholder prices</b>These figures are examples to test with real doctors, clinics and suppliers. Billing is not connected.</div>
 <div class="grid">${plans.map((p,i)=>`<div class="card"><h3>${E(p[0])} ${cur===p[0]?'<span class="tag g">current</span>':""}</h3><p class="kpi">${p[1]?inr(p[1]):"Free"}</p><p class="mu sm">${p[1]?"per quarter":"always"}</p><p class="sm">${E(feat[i]||feat[1])}</p>${cur===p[0]?"":`<button class="btn s" onclick="NC.pickPlan('${id}','${E(p[0])}')">Choose</button>`}</div>`).join("")}</div>`;
}
function pickPlan(id,p){DB.subs[id]=p;save();toast("Plan updated (mock)");render()}
VIEWS["doctor.plan"]=()=>planView("doctor",S.doc);
VIEWS["supplier.plan"]=()=>planView("supplier",S.sup);
VIEWS["clinic.plan"]=()=>planView("clinic",S.cli);
/* ---------- SUPPLIER ---------- */
VIEWS["supplier.products"]=()=>{
 const s=sup(S.sup),ps=DB.products.filter(p=>p.sup===s.id);
 const miss=[!s.licence&&"licence number",!s.gmp&&"GMP certificate",!s.report&&"batch test report"].filter(Boolean);
 return `<h2>${E(s.name)}</h2>
 ${s.status==="verified"?`<div class="good">Verified supplier. Licence ${E(s.licence)}; ${E(s.gmp)}.</div>`:`<div class="card"><h3>Verification <span class="tag a">pending</span></h3><p class="mu sm">Products stay hidden from patients and doctors until admin verifies your licence, GMP certificate and batch test report.${miss.length?" Missing: "+miss.join(", ")+".":" Waiting for admin review."}</p>
 <div class="fl"><input id="sl" placeholder="Manufacturing licence no." value="${E(s.licence)}"><input id="sg" placeholder="GMP certificate details" value="${E(s.gmp)}" style="flex:1;min-width:160px"></div>
 <label class="ck"><input type="checkbox" id="sr" ${s.report?"checked":""}><span>I have batch test reports (COA) for the products I list</span></label>
 <button class="btn s" onclick="NC.submitSup()">Submit for verification</button></div>`}
 ${fold("sup_products","Your products ("+ps.length+")",`<table><tr><th>Product</th><th>Batch</th><th>Price</th><th>Status</th></tr>${ps.map(p=>`<tr><td>${E(p.name)}<br><span class="mu sm">${E(p.form)}</span></td><td>${E(p.batch||"-")}</td><td>${inr(p.price)}</td><td><span class="tag ${p.status==="approved"?"g":p.status==="rejected"?"w":"a"}">${p.status}</span>${p.status==="rejected"&&p.reason?`<br><span class="mu sm">${E(p.reason)}</span>`:""}</td></tr>`).join("")||"<tr><td colspan=4>None</td></tr>"}</table>`,ps.length<=3)}
 <div class="card"><h3>Add a product</h3><div class="fl"><input id="an" placeholder="Product name"><input id="af" placeholder="Form and pack, e.g. Oil, 200 ml"><input id="ap" type="number" placeholder="Price" style="width:100px"><input id="ab" placeholder="Batch no."></div>
 <label class="ck"><input type="checkbox" id="ac"><span>Batch test report attached for this batch</span></label><label class="ck"><input type="checkbox" id="ahm"><span>Contains minerals, metals or Rasa ingredients (bhasma, lauha, rasa, gandhaka)</span></label><label class="ck"><input type="checkbox" id="aht"><span>Heavy-metal assay (lead, mercury, arsenic) report available for this batch</span></label>
 <p class="mu sm">For mineral or Rasa products, give the assay details. Admin checks them before approval.</p>
 <div class="fl"><input id="aal" placeholder="Assay lab name" aria-label="Assay lab name"><input id="aan" placeholder="Assay report no." aria-label="Assay report number"><label class="sm">Test date <input id="aad" type="date" max="${isoDay(new Date())}"></label></div><button class="btn s" onclick="NC.addProduct()">Submit for approval</button></div>`;
};
function submitSup(){const s=sup(S.sup);s.licence=$("sl").value.trim();s.gmp=$("sg").value.trim();s.report=$("sr").checked;save();toast("Submitted for admin review");render()}
function addProduct(){
 const n=$("an").value.trim(),f=$("af").value.trim(),p=parseFloat($("ap").value),b=$("ab").value.trim();
 if(!n||!f||!(p>0)||!b||!$("ac").checked){toast("Fill every field and attach the batch report");return}
 const hm=$("ahm").checked;let assay=null;
 if(hm){
  if(!$("aht").checked){toast("Mineral products need a heavy-metal assay");return}
  const lab=$("aal").value.trim(),no=$("aan").value.trim(),dt=$("aad").value;
  if(!lab||!no||!dt){toast("Add the lab name, report number and test date of the heavy-metal assay");return}
  if(dt>isoDay(new Date())){toast("The assay date cannot be in the future");return}
  assay={lab,no,date:dt};
 }
 DB.products.push({id:uid(),sup:S.sup,name:n,form:f,price:p,batch:b,status:"pending",ail:[],ref:[],hm,ht:hm&&!!assay,assay,note:""});save();toast("Submitted for approval");render();
}
VIEWS["supplier.orders"]=()=>{
 const os=DB.orders.filter(o=>o.sup===S.sup).slice().reverse();
 return `<h2>Orders</h2>${os.length?os.map(o=>`<div class="card"><h3>Order ${o.id} · ${fd(o.when)} <span class="tag a">${o.status}</span></h3><ul class="sm">${o.items.map(i=>`<li>${E(prod(i.pid).name)} × ${i.qty}</li>`).join("")}</ul><p><b>${inr(o.total)}</b> <span class="mu sm">Placed against a prescription</span></p>
 <div class="fl">${o.status==="placed"?`<button class="btn s" onclick="NC.setOrder('${o.id}','dispatched')">Mark dispatched</button>`:""}${o.status==="dispatched"?`<button class="btn s" onclick="NC.setOrder('${o.id}','delivered')">Mark delivered</button>`:""}</div></div>`).join(""):`<div class="card"><p class="mu">No orders yet.</p></div>`}`;
};
function setOrder(id,st){DB.orders.find(o=>o.id===id).status=st;save();render()}
/* ---------- CLINIC ---------- */
VIEWS["clinic.bookings"]=()=>{
 const c=cli(S.cli),bs=DB.tbook.filter(b=>b.clinic===c.id).slice().reverse();
 return `<h2>${E(c.name)}</h2><p><span class="tag ${c.status==="audited"?"g":"w"}">${c.status} · ${c.score}%</span></p><h3 style="margin-top:12px">Bookings</h3>
 ${bs.length?bs.map(b=>`<div class="card"><h3>${patName()} · ${E(b.date)} <span class="tag ${b.status==="done"?"g":"a"}">${b.status}</span></h3><ul class="sm">${b.items.map(i=>`<li>${E(i.name)} × ${i.sessions}</li>`).join("")}</ul><p><b>${inr(b.total)}</b> <span class="mu sm">Prescribed by ${E(doc(DB.rx.find(r=>r.id===b.rx).doctor).name)}</span></p>${b.status==="booked"?`<button class="btn s" onclick="NC.setBooking('${b.id}')">Mark sessions done</button>`:""}</div>`).join(""):`<div class="card"><p class="mu">No bookings yet.</p></div>`}`;
};
function setBooking(id){DB.tbook.find(b=>b.id===id).status="done";save();render()}
VIEWS["clinic.audit"]=()=>{
 const c=cli(S.cli),hist=DB.audits.filter(a=>a.clinic===c.id).slice().reverse();
 const due=addDays(c.last,90),over=new Date(due)<new Date();
 return `<h2>SOP audit</h2><div class="card"><h3>Status: ${c.status} · ${c.score}%</h3><p class="sm">Last audit ${fd(c.last)} · next due ${fd(due)} ${over?'<span class="tag w">overdue</span>':""}</p></div>
 <div class="note"><b>Sample checklist</b>Replace these items with the exact AYUSH and state requirements your advisers confirm. Admin records the official audit score. This self-check is for preparation.</div>
 <div class="card"><h3>Self-audit</h3>${AUDIT.map((t,i)=>`<label class="ck"><input type="checkbox" class="ack" onchange="document.getElementById('acn').textContent=document.querySelectorAll('.ack:checked').length+' of '+document.querySelectorAll('.ack').length+' ticked'"><span>${E(t)}</span></label>`).join("")}<p class="mu sm" id="acn">0 of ${AUDIT.length} ticked</p><button class="btn s" onclick="NC.saveAudit()">Save self-audit</button></div>
 <div class="card"><h3>History</h3><table><tr><th>Date</th><th>By</th><th>Score</th></tr>${hist.map(a=>`<tr><td>${fd(a.date)}</td><td>${a.by}</td><td>${a.score}%</td></tr>`).join("")||"<tr><td colspan=3>None yet</td></tr>"}</table></div>`;
};
function saveAudit(){const ck=[...document.querySelectorAll(".ack")],n=ck.filter(x=>x.checked).length,sc=Math.round(n/ck.length*100);if(!n){toast("Tick at least one item before you save the self-audit");return}DB.audits.push({id:uid(),clinic:S.cli,date:new Date().toISOString(),score:sc,by:"self"});save();toast("Self-audit saved: "+sc+"%");render()}

VIEWS["doctor.cat"]=()=>catView(DB,inr);
