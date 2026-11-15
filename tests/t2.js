const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:420,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
 p.on('dialog',d=>d.dismiss());
 await p.goto('file://'+process.cwd()+'/dist/index.html?demo=1');
 const txt=async()=>(await p.innerText('body'));
 const ok=(n,c)=>console.log((c?'PASS':'FAIL')+' '+n);
 async function runAssess(pick){ // pick(k,optsLen)->index
   await p.click('text=Start assessment');
   const nq=await p.evaluate(()=>Q.length);
   for(let k=0;k<nq;k++){const o=await p.$$('button.opt');await o[pick(k,o.length)].click();await p.click(k<nq-1?'text=Next':'text=See results')}
 }
 await p.click('text=Hair fall, thinning, slow growth');await p.click('text=English');
 // ---- clean patient (Stage 4): age 18-40, not pregnant, no meds, Vata-ish, no red flags
 await runAssess((k,n)=>k===0?1:k===1?1:k===2?n-1:k===n-1?0:(k===15?n-1:0));
 let t=await txt();
 ok('results show plan (no gate)',t.includes('Weekly plan')&&!t.includes('plan is hidden'));
 ok('Likely pattern wording',t.includes('Likely pattern')&&!t.includes('>Diagnosis<'));
 ok('answers count 16',t.includes('Based on your 16 answers'));
 ok('Book a doctor CTA',t.includes('Next: see a doctor'));
 // Book doctor
 await p.click('text=Book a doctor');
 await p.click('text=Book a doctor >> nth=1').catch(()=>{});
 t=await txt();ok('book page',t.includes('Choose a doctor'));
 await p.click('button:has-text("Mon 10:00")');
 await p.click('button:has-text("Confirm Mon 10:00")');
 t=await txt();ok('care page after booking',t.includes('Waiting for the consultation'));
 // Doctor
 await p.click('button:has-text("Doctor")');
 await p.click('button:has-text("Appointments")');
 await p.click('text=Open case sheet');
 t=await txt();ok('case sheet',t.includes('Case sheet')&&t.includes('does not diagnose'));
 // try issuing without agree
 await p.click('text=Issue prescription and complete consult');
 t=await txt();ok('blocks without agree',t.includes('Case sheet'));
 await p.click('button:has-text("Agree")');
 await p.selectOption('select:has(option:text-is("Needs tests first"))',{label:'Vata'}).catch(e=>console.log('select err',e.message.slice(0,80)));
 await p.check('text=TSH');
 await p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));
 await p.selectOption('#mp',{index:1});await p.fill('#md','1 tsp with warm water, 4 weeks');await p.click('button:has-text("Add"):near(#mq)');
 await p.selectOption('#mp',{index:3});await p.fill('#md','At night, 6 weeks');await p.click('button:has-text("Add"):near(#mq)');
 await p.selectOption('#tp',{index:2});await p.click('details:has(h3:has-text("Clinic treatment")) button:has-text("Add")');
 await p.fill('textarea','Regular meals, sleep before 10:30');
 await p.click('text=Issue prescription and complete consult');
 t=await txt();ok('rx issued -> appointment done',t.includes('done'));
 // Patient orders
 await p.click('button:has-text("Patient")');
 await p.click('button:has-text("Medicines")');
 t=await txt();ok('meds page shows rx',t.includes('GMP verified')&&t.includes('Place order'));
 await p.click('text=Place order (mock payment)');
 t=await txt();ok('order placed',t.includes('placed'));
 // supplier dispatch
 await p.click('button:has-text("Supplier")');
 await p.click('button:has-text("Orders")');
 t=await txt();ok('supplier sees order',t.includes('Mark dispatched'));
 await p.click('text=Mark dispatched');await p.click('text=Mark delivered');
 // Clinic booking by patient
 await p.click('button:has-text("Patient")');
 await p.click('button:has-text("Clinic treatment")');
 t=await txt();ok('clinic list + probation blocked',t.includes('Audited partner')&&t.includes('Not bookable'));
 await p.fill('#bd_c1','2026-12-05');await p.click('button:has-text("Book ·") >> nth=0');
 t=await txt();ok('clinic booked',t.includes('Booked at'));
 // follow-up logs
 await p.click('button:has-text("Follow-up")');
 for(const [h,pl] of [[80,9],[70,7],[60,6]]){await p.fill('#fh',String(h));await p.fill('#fp',String(pl));await p.click('text=Save check-in')}
 t=await txt();ok('follow-up chart/table',t.includes('Your progress')&&t.includes('Hairs/day'));
 // clinic role
 await p.click('button:has-text("Clinic")');
 t=await txt();ok('clinic sees booking',t.includes('Mark sessions done'));
 await p.click('text=Mark sessions done');
 await p.click('button:has-text("SOP audit")');await p.check('.ack >> nth=0');await p.click('text=Save self-audit');
 // admin
 await p.click('button:has-text("Admin")');
 t=await txt();ok('funnel',t.includes('Funnel')&&t.includes('Clinic treatment booked'));
 console.log(t.split('\n').filter(l=>/^\d+$|%|Started|Finished|Asked|Booked|completed|issued|ordered/.test(l)).slice(0,24).join(' | '));
 await p.click('button:has-text("Verification")');
 t=await txt();ok('verification queue',t.includes('Newleaf')&&t.includes('Cannot approve'));
 await p.click('text=Mark verified');
 await p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));
 await p.fill('#as_c3','85');await p.click('tr:has-text("Chennai") button:has-text("Save")');
 await p.click('button:has-text("Revenue")');
 t=await txt();ok('revenue',t.includes('Consultation commission')&&t.includes('Quarter total'));
 console.log(t.split('\n').filter(l=>/₹/.test(l)).join(' | '));
 await p.screenshot({path:'/tmp/mvp/s2.png',fullPage:true});
 console.log('ERRS',errs);
 await b.close();
})();
