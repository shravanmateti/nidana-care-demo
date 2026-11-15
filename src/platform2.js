/* ---------- shared bits ---------- */
const VIEWS={};
const sumHtml=s=>s.kind==="gen"?ALsumHtml(s):`<p><b>${E(s.type)}</b> <span class="tag">${E(s.pattern)}</span>${s.noPat?"":` <span class="mu sm">Vata ${s.split.Vata}% · Pitta ${s.split.Pitta}% · Kapha ${s.split.Kapha}%</span>`}</p>
<p class="mu sm">Agni: ${E(s.agni)} · Ama: ${E(s.ama)} · Dhatu: ${E(s.dhatu)}</p>
${s.red.length?`<div class="warn sm"><b>Warning signs reported</b>${s.red.map(E).join("<br>")}</div>`:""}
${s.cautions.length?`<div class="note sm"><b>Cautions</b>${s.cautions.map(E).join("<br>")}</div>`:""}
${s.meds.length?`<p class="sm"><b>Regular medicines:</b> ${E(s.meds.join(", "))}</p>`:""}
<details><summary class="sm">Contributing factors from the patient's answers</summary><ul class="sm">${s.factors.length?s.factors.map(f=>`<li>${E(f)}</li>`).join(""):"<li>None identified</li>"}</ul></details>`;
const aById=id=>DB.assessments.find(a=>a.id===id);
const rxTotal=r=>r.meds.reduce((t,m)=>t+(prod(m.pid)?prod(m.pid).price*m.qty:0),0);
function needA(){return `<div class="note"><b>Complete the assessment first</b>Your doctor needs the summary to start.<br><button class="btn s" style="margin-top:8px" onclick="NC.goto('patient','assess')">Go to assessment</button></div>`}
/* ---------- PATIENT ---------- */
VIEWS["patient.book"]=()=>{
 const a=lastA();if(!a)return needA();
 const mine=DB.appts.filter(x=>x.status==="booked").map(x=>`<li>${E(doc(x.doctor).name)}, ${E(x.slot)} <span class="tag a">booked</span></li>`).join("");
 const p=S.pick;
 return `${mine?`<div class="card"><h3>Your appointments</h3><ul>${mine}</ul><p class="mu sm">Your doctor sees your assessment summary before the call.</p></div>`:""}
 <h2>Choose a doctor</h2><p class="mu">Only doctors whose registration has been verified can take bookings. Sample doctors.</p>
 <div class="grid">${DB.doctors.map(d=>`<div class="card"><h3>${E(d.name)}</h3><p class="sm">${E(d.qual)} · ${d.exp} years<br>${E(d.langs)}<br>Fee: ${inr(d.fee)}</p>
 ${d.reg==="verified"?`<span class="tag g">Registration verified</span><div class="chips" style="margin-top:8px">${d.slots.map(s=>`<button class="${p.d===d.id&&p.s===s?"on":""}" onclick="NC.pickSlot('${d.id}','${s}')">${E(s)}</button>`).join("")}</div>
 ${p.d===d.id?`<button class="btn s" onclick="NC.confirmBook()">Confirm ${E(p.s)} · pay ${inr(d.fee)} (mock)</button>`:""}`:`<span class="tag a">Registration under verification</span>`}</div>`).join("")}</div>`;
};
function pickSlot(d,s){S.pick={d,s};render()}
function confirmBook(){
 const a=lastA(),d=doc(S.pick.d);if(!d)return;
 if(d.reg!=="verified"){toast("This doctor is not verified yet");return}
 DB.appts.push({id:uid(),doctor:d.id,slot:S.pick.s,assess:a.id,status:"booked",fee:d.fee,when:new Date().toISOString()});
 S.pick={};save();toast("Booked (mock payment)");goto("patient","care");
}
VIEWS["patient.care"]=()=>{
 const items=DB.appts.slice().reverse();
 const hist=DB.assessments.slice().reverse().map(a=>`<li>${fd(a.when)}: ${E(a.sum.type)}, ${E(a.sum.pattern)}</li>`).join("");
 return `<h2>My care</h2>${items.length?items.map(ap=>{
  const r=DB.rx.find(x=>x.appt===ap.id),d=doc(ap.doctor);
  return `<div class="card"><h3>${E(d.name)} · ${E(ap.slot)} ${ap.review?`<span class="tag a">review</span> `:""}<span class="tag ${ap.status==="done"?"g":"a"}">${ap.status==="done"?"consult done":"booked"}</span></h3>
  ${r?`<p class="sm"><b>Prescription · ${fd(r.when)}</b></p>
  ${r.tests.length?`<p class="sm"><b>Tests advised:</b> ${E(r.tests.join(", "))}</p>`:""}
  ${r.meds.length?`<ul class="sm">${r.meds.map(m=>`<li>${E(prod(m.pid).name)} × ${m.qty}: ${E(m.dose)}</li>`).join("")}</ul>`:`<p class="mu sm">No medicines prescribed.</p>`}
  ${r.treat.length?`<p class="sm"><b>Clinic treatment advised:</b> ${r.treat.map(t=>E(t.name)+" × "+t.sessions).join("; ")}</p>`:""}
  ${r.advice?`<p class="sm"><b>Advice:</b> ${E(r.advice)}</p>`:""}
  <p class="sm"><b>Follow-up:</b> ${fd(r.follow)}</p>
  <div class="fl">${r.meds.length&&S.stage>=2?`<button class="btn s" onclick="NC.goto('patient','meds')">Order medicines</button>`:""}${r.treat.length&&S.stage>=3?`<button class="btn s" onclick="NC.goto('patient','clinic')">Book clinic treatment</button>`:""}<button class="btn g s" onclick="NC.goto('patient','follow')">Follow-up</button></div>`
  :`<p class="mu sm">Waiting for the consultation. Your doctor will add a prescription after the call.</p>`}</div>`}).join(""):`<div class="card"><p>No appointments yet.</p></div>`}
 <div class="card"><h3>Records</h3><p class="mu sm">Your assessments, kept so every doctor sees the history.</p><ul class="sm">${hist||"<li>None yet</li>"}</ul></div>`;
};
VIEWS["patient.meds"]=()=>{
 const rxs=DB.rx.filter(r=>r.meds.length).reverse();
 const cat=DB.products.filter(p=>p.status==="approved"&&sup(p.sup).status==="verified");
 return `<h2>Medicines</h2><div class="note"><b>Prescription needed</b>Medicines are sold only against a prescription from a registered doctor. The catalogue below is view-only until your doctor prescribes.</div>
 ${rxs.map(r=>{const done=DB.orders.filter(o=>o.rx===r.id);
  return `<div class="card"><h3>From ${E(doc(r.doctor).name)} · ${fd(r.when)}</h3><table><tr><th>Product</th><th>Doctor's dose</th><th>Qty</th><th>Price</th></tr>${r.meds.map(m=>{const p=prod(m.pid);return `<tr><td>${E(p.name)}<br><span class="tag g">GMP verified</span> <span class="mu sm">${E(sup(p.sup).name)} · batch ${E(p.batch)}</span></td><td>${E(m.dose)}</td><td>${m.qty}</td><td>${inr(p.price*m.qty)}</td></tr>`}).join("")}</table>
  <p><b>Total ${inr(rxTotal(r))}</b></p>
  ${done.length?done.map(o=>`<span class="tag a">${E(sup(o.sup).name.split(" (")[0])}: ${E(o.status)}</span>`).join(" "):`<button class="btn s" onclick="NC.placeOrder('${r.id}')">Place order (mock payment)</button>`}</div>`}).join("")||`<div class="card"><p class="mu">No prescription yet. Book a doctor first.</p></div>`}
 <details class="card"><summary><b>Verified catalogue (view only)</b></summary><p class="mu sm">Every product here comes from a supplier whose licence, GMP certificate and batch test report were checked by admin.</p>
 <table><tr><th>Product</th><th>Supplier</th><th>Price</th></tr>${cat.map(p=>`<tr><td>${E(p.name)}<br><span class="mu sm">${E(p.form)}</span></td><td class="sm">${E(sup(p.sup).name)}</td><td>${inr(p.price)}</td></tr>`).join("")}</table></details>`;
};
function placeOrder(rid){
 const r=DB.rx.find(x=>x.id===rid),by={};
 const bad=r.meds.find(m=>{const p=prod(m.pid);return !p||p.status!=="approved"||sup(p.sup).status!=="verified"||(p.hm&&!p.ht)});
 if(bad){toast("A product on this prescription is not approved, so the order cannot be placed");return}
 r.meds.forEach(m=>{const p=prod(m.pid);(by[p.sup]=by[p.sup]||[]).push(m)});
 Object.keys(by).forEach(s=>{const items=by[s].map(m=>({pid:m.pid,qty:m.qty}));DB.orders.push({id:uid(),rx:rid,sup:s,items,total:items.reduce((t,i)=>t+prod(i.pid).price*i.qty,0),status:"placed",when:new Date().toISOString()})});
 save();toast("Order placed (mock)");render();scrollTo(0,0);
}
VIEWS["patient.clinic"]=()=>{
 const rxs=DB.rx.filter(r=>r.treat.length).reverse();
 if(!rxs.length)return `<h2>Clinic treatment</h2><div class="card"><p class="mu">No clinic treatment has been advised yet. Your doctor decides if you need one.</p></div>`;
 const r=rxs[0],done=DB.tbook.find(b=>b.rx===r.id);
 return `<h2>Clinic treatment</h2><div class="card"><h3>Advised by ${E(doc(r.doctor).name)}</h3><ul class="sm">${r.treat.map(t=>`<li>${E(t.name)} × ${t.sessions} sessions</li>`).join("")}</ul></div>
 ${done?`<div class="good">Booked at ${E(cli(done.clinic).name)} on ${E(done.date)}. Total ${inr(done.total)} (pay at clinic).</div>`:`<p class="sm mu">Audited clinics that offer every advised treatment are shown first.</p><div class="grid">${DB.clinics.slice().sort((x,y)=>{const f=c=>(c.status==="audited"&&r.treat.every(t=>c.treat[t.name]))?0:1;return f(x)-f(y)||y.score-x.score}).map(c=>{
  const ok=c.status==="audited",lines=r.treat.map(t=>({n:t.name,s:t.sessions,p:c.treat[t.name]}));const off=lines.every(l=>l.p),tot=lines.reduce((x,l)=>x+(l.p||0)*l.s,0);
  return `<div class="card"><h3>${E(c.name)}</h3><p class="sm">SOP audit score <b>${c.score}%</b> · last audit ${fd(c.last)}</p>
  ${ok?`<span class="tag g">Audited partner</span>`:`<span class="tag w">Not bookable: audit score below 80%</span>`}
  <ul class="sm">${lines.map(l=>`<li>${E(l.n)} × ${l.s}: ${l.p?inr(l.p*l.s):"not offered here"}</li>`).join("")}</ul>
  ${ok&&off?`<div class="fl"><label class="sm">Date <input type="date" id="bd_${c.id}" value="${isoDay(addDays(new Date(),1))}" min="${isoDay(new Date())}"></label><button class="btn s" onclick="NC.bookClinic('${r.id}','${c.id}')">Book · ${inr(tot)}</button></div>`:""}</div>`}).join("")}</div>`}`;
};
function bookClinic(rid,cid){
 const r=DB.rx.find(x=>x.id===rid),c=cli(cid);
 if(c.status!=="audited"){toast("This clinic is not bookable: audit score below 80%");return}
 const d=($("bd_"+cid)||{}).value;if(!d){toast("Pick a date");return}
 const ap0=DB.appts.find(x=>x.id===r.appt);if(ap0&&catPreg(aById(ap0.assess))&&r.treat.some(t=>PROC_INFO[t.name]&&PROC_INFO[t.name].sh)){toast("Shodhana is not allowed when pregnancy or recent delivery is reported");return}
 const items=r.treat.map(t=>({name:t.name,sessions:t.sessions,price:c.treat[t.name]}));
 if(items.some(i=>!i.price)){toast("This clinic does not offer every advised treatment");return}
 DB.tbook.push({id:uid(),rx:rid,clinic:cid,items,total:items.reduce((t,i)=>t+i.price*i.sessions,0),date:d,status:"booked",when:new Date().toISOString()});
 save();toast("Clinic booked");render();scrollTo(0,0);
}
const isoDay=d=>{const x=new Date(d);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
const dayStart=s=>new Date(s+"T09:00:00").toISOString();
VIEWS["patient.follow"]=()=>{
 const r=DB.rx[DB.rx.length-1];
 if(!r)return `<h2>Follow-up</h2><div class="card"><p class="mu">Follow-up starts after your first prescription.</p></div>`;
 const logs=DB.follow.filter(f=>f.rx===r.id).sort((a,b)=>new Date(a.when)-new Date(b.when));
 const pts=logs.map(l=>l.hair),mx=Math.max(1,...pts,1);
 const chart=pts.length>1?`<svg viewBox="0 0 300 90" style="width:100%;max-width:420px"><polyline fill="none" stroke="var(--ac)" stroke-width="2.5" points="${pts.map((v,i)=>`${10+i*(280/Math.max(1,pts.length-1))},${80-(v/mx)*68}`).join(" ")}"/>${pts.map((v,i)=>`<circle cx="${10+i*(280/Math.max(1,pts.length-1))}" cy="${80-(v/mx)*68}" r="3.5" fill="var(--ac)"/>`).join("")}</svg><p class="mu sm">Average hairs lost per day, by check-in date</p>`:`<p class="mu sm">Add at least two check-ins to see your trend.</p>`;
 const today=isoDay(new Date()),rv=isoDay(r.follow),rem=r.remind?isoDay(r.remind):isoDay(addDays(r.follow,-2));
 const d0=doc(r.doctor),booked=DB.appts.find(a=>a.forRx===r.id&&a.status==="booked");
 const times=[...new Set(d0.slots.map(s=>s.split(" ")[1]))];
 return `<h2>Follow-up</h2>
 <div class="card"><h3>Next review: ${fd(r.follow)}</h3>
 ${booked?`<div class="good">Review booked with ${E(doc(booked.doctor).name)}, ${E(booked.slot)}.</div>`:`<p class="mu sm">Book your review with a doctor. The date starts at your review date. You can change it.</p>
 <div class="fl"><label class="sm">Doctor<br><select id="rd">${DB.doctors.filter(x=>x.reg==="verified").map(x=>`<option value="${x.id}" ${x.id===r.doctor?"selected":""}>${E(x.name)} · ${inr(x.fee)}</option>`).join("")}</select></label>
 <label class="sm">Date<br><input type="date" id="rdd" value="${rv<today?today:rv}" min="${today}"></label>
 <label class="sm">Time<br><select id="rdt">${times.map(t=>`<option>${t}</option>`).join("")}</select></label></div>
 <button class="btn s" onclick="NC.bookReview('${r.id}')">Book review (mock payment)</button>`}
 <hr style="border:0;border-top:1px solid var(--ln);margin:14px 0">
 <p class="sm"><b>WhatsApp reminder</b></p>
 <div class="fl"><label class="sm">Remind me on<br><input type="date" id="rmd" value="${rem}" min="${today}" max="${rv}"></label><button class="btn g s" onclick="NC.setRemind('${r.id}')">Set reminder</button></div>
 <p class="mu sm">${r.remind?"Reminder set for "+fd(r.remind)+".":"No reminder set yet."} Prototype: no message is actually sent.</p></div>
 <div class="card"><h3>Log a check-in</h3><div class="fl"><label class="sm">Date of check-in<br><input type="date" id="fdte" value="${today}" max="${today}"></label></div>
 <div class="fl"><label class="sm">Average hairs lost per day (7-day count)<br><input id="fh" type="number" min="0" max="500" style="width:120px"></label>
 <label class="sm">Pull test: hairs out of about 60<br><input id="fp" type="number" min="0" max="60" style="width:120px"></label></div>
 <label class="ck"><input type="checkbox" id="fs"><span>Itching, rash, burning, acidity, loose stools or nausea since the last check-in</span></label>
 <textarea id="fn" placeholder="Notes for your doctor (optional)"></textarea><button class="btn s" style="margin-top:8px" onclick="NC.logFollow('${r.id}')">Save check-in</button></div>
 <div class="card"><h3>Your progress</h3>${chart}${logs.length?`<table><tr><th>Date</th><th>Hairs/day</th><th>Pull test</th><th>Side effects</th></tr>${logs.slice().reverse().map(l=>`<tr><td>${fd(l.when)}</td><td>${l.hair}</td><td>${l.pull}</td><td>${l.side?"Yes":"No"}</td></tr>`).join("")}</table>`:""}</div>`;
};
function logFollow(rid){
 const h=parseInt($("fh").value,10),p=parseInt($("fp").value,10),d=$("fdte").value;
 if(isNaN(h)||isNaN(p)){toast("Enter both numbers");return}
 if(!d||d>isoDay(new Date())){toast("Pick today or an earlier date");return}
 DB.follow.push({id:uid(),rx:rid,when:dayStart(d),hair:h,pull:p,side:$("fs").checked,note:$("fn").value.trim()});save();toast("Saved");render();
}
function setRemind(rid){
 const d=$("rmd").value,r=DB.rx.find(x=>x.id===rid);
 if(!d||d>isoDay(r.follow)||d<isoDay(new Date())){toast("Pick a date from today up to the review date");return}
 r.remind=dayStart(d);save();toast("Reminder set for "+fd(r.remind));render();
}
function bookReview(rid){
 const r=DB.rx.find(x=>x.id===rid),did=$("rd").value,d=$("rdd").value,t=$("rdt").value,dd=doc(did);
 if(!d||d<isoDay(new Date())){toast("Pick a date from today onwards");return}
 const base=DB.appts.find(a=>a.id===r.appt);
 DB.appts.push({id:uid(),doctor:did,slot:fd(dayStart(d))+", "+t,assess:base?base.assess:lastA().id,status:"booked",fee:dd.fee,when:new Date().toISOString(),forRx:rid,review:true});
 save();toast("Review booked (mock payment)");render();
}
