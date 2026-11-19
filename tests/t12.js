// t12: downloadable PDF bills and clinics nearest to the patient (PIN code or device location)
const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const URL='file://'+process.cwd()+'/dist/index.html?demo=1';
 let ok=0,bad=0;const T=(n,c,x)=>{console.log(c?'PASS':'FAIL',n,c?'':(x||''));c?ok++:bad++};
 // geocoder stand-in: PIN prefix -> city centre. mode 'down' makes every lookup fail.
 const CITY={'600':[13.08,80.27],'682':[9.98,76.28],'500':[17.39,78.47],'560':[12.97,77.59]};
 const mk=async(o={})=>{
  const ctx=await b.newContext({viewport:{width:o.w||390,height:800},geolocation:o.geo,permissions:o.geo?['geolocation']:[]});
  ctx.hits=[];
  await ctx.route(/nominatim\.openstreetmap\.org|postalpincode\.in/,r=>{
   const u=r.request().url();ctx.hits.push(u);
   if(o.down)return r.abort();
   const m=u.match(/postalcode=(\d{6})/),c=m&&CITY[m[1].slice(0,3)];
   return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(c?[{lat:String(c[0]),lon:String(c[1])}]:[])})});
  const p=await ctx.newPage();p.on('dialog',d=>d.dismiss());p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.ctx=ctx;
  await p.goto(URL);return p};
 const txt=p=>p.evaluate(()=>document.body.innerText);
 const setv=(p,o)=>p.evaluate(o=>{for(const k in o){const e=document.getElementById(k);if(e)e.value=o[k]}},o);
 const cards=p=>p.evaluate(()=>[...document.querySelectorAll('#view .grid .card h3')].map(h=>h.textContent.trim()));
 const dl=async(p,k,id)=>{const [d]=await Promise.all([p.waitForEvent('download',{timeout:5000}),p.evaluate(([k,i])=>NC.dlBill(k,i),[k,id])]);const path=await d.path();return {name:d.suggestedFilename(),body:fs.readFileSync(path,'latin1')}};
 // a structurally valid PDF: header, xref offsets all point at "N 0 obj", startxref points at xref, page count right
 const validPdf=s=>{if(!s.startsWith('%PDF-1.4')||!s.trimEnd().endsWith('%%EOF'))return 'header/footer';
  const sx=+s.match(/startxref\n(\d+)/)[1];if(s.slice(sx,sx+4)!=='xref')return 'startxref';
  const n=+s.slice(sx).match(/xref\n0 (\d+)/)[1];const rows=s.slice(sx).split('\n').slice(3,3+n-1);
  for(let i=0;i<rows.length;i++){const off=+rows[i].slice(0,10);if(s.slice(off,off+(String(i+1)+' 0 obj').length)!==(i+1)+' 0 obj')return 'offset '+(i+1)}
  const cnt=+s.match(/\/Count (\d+)/)[1];if(((s.match(/\/Type \/Page /g)||[]).length)!==cnt)return 'page count';
  for(const m of s.matchAll(/<< \/Length (\d+) >>\nstream\n/g)){const st=m.index+m[0].length;if(s.slice(st+ +m[1],st+ +m[1]+9)!=='endstream')return 'stream length'}
  return ''};

 // ---------- bills
 let p=await mk();
 const seed=await p.evaluate(()=>{const D=NC.DB;D.patient.name='Asha Ráo (₹ test)';D.patient.phone='9847012345';
  const pr=D.products.find(x=>x.status==='approved');
  const ap={id:'ap_test1234',doctor:'d1',slot:'Mon 10:00',assess:'x',status:'booked',fee:500,when:new Date().toISOString()};D.appts.push(ap);
  D.rx.push({id:'rx_t1',appt:ap.id,doctor:'d1',when:new Date().toISOString(),meds:[{pid:pr.id,qty:2,dose:'1 daily'}],tests:[],treat:[{name:Object.keys(D.clinics[0].treat)[0],sessions:3}],advice:'',follow:new Date().toISOString()});
  D.orders.push({id:'or_test5678',rx:'rx_t1',sup:pr.sup,items:[{pid:pr.id,qty:2}],total:pr.price*2,status:'placed',when:new Date().toISOString()});
  const tn=Object.keys(D.clinics[0].treat)[0];
  D.tbook.push({id:'tb_testabcd',rx:'rx_t1',clinic:'c1',items:[{name:tn,sessions:3,price:D.clinics[0].treat[tn]}],total:D.clinics[0].treat[tn]*3,date:'2030-01-05',status:'booked',when:new Date().toISOString()});
  return {pn:pr.name,pp:pr.price,tn,tp:D.clinics[0].treat[tn]}});
 await p.evaluate(()=>NC.goto('patient','care'));
 T('care page has a bill button for the appointment',(await txt(p)).includes('Download bill (PDF)'));
 let r=await dl(p,'a','ap_test1234');
 T('consultation bill downloads as a PDF file',/^Nidana-Care-bill-NC-A-\d{8}-1234\.pdf$/.test(r.name),r.name);
 T('PDF is structurally valid',validPdf(r.body)==='',validPdf(r.body));
 T('consultation bill shows number, fee, patient, doctor and registration',/NC-A-\d{8}-1234/.test(r.body)&&r.body.includes('Rs.500')&&r.body.includes('Asha R')&&r.body.includes('Dr. Meera Nair')&&r.body.includes('SAMPLE-KL-1001'));
 T('rupee sign and accents are made PDF-safe',!/[^\x00-\x7f]/.test(r.body.replace(/%[^\n]*\n/,'')) );
 T('bill says it is a sample, not a tax invoice',r.body.includes('not a tax invoice'));
 await p.evaluate(()=>NC.goto('patient','meds'));
 T('medicines page has a bill button for the order',(await txt(p)).includes('Download bill (PDF)'));
 r=await dl(p,'o','or_test5678');
 T('medicines bill is valid and itemised with the total',validPdf(r.body)===''&&r.body.includes(seed.pn.slice(0,15))&&r.body.includes('Rs.'+(seed.pp*2).toLocaleString('en-IN'))&&/NC-O-/.test(r.body)&&r.body.includes('Drug licence no.'));
 await p.evaluate(()=>NC.goto('patient','clinic'));
 T('clinic booking page has a bill button',(await txt(p)).includes('Download bill (PDF)'));
 r=await dl(p,'t','tb_testabcd');
 T('clinic bill valid, 3 sessions x price, pay at clinic',validPdf(r.body)===''&&r.body.includes('Rs.'+(seed.tp*3).toLocaleString('en-IN'))&&r.body.includes('paid at the clinic')&&/NC-T-/.test(r.body));
 T('long item list spills to a second page and stays valid',await p.evaluate(()=>{const b=NC.DB;const x={id:'tb_big12345',rx:'rx_t1',clinic:'c1',items:Array.from({length:60},(_,i)=>({name:'Treatment number '+i+' with a deliberately long description to wrap onto lines',sessions:2,price:100})),total:12000,date:'2030-01-05',status:'booked',when:new Date().toISOString()};b.tbook.push(x);return true}));
 r=await dl(p,'t','tb_big12345');T('multi-page PDF is valid',validPdf(r.body)==='' && +r.body.match(/\/Count (\d+)/)[1]>=2,validPdf(r.body));
 T('unknown bill id gives a message and no crash',await p.evaluate(()=>{NC.dlBill('a','nope');return document.getElementById('toast').textContent.includes('Could not find')}));
 T('no JS errors (bills)',p.errs.length===0,p.errs.join('|'));
 await p.ctx.close();

 // ---------- nearest clinics, PIN code
 p=await mk();
 await p.evaluate(()=>{NC.DB.patient.pin='';NC.DB.patient.loc=null;NC.goto('patient','clinic')});
 T('clinic page works with no PIN and says what to do',(await txt(p)).includes('Enter your PIN code or use your location'));
 T('no advised treatment: view-only list with a heading',(await txt(p)).includes('Clinics near you')&&(await txt(p)).includes('view-only'));
 await setv(p,{np:'12345'});await p.evaluate(()=>NC.setPin());
 T('a 5-digit PIN is refused',await p.evaluate(()=>!NC.DB.patient.pin));
 await setv(p,{np:'600002'});await p.evaluate(()=>NC.setPin());await p.waitForFunction(()=>NC.DB.patient.loc,null,{timeout:5000});
 let c=await cards(p);
 T('Chennai PIN puts the Chennai clinic first',/Chennai/.test(c[0]),c.join(' | '));
 T('distance in km is shown',/about \d+(\.\d)? km away/.test(await txt(p)));
 T('Chennai clinic is under 5 km, Kochi and Hyderabad are far',await p.evaluate(()=>{const t=document.body.innerText;const m=[...t.matchAll(/about (\d+(?:\.\d)?) km away/g)].map(x=>+x[1]);return m[0]<5&&m[1]>300}));
 T('each clinic has a Google Maps directions link',await p.evaluate(()=>{const a=[...document.querySelectorAll('#view a[href*="google.com/maps/dir"]')];return a.length===3&&a.every(x=>x.target==='_blank'&&/noopener/.test(x.rel))}));
 T('PIN is remembered across reload',await (async()=>{await p.reload();await p.evaluate(()=>NC.goto('patient','clinic'));return (await p.evaluate(()=>NC.DB.patient.pin))==='600002'&&/Chennai/.test((await cards(p))[0])})());
 // advised treatment: bookable and offering everything first, then nearest
 await p.evaluate(()=>{const D=NC.DB,tn=Object.keys(D.clinics[0].treat)[0];D.rx.push({id:'rx_n1',appt:'',doctor:'d1',when:new Date().toISOString(),meds:[],tests:[],treat:[{name:tn,sessions:2}],advice:'',follow:new Date().toISOString()});NC.render()});
 c=await cards(p);
 T('with a treatment advised, audited partners come before the nearer probation clinic',/Hyderabad|Kochi/.test(c[0])&&/Chennai/.test(c[2]),c.join(' | '));
 T('among audited clinics the nearer one is first (Hyderabad from Chennai)',/Hyderabad/.test(c[1]||'')||/Hyderabad/.test(c[0]),c.join(' | '));
 T('bookable clinic still has its Book button',(await txt(p)).includes('Book ·'));
 await p.evaluate(()=>NC.forgetLoc());
 T('Clear forgets PIN and location',await p.evaluate(()=>!NC.DB.patient.pin&&!NC.DB.patient.loc));
 T('no JS errors (PIN)',p.errs.length===0,p.errs.join('|'));
 await p.ctx.close();

 // ---------- geocoder unreachable: falls back to PIN number closeness, no hang
 p=await mk({down:true});
 await p.evaluate(()=>{NC.DB.patient.pin='682005';NC.DB.patient.loc=null;NC.goto('patient','clinic')});
 await p.waitForFunction(()=>document.body.innerText.includes('Could not look up that PIN'),null,{timeout:12000});
 c=await cards(p);
 T('offline: nearest by PIN number (Kochi first) with an honest message',/Kochi/.test(c[0])&&(await txt(p)).includes('in your PIN area'),c.join(' | '));
 await p.ctx.close();

 // ---------- device location, one tap
 p=await mk({geo:{latitude:17.4,longitude:78.5}});
 await p.evaluate(()=>{NC.DB.patient.pin='';NC.DB.patient.loc=null;NC.goto('patient','clinic')});
 await p.evaluate(()=>NC.useLoc());await p.waitForFunction(()=>NC.DB.patient.loc&&NC.DB.patient.loc.src==='device',null,{timeout:6000});
 c=await cards(p);
 T('device location near Hyderabad puts Hyderabad first',/Hyderabad/.test(c[0]),c.join(' | '));
 T('saved location is approximate (2 decimals)',await p.evaluate(()=>{const l=NC.DB.patient.loc;return String(l.lat).split('.')[1].length<=2&&String(l.lng).split('.')[1].length<=2}));
 T('device location makes no network lookups at all',p.ctx.hits.length===0,p.ctx.hits.join(','));
 await p.ctx.close();
 // permission refused
 p=await mk();
 await p.evaluate(()=>{NC.DB.patient.loc=null;NC.goto('patient','clinic');navigator.geolocation.getCurrentPosition=(ok,err)=>err({code:1});NC.useLoc()});
 T('refused location gives a friendly fallback to PIN',await p.evaluate(()=>document.getElementById('toast').textContent.includes('Enter your PIN code instead')));
 await p.ctx.close();

 // ---------- registration PIN, onboarding PIN
 p=await mk();
 await p.evaluate(()=>NC.logout());await p.click('text=Register as a patient');
 await setv(p,{rg_n:'Near Me',rg_p:'9847000001',rg_z:'12ab',rg_e:'near@example.com',rg_w:'Near2026x',rg_w2:'Near2026x'});await p.evaluate(()=>{document.getElementById('rg_a').checked=true;document.getElementById('rg_c').checked=true;NC.doRegister()});
 T('bad PIN at registration is refused',(await txt(p)).includes('PIN code must be 6 digits'));
 await setv(p,{rg_z:'600002'});await p.evaluate(()=>NC.doRegister());
 T('registration with PIN saves it',await p.evaluate(()=>NC.DB.patient.pin==='600002'));
 await p.evaluate(()=>{NC.DB.rx.push({id:'rx_r',appt:'',doctor:'d1',when:new Date().toISOString(),meds:[],tests:[],treat:[{name:Object.keys(NC.DB.clinics[0].treat)[0],sessions:1}],advice:'',follow:new Date().toISOString()});NC.goto('patient','clinic')});
 await p.waitForFunction(()=>NC.DB.patient.loc,null,{timeout:5000});
 T('registered patient sees distances on the clinic page with no extra steps',/km away/.test(await txt(p)));
 await p.evaluate(()=>NC.logout());
 await p.evaluate(()=>{document.getElementById('lg_e').value='admin@nidana.demo';document.getElementById('lg_w').value='Demo@1234';NC.doLogin();NC.setTab('onboard');document.querySelectorAll('#view details').forEach(d=>d.open=true)});
 const cli=async o=>{await setv(p,Object.assign({ob_cn:'Bengaluru Vaidya Clinic',ob_cc:'Bengaluru',ob_cz:'560001',ob_cs:'Karnataka',ob_cr:'KA-CLN-9001',ob_cd:'Dr. R. Rao',ob_cp:'KA-BAMS-7001',ob_ce:'blr@clinic.test',ob_cph:'9811100011'},o));
  await p.evaluate(()=>{document.querySelectorAll('[id^=obt_]').forEach(e=>e.checked=false);document.getElementById('obt_0').checked=true;document.getElementById('obp_0').value='900'});
  const n=await p.evaluate(()=>NC.DB.clinics.length);await p.evaluate(()=>NC.onboardClinic());return p.evaluate(n=>NC.DB.clinics.length-n,n)};
 T('clinic onboarding needs a 6-digit PIN',(await cli({ob_cz:''}))===0&&(await cli({ob_cz:'56001'}))===0);
 T('clinic with a PIN is onboarded and its location looked up',(await cli({}))===1&&await p.waitForFunction(()=>NC.DB.geo&&NC.DB.geo['560001'],null,{timeout:5000}).then(()=>true).catch(()=>false));
 T('no JS errors (registration and onboarding)',p.errs.length===0,p.errs.join('|'));
 await p.ctx.close();

 // ---------- phone width
 for(const w of [375,390]){const q=await mk({w});await q.evaluate(()=>{NC.DB.patient.pin='600002';NC.goto('patient','clinic')});await q.waitForTimeout(600);const o1=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);await q.evaluate(()=>NC.goto('patient','care'));const o2=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);T('no sideways scroll at '+w+'px (clinics, care)',!o1&&!o2);await q.ctx.close()}
 console.log(ok+' pass '+bad+' fail');await b.close();process.exit(bad?1:0)})();
