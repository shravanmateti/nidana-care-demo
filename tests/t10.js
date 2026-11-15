// t10: detailed analysis for every ailment, login, patient registration, admin onboarding of suppliers and clinics
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const URL='file://'+process.cwd()+'/dist/index.html';
 const mk=async(demo,w=390)=>{const p=await (await b.newContext({viewport:{width:w,height:800}})).newPage();p.on('dialog',d=>d.dismiss());p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(URL+(demo?'?demo=1':''));return p};
 let ok=0,bad=0;const T=(n,c,x)=>{console.log(c?'PASS':'FAIL',n,c?'':(x||''));c?ok++:bad++};
 const txt=p=>p.evaluate(()=>document.body.innerText);
 const setv=(p,o)=>p.evaluate(o=>{for(const k in o){const e=document.getElementById(k);if(e){if(e.type==='checkbox')e.checked=!!o[k];else e.value=o[k]}}},o);
 const login=async(p,e,w)=>{await setv(p,{lg_e:e,lg_w:w});await p.evaluate(()=>NC.doLogin())};
 const PW='Demo@1234';

 // ---- 1. detailed analysis for every ailment
 let p=await mk(true);
 const ids=await p.evaluate(()=>AL.map(a=>a.id).filter(i=>i!=='hair'));
 const heads=['How urgent is this?','What you reported','Likely contributing factors','How it may have developed','Outlook','What you can do now','Get ready for your consultation'];
 const miss=[];
 for(const id of ids){await p.evaluate(i=>alSet(i),id);const n=await p.evaluate(()=>alSteps().length);
  for(let k=0;k<n;k++){const o=await p.$$('button.opt');await o[Math.min(1,o.length-1)].click();await p.click(k<n-1?'text=Next':'text=See summary')}
  const t=await txt(p);for(const h of heads)if(!t.includes(h))miss.push(id+':'+h)}
 T('all '+ids.length+' non-hair ailments show the full analysis',ids.length>=30&&miss.length===0,miss.slice(0,5).join(' | '));
 // analysis reacts to answers: a red-flag answer raises urgency; healthy habits do not
 const lvl=async pick=>{await p.evaluate(()=>alSet('backpain'));const n=await p.evaluate(()=>alSteps().length);
  for(let k=0;k<n;k++){const o=await p.$$('button.opt');await o[Math.min(pick(k),o.length-1)].click();await p.click(k<n-1?'text=Next':'text=See summary')}
  return p.evaluate(()=>window._SUM.an.pri.lvl)};
 const safe=await p.evaluate(()=>{alSet('backpain');return alSteps().map(q=>Math.max(0,q.o.findIndex(o=>o.k!=='!')))});
 const calm=await lvl(k=>safe[k]);
 T('calm answers give routine priority',calm==='Routine',calm);
 const sums=await p.evaluate(()=>{const a=AL.find(x=>x.id==='backpain');let best=null;
  const base=alSteps().map(()=>[0]);alSteps().forEach((q,n)=>q.o.forEach((o,j)=>{if(o.k==='!'&&!best)best={n,j}}));return best});
 if(sums){await p.evaluate(()=>alSet('backpain'));const n=await p.evaluate(()=>alSteps().length);
  for(let k=0;k<n;k++){const o=await p.$$('button.opt');await o[Math.min(k===sums.n?sums.j:0,o.length-1)].click();await p.click(k<n-1?'text=Next':'text=See summary')}
  const l=await p.evaluate(()=>window._SUM.an.pri.lvl);T('warning-sign answer raises priority to see a doctor soon',l==='See a doctor soon',l)}
 else T('found a warning-sign option to test',false);
 T('analysis is stored with the assessment for the doctor',await p.evaluate(()=>!!NC.DB.assessments.at(-1).sum.an&&NC.DB.assessments.at(-1).sum.an.fac!==undefined));
 T('copy text includes priority and outlook',await p.evaluate(()=>{const t=summaryText(window._SUM);return /Priority:/.test(t)&&/Outlook:/.test(t)}));
 // doctor case sheet shows the detailed analysis
 await p.click('.nxt button');await p.click('.chips button >> nth=0');await p.click('text=Confirm');await p.click('.nxt button');
 await p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));
 T('doctor case sheet has the detailed analysis',(await txt(p)).includes('Detailed analysis')&&(await txt(p)).includes('Contributing factors')||(await txt(p)).includes('Likely contributing factors'));
 T('no JS errors in analysis run',p.errs.length===0,p.errs.join('|'));

 // ---- 2. login gate and registration
 p=await mk(false);
 let t=await txt(p);
 T('first screen is the login page',t.includes('Log in')&&t.includes('Register as a patient')&&!(await p.$('.pills button:has-text("Supplier")')));
 T('no app tabs before login',!t.includes('Book a doctor'));
 await login(p,'asha@nidana.demo','wrong');T('wrong password refused',(await txt(p)).includes('not correct')&&await p.evaluate(()=>!NC.DB.session));
 for(let i=0;i<5;i++)await login(p,'asha@nidana.demo','bad'+i);
 await login(p,'asha@nidana.demo',PW);
 T('lockout after repeated failures',(await txt(p)).includes('Too many attempts')&&await p.evaluate(()=>!NC.DB.session));
 p=await mk(false);
 await p.click('text=Register as a patient');
 const reg=async o=>{await setv(p,Object.assign({rg_n:'Test Patient',rg_p:'9876543210',rg_e:'tp@example.com',rg_w:'Passw0rdX',rg_w2:'Passw0rdX',rg_a:true,rg_c:true},o));await p.evaluate(()=>NC.doRegister());return p.evaluate(()=>({s:!!NC.DB.session,n:NC.DB.users.length}))};
 const u0=(await reg({rg_w:'short',rg_w2:'short'}));T('weak password refused',!u0.s);
 T('mismatched passwords refused',!(await reg({rg_w2:'Different1'})).s);
 T('invalid email refused',!(await reg({rg_e:'not-an-email'})).s);
 T('invalid phone refused',!(await reg({rg_p:'12'})).s);
 T('consent boxes are required',!(await reg({rg_c:false})).s);
 T('existing email refused',!(await reg({rg_e:'asha@nidana.demo'})).s);
 const ok1=await reg({});T('valid registration signs the patient in',ok1.s&&(await txt(p)).includes('Signed in as')&&(await txt(p)).includes('Test Patient'));
 T('registered patient sees only patient tabs and no role switcher',await p.evaluate(()=>!document.querySelector('.pills button[onclick*="setRole"]')&&NC.DB.session.uid&&document.body.innerText.includes('Book a doctor')));
 await p.evaluate(()=>{NC.setRole('admin');NC.goto('admin','verify')});
 T('patient cannot switch to another role',(await txt(p)).includes('Book a doctor')||(await txt(p)).includes('Assess'));
 T('registered patient name is used',await p.evaluate(()=>NC.DB.patient.name==='Test Patient'));
 await p.evaluate(()=>{NC.logout()});t=await txt(p);
 T('log out returns to login',t.includes('Register as a patient')&&await p.evaluate(()=>!NC.DB.session));
 await login(p,'tp@example.com','Passw0rdX');T('registered patient can log in again',(await txt(p)).includes('Signed in as')&&await p.evaluate(()=>NC.DB.users.find(u=>u.email==='tp@example.com').ph!=='Passw0rdX'),'password must not be stored in plain text');
 // session survives reload
 await p.reload();T('session survives a reload',(await txt(p)).includes('Signed in as'));
 // staff logins
 const roles=[['admin@nidana.demo','Admin','Onboarding'],['meera@nidana.demo','Doctor','Requests'],['sahyadri@nidana.demo','Supplier','Products'],['kochi@nidana.demo','Clinic','Bookings']];
 for(const [e,r,tab] of roles){const q=await mk(false);await q.click('text=Log in >> nth=0').catch(()=>{});await login(q,e,PW);const tt=await txt(q);
  T(r+' login lands on the '+r+' screen with the right tab',tt.includes('Signed in as')&&tt.includes('('+r+')')&&tt.includes(tab));
  T(r+' cannot reach other roles',await q.evaluate(rr=>{NC.setRole('patient');NC.setRole('admin');return NC.DB.session.uid&&document.body.innerText.includes('('+rr+')')},r))}
 const dq=await mk(false);await login(dq,'ravi@nidana.demo',PW);T('doctor login opens that doctor profile',await dq.evaluate(()=>document.body.innerText.includes('Ravi')));
 const dm=await mk(false);await dm.evaluate(()=>NC.demoMode());T('demo mode keeps the role switcher',!!(await dm.$('.pills button:has-text("Supplier")')));
 T('no JS errors in login run',p.errs.length===0,p.errs.join('|'));

 // ---- 3. admin onboards a supplier
 p=await mk(false);await login(p,'admin@nidana.demo',PW);await p.evaluate(()=>NC.setTab('onboard'));
 await p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));
 const sup=async o=>{await setv(p,Object.assign({ob_sn:'Greenroot Pharma',ob_sc:'R. Iyer',ob_se:'iyer@greenroot.test',ob_sp:'9811122233',ob_ss:'Kerala',ob_sl:'LIC-KL-9001',ob_sg:'',ob_sr:false},o));const n=await p.evaluate(()=>NC.DB.suppliers.length);await p.evaluate(()=>NC.onboardSup());return p.evaluate(n=>NC.DB.suppliers.length-n,n)};
 T('supplier needs a valid email',(await sup({ob_se:'bad'}))===0);
 T('supplier needs a valid phone',(await sup({ob_sp:'1'}))===0);
 T('supplier needs a licence number',(await sup({ob_sl:'ab'}))===0);
 T('supplier licence must be new',(await sup({ob_sl:'SAMPLE-LIC-KL-77'}))===0);
 T('supplier login email must be new',(await sup({ob_se:'sahyadri@nidana.demo'}))===0);
 T('valid supplier is onboarded as pending',(await sup({}))===1&&await p.evaluate(()=>NC.DB.suppliers.at(-1).status==='pending'));
 let cr=await p.evaluate(()=>document.body.innerText.match(/Temporary password: (\S+)/));T('temporary password shown once to the admin',!!cr);
 const sid=await p.evaluate(()=>NC.DB.suppliers.at(-1).id);
 T('cannot approve supplier without GMP certificate and report',await p.evaluate(i=>{NC.approveSup(i);return NC.DB.suppliers.find(s=>s.id===i).status==='pending'},sid));
 await p.evaluate(()=>NC.dismissCred());T('credential card can be dismissed',!(await txt(p)).includes('Temporary password'));
 T('admin sees the new supplier in the verification queue',await (async()=>{await p.evaluate(()=>{NC.setTab('verify')});await p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));return (await txt(p)).includes('Greenroot Pharma')})());
 // new supplier logs in with the temporary password
 const spw=cr[1];await p.evaluate(()=>NC.logout());await login(p,'iyer@greenroot.test',spw);
 T('new supplier can log in with the temporary password',(await txt(p)).includes('Greenroot Pharma')&&(await txt(p)).includes('(Supplier)'));
 T('supplier session is tied to its own company',await p.evaluate(i=>NC.DB.suppliers.find(s=>s.id===i)&&document.body.innerText.includes('Greenroot'),sid));

 // ---- 4. admin onboards a clinic
 await p.evaluate(()=>NC.logout());await login(p,'admin@nidana.demo',PW);await p.evaluate(()=>NC.setTab('onboard'));
 await p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));
 const cli=async(o,tr=true)=>{await setv(p,Object.assign({ob_cn:'Nirmal Ayurveda Clinic',ob_cc:'Pune',ob_cs:'Maharashtra',ob_cr:'MH-CLN-5521',ob_cd:'Dr. S. Kulkarni',ob_cp:'MH-BAMS-8812',ob_ce:'nirmal@clinic.test',ob_cph:'9822233344',ob_ca:'MG Road'},o));
  await p.evaluate(tr=>{document.querySelectorAll('[id^=obt_]').forEach(e=>e.checked=false);if(tr){const a=document.getElementById('obt_0'),b=document.getElementById('obt_1');a.checked=true;b.checked=true;document.getElementById('obp_0').value='900';document.getElementById('obp_1').value='1500'}},tr);
  const n=await p.evaluate(()=>NC.DB.clinics.length);await p.evaluate(()=>NC.onboardClinic());return p.evaluate(n=>NC.DB.clinics.length-n,n)};
 T('clinic needs at least one treatment',(await cli({},false))===0);
 T('clinic needs a registration number',(await cli({ob_cr:'x'}))===0);
 T('clinic needs the physician in charge',(await cli({ob_cd:''}))===0);
 T('clinic needs a valid email',(await cli({ob_ce:'nope'}))===0);
 T('clinic registration number must be new',await (async()=>{await p.evaluate(()=>{NC.DB.clinics[0].regno='DUP-12345'});return (await cli({ob_cr:'DUP-12345'}))===0})());
 T('treatment price must be valid',await (async()=>{await setv(p,{});const r=await p.evaluate(()=>{document.querySelectorAll('[id^=obt_]').forEach(e=>e.checked=false);document.getElementById('obt_0').checked=true;document.getElementById('obp_0').value='-5';const n=NC.DB.clinics.length;NC.onboardClinic();return NC.DB.clinics.length===n});return r})());
 T('valid clinic is onboarded as pending with 0%',(await cli({}))===1&&await p.evaluate(()=>{const c=NC.DB.clinics.at(-1);return c.status==='pending'&&c.score===0&&Object.keys(c.treat).length===2}));
 cr=await p.evaluate(()=>document.body.innerText.match(/Temporary password: (\S+)/));T('clinic credentials shown once',!!cr);
 const cid=await p.evaluate(()=>NC.DB.clinics.at(-1).id);
 T('pending clinic cannot be booked by a patient',await p.evaluate(i=>{const n=NC.DB.tbook.length;try{NC.bookClinic('none',i)}catch(e){}return NC.DB.tbook.length===n},cid));
 T('new clinic shows in the audit list with a not-audited label',await (async()=>{await p.evaluate(()=>NC.setTab('verify'));await p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));const t2=await txt(p);return t2.includes('Nirmal Ayurveda Clinic')&&t2.includes('not audited yet')})());
 await p.evaluate(i=>{document.getElementById('as_'+i).value='85';NC.recordAudit(i)},cid);
 T('admin audit of 85% makes the new clinic bookable',await p.evaluate(i=>NC.DB.clinics.find(c=>c.id===i).status==='audited',cid));
 await p.evaluate(()=>NC.logout());await login(p,'nirmal@clinic.test',cr[1]);
 T('new clinic can log in with the temporary password',(await txt(p)).includes('Nirmal Ayurveda Clinic')&&(await txt(p)).includes('(Clinic)'));
 T('no JS errors in onboarding run',p.errs.length===0,p.errs.join('|'));
 // phone width: login page and onboarding page do not overflow
 for(const w of [375,390]){const q=await mk(false,w);const o1=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);await login(q,'admin@nidana.demo',PW);await q.evaluate(()=>NC.setTab('onboard'));await q.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));const o2=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);T('no sideways scroll at '+w+'px (login and onboarding)',!o1&&!o2)}
 console.log(ok+' pass '+bad+' fail');await b.close();process.exit(bad?1:0)})();
