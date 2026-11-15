const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:420,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('dialog',d=>d.dismiss());
 const ok=(n,c)=>console.log((c?'PASS':'FAIL')+' '+n);const T=()=>p.innerText('body');
 await p.goto('file://'+process.cwd()+'/dist/index.html?demo=1');await p.click('text=Hair fall, thinning, slow growth');await p.click('text=English');await p.click('text=Start assessment');
 const nq=await p.evaluate(()=>Q.length);
 for(let k=0;k<nq;k++){const o=await p.$$('button.opt');await o[k===0||k===1?1:k===2||k===15?o.length-1:0].click();await p.click(k<nq-1?'text=Next':'text=See results')}
 await p.click('button:has-text("Book a doctor") >> nth=0').catch(()=>{});
 await p.click('.pills button:has-text("Book a doctor")');
 await p.click('button:has-text("Mon 10:00")');await p.click('button:has-text("Confirm Mon 10:00")');
 await p.click('button:has-text("Doctor")');await p.click('button:has-text("Appointments")');await p.click('text=Open case sheet');
  await p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));await p.click('button:has-text("Agree")');await p.fill('textarea','ok');await p.click('text=Issue prescription and complete consult');
 await p.click('button:has-text("Patient")');await p.click('.pills button:has-text("Follow-up")');
 let t=await T();
 ok('date inputs present',await p.$('#fdte')!==null&&await p.$('#rmd')!==null&&await p.$('#rdd')!==null);
 const today=await p.inputValue('#fdte');const real=await p.evaluate(()=>{const x=new Date();return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")});
 ok('check-in date defaults to today',today===real);
 // future date blocked
 await p.fill('#fdte','2099-01-01');await p.fill('#fh','50');await p.fill('#fp','5');await p.click('text=Save check-in');
 t=await T();ok('future date blocked',!t.includes('Hairs/day'));
 // backdated entries, out of order
 const back=n=>p.evaluate(n=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")},n);
 for(const [n,h,pl] of [[7,90,9],[21,100,10],[14,95,9]]){await p.fill('#fdte',await back(n));await p.fill('#fh',String(h));await p.fill('#fp',String(pl));await p.click('text=Save check-in')}
 const order=await p.evaluate(()=>[...document.querySelectorAll('table tr td:nth-child(2)')].map(x=>x.textContent));
 ok('table newest first by chosen date: '+order.join(','),order.join(',')==='95,90,100'.replace('95,90,100','90,95,100')||order.join(',')==='90,95,100');
 // reminder
 const rv=await p.inputValue('#rmd');
 await p.click('text=Set reminder');t=await T();ok('reminder set',t.includes('Reminder set for'));
 // book review
 const rdd=await p.inputValue('#rdd');ok('review date defaults to next review date: '+rdd,rdd>=real);
 await p.click('text=Book review (mock payment)');t=await T();ok('review booked',t.includes('Review booked with'));
 await p.click('.pills button:has-text("My care")');t=await T();ok('care page shows review tag',t.includes('review'));
 await p.click('button:has-text("Doctor")');await p.click('button:has-text("Appointments")');t=await T();ok('doctor sees review booking',t.includes('review')&&t.includes('booked'));
 console.log('ERRS',errs);await b.close();
})();
