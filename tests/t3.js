const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const errs=[];
 const ok=(n,c)=>console.log((c?'PASS':'FAIL')+' '+n);
 async function fresh(w=420){const ctx=await b.newContext({viewport:{width:w,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});p.on('dialog',d=>d.dismiss());await p.goto('file://'+process.cwd()+'/dist/index.html');await p.click('text=Hair fall, thinning, slow growth');await p.click('text=English');return p}
 async function run(p,pick){await p.click('text=Start assessment');const nq=await p.evaluate(()=>Q.length);for(let k=0;k<nq;k++){const o=await p.$$('button.opt');await o[pick(k,o.length)].click();await p.click(k<nq-1?'text=Next':'text=See results')}}
 const T=p=>p.innerText('body');
 // A: all-None
 let p=await fresh();
 await run(p,(k,n)=>k===0?1:k===1?1:(k>=2&&n>=2?n-1:0));
 // Q index 3 (pattern) has no None -> pick first; fine
 let t=await T(p);
 ok('A: no clear pattern handled',t.includes('No clear dosha pattern')||t.includes('did not point to one dosha'));
 ok('A: no plan shown',!t.includes('Weekly plan'));
 // B: pregnant => no nasya/shodhana, herbs hidden, plan visible
 p=await fresh();
 await run(p,(k,n)=>k===0?1:k===1?0:k===2?n-1:k===15?n-1:0);
 t=await T(p);
 ok('B: pregnancy caution',t.includes('Pregnancy: do not start herbs'));
 ok('B: herbs hidden notice',t.includes('Herb suggestions are hidden because of: pregnancy'));
 await p.click('button:has-text("Weekly plan")');t=await T(p);
 ok('B: no Nasya in weekly plan',!/Nasya:|Morning Nasya/.test(t));
 await p.click('button:has-text("Therapy details")');t=await T(p);
 ok('B: herbs & shodhana withheld',t.includes('Not suggested by this tool for you')&&t.includes('Not suggested in your situation'));
 // C: Stage 0 lead flow
 p=await fresh();
 await p.evaluate(()=>NC.setStage(0));
 await p.click('button:has-text("Assess")');
 // stage switch re-renders assess: continue
 const st=await T(p);
 await run(p,(k,n)=>k===0?1:k===1?1:k===2?n-1:k===15?n-1:0).catch(e=>console.log('run err',e.message.slice(0,100)));
 t=await T(p);ok('C: stage0 request form',t.includes('Ask a doctor to call you'));
 await p.click('text=Request a call');t=await T(p);ok('C: needs phone',t.includes('Ask a doctor to call you'));
 await p.fill('#ph','9876543210');await p.check('#cn');await p.click('text=Request a call');
 t=await T(p);ok('C: request sent',t.includes('Request sent'));
 await p.click('button:has-text("Doctor")');t=await T(p);ok('C: doctor inbox lead',t.includes('Requests from patients')&&t.includes('9876543210'));
 await p.click('button:has-text("Book a doctor")').catch(()=>{});
 await p.click('button:has-text("Appointments")');t=await T(p);ok('C: appts locked at stage0',t.includes('Unlocks in Stage 1'));
 // D: language switch mid-flow with new questions
 p=await fresh();
 await p.click('text=Start assessment');
 await p.selectOption('select[aria-label="Language"]','te');
 t=await T(p);ok('D: english-only note on new question',t.includes('English only for now'));
 await p.click('button.opt >> nth=1');await p.click('text=/Next|తదుపరి/').catch(()=>{});
 await p.screenshot({path:'/tmp/mvp/s3.png'});
 // E: desktop width screenshots of main screens
 p=await fresh(1100);
 await p.click('button:has-text("Admin")');await p.click('button:has-text("Revenue")');
 t=await T(p);ok('E: revenue sim renders',t.includes('Quarter total'));
 await p.screenshot({path:'/tmp/mvp/s4.png',fullPage:true});
 console.log('ERRS',errs);await b.close();
})();
