// t13: automatic supplier choice by stock and PIN, split parcels, delivery estimate, back-orders, supplier stock screens
const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const URL='file://'+process.cwd()+'/dist/index.html?demo=1';
 let ok=0,bad=0;const T=(n,c,x)=>{console.log(c?'PASS':'FAIL',n,c?'':(x||''));c?ok++:bad++};
 const CITY={'600':[13.08,80.27],'682':[9.98,76.28],'500':[17.39,78.47],'560':[12.97,77.59]};
 const mk=async(o={})=>{
  const ctx=await b.newContext({viewport:{width:o.w||390,height:900},acceptDownloads:true});
  await ctx.route(/nominatim\.openstreetmap\.org|postalpincode\.in/,r=>{
   if(o.down)return r.abort();
   const m=r.request().url().match(/postalcode=(\d{6})/),c=m&&CITY[m[1].slice(0,3)];
   return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(c?[{lat:String(c[0]),lon:String(c[1])}]:[])})});
  const p=await ctx.newPage();p.on('dialog',d=>d.dismiss());p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.ctx=ctx;
  await p.goto(URL);return p};
 const txt=p=>p.evaluate(()=>document.body.innerText);
 const setv=(p,o)=>p.evaluate(o=>{for(const k in o){const e=document.getElementById(k);if(e)e.value=o[k]}},o);
 const openAll=p=>p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));
 // put the patient in Kochi, set stock, create one prescription with the given lines, open the Medicines page
 const setup=async(p,{pin='682002',stock={},meds=[{pid:'p1',qty:2},{pid:'p3',qty:1}],extra}={})=>{
  await p.evaluate(([pin,stock,meds])=>{const D=NC.DB;D.patient.pin=pin;D.patient.loc=null;D.stock=stock;D.orders=[];D.backorders=[];D.rx=[];
   D.suppliers.forEach(s=>{if(s.id==='s1'){s.ship=60;s.dispatch=1}if(s.id==='s2'){s.ship=50;s.dispatch=1}});
   D.rx.push({id:'rx1',appt:'',doctor:'d1',when:new Date().toISOString(),meds:meds.map(m=>({pid:m.pid,qty:m.qty,dose:'as directed'})),tests:[],treat:[],advice:'',follow:new Date().toISOString()});
   NC.goto('patient','meds')},[pin,stock,meds]);
  if(pin)await p.waitForFunction(()=>NC.DB.patient.loc||(NC.DB.geo&&0),null,{timeout:6000}).catch(()=>{});
  await p.evaluate(()=>NC.render())};
 const shipTxt=async p=>{const t=await txt(p);const i=t.indexOf('How it will ship');return i<0?'':t.slice(i,i+900)};
 const orders=p=>p.evaluate(()=>NC.DB.orders.map(o=>({sup:o.sup,n:o.n,i:o.i,items:o.items,ship:o.ship,total:o.total,late:o.late,lo:o.lo})));
 const dl=async(p,id)=>{const [d]=await Promise.all([p.waitForEvent('download',{timeout:5000}),p.evaluate(i=>NC.dlBill('o',i),id)]);return fs.readFileSync(await d.path(),'latin1')};

 let p=await mk();
 // 1. no PIN: asks once, cannot order
 await setup(p,{pin:'',stock:{p1:{s1:30},p3:{s2:40}}});
 T('no PIN: page asks where to send it, one field',(await txt(p)).includes('Where should we send it?'));
 T('no PIN: order button is disabled',await p.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>/Place order/.test(x.textContent)).every(x=>x.disabled)));
 T('no PIN: placeOrder refuses',await p.evaluate(()=>{NC.placeOrder('rx1');return NC.DB.orders.length===0&&document.getElementById('toast').textContent.includes('PIN')}));
 // entering the PIN in the page shows the plan
 await p.fill('#np','682002');await p.click('text=Show delivery');await p.waitForFunction(()=>NC.DB.patient.loc,null,{timeout:6000});
 T('after the PIN the shipping plan appears',(await shipTxt(p)).includes('How it will ship'));

 // 2. one supplier can do everything: one parcel, from the nearest, soonest
 await setup(p,{stock:{p1:{s1:30},p3:{s1:5,s2:40}}});
 let t=await shipTxt(p);
 T('one supplier covers all: single parcel from the nearest (Sahyadri, Kochi)',/Sahyadri/.test(t)&&!/Parcel 1 of/.test(t)&&!/Deccan/.test(t),t);
 T('local supplier: arrives in 1 to 2 days',/in 1 to 2 days/.test(t),t);
 T('shipping fee and total shown before ordering',/shipping ₹60/.test(t)&&/Total ₹840/.test(t),t);

 // 3. forced split: p1 only at s1, p3 only at s2
 await setup(p,{stock:{p1:{s1:30},p3:{s2:40}}});
 t=await shipTxt(p);
 T('forced split: 2 parcels shown with both suppliers',/2 parcels/.test(t)&&/Sahyadri/.test(t)&&/Deccan/.test(t),t);
 T('distant supplier gets a longer estimate (Kochi to Hyderabad is about 840 km: 4 to 5 days)',/in 4 to 5 days/.test(t)&&/in 1 to 2 days/.test(t),t);
 T('both shipping fees added to the total',/Total ₹890/.test(t),t);

 // 4. fewer parcels at equal speed: s2 can do both (slowest 3 days either way)
 await setup(p,{stock:{p1:{s1:30,s2:30},p3:{s2:40}}});
 t=await shipTxt(p);
 T('equal slowest arrival: fewest parcels wins (one parcel from Deccan)',/Deccan/.test(t)&&!/Sahyadri/.test(t)&&!/2 parcels/.test(t),t);

 // 5. speed beats parcel count: a third, nearby supplier holds p3
 await p.evaluate(()=>{const s=NC.DB.suppliers.find(x=>x.id==='s3');Object.assign(s,{status:'verified',pin:'682010',lat:9.99,lng:76.3,dispatch:1,ship:100,restock:7})});
 await setup(p,{stock:{p1:{s1:30},p3:{s2:40,s3:5}}});
 t=await shipTxt(p);
 T('speed first: nearby third supplier chosen over distant Deccan for the second parcel',/Newleaf/.test(t)&&/Sahyadri/.test(t)&&!/Deccan/.test(t)&&!/in 4 to 5 days/.test(t),t);
 // 6. equal speed and parcels: cheaper shipping wins
 await setup(p,{meds:[{pid:'p3',qty:1}],stock:{p3:{s1:5,s3:5}}});
 t=await shipTxt(p);
 T('equal speed and parcels: lower shipping fee wins (Sahyadri ₹60 beats Newleaf ₹100)',/Sahyadri/.test(t)&&!/Newleaf/.test(t),t);
 await p.evaluate(()=>{NC.DB.suppliers.find(x=>x.id==='s3').status='pending'});

 // 7. quantity split across two suppliers when none holds enough
 await setup(p,{meds:[{pid:'p3',qty:10}],stock:{p3:{s1:6,s2:6}}});
 t=await shipTxt(p);
 T('no single supplier has 10: split quantity across two parcels',/2 parcels/.test(t)&&/× 6/.test(t)&&/× 4/.test(t),t);
 await p.evaluate(()=>NC.placeOrder('rx1'));
 let os=await orders(p);
 T('quantities add up to the prescribed 10 and stock is reduced',os.length===2&&os.reduce((a,o)=>a+o.items.reduce((x,i)=>x+i.qty,0),0)===10&&await p.evaluate(()=>{const s=NC.DB.stock.p3;return s.s1===0&&s.s2===2}),JSON.stringify(os));
 T('parcels carry order group, number and fee',os.every(o=>o.n===2)&&os.map(o=>o.i).sort().join()==='1,2'&&os.every(o=>o.ship>0));
 T('patient sees both parcels with estimated dates',/Parcel 1 of 2/.test(await txt(p))&&/Expected by/.test(await txt(p)));
 T('cannot order the same prescription twice',await p.evaluate(()=>{NC.placeOrder('rx1');return NC.DB.orders.length===2}));

 // 8. shortage: ship what exists, back-order the rest, auto-ship when the supplier restocks
 await setup(p,{meds:[{pid:'p3',qty:10}],stock:{p3:{s1:3}}});
 t=await shipTxt(p);
 T('shortage is explained before ordering, with restock time',/Not in stock right now/.test(t)&&/about 7 days/.test(t)&&/Total ₹480/.test(t),t);
 await p.evaluate(()=>NC.placeOrder('rx1'));
 os=await orders(p);
 T('only the 3 available units ship now',os.length===1&&os[0].items[0].qty===3);
 T('the other 7 are recorded as a waiting back-order',await p.evaluate(()=>NC.DB.backorders.length===1&&NC.DB.backorders[0].status==='waiting'&&NC.DB.backorders[0].items[0].qty===7));
 T('patient sees the waiting item',(await txt(p)).includes('Waiting for stock'));
 await p.evaluate(()=>{NC.setRole('supplier');NC.setCtx&&0});
 await p.evaluate(()=>{NC.goto('supplier','products')});await p.evaluate(()=>{});
 T('supplier stock screen shows the stock table',await (async()=>{await openAll(p);return !!(await p.$('#st_p3'))})());
 await setv(p,{st_p3:'-4'});await p.evaluate(()=>NC.saveStock());
 T('negative stock refused',await p.evaluate(()=>NC.DB.stock.p3.s1===0));
 await setv(p,{st_p3:'2.5'});await p.evaluate(()=>NC.saveStock());
 T('fractional stock refused',await p.evaluate(()=>NC.DB.stock.p3.s1===0));
 await setv(p,{st_p3:'20'});await p.evaluate(()=>NC.saveStock());
 os=await orders(p);
 T('supplier restocks 20: back-order ships automatically as a new parcel',os.length===2&&os[1].items[0].qty===7&&os[1].late===true&&await p.evaluate(()=>NC.DB.backorders[0].status==='filled'&&NC.DB.stock.p3.s1===13));
 T('no JS errors (routing)',p.errs.length===0,p.errs.join('|'));

 // 9. nothing in stock anywhere
 await setup(p,{stock:{}});
 t=await shipTxt(p);
 T('nothing in stock: says so and still lets the patient reserve',/None of these medicines is in stock/.test(t)&&await p.evaluate(()=>[...document.querySelectorAll('button')].some(x=>/Place order/.test(x.textContent)&&!x.disabled)));
 await p.evaluate(()=>NC.placeOrder('rx1'));
 T('reserved: no parcels, a waiting back-order for both items',await p.evaluate(()=>NC.DB.orders.length===0&&NC.DB.backorders.length===1&&NC.DB.backorders[0].items.length===2));

 // 10. two prescriptions cannot oversell the same stock
 await setup(p,{meds:[{pid:'p1',qty:2}],stock:{p1:{s1:2}}});
 await p.evaluate(()=>{NC.DB.rx.push({id:'rx2',appt:'',doctor:'d1',when:new Date().toISOString(),meds:[{pid:'p1',qty:2,dose:'x'}],tests:[],treat:[],advice:'',follow:new Date().toISOString()});NC.placeOrder('rx1');NC.placeOrder('rx2')});
 T('stock of 2 cannot be sold twice',await p.evaluate(()=>NC.DB.stock.p1.s1===0&&NC.DB.orders.length===1&&NC.DB.backorders.length===1));

 // 11. bill shows shipping and parcel number
 await setup(p,{stock:{p1:{s1:30},p3:{s2:40}}});
 await p.evaluate(()=>NC.placeOrder('rx1'));
 const oid=await p.evaluate(()=>NC.DB.orders[0].id);const body=await dl(p,oid);
 T('bill has a shipping line, parcel number and estimated arrival',/Shipping \\?\(parcel 1 of 2\\?\)/.test(body)&&/Parcel 1 of 2/.test(body)&&/Estimated arrival/.test(body)&&/Rs\.60/.test(body));

 // 12. supplier view: ship-to, promised date; dispatch settings change the estimate
 await p.evaluate(()=>{NC.setRole('supplier');NC.goto('supplier','orders')});
 t=await txt(p);
 T('supplier sees ship-to PIN, promised date and dispatch window',/Ship to:/.test(t)&&/PIN 682002/.test(t)&&/arrives by/.test(t)&&/Dispatch within 1 day/.test(t),t.slice(0,400));
 await p.evaluate(()=>{NC.goto('supplier','products')});await openAll(p);
 const sv=async o=>{await setv(p,Object.assign({sp_pin:'682001',sp_d:'1',sp_f:'60',sp_r:'7'},o));return p.evaluate(()=>{const s=NC.DB.suppliers.find(x=>x.id==='s1'),b=[s.pin,s.dispatch,s.ship,s.restock].join();NC.saveShip();return b!==[s.pin,s.dispatch,s.ship,s.restock].join()})};
 T('bad PIN refused',!(await sv({sp_pin:'12'})));
 T('dispatch of 0 or 9 days refused',!(await sv({sp_d:'0'}))&&!(await sv({sp_d:'9'})));
 T('negative or huge shipping fee refused',!(await sv({sp_f:'-1'}))&&!(await sv({sp_f:'99999'})));
 T('restock of 100 days refused',!(await sv({sp_r:'100'})));
 T('valid settings saved',await sv({sp_d:'3',sp_f:'80'}));
 await p.evaluate(()=>{NC.setRole('patient');NC.goto('patient','meds')});
 await p.evaluate(()=>{const D=NC.DB;D.orders=[];D.backorders=[];D.stock={p1:{s1:30},p3:{s1:5}};D.rx=[{id:'rx1',appt:'',doctor:'d1',when:new Date().toISOString(),meds:[{pid:'p1',qty:2,dose:'x'}],tests:[],treat:[],advice:'',follow:new Date().toISOString()}];NC.render()});
 t=await shipTxt(p);
 T('slower dispatch lengthens the promised time (3 + 0 = 3 to 4 days) and new fee shows',/in 3 to 4 days/.test(t)&&/shipping ₹80/.test(t),t);
 // supplier changes PIN to Hyderabad: location is looked up and the estimate grows
 await p.evaluate(()=>{NC.setRole('supplier');NC.goto('supplier','products')});await openAll(p);
 await setv(p,{sp_pin:'500003',sp_d:'1',sp_f:'60',sp_r:'7'});await p.evaluate(()=>NC.saveShip());
 await p.waitForFunction(()=>NC.DB.geo&&NC.DB.geo['500003'],null,{timeout:5000});
 T('changing the supplier PIN triggers a location lookup',await p.evaluate(()=>NC.DB.suppliers.find(x=>x.id==='s1').pin==='500003'));
 await p.evaluate(()=>{NC.setRole('patient');NC.goto('patient','meds')});await p.evaluate(()=>NC.nearEnsure&&0);await p.waitForTimeout(400);
 t=await shipTxt(p);
 T('estimate grows when the supplier is far away (about 840 km: 1+3 = 4 to 5 days)',/in 4 to 5 days/.test(t),t);

 // 13. add stock for another supplier's product
 await p.evaluate(()=>{NC.DB.suppliers.find(x=>x.id==='s1').pin='682001';NC.DB.suppliers.find(x=>x.id==='s1').lat=9.98;NC.DB.suppliers.find(x=>x.id==='s1').lng=76.28;NC.setRole('supplier');NC.goto('supplier','products')});await openAll(p);
 T('supplier can also stock another supplier\'s approved product',await p.evaluate(()=>{const o=document.getElementById('dv_p');if(!o)return false;const pid=o.value;document.getElementById('dv_q').value='9';NC.addDistrib();return NC.DB.stock[pid].s1===9}));
 T('adding stock with 0 units is refused',await p.evaluate(()=>{const o=document.getElementById('dv_p');if(!o)return true;const pid=o.value,before=JSON.stringify(NC.DB.stock[pid]);document.getElementById('dv_q').value='0';NC.addDistrib();return JSON.stringify(NC.DB.stock[pid])===before}));
 // new product with stock
 T('a new product can be listed with units in stock',await p.evaluate(()=>{['an','af','ap','ab','aq'].forEach((k,i)=>document.getElementById(k).value=['Test oil','Oil, 100 ml','200','TB-1','12'][i]);document.getElementById('ac').checked=true;NC.addProduct();const pr=NC.DB.products.at(-1);return pr.name==='Test oil'&&NC.DB.stock[pr.id].s1===12}));
 await p.ctx.close();

 // ---------- geocoder down: estimate falls back to PIN prefixes
 p=await mk({down:true});
 await setup(p,{stock:{p1:{s1:30},p3:{s2:40}}});
 await p.waitForFunction(()=>document.body.innerText.includes('How it will ship'),null,{timeout:12000});await p.waitForTimeout(500);
 t=await shipTxt(p);
 T('offline: still shows a plan, estimates from PIN prefix (682 vs 682 = 1 to 2 days; 682 vs 500 = 4 to 5 days)',/in 1 to 2 days/.test(t)&&/in 4 to 5 days/.test(t),t);
 await p.ctx.close();

 // ---------- old saved data gets stock and supplier PINs on load
 p=await mk();
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('ncDB_v2')||'null')||NC.DB;delete d.stock;delete d.backorders;d.suppliers.forEach(s=>{delete s.pin;delete s.lat;delete s.lng;delete s.dispatch;delete s.ship});localStorage.setItem('ncDB_v2',JSON.stringify(d))});
 await p.reload();
 T('old saved data is upgraded: stock, back-orders and supplier PINs appear',await p.evaluate(()=>!!NC.DB.stock.p1&&Array.isArray(NC.DB.backorders)&&NC.DB.suppliers.find(s=>s.id==='s1').pin==='682001'));
 await p.ctx.close();

 // ---------- onboarding a supplier needs a PIN
 p=await mk();
 await p.evaluate(()=>{NC.setRole('admin');NC.setTab('onboard');document.querySelectorAll('#view details').forEach(d=>d.open=true)});
 const sup=async o=>{await setv(p,Object.assign({ob_sn:'Pune Herbals',ob_sc:'A. Kulkarni',ob_se:'pune@herb.test',ob_sp:'9811100022',ob_ss:'Maharashtra',ob_sz:'560001',ob_sl:'LIC-MH-7001'},o));const n=await p.evaluate(()=>NC.DB.suppliers.length);await p.evaluate(()=>NC.onboardSup());return p.evaluate(n=>NC.DB.suppliers.length-n,n)};
 T('supplier onboarding needs a 6-digit PIN',(await sup({ob_sz:''}))===0&&(await sup({ob_sz:'5600'}))===0);
 T('supplier with a PIN is onboarded and located',(await sup({}))===1&&await p.waitForFunction(()=>NC.DB.geo&&NC.DB.geo['560001'],null,{timeout:5000}).then(()=>true).catch(()=>false));
 T('an unverified supplier is never used for routing',await p.evaluate(()=>{const D=NC.DB,s=D.suppliers.at(-1);D.stock={p3:{[s.id]:50}};D.patient.pin='560002';D.patient.loc=null;D.rx=[{id:'rx9',appt:'',doctor:'d1',when:new Date().toISOString(),meds:[{pid:'p3',qty:1,dose:'x'}],tests:[],treat:[],advice:'',follow:new Date().toISOString()}];D.orders=[];D.backorders=[];NC.placeOrder('rx9');return D.orders.length===0&&D.backorders.length===1}));
 await p.ctx.close();

 // ---------- phone width with two parcels
 for(const w of [375,390]){const q=await mk({w});await setup(q,{stock:{p1:{s1:30},p3:{s2:40}}});await q.waitForTimeout(500);const o1=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);await q.evaluate(()=>NC.placeOrder('rx1'));const o2=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);await q.evaluate(()=>{NC.setRole('supplier');NC.goto('supplier','products');document.querySelectorAll('#view details').forEach(d=>d.open=true)});const o3=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);T('no sideways scroll at '+w+'px (plan, parcels, supplier stock)',!o1&&!o2&&!o3);await q.ctx.close()}
 console.log(ok+' pass '+bad+' fail');await b.close();process.exit(bad?1:0)})();
