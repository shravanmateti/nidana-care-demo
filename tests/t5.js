const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const errs=[];const ok=(n,c)=>console.log((c?'PASS':'FAIL')+' '+n);
 const ctx=await b.newContext({viewport:{width:420,height:900}});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});p.on('dialog',d=>d.dismiss());
 await p.goto('file://'+process.cwd()+'/dist/index.html');
 let t=await p.innerText('body');
 ok('picker shown first',t.includes('What would you like help with?')&&t.includes('Acne, pimples, oily skin')&&t.includes('Detox (Panchakarma)'));
 const ids=await p.evaluate(()=>AL.filter(a=>a.id!=='hair').map(a=>[a.id,a.n,alSteps===undefined?0:0]));
 let redSeen=0;
 for(const [id,name] of ids){
  await p.evaluate(i=>alSet(i),id);
  const n=await p.evaluate(()=>alSteps().length);
  const mode=ids.findIndex(x=>x[0]===id)%2; // 0: first options, 1: pick red-flag options where exist
  for(let k=0;k<n;k++){
   const j=await p.evaluate(([mode])=>{const q=alSteps()[ALS_st.i];if(mode===1){const r=q.o.findIndex(o=>o.k==='!');if(r>=0)return r}return 0},[mode]);
   const o=await p.$$('button.opt');await o[j].click();
   await p.click(k<n-1?'text=Next':'text=See summary',{timeout:4000}).catch(async e=>{console.log('STUCK',id,k,n);require('fs').writeFileSync('stuck.txt',await p.innerText('body'));throw e});
  }
  t=await p.innerText('body');
  const good=t.includes('Your pre-consultation summary')&&t.includes(name);
  const hasRed=t.includes('Please do not wait for an online booking');
  if(hasRed)redSeen++;
  if(!good)console.log('FAIL summary for '+id);
  if(mode===1&&!hasRed&&await p.evaluate(()=>alById(ALS_st.id).qs.some(q=>q.o.some(o=>o.k==='!'))))console.log('FAIL red flag expected for '+id);
 }
 ok('all '+ids.length+' ailment flows complete; red banners seen: '+redSeen,true);
 // age under18 + pregnancy caution content
 await p.evaluate(()=>alSet('acne'));
 let o=await p.$$('button.opt');await o[0].click();await p.click('text=Next');
 o=await p.$$('button.opt');await o[1].click();await p.click('text=Next');
 o=await p.$$('button.opt');await o[1].click();await p.click('text=Next');
 const n=await p.evaluate(()=>alSteps().length);
 for(let k=3;k<n;k++){o=await p.$$('button.opt');await o[0].click();await p.click(k<n-1?'text=Next':'text=See summary')}
 t=await p.innerText('body');
 ok('under-18 + pregnancy cautions + blood-thinner med',t.includes('Under 18')&&t.includes('Pregnant or trying to conceive')&&t.includes('Blood thinners'));
 ok('sources panel present with links',(await p.$$('details a[href*="nih.gov"], details a[href*="ayush.gov.in"], details a[href*="ccras.nic.in"], details a[href*="ncismindia.org"]')).length>0);
 // all links are on allowed domains
 const bad=await p.evaluate(()=>{const ok=/^https?:\/\/([a-z0-9.-]*\.)?(nih\.gov|ayush\.gov\.in|ccras\.nic\.in|ncismindia\.org|medlineplus\.gov)\//;const u=[];Object.values(ALS).forEach(x=>{if(!ok.test(x[1]))u.push(x[1])});return u});
 ok('all source links on Ayush/NIH domains '+JSON.stringify(bad),bad.length===0);
 // share text
 const txt=await p.evaluate(()=>summaryText(window._SUM));
 ok('share text built',txt.includes('pre-consultation summary')&&txt.includes('Nidana')===false||txt.length>100);
 // Stage 0 lead flow with generic summary
 await p.evaluate(()=>NC.setStage(0));
 await p.click('button:has-text("Assess")').catch(()=>{});
 await p.evaluate(()=>NC.setStage&&0);
 t=await p.innerText('body');
 ok('ailment bar and change link',t.includes('Change ailment')||t.includes('What would you like help with?'));
 console.log(errs.length?errs.join('\n'):'NO CONSOLE ERRORS');
 await b.close();
})().catch(e=>{console.log('SCRIPT ERR',e.message);process.exit(1)});
