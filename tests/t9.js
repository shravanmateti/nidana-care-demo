// t9: logic guards, assay evidence, audit check, labels, fold memory, sticky Rx bar
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const mk=async(w=390)=>{const p=await (await b.newContext({viewport:{width:w,height:800}})).newPage();p.on('dialog',d=>d.dismiss());p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto('file://'+process.cwd()+'/dist/index.html');await p.evaluate(()=>NC.setStage(4));return p};
 let ok=0,bad=0;const T=(n,c,x)=>{console.log(c?'PASS':'FAIL',n,c?'':(x||''));c?ok++:bad++};
 const txt=p=>p.evaluate(()=>document.body.innerText);
 const openAll=p=>p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));
 async function assess(p,id,pick={}){await p.evaluate(i=>alSet(i),id);const n=await p.evaluate(()=>alSteps().length);
  for(let k=0;k<n;k++){const o=await p.$$('button.opt');await o[Math.min(pick[k]??0,o.length-1)].click();await p.click(k<n-1?'text=Next':'text=See summary')}}
 async function toCase(p){await p.click('.nxt button');await p.click('.chips button >> nth=0');await p.click('text=Confirm');await p.click('.nxt button')}

 // ---- item 1: guards inside the functions, not only the screens
 let p=await mk();
 let r=await p.evaluate(()=>{const D=NC.DB;const s=D.suppliers.find(x=>x.status==='verified');
  D.products.push({id:'zz1',sup:s.id,name:'Zz bhasma',form:'Tab',price:10,batch:'B1',status:'pending',ail:[],ref:[],hm:true,ht:false});
  NC.approveProd('zz1');const a=D.products.find(x=>x.id==='zz1').status;
  D.products.push({id:'zz2',sup:s.id,name:'Zz oil',form:'Oil',price:10,batch:'',status:'pending',ail:[],ref:[],hm:false,ht:false});
  NC.approveProd('zz2');const b2=D.products.find(x=>x.id==='zz2').status;
  const sp=D.suppliers.find(x=>x.status!=='verified');let c=null;
  if(sp){sp.licence='';NC.approveSup(sp.id);c=D.suppliers.find(x=>x.id===sp.id).status}
  return {a,b2,c}});
 T('approveProd refuses herbo-mineral with no assay',r.a==='pending',r.a);
 T('approveProd refuses a product with no batch',r.b2==='pending',r.b2);
 T('approveSup refuses a supplier with missing documents',r.c!=='verified',r.c);
 T('doctor not verified cannot be booked (confirmBook)',await (async()=>{await assess(p,'backpain');return p.evaluate(()=>{const d=NC.DB.doctors.find(x=>x.reg!=='verified');const n=NC.DB.appts.length;NC.pickSlot(d.id,d.slots[0]);NC.confirmBook();return NC.DB.appts.length===n})})());

 // pregnant patient: shodhana blocked in drAddTreat
 p=await mk();await assess(p,'backpain',{1:1});await toCase(p);await openAll(p);
 r=await p.evaluate(()=>{const s=document.getElementById('tp');s.value='Nasya (nasal oil therapy)';NC.drAddTreat();return document.body.innerText.includes('Nasya (nasal oil therapy) ×')});
 T('Shodhana cannot be added when pregnant (function guard)',!r);

 // non-pregnant: full loop then mutate and call the functions directly
 p=await mk();await assess(p,'backpain');await toCase(p);await openAll(p);
 await p.click('button:has-text("Agree")');await p.selectOption('#mp',{index:1});await p.fill('#md','as directed, 4 weeks');await p.click('button:has-text("Add"):near(#mq)');
 await p.selectOption('#tp',{index:1});await p.click('details:has(h3:has-text("Clinic treatment")) button:has-text("Add")');
 await p.click('text=Issue prescription');
 r=await p.evaluate(()=>{const D=NC.DB,rx=D.rx[0];const n0=D.orders.length;const pr=D.products.find(x=>x.id===rx.meds[0].pid);const old=pr.status;pr.status='pending';NC.placeOrder(rx.id);const blocked=D.orders.length===n0;pr.status=old;
  const c=D.clinics.find(x=>x.status==='audited');const keep=c.status;c.status='probation';const t0=D.tbook.length;NC.bookClinic(rx.id,c.id);const cb=D.tbook.length===t0;c.status=keep;return {blocked,cb}});
 T('placeOrder refuses an unapproved product',r.blocked);
 T('bookClinic refuses a clinic that is not audited',r.cb);

 // ---- item 2: assay evidence
 p=await mk();await p.evaluate(()=>{NC.setRole('supplier');NC.setTab('products')});
 const fill=async o=>{for(const k of ['an','af','ap','ab'])await p.fill('#'+k,o[k]??'');await p.setChecked('#ac',true);await p.setChecked('#ahm',!!o.hm);await p.setChecked('#aht',!!o.ht);await p.fill('#aal',o.lab??'');await p.fill('#aan',o.no??'');await p.evaluate(d=>{document.getElementById('aad').value=d},o.dt??'')};
 const n0=await p.evaluate(()=>NC.DB.products.length);
 await fill({an:'Bh1',af:'Tab',ap:'50',ab:'B9',hm:true,ht:true});await p.evaluate(()=>NC.addProduct());
 T('assay details required (lab, report no, date)',await p.evaluate(n=>NC.DB.products.length===n,n0));
 await fill({an:'Bh1',af:'Tab',ap:'50',ab:'B9',hm:true,ht:true,lab:'Test Lab',no:'R-1',dt:'2999-01-01'});await p.evaluate(()=>NC.addProduct());
 T('future assay date rejected',await p.evaluate(n=>NC.DB.products.length===n,n0));
 await fill({an:'Bh1',af:'Tab',ap:'50',ab:'B9',hm:true,ht:true,lab:'Test Lab',no:'R-1',dt:'2026-10-01'});await p.evaluate(()=>NC.addProduct());
 T('valid assay stored with product',await p.evaluate(n=>{const x=NC.DB.products.at(-1);return NC.DB.products.length===n+1&&x.assay&&x.assay.lab==='Test Lab'&&x.ht===true},n0));
 await p.evaluate(()=>{NC.setRole('admin');NC.setTab('verify')});await openAll(p);
 T('admin sees assay lab and report number',(await txt(p)).includes('Test Lab')&&(await txt(p)).includes('R-1'));
 const pid=await p.evaluate(()=>NC.DB.products.at(-1).id);
 await p.evaluate(i=>{document.getElementById('rj_'+i).value=''},pid);await p.evaluate(i=>NC.rejectProd(i),pid);
 T('reject needs a reason',await p.evaluate(i=>NC.DB.products.find(x=>x.id===i).status==='pending',pid));
 await p.evaluate(i=>{document.getElementById('rj_'+i).value='Report is older than 12 months'},pid);await p.evaluate(i=>NC.rejectProd(i),pid);
 T('product rejected with reason',await p.evaluate(i=>{const x=NC.DB.products.find(y=>y.id===i);return x.status==='rejected'&&x.reason.length>0},pid));

 // ---- item 3: empty self-audit
 p=await mk();await p.evaluate(()=>{NC.setRole('clinic');NC.setTab('audit')});
 const a0=await p.evaluate(()=>NC.DB.audits.length);await p.click('button:has-text("Save self-audit")');
 T('empty self-audit is not saved',await p.evaluate(n=>NC.DB.audits.length===n,a0));
 await p.check('.ack >> nth=0');T('live tick count shown',(await txt(p)).includes('1 of'));
 await p.click('button:has-text("Save self-audit")');T('ticked self-audit saves',await p.evaluate(n=>NC.DB.audits.length===n+1,a0));

 // ---- item 5: every visible field has a name; links are tappable
 const roles={patient:['assess','book','care','meds','clinic','follow'],doctor:['inbox','appts','cat','plan'],supplier:['products','orders','plan'],clinic:['bookings','audit','plan'],admin:['funnel','verify','cat','revenue','settings']};
 for(const w of [390,1280]){const q=await mk(w);const un=[];const sm=[];
  for(const [rl,tabs] of Object.entries(roles))for(const t of tabs){await q.evaluate(([r,t])=>{NC.setRole(r);NC.setTab(t)},[rl,t]);await openAll(q);
   const m=await q.evaluate(()=>({u:[...document.querySelectorAll('input,select,textarea')].filter(e=>e.type!=='hidden'&&e.getBoundingClientRect().width>0&&!(e.labels&&e.labels.length)&&!e.getAttribute('aria-label')).length,l:[...document.querySelectorAll('#view a')].filter(a=>{const r=a.getBoundingClientRect();return r.width>0&&r.height<40&&innerWidth<700}).length}));
   if(m.u)un.push(rl+'.'+t+':'+m.u);if(m.l)sm.push(rl+'.'+t+':'+m.l)}
  T('all fields labelled at '+w+'px',un.length===0,un.join(' '));T('source links at least 40px tall at '+w+'px',sm.length===0,sm.join(' '))}

 // ---- item 4/4b: folds and remembered state, sticky Rx bar
 p=await mk(390);await p.evaluate(()=>{NC.setRole('doctor');NC.setTab('cat')});
 T('catalogue sections start collapsed on phone',await p.evaluate(()=>[...document.querySelectorAll('#view details.card')].every(d=>!d.open)));
 await p.evaluate(()=>{document.querySelector('#view details.card').open=true});
 await p.selectOption('#view select',{index:1});
 T('catalogue open state kept after changing the filter',await p.evaluate(()=>document.querySelector('#view details.card').open));
 p=await mk(390);await assess(p,'backpain');await toCase(p);
 T('Medicines open, Treatment and Advice folded on phone',await p.evaluate(()=>{const d=[...document.querySelectorAll('#view details.card')];return d.length>=3&&d[d.length-3].open&&!d[d.length-2].open&&!d[d.length-1].open}));
 await p.evaluate(()=>{const d=[...document.querySelectorAll('#view details.card')];d[d.length-2].open=true});await p.click('button:has-text("Agree")');
 T('Treatment fold stays open after a re-render',await p.evaluate(()=>{const d=[...document.querySelectorAll('#view details.card')];return d[d.length-2].open}));
 T('Issue prescription button visible without scrolling',await p.evaluate(()=>{const b=document.querySelector('.rxbar button').getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight}));
 const h=await p.evaluate(()=>document.documentElement.scrollHeight);
 T('case sheet shorter than before (<2700px with folds closed)',await (async()=>{const q=await mk(390);await assess(q,'backpain');await toCase(q);return (await q.evaluate(()=>document.documentElement.scrollHeight))<2700})(),'height '+h);
 T('no JS errors',p.errs.length===0,p.errs.join('|'));
 console.log(ok+' pass '+bad+' fail');await b.close();process.exit(bad?1:0)})();
