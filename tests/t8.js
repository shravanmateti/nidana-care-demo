const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});
const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto('file://'+process.cwd()+'/dist/index.html');
for(const s of [0,1,2,4]){await p.evaluate(s=>NC.setStage(s),s);await p.evaluate(()=>NC.setRole('admin'));await p.click('button:has-text("Revenue")');
const t=await p.innerText('body');console.log('stage',s,t.includes('From activity in this prototype'),t.includes('Quarter total'),t.includes('Unlocks'))}
await p.evaluate(()=>NC.setStage(1));await p.evaluate(()=>NC.setRole('patient'));await p.click('button:has-text("Clinic treatment")');
await p.click('text=Turn on Stage 3');console.log('lock button works',(await p.evaluate(()=>NC.DB&&1)),e);
await p.screenshot({path:'ux_30_rev.png',fullPage:true});await b.close()})()
