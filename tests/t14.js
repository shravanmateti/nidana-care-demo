// t14: delivery address collection and order tracking (patient timeline, supplier dispatch details)
const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const URL='file://'+process.cwd()+'/dist/index.html?demo=1';
 let ok=0,bad=0;const T=(n,c,x)=>{console.log(c?'PASS':'FAIL',n,c?'':(x||''));c?ok++:bad++};
 const CITY={'682':[9.98,76.28],'500':[17.39,78.47],'560':[12.97,77.59]};
 const mk=async(w=390)=>{
  const ctx=await b.newContext({viewport:{width:w,height:900},acceptDownloads:true});
  await ctx.route(/nominatim\.openstreetmap\.org|postalpincode\.in/,r=>{
   const m=r.request().url().match(/postalcode=(\d{6})/),c=m&&CITY[m[1].slice(0,3)];
   return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(c?[{lat:String(c[0]),lon:String(c[1])}]:[])})});
  const p=await ctx.newPage();p.on('dialog',d=>d.dismiss());p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.ctx=ctx;
  await p.goto(URL);return p};
 const txt=p=>p.evaluate(()=>document.body.innerText);
 const setv=(p,o)=>p.evaluate(o=>{for(const k in o){const e=document.getElementById(k);if(e)e.value=o[k]}},o);
 const GOOD={ad_n:'Asha Rao',ad_p:'9847012345',ad_l:'12 Temple Road',ad_a:'Near the bus stand',ad_c:'Kochi',ad_s:'Kerala',ad_z:'682002'};
 const saveAddr=async(p,o={})=>{await setv(p,Object.assign({},GOOD,o));await p.evaluate(()=>NC.saveAddr())};
 const addr=p=>p.evaluate(()=>NC.DB.patient.addr||null);
 const prep=async(p,{stock={p1:{s1:30},p3:{s2:40}},addrNow=false}={})=>{
  await p.evaluate(([stock,addrNow])=>{const D=NC.DB;D.patient.name='Asha Rao';D.patient.phone='9847012345';D.patient.pin='682002';D.patient.loc=null;D.patient.addr=addrNow?{name:'Asha Rao',phone:'9847012345',line:'12 Temple Road',area:'Near the bus stand',city:'Kochi',state:'Kerala',pin:'682002'}:null;
   D.stock=stock;D.orders=[];D.backorders=[];D.rx=[{id:'rx1',appt:'',doctor:'d1',when:new Date().toISOString(),meds:[{pid:'p1',qty:2,dose:'x'},{pid:'p3',qty:1,dose:'y'}],tests:[],treat:[],advice:'',follow:new Date().toISOString()}];
   NC.setRole('patient');NC.goto('patient','meds')},[stock,addrNow]);
  await p.waitForFunction(()=>NC.DB.patient.loc,null,{timeout:6000}).catch(()=>{});await p.evaluate(()=>NC.render())};
 const dl=async(p,id)=>{const [d]=await Promise.all([p.waitForEvent('download',{timeout:5000}),p.evaluate(i=>NC.dlBill('o',i),id)]);return fs.readFileSync(await d.path(),'latin1')};

 let p=await mk();
 // 1. form, prefilled from the profile, nothing to type twice
 await prep(p);
 let t=await txt(p);
 T('no address yet: the form is shown on the Medicines page',t.includes('Where should we deliver?'));
 T('name, mobile and PIN are prefilled from the profile',await p.evaluate(()=>document.getElementById('ad_n').value==='Asha Rao'&&document.getElementById('ad_p').value==='9847012345'&&document.getElementById('ad_z').value==='682002'));
 T('without an address there is no delivery plan and the order button is disabled',!t.includes('How it will ship')&&await p.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>/Place order/.test(x.textContent)).every(x=>x.disabled)));
 // 2. validation, one field at a time
 for(const [lbl,o] of [['name',{ad_n:'A'}],['mobile',{ad_p:'12'}],['street',{ad_l:'12'}],['city',{ad_c:''}],['state',{ad_s:''}],['PIN (5 digits)',{ad_z:'68200'}],['PIN (letters)',{ad_z:'68a002'}],['PIN starting with 0',{ad_z:'082002'}]]){
  await saveAddr(p,o);T('bad '+lbl+' is refused',(await addr(p))===null)}
 await saveAddr(p);
 const a=await addr(p);
 T('valid address is saved',!!a&&a.city==='Kochi'&&a.pin==='682002');
 T('saved address is shown with a Change button',(await txt(p)).includes('12 Temple Road')&&(await txt(p)).includes('Change address'));
 T('delivery plan now appears',(await txt(p)).includes('How it will ship'));

 // 3. order, snapshot, tracking starts
 await p.evaluate(()=>NC.placeOrder('rx1'));
 let os=await p.evaluate(()=>NC.DB.orders.map(o=>({id:o.id,sup:o.sup,to:o.to,track:o.track,status:o.status,items:o.items})));
 T('two parcels, each with a copy of the address and a tracking start',os.length===2&&os.every(o=>o.to&&o.to.line==='12 Temple Road'&&o.track&&o.track[0].s==='placed'));
 t=await txt(p);
 T('patient sees "Ordered" tracking on each parcel',(t.match(/Ordered/g)||[]).length>=2&&/○\s*Dispatched/.test(t)&&/○\s*Delivered/.test(t),t.slice(t.indexOf('Parcel 1'),t.indexOf('Parcel 1')+300));
 T('current step is marked for screen readers',await p.evaluate(()=>document.querySelectorAll('ol[aria-label="Order tracking"] li[aria-current="step"]').length===2));
 // later address edit does not touch orders already placed
 await p.evaluate(()=>NC.addrToggle());await saveAddr(p,{ad_l:'99 New Street',ad_c:'Pune',ad_s:'Maharashtra',ad_z:'411001'});
 T('editing the address later does not change parcels already ordered',await p.evaluate(()=>NC.DB.orders.every(o=>o.to.line==='12 Temple Road'&&o.to.city==='Kochi')));
 T('editing the address updates the profile PIN and clears the old location',await p.evaluate(()=>NC.DB.patient.pin==='411001'&&NC.DB.patient.addr.city==='Pune'));
 await saveAddr(p,GOOD);await p.evaluate(()=>NC.addrToggle());await saveAddr(p,GOOD);

 // 4. supplier side
 const s1id=os.find(o=>o.sup==='s1').id,s2id=os.find(o=>o.sup==='s2').id;
 await p.evaluate(()=>{NC.setRole('supplier');NC.goto('supplier','orders')});
 t=await txt(p);
 T('supplier sees the full address and phone for their parcel',/Ship to:/.test(t)&&/Asha Rao/.test(t)&&/9847012345/.test(t)&&/12 Temple Road/.test(t)&&/Kochi, Kerala 682002/.test(t),t.slice(0,500));
 T('supplier sees only their own parcel (not the other supplier\'s items)',/Bhringaraja/.test(t)&&!/Amalaki/.test(t),t.slice(0,500));
 T('dispatch needs courier and tracking number fields',await p.evaluate(()=>!!document.querySelector('input[id^="cr_"]')&&!!document.querySelector('input[id^="tn_"]')));
 await p.evaluate(i=>NC.setOrder(i,'dispatched'),s1id);
 T('dispatch refused without courier and tracking number',await p.evaluate(i=>NC.DB.orders.find(o=>o.id===i).status==='placed',s1id));
 await setv(p,{['cr_'+s1id]:'BlueDart'});await p.evaluate(i=>NC.setOrder(i,'dispatched'),s1id);
 T('dispatch refused with a courier but no tracking number',await p.evaluate(i=>NC.DB.orders.find(o=>o.id===i).status==='placed',s1id));
 await p.evaluate(i=>NC.setOrder(i,'delivered'),s1id);
 T('cannot mark delivered before dispatched',await p.evaluate(i=>NC.DB.orders.find(o=>o.id===i).status==='placed',s1id));
 await setv(p,{['cr_'+s1id]:'BlueDart',['tn_'+s1id]:'BD<i>456'});await p.evaluate(i=>NC.setOrder(i,'dispatched'),s1id);
 T('valid dispatch is saved with a timestamp',await p.evaluate(i=>{const o=NC.DB.orders.find(x=>x.id===i);return o.status==='dispatched'&&o.courier==='BlueDart'&&o.awb==='BD<i>456'&&o.track.length===2&&o.track[1].s==='dispatched'},s1id));
 T('supplier sees the courier and tracking number they entered',(await txt(p)).includes('tracking no. BD<i>456'));
 await p.evaluate(i=>NC.setOrder(i,'dispatched'),s1id);
 T('dispatching twice does nothing',await p.evaluate(i=>NC.DB.orders.find(o=>o.id===i).track.length===2,s1id));
 await p.evaluate(i=>NC.setOrder(i,'bogus'),s1id);
 T('unknown status is ignored',await p.evaluate(i=>NC.DB.orders.find(o=>o.id===i).status==='dispatched',s1id));

 // 5. patient sees tracking move
 await p.evaluate(()=>{NC.setRole('patient');NC.goto('patient','meds')});
 t=await txt(p);
 T('patient sees courier and tracking number on the dispatched parcel',/Dispatched with BlueDart, tracking no\. BD<i>456/.test(t),t.slice(t.indexOf('Parcel'),t.indexOf('Parcel')+400));
 T('courier text is shown as text, not injected as HTML',await p.evaluate(()=>!document.querySelector('#view ol i')));
 T('dispatched step is current, delivered is still open',await p.evaluate(()=>{const ols=[...document.querySelectorAll('ol[aria-label="Order tracking"]')];return ols.some(o=>/●\s*Dispatched/.test(o.innerText)&&/○\s*Delivered/.test(o.innerText))}));
 await p.evaluate(()=>{NC.setRole('supplier');NC.goto('supplier','orders')});await p.evaluate(i=>NC.setOrder(i,'delivered'),s1id);
 await p.evaluate(()=>{NC.setRole('patient');NC.goto('patient','meds')});
 T('delivered parcel shows all three steps complete',await p.evaluate(()=>[...document.querySelectorAll('ol[aria-label="Order tracking"]')].some(o=>/●\s*Delivered/.test(o.innerText))));
 // 6. late flag
 await p.evaluate(i=>{NC.DB.orders.find(o=>o.id===i).eta=new Date(Date.now()-3*864e5).toISOString();NC.render()},s2id);
 T('an overdue parcel is flagged as running later than estimated',(await txt(p)).includes('Running later than estimated'));
 await p.evaluate(i=>{const o=NC.DB.orders.find(x=>x.id===i);o.eta=new Date(Date.now()-3*864e5).toISOString();o.status='delivered';NC.render()},s1id);
 T('a delivered parcel is never flagged late',await p.evaluate(i=>{const o=NC.DB.orders.find(x=>x.id===i);o.eta=new Date(Date.now()-9*864e5).toISOString();NC.render();return [...document.querySelectorAll('#view .fl')].filter(x=>/Bhringaraja/.test(x.innerText)).every(x=>!/Running later/.test(x.innerText))},s1id));

 // 7. My care link, bill
 await p.evaluate(()=>{const D=NC.DB;D.appts=[{id:'ap1',doctor:'d1',slot:'Mon 10:00',assess:'x',status:'done',fee:500,when:new Date().toISOString()}];D.rx[0].appt='ap1';NC.goto('patient','care')});
 T('My care offers "Track your order" once ordered',(await txt(p)).includes('Track your order'));
 const body=await dl(p,s1id);
 T('bill shows who it is delivered to and the courier details',/Deliver to/.test(body)&&/Asha Rao, 12 Temple Road/.test(body)&&/Kochi, Kerala 682002/.test(body)&&/tracking no\. BD<i>456/.test(body));
 T('no JS errors (address and tracking)',p.errs.length===0,p.errs.join('|'));
 await p.ctx.close();

 // 8. address edit before ordering changes the estimate
 p=await mk();await prep(p,{addrNow:true});
 t=await txt(p);const m1=(t.match(/Deccan[^\n]*arrives in (\d) to/)||[])[1];
 await p.evaluate(()=>NC.addrToggle());await saveAddr(p,{ad_c:'Hyderabad',ad_s:'Telangana',ad_z:'500003'});
 await p.waitForFunction(()=>NC.DB.patient.loc&&NC.DB.patient.loc.lat>17,null,{timeout:6000});await p.evaluate(()=>NC.render());
 t=await txt(p);const m2=(t.match(/Deccan[^\n]*arrives in (\d) to/)||[])[1];
 T('moving the delivery address to Hyderabad makes the Hyderabad supplier faster',m1&&m2&&+m2<+m1,m1+' -> '+m2);
 await p.ctx.close();

 // 9. a back-ordered parcel that ships later also carries the address saved at that time
 p=await mk();await prep(p,{addrNow:true,stock:{p1:{s1:30},p3:{s2:0}}});
 await p.evaluate(()=>NC.placeOrder('rx1'));
 T('out-of-stock item waits as a back-order',await p.evaluate(()=>NC.DB.backorders.length===1&&NC.DB.orders.length===1));
 await p.evaluate(()=>{NC.setRole('supplier');NC.setCtx('sup','s2');NC.goto('supplier','products');document.querySelectorAll('#view details').forEach(d=>d.open=true)});
 await setv(p,{st_p3:'10'});await p.evaluate(()=>NC.saveStock());
 T('restock ships the back-order automatically with the address and tracking start',await p.evaluate(()=>{const o=NC.DB.orders.find(x=>x.late);return !!o&&o.to&&o.to.line==='12 Temple Road'&&o.track[0].s==='placed'&&o.sup==='s2'}));
 await p.ctx.close();

 // 10. old orders without address or tracking still render
 p=await mk();await prep(p,{addrNow:true});
 await p.evaluate(()=>{NC.DB.orders=[{id:'old1',rx:'rx1',sup:'s1',items:[{pid:'p1',qty:2}],total:640,status:'dispatched',when:new Date().toISOString()}];NC.render()});
 T('an old order with no address or tracking data still shows on the patient page',(await txt(p)).includes('Your parcel')&&p.errs.length===0,p.errs.join('|'));
 await p.evaluate(()=>{NC.setRole('supplier');NC.goto('supplier','orders')});
 T('and on the supplier page',(await txt(p)).includes('Ship to:')&&p.errs.length===0,p.errs.join('|'));
 await p.ctx.close();

 // 11. markup in the address is shown as text
 p=await mk();await prep(p);
 await saveAddr(p,{ad_l:'<img src=x onerror=window.__x=1> Road',ad_n:'<b>Asha</b>'});
 T('markup in address fields is escaped on the patient page',await p.evaluate(()=>!document.querySelector('#view img[src="x"]')&&!window.__x&&document.body.innerText.includes('<b>Asha</b>')));
 await p.evaluate(()=>NC.placeOrder('rx1'));await p.evaluate(()=>{NC.setRole('supplier');NC.goto('supplier','orders')});
 T('and on the supplier page',await p.evaluate(()=>!document.querySelector('#view img[src="x"]')&&!window.__x));
 await p.ctx.close();

 // 12. phone width
 for(const w of [375,390]){const q=await mk(w);await prep(q);const o1=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);await saveAddr(q);await q.evaluate(()=>NC.placeOrder('rx1'));const o2=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);await q.evaluate(()=>{NC.setRole('supplier');NC.goto('supplier','orders')});const o3=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);T('no sideways scroll at '+w+'px (address form, tracking, supplier orders)',!o1&&!o2&&!o3);await q.ctx.close()}
 console.log(ok+' pass '+bad+' fail');await b.close();process.exit(bad?1:0)})();
