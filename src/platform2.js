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
  :`<p class="mu sm">Waiting for the consultation. Your doctor will add a prescription after the call.</p>`}<div class="fl" style="margin-top:6px">${billBtn("a",ap.id)}</div></div>`}).join(""):`<div class="card"><p>No appointments yet.</p></div>`}
 <div class="card"><h3>Records</h3><p class="mu sm">Your assessments, kept so every doctor sees the history.</p><ul class="sm">${hist||"<li>None yet</li>"}</ul></div>`;
};
/* ---------- medicines: automatic supplier choice, split parcels, delivery estimate ---------- */
const stockOf=(pid,sid)=>(((DB.stock||{})[pid]||{})[sid])|0;
const aggr=meds=>{const m={};meds.forEach(x=>{m[x.pid]=(m[x.pid]||0)+x.qty});return Object.keys(m).map(pid=>({pid,qty:m[pid]}))};
const transitDays=km=>km<50?0:km<300?1:km<800?2:km<1500?3:4;
const prefixDays=(a,b)=>{a=String(a||"");b=String(b||"");return !a||!b?3:a.slice(0,3)===b.slice(0,3)?0:a.slice(0,2)===b.slice(0,2)?1:a[0]===b[0]?2:3};
const supLoc=x=>isFinite(x.lat)?{lat:x.lat,lng:x.lng}:(x.pin&&DB.geo&&DB.geo[x.pin]&&isFinite(DB.geo[x.pin].lat)?DB.geo[x.pin]:null);
function etaFor(x){
 const P=DB.patient||{},l=supLoc(x),me=P.loc,km=me&&l?kmBetween(me,l):null;
 const lo=Math.max(1,parseInt(x.dispatch,10)||1)+(km!=null?transitDays(km):prefixDays(P.pin,x.pin));
 return {lo,hi:lo+1,km}
}
const cmpKey=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];return 0};
/* Exact search: try every set of verified suppliers (at most 12, fastest first) that can cover the order.
   Pick the set whose slowest parcel arrives soonest, then fewest parcels, then lowest shipping. Exact products only. */
function planFor(lines){
 const sups=DB.suppliers.filter(x=>x.status==="verified"),info={};
 sups.forEach(x=>{info[x.id]=Object.assign({fee:Math.max(0,+x.ship||0)},etaFor(x))});
 const want=[],back=[];
 lines.forEach(l=>{const tot=sups.reduce((t,x)=>t+stockOf(l.pid,x.id),0),have=Math.min(l.qty,tot);if(have>0)want.push({pid:l.pid,qty:have});if(l.qty>have){const pr=prod(l.pid),ps=pr&&sup(pr.sup);back.push({pid:l.pid,qty:l.qty-have,days:(ps&&parseInt(ps.restock,10))||7})}});
 const fast=(a,b)=>info[a.id].lo-info[b.id].lo||(a.id<b.id?-1:1);
 const cand=sups.filter(x=>want.some(w=>stockOf(w.pid,x.id)>0)).sort(fast).slice(0,12);
 let best=null;
 if(want.length)for(let m=1;m<(1<<cand.length);m++){
  const set=cand.filter((_,k)=>m>>k&1);
  if(!want.every(w=>set.reduce((t,x)=>t+stockOf(w.pid,x.id),0)>=w.qty))continue;
  const asg={};
  want.forEach(w=>{
   const one=set.find(x=>stockOf(w.pid,x.id)>=w.qty);
   if(one){(asg[one.id]=asg[one.id]||[]).push({pid:w.pid,qty:w.qty});return}
   let left=w.qty;set.forEach(x=>{const q=Math.min(left,stockOf(w.pid,x.id));if(q>0){(asg[x.id]=asg[x.id]||[]).push({pid:w.pid,qty:q});left-=q}})});
  const used=Object.keys(asg),key=[Math.max.apply(null,used.map(id=>info[id].lo)),used.length,used.reduce((t,id)=>t+info[id].fee,0)];
  if(!best||cmpKey(key,best.key)<0)best={key,asg}
 }
 const parcels=best?Object.keys(best.asg).map(id=>{const e=info[id];return {sup:id,items:best.asg[id],lo:e.lo,hi:e.hi,fee:e.fee,subtotal:best.asg[id].reduce((t,it)=>t+prod(it.pid).price*it.qty,0)}}).sort((a,b)=>a.lo-b.lo||(a.sup<b.sup?-1:1)):[];
 const items=parcels.reduce((t,pc)=>t+pc.subtotal,0),ship=parcels.reduce((t,pc)=>t+pc.fee,0);
 return {parcels,back,items,ship,grand:items+ship}
}
const etaTxt=(lo,hi,when)=>`in ${lo} to ${hi} days (by ${fd(addDays(when||new Date(),hi))}), estimated`;
function makeOrders(rid,plan,late){
 const grp=uid(),n=plan.parcels.length,now=new Date().toISOString();
 plan.parcels.forEach((pc,k)=>{
  pc.items.forEach(it=>{DB.stock[it.pid][pc.sup]-=it.qty});
  DB.orders.push({id:uid(),rx:rid,grp,i:k+1,n,sup:pc.sup,items:pc.items,total:pc.subtotal,ship:pc.fee,lo:pc.lo,hi:pc.hi,eta:addDays(new Date(),pc.hi),late:!!late,status:"placed",when:now})})
}
/* when a supplier adds stock, waiting back-orders ship automatically */
function fillBackorders(){
 let n=0;
 DB.backorders.filter(b=>b.status==="waiting").forEach(b=>{
  const plan=planFor(b.items);if(!plan.parcels.length)return;
  makeOrders(b.rx,plan,true);n+=plan.parcels.length;
  b.items=plan.back.map(x=>({pid:x.pid,qty:x.qty}));if(!b.items.length)b.status="filled"});
 return n
}
function pinAsk(){return `<div class="note sm"><b>Where should we send it?</b> Enter your PIN code. We pick the suppliers that can deliver soonest and show you the dates.<div class="fl" style="margin-top:6px"><input id="np" inputmode="numeric" maxlength="6" placeholder="Your PIN code" aria-label="Your PIN code" style="width:140px"><button class="btn s" onclick="NC.setPin()">Show delivery</button></div></div>`}
function shipHtml(r){
 const plan=planFor(aggr(r.meds));
 const lines=pc=>pc.items.map(it=>E(prod(it.pid).name)+" × "+it.qty).join(", ");
 return {plan,html:`<div class="note sm"><b>How it will ship</b>${plan.parcels.length>1?` <span class="tag a">${plan.parcels.length} parcels</span>`:""}
 <ul>${plan.parcels.map((pc,k)=>`<li>${plan.parcels.length>1?"Parcel "+(k+1)+" of "+plan.parcels.length+": ":""}${lines(pc)}<br><span class="mu">From ${E(sup(pc.sup).name.split(" (")[0])} · arrives ${etaTxt(pc.lo,pc.hi)} · shipping ${pc.fee?inr(pc.fee):"free"}</span></li>`).join("")||"<li>None of these medicines is in stock right now.</li>"}</ul>
 ${plan.back.length?`<p class="warn sm"><b>Not in stock right now:</b> ${plan.back.map(b=>E(prod(b.pid).name)+" × "+b.qty).join(", ")}. Restock is expected in about ${Math.max.apply(null,plan.back.map(b=>b.days))} days. It ships on its own as soon as it arrives, with no extra step from you, and you pay for it now.</p>`:""}
 <p style="margin:6px 0 0">Medicines ${inr(plan.items)} · Shipping ${plan.ship?inr(plan.ship):"free"} · <b>Total ${inr(plan.grand)}</b></p></div>`}
}
VIEWS["patient.meds"]=()=>{
 const rxs=DB.rx.filter(r=>r.meds.length).reverse(),P=DB.patient||{};
 const cat=DB.products.filter(p=>p.status==="approved"&&sup(p.sup).status==="verified");
 const ordered=r=>DB.orders.some(o=>o.rx===r.id)||DB.backorders.some(b=>b.rx===r.id);
 const need=rxs.some(r=>!ordered(r))&&!(P.pin||P.loc);
 setTimeout(nearEnsure,0);
 return `<h2>Medicines</h2><div class="note"><b>Prescription needed</b>Medicines are sold only against a prescription from a registered doctor. The catalogue below is view-only until your doctor prescribes.</div>
 ${need?pinAsk():""}
 ${rxs.map(r=>{const done=DB.orders.filter(o=>o.rx===r.id),bo=DB.backorders.filter(b=>b.rx===r.id&&b.status==="waiting");
  const sh=!ordered(r)&&(P.pin||P.loc)?shipHtml(r):null;
  return `<div class="card"><h3>From ${E(doc(r.doctor).name)} · ${fd(r.when)}</h3><table><tr><th>Product</th><th>Doctor's dose</th><th>Qty</th><th>Price</th></tr>${r.meds.map(m=>{const p=prod(m.pid);return `<tr><td>${E(p.name)}<br><span class="tag g">GMP verified</span> <span class="mu sm">${E(sup(p.sup).name)} · batch ${E(p.batch)}</span></td><td>${E(m.dose)}</td><td>${m.qty}</td><td>${inr(p.price*m.qty)}</td></tr>`}).join("")}</table>
  <p><b>Medicines ${inr(rxTotal(r))}</b></p>
  ${sh?sh.html:""}
  ${done.length?done.map(o=>`<div class="fl" style="border-top:1px solid var(--ln);padding:8px 0"><span class="sm" style="flex:1"><b>${o.n>1?"Parcel "+o.i+" of "+o.n:"Your parcel"}</b> from ${E(sup(o.sup).name.split(" (")[0])} <span class="tag ${o.status==="delivered"?"g":"a"}">${E(o.status)}</span><br>${o.items.map(i=>E(prod(i.pid).name)+" × "+i.qty).join(", ")}<br><span class="mu">${o.status==="delivered"?"Delivered":(o.eta?"Expected by "+fd(o.eta)+" (estimated, "+o.lo+" to "+o.hi+" days after "+(o.late?"restock":"ordering")+")":"")}${o.ship?" · shipping "+inr(o.ship):""}</span></span>${billBtn("o",o.id)}</div>`).join(""):""}
  ${bo.map(b=>`<p class="warn sm"><b>Waiting for stock:</b> ${b.items.map(i=>E(prod(i.pid).name)+" × "+i.qty).join(", ")}. We will ship it automatically when it is back in stock.</p>`).join("")}
  ${!ordered(r)?`<button class="btn s" ${sh&&sh.plan.parcels.length+sh.plan.back.length?"":"disabled"} onclick="NC.placeOrder('${r.id}')">Place order (mock payment)${sh?" · "+inr(sh.plan.grand):""}</button>`:""}</div>`}).join("")||`<div class="card"><p class="mu">No prescription yet. Book a doctor first.</p></div>`}
 <details class="card"><summary><b>Verified catalogue (view only)</b></summary><p class="mu sm">Every product here comes from a supplier whose licence, GMP certificate and batch test report were checked by admin.</p>
 <table><tr><th>Product</th><th>Supplier</th><th>Price</th></tr>${cat.map(p=>`<tr><td>${E(p.name)}<br><span class="mu sm">${E(p.form)}</span></td><td class="sm">${E(sup(p.sup).name)}</td><td>${inr(p.price)}</td></tr>`).join("")}</table></details>`;
};
function placeOrder(rid){
 const r=DB.rx.find(x=>x.id===rid),P=DB.patient||{};
 if(!r)return;
 const bad=r.meds.find(m=>{const p=prod(m.pid);return !p||p.status!=="approved"||sup(p.sup).status!=="verified"||(p.hm&&!p.ht)});
 if(bad){toast("A product on this prescription is not approved, so the order cannot be placed");return}
 if(DB.orders.some(o=>o.rx===rid)||DB.backorders.some(b=>b.rx===rid)){toast("This prescription has already been ordered");return}
 if(!(P.pin||P.loc)){toast("Add your PIN code first so we can work out delivery");return}
 const plan=planFor(aggr(r.meds));
 makeOrders(rid,plan,false);
 if(plan.back.length)DB.backorders.push({id:uid(),rx:rid,items:plan.back.map(x=>({pid:x.pid,qty:x.qty})),when:new Date().toISOString(),status:"waiting"});
 save();toast(plan.parcels.length?(plan.parcels.length>1?"Order placed in "+plan.parcels.length+" parcels (mock)":"Order placed (mock)"):"Order recorded. It ships when back in stock");render();scrollTo(0,0);
}
VIEWS["patient.clinic"]=()=>{
 const rxs=DB.rx.filter(r=>r.treat.length).reverse(),r=rxs[0],done=r&&DB.tbook.find(b=>b.rx===r.id),P=DB.patient;
 setTimeout(nearEnsure,0);
 if(done)return `<h2>Clinic treatment</h2><div class="good">Booked at ${E(cli(done.clinic).name)} on ${E(done.date)}. Total ${inr(done.total)} (pay at clinic).<div class="fl" style="margin-top:8px">${billBtn("t",done.id)}</div></div>`;
 const rank=nearRank(DB.clinics.slice(),r);
 return `${r?`<h2>Clinic treatment</h2><div class="card"><h3>Advised by ${E(doc(r.doctor).name)}</h3><ul class="sm">${r.treat.map(t=>`<li>${E(t.name)} × ${t.sessions} sessions</li>`).join("")}</ul></div>`:`<h2>Clinics near you</h2><p class="mu sm">Your doctor will tell you if you need a clinic treatment. Until then, this is a view-only list.</p>`}
 ${nearCard()}
 ${r?`<p class="sm mu">Audited clinics that offer every advised treatment are shown first, then the nearest.</p>`:""}<div class="grid">${rank.map(x=>{const c=x.c;
  const ok=c.status==="audited";
  const head=`<h3>${E(c.name)}</h3><p class="sm">${nearTxt(x)}${c.city?" · "+E(c.city):""}${c.pin?" · PIN "+E(c.pin):""}<br>SOP audit score <b>${c.score}%</b> · last audit ${lastTxt(c)}</p>${ok?`<span class="tag g">Audited partner</span>`:`<span class="tag w">Not bookable: audit score below 80%</span>`} <div style="margin-top:8px"><a class="btn g s dir" href="${mapsUrl(c)}" target="_blank" rel="noopener">Directions in Google Maps</a></div>`;
  if(!r)return `<div class="card">${head}<p class="sm">Offers ${Object.keys(c.treat).length} treatments.</p></div>`;
  const lines=r.treat.map(t=>({n:t.name,s:t.sessions,p:c.treat[t.name]}));const off=lines.every(l=>l.p),tot=lines.reduce((y,l)=>y+(l.p||0)*l.s,0);
  return `<div class="card">${head}
  <ul class="sm">${lines.map(l=>`<li>${E(l.n)} × ${l.s}: ${l.p?inr(l.p*l.s):"not offered here"}</li>`).join("")}</ul>
  ${ok&&off?`<div class="fl"><label class="sm">Date <input type="date" id="bd_${c.id}" value="${isoDay(addDays(new Date(),1))}" min="${isoDay(new Date())}"></label><button class="btn s" onclick="NC.bookClinic('${r.id}','${c.id}')">Book · ${inr(tot)}</button></div>`:""}</div>`}).join("")}</div>`;
};
/* ---------- clinics near the patient: PIN code or device location, no paid map service ---------- */
const PIN_RE=/^[1-9]\d{5}$/;
const rad=x=>x*Math.PI/180;
const kmBetween=(a,b)=>{const dl=rad(b.lat-a.lat),dn=rad(b.lng-a.lng),q=Math.sin(dl/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dn/2)**2;return 12742*Math.asin(Math.sqrt(q))};
async function getJ(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);try{const r=await fetch(url,{signal:c.signal,headers:{Accept:"application/json"}});return r.ok?await r.json():null}catch(e){return null}finally{clearTimeout(t)}}
async function geoPin(pin){
 DB.geo=DB.geo||{};const k=DB.geo[pin];if(k&&isFinite(k.lat))return k;
 let g=null;const ok=a=>a&&a[0]&&isFinite(+a[0].lat)&&isFinite(+a[0].lon);
 const a=await getJ("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&postalcode="+pin);
 if(ok(a))g={lat:+a[0].lat,lng:+a[0].lon};
 if(!g){const b=await getJ("https://api.postalpincode.in/pincode/"+pin),po=b&&b[0]&&b[0].PostOffice&&b[0].PostOffice[0];
  if(po){const c=await getJ("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q="+encodeURIComponent([po.Name,po.District,po.State].join(", ")));if(ok(c))g={lat:+c[0].lat,lng:+c[0].lon}}}
 if(!g)return null;
 g={lat:Math.round(g.lat*1000)/1000,lng:Math.round(g.lng*1000)/1000};DB.geo[pin]=g;return g
}
const clinicLoc=c=>{if(isFinite(c.lat))return {lat:c.lat,lng:c.lng};const g=c.pin&&DB.geo&&DB.geo[c.pin];return g&&isFinite(g.lat)?g:null};
function nearRank(list,r){
 const P=DB.patient||{},me=P.loc;
 const rows=list.map(c=>{const cl=clinicLoc(c);return {c,d:me&&cl?kmBetween(me,cl):null,gap:P.pin&&c.pin?Math.abs(parseInt(P.pin,10)-parseInt(c.pin,10)):1e9}});
 const grp=x=>r?((x.c.status==="audited"&&r.treat.every(t=>x.c.treat[t.name]))?0:1):0;
 const known=me||P.pin;
 return rows.sort((x,y)=>grp(x)-grp(y)||(known?((x.d==null)-(y.d==null)||(x.d!=null?x.d-y.d:x.gap-y.gap)):0)||y.c.score-x.c.score)
}
function nearTxt(x){
 const P=DB.patient||{};
 if(x.d!=null)return `<b>about ${x.d<10?x.d.toFixed(1):Math.round(x.d)} km away</b> (straight line)`;
 if(P.pin&&x.c.pin)return String(P.pin).slice(0,3)===String(x.c.pin).slice(0,3)?"<b>in your PIN area</b>":"distance not available";
 return "";
}
const mapsUrl=c=>"https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent([String(c.name).replace(/ \(sample\)/,""),c.address||"",c.city||"",c.pin||""].filter(Boolean).join(", "));
function nearCard(){
 const P=DB.patient||{},me=P.loc,fail=P.pin&&!me&&S.geoFail&&S.geoFail[P.pin];
 const st=me?`Showing the nearest first, from ${me.src==="device"?"your device location":"PIN "+E(P.pin)}.`:P.pin?(fail?"Could not look up that PIN online, so clinics are ordered by how close their PIN number is. Try 'Use my location' for distances.":"Looking up your PIN…"):"Enter your PIN code or use your location to see the nearest clinics first.";
 return `<div class="card"><h3>Clinics near you</h3><div class="fl"><input id="np" inputmode="numeric" maxlength="6" placeholder="Your PIN code" aria-label="Your PIN code" value="${E(P.pin||"")}" style="width:140px"><button class="btn s" onclick="NC.setPin()">Find clinics</button><button class="btn g s" onclick="NC.useLoc()">Use my location</button>${P.pin||me?`<button class="btn g s" onclick="NC.forgetLoc()">Clear</button>`:""}</div>
 <p class="sm" id="nearSt" role="status">${st}</p><p class="mu sm">Free to use. Your PIN is sent to OpenStreetMap to find the area; your device location never leaves this browser and is saved only as an approximate point. Distances are straight-line, not road distance.</p></div>`
}
let nearBusy=false;
async function nearEnsure(){
 if(nearBusy)return;nearBusy=true;let ch=false;S.geoFail=S.geoFail||{};
 try{const P=DB.patient;
  if(P.pin&&!P.loc&&!S.geoFail[P.pin]){const g=await geoPin(P.pin);if(g){P.loc={lat:g.lat,lng:g.lng,src:"pin"};ch=true}else{S.geoFail[P.pin]=1;ch=true}}
  for(const c of DB.clinics.concat(DB.suppliers.filter(x=>x.status==="verified"))){if(!clinicLoc(c)&&c.pin&&!S.geoFail[c.pin]){const g=await geoPin(c.pin);if(g)ch=true;else S.geoFail[c.pin]=1}}
 }finally{nearBusy=false}
 if(ch){save();if(S.role==="patient"&&(S.tab==="clinic"||S.tab==="meds"))render()}
}
function setPin(){const v=val("np");if(!PIN_RE.test(v)){toast("Enter a 6-digit PIN code");return}const P=DB.patient;P.pin=v;P.loc=null;if(S.geoFail)delete S.geoFail[v];save();render()}
function useLoc(){
 if(!navigator.geolocation){toast("This browser cannot share location. Enter your PIN code instead.");return}
 toast("Asking your browser for your location");
 navigator.geolocation.getCurrentPosition(p=>{DB.patient.loc={lat:Math.round(p.coords.latitude*100)/100,lng:Math.round(p.coords.longitude*100)/100,src:"device"};save();render()},
  e=>toast(e&&e.code===1?"Location permission was refused. Enter your PIN code instead.":"Could not get your location. Enter your PIN code instead."),{timeout:8000,maximumAge:600000})
}
function forgetLoc(){const P=DB.patient;P.pin="";P.loc=null;save();render()}
/* ---------- downloadable bills (a real PDF, no libraries, one tap) ---------- */
const billBtn=(k,id)=>`<button class="btn g s" onclick="NC.dlBill('${k}','${id}')">Download bill (PDF)</button>`;
const billNo=(k,x)=>"NC-"+k.toUpperCase()+"-"+isoDay(x.when).replace(/-/g,"")+"-"+String(x.id).slice(-4).toUpperCase();
function billFor(k,id){
 const P=DB.patient||{},b={patient:P.name||"Patient",phone:P.phone||""};
 if(k==="a"){const x=DB.appts.find(y=>y.id===id);if(!x)return null;const d=doc(x.doctor)||{};
  return Object.assign(b,{no:billNo(k,x),title:x.review?"Follow-up consultation":"Online consultation",date:x.when,provider:d.name||"Doctor",provReg:d.regno?"Council registration no. "+d.regno:"",extra:"Appointment slot: "+x.slot,lines:[{d:(x.review?"Follow-up consultation":"Online consultation")+", "+x.slot,q:1,u:x.fee,a:x.fee}],total:x.fee,pay:"Paid online (mock payment, no real money was taken)"})}
 if(k==="o"){const x=DB.orders.find(y=>y.id===id);if(!x)return null;const s=sup(x.sup)||{};
  const lines=x.items.map(i=>{const p=prod(i.pid)||{};return {d:(p.name||"Item")+(p.batch?" (batch "+p.batch+")":""),q:i.qty,u:p.price||0,a:(p.price||0)*i.qty}});if(x.ship)lines.push({d:"Shipping"+(x.n>1?" (parcel "+x.i+" of "+x.n+")":""),q:1,u:x.ship,a:x.ship});
  return Object.assign(b,{no:billNo(k,x),title:"Medicines order",date:x.when,provider:s.name||"Supplier",provReg:s.licence?"Drug licence no. "+s.licence:"",extra:(x.n>1?"Parcel "+x.i+" of "+x.n+". ":"")+"Order status: "+x.status+(x.eta?". Estimated arrival "+fd(x.eta):""),lines,total:lines.reduce((t,l)=>t+l.a,0),pay:"Paid online (mock payment, no real money was taken)"})}
 if(k==="t"){const x=DB.tbook.find(y=>y.id===id);if(!x)return null;const c=cli(x.clinic)||{};
  const lines=x.items.map(i=>({d:i.name+", "+i.sessions+(i.sessions>1?" sessions":" session"),q:i.sessions,u:i.price,a:i.price*i.sessions}));
  return Object.assign(b,{no:billNo(k,x),title:"Clinic treatment",date:x.when,provider:c.name||"Clinic",provReg:c.regno?"Clinic registration no. "+c.regno:"",extra:"Treatment start date: "+x.date,lines,total:lines.reduce((t,l)=>t+l.a,0),pay:"To be paid at the clinic. Nothing has been paid yet."})}
 return null
}
const pdfT=s=>String(s==null?"":s).replace(/₹/g,"Rs.").replace(/×/g,"x").replace(/[–—]/g,"-").replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[^\x20-\x7E]/g,"?");
const pdfE=s=>pdfT(s).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
const rs=n=>"Rs."+Math.round(n).toLocaleString("en-IN");
function wrapTxt(s,n){const o=[];let c="";pdfT(s).split(/\s+/).filter(Boolean).forEach(w=>{while(w.length>n){if(c){o.push(c);c=""}o.push(w.slice(0,n));w=w.slice(n)}if((c?c.length+1:0)+w.length>n){o.push(c);c=w}else c=c?c+" "+w:w});if(c)o.push(c);return o.length?o:[""]}
function billPages(b){
 const pages=[];let c="",y=0;
 const np=()=>{if(c)pages.push(c);c="";y=790};
 const t=(f,sz,x,s)=>{c+=`BT /${f} ${sz} Tf ${x} ${y} Td (${pdfE(s)}) Tj ET\n`};
 const rule=()=>{c+=`0.6 w 50 ${y} m 545 ${y} l S\n`};
 const dn=n=>{y-=n;if(y<70){np();}};
 np();
 t("F2",20,50,"Nidana Care");t("F1",10,400,"RECEIPT");y-=14;t("F1",8,50,"Prototype receipt: sample data, not a tax invoice, not medical advice.");y-=10;rule();y-=18;
 [["Bill no.",b.no],["Date",new Date(b.date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})],["Type",b.title],["Patient",b.patient+(b.phone?" ("+b.phone+")":"")],["Provider",b.provider],b.provReg?["",b.provReg]:null,b.extra?["",b.extra]:null].filter(Boolean).forEach(r=>{t("F2",10,50,r[0]);t("F1",10,130,r[1]);dn(15)});
 y-=6;rule();y-=16;
 const D=44,col=(d,q,u,a)=>d.padEnd(D)+" "+String(q).padStart(3)+" "+u.padStart(11)+" "+a.padStart(12);
 t("F4",9,50,col("Description","Qty","Rate","Amount"));dn(8);rule();dn(13);
 b.lines.forEach(l=>{const w=wrapTxt(l.d,D);w.forEach((x,i)=>{t("F3",9,50,i?x:col(x,l.q,rs(l.u),rs(l.a)));dn(12)})});
 dn(0);rule();dn(16);t("F4",9,50,col("TOTAL","","",rs(b.total)));dn(22);
 t("F2",10,50,"Payment");dn(14);wrapTxt(b.pay,95).forEach(x=>{t("F1",10,50,x);dn(13)});
 dn(10);wrapTxt("This receipt was generated by a prototype for demonstration. No real payment was collected and no goods or services were supplied. Keep it only as a sample.",110).forEach(x=>{t("F1",8,50,x);dn(11)});
 np();return pages
}
function makePdf(pages){
 const objs=[],add=s=>objs.push(s);
 add("<< /Type /Catalog /Pages 2 0 R >>");add("");
 ["Helvetica","Helvetica-Bold","Courier","Courier-Bold"].forEach(f=>add(`<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`));
 const kids=[];
 pages.forEach(c=>{const pid=objs.length+1;kids.push(pid+" 0 R");add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> /Contents ${pid+1} 0 R >>`);add(`<< /Length ${c.length} >>\nstream\n${c}endstream`)});
 objs[1]=`<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} >>`;
 let out="%PDF-1.4\n";const off=[];
 objs.forEach((o,i)=>{off.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
 const xr=out.length;
 out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+off.map(o=>String(o).padStart(10,"0")+" 00000 n \n").join("")+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF\n`;
 return new Blob([out],{type:"application/pdf"})
}
function dlBill(k,id){
 const b=billFor(k,id);if(!b){toast("Could not find that bill");return}
 const blob=makePdf(billPages(b)),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="Nidana-Care-bill-"+b.no+".pdf";document.body.appendChild(a);a.click();
 setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},3000);toast("Bill downloaded")
}
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
