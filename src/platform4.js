/* ---------- ADMIN ---------- */
const sumN=(a,f)=>a.reduce((t,x)=>t+(+f(x)||0),0);
VIEWS["admin.funnel"]=()=>{
 const m=DB.metrics,asked=new Set([...DB.leads.map(l=>l.assess),...DB.appts.map(a=>a.assess)]).size;
 const rows=[["Started the assessment",m.started],["Finished the assessment",DB.assessments.length],["Asked for a doctor",asked],["Booked a consultation",DB.appts.length],["Consultation completed",DB.appts.filter(a=>a.status==="done").length],["Prescription issued",DB.rx.length],["Medicines ordered",new Set(DB.orders.map(o=>o.rx)).size],["Clinic treatment booked",DB.tbook.length]];
 const cs=Object.values(DB.cases),agree=cs.filter(c=>c.agree==="yes").length,part=cs.filter(c=>c.agree==="partly").length;
 const reach=m.reach||[];
 return `<h2>Funnel</h2><p class="mu">These are the numbers for your Stage 0 test. Run it with about 5 doctors and 50 patients, then read this page.</p>
 <div class="card"><table><tr><th>Step</th><th>Count</th><th>% of previous</th></tr>${rows.map((r,i)=>`<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td>${i&&rows[i-1][1]?Math.round(r[1]/rows[i-1][1]*100)+"%":"-"}</td></tr>`).join("")}</table></div>
 <div class="card"><h3>Does the tool match the doctors?</h3><p class="kpi">${cs.length?Math.round(agree/cs.length*100)+"%":"-"}</p><p class="mu sm">${cs.length} cases reviewed · ${agree} agreed · ${part} partly · ${cs.length-agree-part} disagreed. Show this to a Vaidya before changing any scoring.</p></div>
 <div class="card"><h3>Where people stop</h3>${reach.length?`<table><tr><th>Question</th><th>Reached it</th></tr>${Q.map((q,i)=>`<tr><td class="sm">${i+1}. ${E(q.q)}</td><td>${reach[i]||0}</td></tr>`).join("")}</table>`:`<p class="mu sm">Fills in as people use the assessment.</p>`}</div>`;
};
VIEWS["admin.verify"]=()=>{
 let h=`<h2>Verification queue</h2>${fold("ad_doc","Doctors",`${DB.doctors.map(d=>`<div style="border-top:1px solid var(--ln);padding:8px 0"><b>${E(d.name)}</b> <span class="tag ${d.reg==="verified"?"g":"a"}">${d.reg}</span><br><span class="mu sm">${E(d.qual)}</span>
 <p class="sm">Registration no.: <b>${E(d.regno||"missing")}</b>${d.council?" · "+E(d.council):""}<br>Certificate image: ${certOk(d)?`uploaded ${fd(d.cert.at)}`:"not uploaded"}${d.rejectNote?`<br>Last rejection: ${E(d.rejectNote)}`:""}</p>
 ${certOk(d)?`<details><summary class="sm">View certificate image</summary><img src="${d.cert.data}" alt="Registration certificate uploaded by ${E(d.name)}" style="max-width:100%;border:1px solid var(--ln);border-radius:8px;margin-top:6px"></details>`:""}
 ${d.reg!=="verified"?(certOk(d)&&d.regno?`<div class="fl" style="margin-top:6px"><button class="btn s" onclick="NC.verifyDoc('${d.id}')">Approve registration</button><input id="rd_${d.id}" placeholder="Reason to reject" aria-label="Reason to reject ${E(d.name)}" style="flex:1;min-width:140px"><button class="btn g s" onclick="NC.rejectDoc('${d.id}')">Reject</button></div>`:`<span class="mu sm">Cannot approve until the doctor uploads the registration certificate image.</span>`):""}</div>`).join("")}
 <p class="mu sm">Check that the name and registration number on the certificate image match what was entered, and look the number up on the state Ayurveda council's own register if it publishes one. This prototype does not do that lookup. Also check the practitioner's telemedicine course certificate in the real product.</p>`,true)}`;
 if(S.stage>=2){
  h+=fold("ad_sup","Suppliers",`${DB.suppliers.map(s=>{const miss=[!s.licence&&"licence",!s.gmp&&"GMP certificate",!s.report&&"batch test report"].filter(Boolean);
   return `<div style="border-top:1px solid var(--ln);padding:8px 0"><b>${E(s.name)}</b> <span class="tag ${s.status==="verified"?"g":"a"}">${s.status}</span><p class="sm">Licence: ${E(s.licence||"missing")}<br>GMP: ${E(s.gmp||"missing")}<br>Batch test report: ${s.report?"provided":"missing"}</p>
   ${s.status!=="verified"?(miss.length?`<span class="mu sm">Cannot approve. Missing: ${miss.join(", ")}.</span>`:`<button class="btn s" onclick="NC.approveSup('${s.id}')">Approve supplier</button>`):""}</div>`}).join("")}`,DB.suppliers.some(s=>s.status!=="verified"))+
  fold("ad_prod","Products awaiting approval ("+DB.products.filter(p=>p.status==="pending").length+")",`${DB.products.filter(p=>p.status==="pending").map(p=>{const sv=sup(p.sup).status==="verified";return `<div class="fl"><span class="sm" style="flex:1"><b>${E(p.name)}</b> · ${E(sup(p.sup).name)} · batch ${E(p.batch||"missing")}${p.hm?`<br>Heavy-metal assay: ${p.assay?E(p.assay.lab)+", report "+E(p.assay.no)+", "+E(p.assay.date):(p.ht?"declared, no details on file":"missing")}`:""}</span>${sv&&p.batch&&(!p.hm||p.ht)?`<button class="btn s" onclick="NC.approveProd('${p.id}')">Approve</button>`:`<span class="tag a">supplier, batch or heavy-metal assay not ready</span>`}<input id="rj_${p.id}" placeholder="Reason to reject" aria-label="Reason to reject ${E(p.name)}" style="flex:1;min-width:140px"><button class="btn g s" onclick="NC.rejectProd('${p.id}')">Reject</button></div>`}).join("")||`<p class="mu sm">None pending.</p>`}`,DB.products.some(p=>p.status==="pending"));
 }
 if(S.stage>=3){
  h+=fold("ad_aud","Clinic audits",`<table><tr><th>Clinic</th><th>Score</th><th>Status</th><th>Record audit</th></tr>${DB.clinics.map(c=>{const sa=DB.audits.filter(a=>a.clinic===c.id&&a.by==="self").slice(-1)[0];return `<tr><td class="sm">${E(c.name)}<br><span class="mu">last ${lastTxt(c)}${sa?" · self-check "+sa.score+"%":""}</span></td><td>${c.score}%</td><td><span class="tag ${c.status==="audited"?"g":"w"}">${c.status}</span></td><td><div class="fl"><input id="as_${c.id}" type="number" min="0" max="100" style="width:70px" placeholder="%"><button class="btn s" onclick="NC.recordAudit('${c.id}')">Save</button></div></td></tr>`}).join("")}</table>
  <p class="mu sm">Rule used here: 80% and above is a bookable partner, 60 to 79% is probation, below 60% is suspended. Change it to match your policy.</p>`,false);
 }
 return h;
};
const certOk=d=>!!(d&&d.cert&&typeof d.cert.data==="string"&&d.cert.data.indexOf("data:image/jpeg;base64,")===0);
function verifyDoc(id){const d=doc(id);if(!d||!d.regno){toast("Cannot verify: registration number missing");return}if(!certOk(d)){toast("Cannot verify: registration certificate image not uploaded");return}d.reg="verified";d.rejectNote="";save();render()}
function rejectDoc(id){const d=doc(id);if(!d)return;const r=val("rd_"+id);if(r.length<3){toast("Write a reason so the doctor knows what to fix");return}d.reg="rejected";d.rejectNote=r;save();toast("Registration rejected");render()}
function certPick(inp){
 const d=doc(S.doc),f=inp.files&&inp.files[0];if(!d||!f)return;
 if(d.reg==="verified"){toast("Your registration is already verified");return}
 if(!/^image\/(jpeg|png|webp)$/.test(f.type)){toast("Upload a photo or scan as JPG, PNG or WebP");inp.value="";return}
 if(f.size>10*1048576){toast("Image is larger than 10 MB. Use a smaller photo.");inp.value="";return}
 const fr=new FileReader();fr.onerror=()=>toast("Could not read that file");
 fr.onload=()=>{const im=new Image();im.onerror=()=>toast("That file is not a readable image");
  im.onload=()=>{let w=im.width,h=im.height;if(!w||!h){toast("That file is not a readable image");return}
   const sc=Math.min(1,1200/Math.max(w,h));w=Math.round(w*sc);h=Math.round(h*sc);
   const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);
   const data=c.toDataURL("image/jpeg",0.75);
   d.cert={name:String(f.name).slice(0,80),data,at:new Date().toISOString()};d.reg="pending";d.rejectNote="";save();toast("Certificate uploaded. The admin will review it.");render()};
  im.src=fr.result};
 fr.readAsDataURL(f)
}
function regCard(){
 const d=doc(S.doc);if(!d)return "";
 const st=d.reg==="verified"?"g":"a";
 return fold("dr_reg","My registration · "+d.reg,`<p class="sm">Registration no.: <b>${E(d.regno||"missing")}</b>${d.council?" · "+E(d.council):""}</p>
 ${d.reg==="verified"?`<p class="good">Your registration is verified. Patients can book you.</p>`:`<p class="sm">Patients cannot book you until the admin verifies your registration. Upload a clear photo or scan of your state Ayurveda council registration certificate.</p>
 ${d.reg==="rejected"?`<p class="warn sm">Rejected: ${E(d.rejectNote||"please upload again")}. Upload a new image to try again.</p>`:""}
 ${certOk(d)?`<p class="sm">Uploaded ${fd(d.cert.at)} (${E(d.cert.name)}). ${d.reg==="pending"?"Waiting for the admin to review it.":""}</p>`:""}
 <label class="sm">Certificate image (JPG, PNG or WebP)<br><input type="file" id="cert_f" accept="image/jpeg,image/png,image/webp" onchange="NC.certPick(this)"></label>
 <p class="mu sm">The image is shrunk and kept in this browser only. Do not upload anything else.</p>`}
 ${certOk(d)?`<details><summary class="sm">View the image you uploaded</summary><img src="${d.cert.data}" alt="Your uploaded registration certificate" style="max-width:100%;border:1px solid var(--ln);border-radius:8px;margin-top:6px"></details>`:""}`,d.reg!=="verified")}
function approveSup(id){const s=sup(id);if(!s.licence||!s.gmp||!s.report){toast("Cannot approve: licence, GMP certificate and batch test report are all needed");return}s.status="verified";save();render()}
function approveProd(id){const p=prod(id);
 if(!p||sup(p.sup).status!=="verified"){toast("Cannot approve: the supplier is not verified");return}
 if(!p.batch){toast("Cannot approve: batch number missing");return}
 if(p.hm&&!p.ht){toast("Cannot approve: herbo-mineral products need a heavy-metal assay");return}
 p.status="approved";save();render()}
function rejectProd(id){const p=prod(id);if(!p)return;const el=$("rj_"+id),r=el?el.value.trim():"";if(!r){toast("Write a short reason for the supplier");return}p.status="rejected";p.reason=r;save();render()}
function recordAudit(id){
 const v=parseInt($("as_"+id).value,10);if(isNaN(v)||v<0||v>100){toast("Enter a score from 0 to 100");return}
 const c=cli(id);c.score=v;c.last=new Date().toISOString();c.status=v>=80?"audited":v>=60?"probation":"suspended";
 DB.audits.push({id:uid(),clinic:id,date:c.last,score:v,by:"admin"});save();toast("Audit recorded");render();
}
const roleOf=id=>id[0]==="d"?"doctor":id[0]==="s"?"supplier":"clinic";
VIEWS["admin.revenue"]=()=>{
 const st=DB.settings,done=DB.appts.filter(a=>a.status==="done");
 const cR=sumN(done,a=>a.fee)*st.commConsult/100,oR=sumN(DB.orders,o=>o.total)*st.commOrder/100,bR=sumN(DB.tbook,b=>b.total)*st.feeBook/100,aR=DB.audits.filter(a=>a.by==="admin").length*st.auditFee;
 const subs=Object.entries(DB.subs).map(([id,p])=>{const pl=st.plans[roleOf(id)].find(x=>x[0]===p);return pl?pl[1]:0}).reduce((a,b)=>a+b,0);
 const rows=[["Consultation commission ("+st.commConsult+"%)",cR],["Medicine order commission ("+st.commOrder+"%)",oR],["Clinic booking fee ("+st.feeBook+"%)",bR],["Clinic audit fees",aR],["Subscriptions chosen so far (per quarter)",subs]];
 return `<h2>Revenue</h2><div class="card"><h3>From activity in this prototype</h3><table>${rows.map(r=>`<tr><td>${r[0]}</td><td><b>${inr(r[1])}</b></td></tr>`).join("")}<tr><td><b>Total</b></td><td><b>${inr(rows.reduce((t,r)=>t+r[1],0))}</b></td></tr></table></div>
 <div class="card"><h3>Model one quarter</h3><p class="mu sm">All inputs are guesses. The number that matters most is how many doctors pay once you bring them patients.</p>
 <div class="grid" style="gap:8px">${[["sd","Paying doctors",50],["sc","Paying clinics",10],["ss","Paying suppliers",8],["cp","Consults per doctor",60],["fe","Average consult fee ₹",450],["no","Medicine orders",400],["ao","Average order ₹",500],["nb","Clinic bookings",300],["ab","Average booking ₹",1500]].map(x=>`<label class="sm">${x[1]}<br><input id="m_${x[0]}" type="number" value="${x[2]}" oninput="NC.sim()" style="width:100%"></label>`).join("")}</div>
 <div id="simout" style="margin-top:10px"></div></div>`;
};
function sim(){
 const v=k=>parseFloat($("m_"+k).value)||0,st=DB.settings;
 const dp=st.plans.doctor[1][1],cp=st.plans.clinic[0][1],sp=st.plans.supplier[0][1];
 const subs=v("sd")*dp+v("sc")*cp+v("ss")*sp;
 const com=v("sd")*v("cp")*v("fe")*st.commConsult/100+v("no")*v("ao")*st.commOrder/100+v("nb")*v("ab")*st.feeBook/100;
 const tot=subs+com;
 $("simout").innerHTML=`<table><tr><td>Subscriptions (doctor Pro, clinic Partner, supplier Listing)</td><td><b>${inr(subs)}</b></td></tr><tr><td>Commissions and booking fees</td><td><b>${inr(com)}</b></td></tr><tr><td><b>Quarter total</b></td><td><b>${inr(tot)}</b></td></tr></table><p class="mu sm">${tot?Math.round(subs/tot*100):0}% of revenue comes from subscriptions. Activity-based income grows with patients, which is why it comes first.</p>`;
}
VIEWS["admin.settings"]=()=>{
 const st=DB.settings;
 return `<h2>Settings</h2><div class="card"><h3>Fees</h3><div class="grid" style="gap:8px">${[["commConsult","Consultation commission %"],["commOrder","Medicine order commission %"],["feeBook","Clinic booking fee %"],["auditFee","Audit fee per clinic ₹"]].map(x=>`<label class="sm">${x[1]}<br><input id="st_${x[0]}" type="number" value="${st[x[0]]}"></label>`).join("")}</div><button class="btn s" style="margin-top:8px" onclick="NC.saveSettings()">Save</button></div>
 <div class="card"><h3>Reset prototype</h3><p class="mu sm">Clears all sample activity and restores the starting data.</p><button class="btn g s" onclick="NC.resetAll()">Reset all data</button></div>
 <div class="card"><h3>What this prototype does not do</h3><ul class="sm"><li>No real accounts, payments, video calls or messages.</li><li>No data leaves this browser except the WhatsApp or copy action the patient chooses.</li><li>All doctors, clinics, suppliers, licence numbers and prices are made-up samples.</li><li>The assessment weights and the audit checklist need review by a registered Vaidya and a lawyer before real use.</li></ul></div>`;
};
function saveSettings(){["commConsult","commOrder","feeBook","auditFee"].forEach(k=>{const v=parseFloat($("st_"+k).value);if(!isNaN(v)&&v>=0)DB.settings[k]=v});save();toast("Saved")}
function resetAll(){const ss=DB.session;try{localStorage.removeItem(LS)}catch(e){}ALS_st.id=null;ALS_st.ans={};ALS_st.i=0;DB=seed();DB.session=ss;S.role="admin";S.tab="settings";S.caseId=null;try{ans=Q.map(()=>[]);window._gateOpen=false}catch(e){}startedThisRun=false;toast("Reset");render()}
window.onAssessmentStep=n=>{
 const m=DB.metrics;m.reach=m.reach||[];
 if(n===0&&!startedThisRun0){startedThisRun0=true;maxReach=-1}
 if(n>maxReach){for(let k=maxReach+1;k<=n;k++)m.reach[k]=(m.reach[k]||0)+1;maxReach=n;save()}
};
let maxReach=-1,startedThisRun0=false;
/* ---------- admin: onboarding new suppliers and clinics ---------- */
const lastTxt=c=>c.status==="pending"?"not audited yet":fd(c.last);
const tmpPw=()=>"Nc"+Math.random().toString(36).slice(2,8)+Math.floor(10+Math.random()*89);
const val=id=>(($(id)||{}).value||"").trim();
function mkLogin(role,ref,name,email){const pw=tmpPw();DB.users.push({id:uid(),role,ref,name,email,ph:hpw(email,pw),tmp:true,since:new Date().toISOString()});S.cred={role,name,email,pw}}
function obCheck(email,phone){
 if(!okEmail(email))return "Enter a valid contact email.";
 if(DB.users.some(u=>u.email===email))return "An account with this email already exists.";
 if(!okPhone(phone))return "Enter a valid contact phone number (8 to 15 digits).";
 return "";
}
function onboardSup(){
 const n=val("ob_sn"),c=val("ob_sc"),pin=val("ob_sz"),e=val("ob_se").toLowerCase(),ph=val("ob_sp"),st=val("ob_ss"),l=val("ob_sl"),g=val("ob_sg"),r=!!($("ob_sr")||{}).checked;
 if(n.length<3){toast("Enter the supplier's company name");return}
 if(c.length<2){toast("Enter the contact person's name");return}
 const er=obCheck(e,ph);if(er){toast(er);return}
 if(!/^[1-9]\d{5}$/.test(pin)){toast("Enter the supplier's 6-digit dispatch PIN code");return}
 if(l.length<5){toast("Enter the drug manufacturing licence number");return}
 if(DB.suppliers.some(x=>x.licence&&x.licence.toLowerCase()===l.toLowerCase())){toast("A supplier with this licence number is already on file");return}
 if(DB.suppliers.some(x=>x.name.toLowerCase()===n.toLowerCase())){toast("A supplier with this name is already on file");return}
 const id="s"+uid();DB.suppliers.push({id,name:n,pin,dispatch:1,ship:0,restock:7,licence:l,gmp:g,report:r,status:"pending",contact:c,email:e,phone:ph,state:st,since:new Date().toISOString()});
 mkLogin("supplier",id,n,e);geoPin(pin).then(g=>{if(g)save()});save();toast("Supplier onboarded. Verification is pending.");S.fold.ad_sup=true;render()
}
function onboardDoc(){
 const n=val("ob_dn"),q=val("ob_dq"),ex=parseInt(val("ob_dx"),10),lg=val("ob_dl"),fee=parseInt(val("ob_df"),10),rn=val("ob_dr"),cn=val("ob_dc"),e=val("ob_de").toLowerCase(),ph=val("ob_dp");
 const slots=val("ob_ds").split(",").map(x=>x.trim()).filter(Boolean);
 if(n.length<3){toast("Enter the doctor's full name");return}
 if(!/BAMS/i.test(q)){toast("Qualification must include BAMS (Ayurveda degree)");return}
 if(isNaN(ex)||ex<0||ex>60){toast("Enter years of experience between 0 and 60");return}
 if(lg.length<2){toast("Enter the languages the doctor consults in");return}
 if(isNaN(fee)||fee<100||fee>5000){toast("Consultation fee must be between ₹100 and ₹5000");return}
 if(rn.length<5||cn.length<2){toast("Enter the state council registration number and the council's name");return}
 if(DB.doctors.some(x=>x.regno&&x.regno.toLowerCase()===rn.toLowerCase())){toast("A doctor with this registration number is already on file");return}
 const er=obCheck(e,ph);if(er){toast(er);return}
 if(!slots.length||slots.some(x=>!/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) ([01]\d|2[0-3]):[0-5]\d$/.test(x))){toast("Write slots like Mon 10:00, Wed 17:00");return}
 const id="d"+uid();DB.doctors.push({id,name:n,qual:q,exp:ex,langs:lg,fee,slots,reg:"pending",regno:rn,council:cn,email:e,phone:ph,since:new Date().toISOString()});
 mkLogin("doctor",id,n,e);save();toast("Doctor onboarded. Registration is pending verification.");S.fold.ad_doc=true;render()
}
function onboardClinic(){
 const n=val("ob_cn"),city=val("ob_cc"),pin=val("ob_cz"),st=val("ob_cs"),rg=val("ob_cr"),dn=val("ob_cd"),dr=val("ob_cp"),e=val("ob_ce").toLowerCase(),ph=val("ob_cph"),ad=val("ob_ca");
 if(n.length<3){toast("Enter the clinic name");return}
 if(city.length<2){toast("Enter the city");return}
 if(!/^[1-9]\d{5}$/.test(pin)){toast("Enter the clinic's 6-digit PIN code");return}
 if(rg.length<5){toast("Enter the state clinic registration number");return}
 if(dn.length<3||dr.length<4){toast("Enter the BAMS physician in charge and their registration number");return}
 const er=obCheck(e,ph);if(er){toast(er);return}
 if(DB.clinics.some(x=>x.regno&&x.regno.toLowerCase()===rg.toLowerCase())){toast("A clinic with this registration number is already on file");return}
 const treat={};let bad=false;Object.keys(PROC_INFO).forEach((t,i)=>{if(($("obt_"+i)||{}).checked){const pr=parseInt(val("obp_"+i),10);if(!(pr>0&&pr<=100000))bad=true;else treat[t]=pr}});
 if(bad){toast("Give each ticked treatment a price between 1 and 100000");return}
 if(!Object.keys(treat).length){toast("Tick at least one treatment the clinic offers");return}
 const id="c"+uid();DB.clinics.push({id,name:n,city,pin,state:st,regno:rg,physician:dn,physReg:dr,email:e,phone:ph,address:ad,treat,score:0,last:new Date().toISOString(),status:"pending",since:new Date().toISOString()});
 mkLogin("clinic",id,n,e);geoPin(pin).then(g=>{if(g)save()});save();toast("Clinic onboarded. Record an audit before it can take bookings.");S.fold.ad_aud=true;render()
}
VIEWS["admin.onboard"]=()=>{
 const cr=S.cred,pendD=DB.doctors.filter(x=>x.reg!=="verified").length,pendS=DB.suppliers.filter(x=>x.status==="pending").length,pendC=DB.clinics.filter(x=>x.status==="pending").length;
 const f=(id,l,ph,t)=>`<label class="sm">${l}<br><input id="${id}" ${t?`type="${t}"`:""} placeholder="${E(ph||l)}"></label>`;
 const procs=Object.keys(PROC_INFO).map((t,i)=>`<div class="fl"><label class="ck" style="flex:1"><input type="checkbox" id="obt_${i}"><span>${E(t)}</span></label><input id="obp_${i}" type="number" min="1" max="100000" placeholder="Price ₹" aria-label="Price for ${E(t)}" style="width:96px"></div>`).join("");
 return `<h2>Onboarding</h2><p class="mu sm">Add a new doctor, supplier or clinic. Each gets a login and then goes through verification or audit before it can see patients, sell or take bookings. ${pendD} doctor${pendD===1?"":"s"}, ${pendS} supplier${pendS===1?"":"s"} and ${pendC} clinic${pendC===1?"":"s"} awaiting verification.</p>
 ${cr?`<div class="good" role="status"><b>${cr.reset?"Password reset for ":"Login created for "}${E(cr.name)}.</b><br>Email: ${E(cr.email)}<br>Temporary password: <b>${E(cr.pw)}</b><br><span class="sm">Share this with them now. It is not shown again.</span><br><button class="btn g s" onclick="NC.dismissCred()">Done, hide it</button></div>`:""}
 ${fold("ob_doc","Onboard a doctor",`<div class="grid" style="gap:8px">${f("ob_dn","Doctor full name")}${f("ob_dq","Qualification","BAMS, MD (Kayachikitsa)")}${f("ob_dx","Years of experience","","number")}${f("ob_dl","Languages","English, Hindi")}${f("ob_df","Consultation fee ₹","","number")}${f("ob_dr","State council registration number")}${f("ob_dc","State Ayurveda council")}${f("ob_de","Contact email","name@example.com","email")}${f("ob_dp","Contact phone","","tel")}</div>
  <label class="sm" style="display:block;margin-top:8px">Weekly slots, comma separated<br><input id="ob_ds" placeholder="Mon 10:00, Wed 17:00"></label>
  <p class="mu sm">The doctor stays unverified, and patients cannot book them, until they upload a photo of their council registration certificate and you approve it under Verification.</p>
  <button class="btn" onclick="NC.onboardDoc()">Onboard doctor</button>`,true)}
 ${fold("ob_sup","Onboard a supplier",`<div class="grid" style="gap:8px">${f("ob_sn","Company name")}${f("ob_sc","Contact person")}${f("ob_se","Contact email","name@company.com","email")}${f("ob_sp","Contact phone","","tel")}${f("ob_ss","State")}${f("ob_sz","Dispatch PIN code","6 digits")}${f("ob_sl","Drug manufacturing licence number")}${f("ob_sg","GMP certificate details (optional now)","Certificate and valid-to date")}</div>
  <label class="ck"><input type="checkbox" id="ob_sr"><span>Batch test report received (optional now)</span></label>
  <p class="mu sm">The licence number is required. Missing documents keep the supplier in the verification queue until they are provided.</p>
  <button class="btn" onclick="NC.onboardSup()">Onboard supplier</button>`,true)}
 ${fold("ob_cli","Onboard a clinic",`<div class="grid" style="gap:8px">${f("ob_cn","Clinic name")}${f("ob_cc","City")}${f("ob_cz","PIN code","6 digits")}${f("ob_cs","State")}${f("ob_cr","State clinic registration number")}${f("ob_cd","BAMS physician in charge")}${f("ob_cp","Physician registration number")}${f("ob_ce","Contact email","name@clinic.com","email")}${f("ob_cph","Contact phone","","tel")}${f("ob_ca","Address (optional)")}</div>
  <p class="sm" style="margin-top:8px"><b>Treatments offered and prices</b></p>${procs}
  <p class="mu sm">A new clinic cannot take bookings until you record an SOP audit scoring 80% or more under Verification.</p>
  <button class="btn" onclick="NC.onboardClinic()">Onboard clinic</button>`,false)}
 ${fold("ob_list","Onboarded logins ("+DB.users.filter(u=>u.role!=="patient"&&u.role!=="admin").length+")",`<table><tr><th>Name</th><th>Role</th><th>Email</th><th></th></tr>${DB.users.filter(u=>u.role!=="patient"&&u.role!=="admin").map(u=>`<tr><td class="sm">${E(u.name)}</td><td class="sm">${E(roleName(u.role))}</td><td class="sm">${E(u.email)}</td><td><button class="btn g s" aria-label="Reset password for ${E(u.name)}" onclick="NC.adminReset('${u.id}')">Reset password</button></td></tr>`).join("")}</table><p class="mu sm">Reset gives the person a new temporary password. They are asked to change it when they log in.</p>`,false)}`;
};
function dismissCred(){S.cred=null;render()}
VIEWS["admin.cat"]=()=>catView(DB,inr);
const _done=window.onAssessmentDone;window.onAssessmentDone=s=>{_done(s);startedThisRun0=false;maxReach=-1;
 const m=DB.metrics;m.reach=m.reach||[];if(Q.length){m.reach[Q.length]=(m.reach[Q.length]||0)}save()};
return {get DB(){return DB},saveAddr,addrToggle,saveStock,addDistrib,saveShip,dlBill,setPin,useLoc,forgetLoc,authTab,sendReset,doReset,changePw,pwToggle,adminReset,certPick,rejectDoc,doLogin,doRegister,demoMode,logout,onboardSup,onboardClinic,onboardDoc,dismissCred,foldSet,rejectProd,nextGo,render,setRole,setTab,setStage,goto,setCtx,reqLead,pickSlot,confirmBook,placeOrder,bookClinic,logFollow,setRemind,bookReview,openCase,closeCase,dr,drTest,drAddMed,drDelMed,pickAgree,drOtherTest,drAddTreat,drDelTreat,issueRx,markLead,pickPlan,submitSup,addProduct,setOrder,setBooking,saveAudit,verifyDoc,approveSup,approveProd,recordAudit,saveSettings,resetAll,sim};
})();
