const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const errs=[];const ok=(n,c)=>console.log((c?'PASS':'FAIL')+' '+n);
 const p=await (await b.newContext({viewport:{width:900,height:900}})).newPage();
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});p.on('dialog',d=>d.dismiss());
 await p.goto('file://'+process.cwd()+'/dist/index.html');
 const d=await p.evaluate(()=>({np:NC.DB.products.length,nproc:PROCS.length,noSrc:NC.DB.products.filter(x=>!x.ref.length).map(x=>x.id),bad:PROCS.filter(n=>PROC_INFO[n].ail.some(a=>!alById(a))),badP:NC.DB.products.filter(x=>x.ail.some(a=>!alById(a))).map(x=>x.id),clinicBad:NC.DB.clinics.flatMap(c=>Object.keys(c.treat).filter(n=>!PROC_INFO[n]))}));
 console.log(JSON.stringify(d));
 ok('every ailment id valid',d.bad.length===0&&d.badP.length===0&&d.clinicBad.length===0);
 // ailments with no product or no treatment
 const gaps=await p.evaluate(()=>AL.filter(a=>a.id!=="hair"||1).map(a=>[a.id,NC.DB.products.filter(x=>x.ail.includes(a.id)).length,PROCS.filter(n=>PROC_INFO[n].ail.includes(a.id)).length]).filter(x=>x[1]===0||x[2]===0));
 console.log('gaps (id,products,treatments):',JSON.stringify(gaps));
 // catalogue views
 await p.evaluate(()=>{NC.setStage(4)});
 for(const [role,tab] of [['admin','cat'],['doctor','cat']]){await p.evaluate(([r,t])=>NC.goto(r,t),[role,tab]);const t=await p.innerText('body');ok(role+' catalogue renders',t.includes('Catalogue by ailment')&&t.includes('Nishamalaki churna')&&t.includes('Kati basti'))}
 await p.selectOption('select >> nth=-1',{value:'arthritis'}).catch(()=>{});
 await p.evaluate(()=>{window._catF='arthritis';NC.render()});
 let t=await p.innerText('body');ok('filter arthritis shows Yograj, hides Nishamalaki',t.includes('Yograj guggulu')&&!t.includes('Nishamalaki churna'));
 // admin approval gating: Kamaduddha pending hm without assay
 await p.evaluate(()=>NC.goto('admin','verify'));t=await p.innerText('body');
 ok('Kamaduddha blocked without heavy-metal assay',t.includes('Kamaduddha')&&t.includes('heavy-metal assay not ready'));
 // full clinical flow for ailment arthritis with pregnancy caution: doctor sheet
 await p.evaluate(()=>{NC.setRole('patient');NC.setStage(4);NC.setTab('assess')});
 await p.evaluate(()=>{alSet('arthritis')});
 const n=await p.evaluate(()=>alSteps().length);
 for(let k=0;k<n;k++){const j=await p.evaluate(()=>{const q=alSteps()[ALS_st.i];return ALS_st.i===1?1:0});const o=await p.$$('button.opt');await o[j].click();await p.click(k<n-1?'text=Next':'text=See summary')}
 await p.evaluate(()=>NC.goto('patient','book'));
 await p.click('text=Dr. Meera Nair').catch(()=>{});
 const hasBook=await p.evaluate(()=>typeof NC.confirmBook==='function');
 // book through API
 await p.evaluate(()=>{const a=NC.DB.assessments[NC.DB.assessments.length-1];NC.DB.appts.push({id:'ap1',doctor:'d1',slot:'Mon 10:00',fee:500,status:'booked',assess:a.id,when:new Date().toISOString()})});
 await p.evaluate(()=>{NC.setRole('doctor');NC.setTab('appts')});
 await p.evaluate(()=>NC.openCase('ap1'));
 t=await p.innerText('body');
 ok('preg warning on case sheet',t.includes('Pregnancy or recent delivery reported'));
 const dis=await p.evaluate(()=>[...document.querySelectorAll('#tp option')].filter(o=>o.disabled).map(o=>o.textContent));
 ok('shodhana disabled when pregnant: '+dis.length,dis.length>=5&&dis.includes('Virechana (therapeutic purgation)'));
 const grp=await p.evaluate(()=>[...document.querySelectorAll('#mp optgroup')].map(g=>g.label+':'+g.children.length));
 ok('medicine list grouped by ailment '+grp.join('|'),grp[0].startsWith('Matches this ailment'));
 console.log(errs.length?errs.join('\n'):'NO CONSOLE ERRORS');
 await b.close();
})().catch(e=>{console.log('SCRIPT ERR',e.message);process.exit(1)});
