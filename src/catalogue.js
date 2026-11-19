/* ===== Medicine catalogue and clinic treatments mapped to ailments =====
   References: Ministry of Ayush family (CCRAS, AIIA, NCISM, Ayush STG) and NIH family (NCCIH, NLM PMC) only.
   Prices, batches, suppliers and clinics are made-up samples. Doses are never suggested; the doctor writes them. */
const CR={
 ebp:["CCRAS: Evidence-based Ayurvedic practice (diabetes, lipid and other protocols)","https://ccras.nic.in/wp-content/uploads/2024/06/Evidence_based_Ayurvedic_Practice.pdf"],
 obe:["CCRAS: Obesity (Sthaulya) protocol","https://ccras.nic.in/wp-content/uploads/2023/06/Obesity.pdf"],
 stg:["Ministry of Ayush: Ayurveda STG, metabolic disorders","https://ayush.gov.in/assets/pdf/publichealth/STG_Ayuveda_Metabolc_Disorders.pdf"],
 pso:["CCRAS: Psoriasis, an agonizing skin disease","http://www.ccras.nic.in/content/psoriasis-agonizing-skin-disease"],
 psoF:["CCRAS: Kitibha (psoriasis) FAQ","https://ccras.nic.in/wp-content/uploads/2023/06/Psoriasis.pdf"],
 clin:["CCRAS: Clinical research programme (Kitibha, Vicharchika, Amavata, Grahani, Gridhrasi lists)","https://ccras.nic.in/services/clinical-research/"],
 ama:["CCRAS: Ayurvedic guidelines for Amavata","http://www.ccras.nic.in/content/ayurvedic-guidelines-amavata-rheumatoid-arthritis"],
 ar80:["CCRAS annual report 1980-81 (Amlapitta, Amavata trials)","https://ccras.nic.in/wp-content/uploads/2023/07/Annual-Reports-1980-1981.pdf"],
 ayu:["AIIA: AyuCaRe case reports (Udvartana, Virechana, Vasti, thyroid, frozen shoulder)","https://aiia.gov.in/wp-content/uploads/2019/03/AyuCaRe-Vol-1-Issue-1.pdf"],
 bul:["CCRAS Bulletin Vol 2 Issue 3 (Janu Sandhigata Vata, Ksheera Bala oil, Matra Basti)","https://ccras.nic.in/wp-content/uploads/2025/11/11112025-CCRAS-Bulletin-Vol-2-Issue-3.pdf"],
 bul2:["CCRAS Bulletin Apr-Jun 2025 (Rasayana, psoriasis case)","https://ccras.nic.in/wp-content/uploads/2025/06/CCRAS-Bulletin-Apr-Jun-2025.pdf"],
 skinD:["CCRAS: Ayurveda diet and lifestyle guidelines, skin diseases","https://ccras.nic.in/wp-content/uploads/2024/06/Ayurveda-Based-diet-lifeStyle-Guidelines-Skin-Diseases.pdf"],
 swa:["CCRAS: Swasthavritta (Dinacharya, Udvartana)","http://ccras.nic.in/node/978"],
 ncP:["NCISM: BAMS Panchakarma curriculum (Abhyanga, Swedana, Basti types)","https://ncismindia.org/2.%20NCISM_IIIBAMS_AyUG-PK.pdf"],
 ncB:["NCISM: MD Ayurveda Bala Panchakarma (Abhyanga, Pizhichil, Kati/Janu/Prishta basti)","https://www.ncismindia.org/NCISM-AYPG-AB-KB.pdf"],
 nccih:["NCCIH (NIH): Ayurvedic medicine in depth, safety","https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth"],
 pmcM:["NLM PMC: Toxic metals in Ayurvedic preparations","https://pmc.ncbi.nlm.nih.gov/articles/PMC6060866/"],
 pmcC:["NLM PMC: Three cases of lead toxicity (Brahmi bati, Mahayogaraj guggulu analysed)","https://pmc.ncbi.nlm.nih.gov/articles/PMC3001842/"]
};
/* product: [id,supplier,name,form,price,batch,ailments,refs,flags] flags: hm = contains metals/minerals, ht = heavy-metal assay on file, st = status, note */
function CAT_PRODUCTS(){
 const P=(id,sup,name,form,price,batch,ail,ref,o={})=>({id,sup,name,form,price,batch,status:o.st||"approved",ail,ref,hm:!!o.hm,ht:o.ht!==undefined?o.ht:true,note:o.note||""});
 return [
 P("p1","s1","Bhringaraja taila (hair oil)","Oil, 200 ml",320,"BH-2411",["hair"],[CR.bul2],{note:"Bhringaraja is named as a Rasayana for liver health in the CCRAS bulletin. No Ayush page reviewed here states a hair indication; this item was in the first catalogue."}),
 P("p2","s1","Neelibhringadi taila","Oil, 200 ml",380,"NB-2410",["hair"],[],{note:"No Ayush or NIH page reviewed here covers this oil. Kept from the first catalogue; doctor discretion."}),
 P("p3","s2","Amalaki churna","Powder, 100 g",140,"AM-2409",["diabetes","immunity"],[CR.ebp],{note:"Amalaki is half of Nishamalaki (CCRAS diabetes protocol)."}),
 P("p4","s2","Triphala churna","Powder, 100 g",120,"TR-2412",["constip","psoriasis","obesity","bloat"],[CR.bul2,CR.obe,CR.ayu],{note:"CCRAS case report: Triphala used first to improve digestion in psoriasis. AIIA case report mentions Triphala for constipation. Listed for obesity by CCRAS."}),
 P("p5","s2","Brahmi vati","Tablets, 60",210,"BR-2408",["stress","anxiety"],[CR.bul2,CR.pmcC],{hm:true,note:"The CCRAS bulletin names Shankhapushpi and Mandukaparni for mental Rasayana, not Brahmi vati. An NIH-indexed case report found high mercury in a Brahmi bati product, so only batches with a heavy-metal assay are allowed."}),
 P("p6","s1","Anu taila (nasya drops)","Drops, 10 ml",260,"AN-2411",["hair"],[],{note:"Kept from the first catalogue; no source reviewed here for the indication."}),
 P("p7","s3","Herbal hair growth capsule (new)","Capsules, 60",450,"",["hair"],[],{st:"pending"}),
 P("p8","s2","Nishamalaki churna","Powder, 100 g",150,"NM-2501",["diabetes"],[CR.ebp,CR.stg],{note:"CCRAS protocol for early diabetes: equal parts Amalaki and Haridra, with meditation. The Ayush STG says follow-up every 15 days."}),
 P("p9","s2","Triphala guggulu","Tablets, 60",230,"TG-2502",["obesity"],[CR.obe],{note:"Listed among compound formulations for Sthaulya (CCRAS)."}),
 P("p10","s2","Trikatu churna","Powder, 50 g",110,"TK-2503",["obesity"],[CR.obe,CR.ayu],{note:"Listed for Sthaulya (CCRAS). Deepana action described in an AIIA case report."}),
 P("p11","s1","Takrarishta","Liquid, 450 ml",190,"TA-2504",["obesity","ibs"],[CR.obe,CR.clin],{note:"Listed for Sthaulya (CCRAS) and in the CCRAS Grahani list with Bilwa majja churna."}),
 P("p12","s2","Vidangadi churna","Powder, 100 g",130,"VD-2505",["obesity"],[CR.obe]),
 P("p13","s1","Triphaladya guggulu","Tablets, 60",260,"TY-2506",["thyroid"],[CR.ayu],{note:"Only a single AIIA case report (hypothyroidism, used with Punarnavadi kashaya). Evidence is very thin. The patient must not stop thyroid medicine without the treating doctor."}),
 P("p14","s2","Kaishore guggulu","Tablets, 60",240,"KG-2507",["eczema","psoriasis","scalppso"],[CR.clin,CR.ayu],{note:"Named in CCRAS clinical studies for Vicharchika (eczema) and Kitibha (psoriasis)."}),
 P("p15","s1","Khadirarishta","Liquid, 450 ml",210,"KH-2508",["eczema","dermatitis"],[CR.clin],{note:"CCRAS completed a trial of Khadirarishta, Kaishore guggulu and Gandhakadya malahar in Vicharchika."}),
 P("p16","s2","Gandhakadya malahar (external)","Ointment, 50 g",180,"GM-2509",["eczema"],[CR.clin],{hm:true,note:"Contains sulphur (mineral). Heavy-metal assay required. Named in the CCRAS Vicharchika trial."}),
 P("p17","s1","Chakramarda taila (external)","Oil, 100 ml",210,"CT-2510",["psoriasis","scalppso"],[CR.clin],{note:"Named for local application in Kitibha (CCRAS)."}),
 P("p18","s2","Haridra churna","Powder, 100 g",100,"HR-2511",["psoriasis","eczema"],[CR.pso],{note:"CCRAS lists Haridra among drugs for skin disease, with Nimba, Manjishtha and Triphala."}),
 P("p19","s2","Nimba churna","Powder, 100 g",100,"NI-2512",["psoriasis","eczema","fungal"],[CR.pso,CR.skinD]),
 P("p20","s1","Manjishtha churna","Powder, 100 g",140,"MJ-2513",["psoriasis","eczema"],[CR.pso]),
 P("p21","s2","Yograj guggulu","Tablets, 60",250,"YG-2514",["arthritis","backpain","spondylosis"],[CR.ar80,CR.clin],{ht:true,note:"Used in CCRAS Amavata trials and listed for Gridhrasi. Not the same as Mahayogaraj guggulu, which an NIH-indexed case report found to contain high lead. Assay required."}),
 P("p22","s1","Maharasnadi kwatha","Liquid, 450 ml",200,"MR-2515",["arthritis","spondylosis","backpain"],[CR.ar80],{note:"Used with Panchakarma in CCRAS Vata vyadhi studies."}),
 P("p23","s1","Rasna saptaka kwatha","Liquid, 450 ml",190,"RS-2516",["arthritis"],[CR.ar80,CR.ayu],{note:"Used in CCRAS Amavata trials and in an AIIA case report."}),
 P("p24","s1","Nirgundi taila (external)","Oil, 200 ml",230,"NG-2517",["arthritis"],[CR.ar80],{note:"CCRAS: more effective in Amavata of under one year."}),
 P("p25","s1","Hingu triguna taila","Oil, 200 ml",260,"HT-2518",["backpain","spondylosis"],[CR.clin],{note:"Listed with Yograj guggulu for Gridhrasi in the CCRAS clinical list."}),
 P("p26","s1","Ksheera bala taila (external)","Oil, 200 ml",340,"KB-2519",["arthritis","spondylosis"],[CR.bul],{note:"CCRAS pilot study in Janu Sandhigata Vata (24 patients). Small study."}),
 P("p27","s2","Guduchi churna","Powder, 100 g",120,"GD-2520",["arthritis","immunity"],[CR.ar80,CR.bul2],{note:"Shunthi with Guduchi kwatha was used in CCRAS Amavata trials."}),
 P("p28","s2","Avipattikara churna","Powder, 100 g",130,"AV-2521",["acidity"],[CR.ar80],{note:"Used in a 65-patient CCRAS Amlapitta study with other drugs."}),
 P("p29","s2","Guduchi satva","Powder, 25 g",160,"GS-2522",["acidity"],[CR.ar80]),
 P("p30","s2","Bilwa majja churna","Powder, 50 g",110,"BM-2523",["ibs"],[CR.clin],{note:"Listed with Takrarishta for Grahani roga in the CCRAS clinical list."}),
 P("p31","s2","Shankhapushpi syrup","Syrup, 200 ml",170,"SP-2524",["stress","anxiety","insomnia"],[CR.bul2],{note:"CCRAS bulletin names Shankhapushpi and Mandukaparni for cognitive and mental Rasayana. No retrieved source gives an insomnia indication."}),
 P("p32","s2","Mandukaparni churna","Powder, 50 g",120,"MP-2525",["stress","anxiety"],[CR.bul2]),
 P("p33","s2","Sudarshana ghana vati","Tablets, 60",200,"SG-2526",["immunity"],[CR.bul2],{note:"Named in a CCRAS bulletin case (fever care). Not a general immunity claim."}),
 P("p34","s1","Triphaladi taila (nasya)","Drops, 10 ml",280,"TN-2527",["obesity","diabetes"],[CR.stg],{note:"Ayush STG: Nasya with Triphaladi taila for excessive sleep and lethargy in metabolic disorders."}),
 P("p35","s2","Yava churna (for Udvartana)","Powder, 500 g",90,"YV-2528",["obesity","diabetes"],[CR.stg,CR.ayu],{note:"Yava, Kola-kulattha or Triphala powders are named for Udvartana in obese diabetics (Ayush STG)."}),
 P("p36","s2","Arogyavardhini vati","Tablets, 60",220,"AR-2529",["obesity"],[CR.obe,CR.nccih],{hm:true,note:"Listed for Sthaulya (CCRAS). Contains Rasa (mineral) ingredients. NIH (NCCIH) warns some Ayurvedic preparations contain lead, mercury or arsenic. Assay required."}),
 P("p37","s3","Kamaduddha ras","Tablets, 60",200,"KD-2530",["acidity"],[CR.ar80,CR.pmcM],{hm:true,ht:false,st:"pending",note:"Used in the CCRAS Amlapitta study. Herbo-mineral. Cannot be approved without a heavy-metal assay."})
 ];
}
/* procedures: ailments, source, shodhana (needs pregnancy check), note */
const PROC_INFO={
 "Shiro-abhyanga (scalp oil massage)":{ail:["hair","dandruff"],ref:[CR.ncB],sh:0},
 "Shirolepa (scalp paste)":{ail:["hair","dandruff"],ref:[],sh:0,note:"No source reviewed here for the indication."},
 "Shirodhara":{ail:["stress","anxiety","insomnia","hair"],ref:[CR.stg],sh:0,note:"The Ayush STG glossary defines Shirodhara. No retrieved Ayush or NIH page states an indication for stress or sleep, so this is doctor's discretion."},
 "Takradhara":{ail:["hair"],ref:[],sh:0,note:"No source reviewed here for the indication."},
 "Nasya (nasal oil therapy)":{ail:["hair","obesity","diabetes"],ref:[CR.stg],sh:1,note:"Ayush STG: Nasya with Triphaladi taila for lethargy and excess sleep in metabolic disorders."},
 "Abhyanga (whole-body oil massage)":{ail:["immunity","seasonal","backpain","arthritis"],ref:[CR.swa,CR.ncP],sh:0,note:"CCRAS recommends daily oil massage for health. NCISM teaches the procedure."},
 "Udvartana (dry powder massage)":{ail:["obesity","diabetes","arthritis","spondylosis"],ref:[CR.stg,CR.obe,CR.ayu],sh:0,note:"Ayush STG and CCRAS: Ruksha udvartana in obesity and in diabetes with excess fat. AIIA case reports use it before other procedures."},
 "Patra pinda sweda (leaf bolus fomentation)":{ail:["arthritis","backpain","spondylosis"],ref:[CR.clin,CR.ncP],sh:0,note:"Nirgundi patra pinda sweda is in the CCRAS Gridhrasi list."},
 "Baluka sweda (sand fomentation)":{ail:["arthritis"],ref:[CR.ar80],sh:0,note:"Used with Lepa in CCRAS Amavata trials."},
 "Jambeera pinda sweda":{ail:["arthritis","spondylosis"],ref:[CR.ayu],sh:0,note:"AIIA case report on frozen shoulder. Single report."},
 "Kati basti (lumbar oil pooling)":{ail:["backpain","spondylosis"],ref:[CR.ncB,CR.ncP],sh:0,note:"NCISM lists Kati basti among Bahya basti. Lumbar indication follows the curriculum, not a trial."},
 "Janu basti (knee oil pooling)":{ail:["arthritis"],ref:[CR.ncB],sh:0,note:"NCISM lists Janu basti. CCRAS notes Matra basti is traditional for knee Sandhigata Vata."},
 "Prishta basti (spine oil pooling)":{ail:["backpain","spondylosis"],ref:[CR.ncB],sh:0},
 "Matra basti (small-dose oil enema)":{ail:["arthritis"],ref:[CR.bul],sh:1,note:"CCRAS bulletin: traditional for Janu Sandhigata Vata but usually needs admission."},
 "Virechana (therapeutic purgation)":{ail:["psoriasis","eczema","dermatitis","obesity","arthritis","scalppso","panchakarma"],ref:[CR.psoF,CR.obe,CR.ama],sh:1,note:"CCRAS: monthly purgation in skin diseases; also listed for Sthaulya and Amavata."},
 "Vamana (therapeutic emesis)":{ail:["psoriasis","scalppso","obesity","diabetes","panchakarma"],ref:[CR.psoF,CR.obe,CR.stg],sh:1,note:"CCRAS: fortnightly emesis in skin disease. Ayush STG: Vamana in strong obese patients."},
 "Lekhana basti (scraping enema)":{ail:["obesity"],ref:[CR.obe],sh:1},
 "Raktamokshana (leech therapy)":{ail:["psoriasis","eczema","scalppso"],ref:[CR.psoF],sh:1,note:"CCRAS: leech therapy is indicated in certain patients."}
};
const PROCS=Object.keys(PROC_INFO);
const SUP_LOC={s1:{pin:"682001",lat:9.98,lng:76.28,dispatch:1,ship:60,restock:7},s2:{pin:"500001",lat:17.39,lng:78.47,dispatch:1,ship:50,restock:7}};
function CAT_STOCK(){const st={};CAT_PRODUCTS().forEach((p,i)=>{if(p.status!=="approved")return;const o=p.sup==="s1"?"s2":"s1";st[p.id]={[p.sup]:[30,5,40,12][i%4]};if(i%3===0)st[p.id][o]=[3,8,15,4][i%4]});return st}
const CAT_LOC={c1:{pin:"682001",lat:9.98,lng:76.28},c2:{pin:"500001",lat:17.39,lng:78.47},c3:{pin:"600001",lat:13.09,lng:80.28}};
function CAT_CLINICS(addDays){
 const all=(m,x)=>Object.assign({},m,x);
 const L=[
 {id:"c1",name:"Vaidyashala Wellness, Kochi (sample)",city:"Kochi",treat:{"Shiro-abhyanga (scalp oil massage)":900,"Shirodhara":1800,"Takradhara":1500,"Nasya (nasal oil therapy)":700,"Abhyanga (whole-body oil massage)":1200,"Udvartana (dry powder massage)":1300,"Patra pinda sweda (leaf bolus fomentation)":1600,"Baluka sweda (sand fomentation)":1100,"Kati basti (lumbar oil pooling)":1400,"Janu basti (knee oil pooling)":1300,"Prishta basti (spine oil pooling)":1500,"Virechana (therapeutic purgation)":6500,"Vamana (therapeutic emesis)":6000},score:92,last:addDays(new Date(),-40),status:"audited"},
 {id:"c2",name:"Charak Ayurveda Centre, Hyderabad (sample)",city:"Hyderabad",treat:{"Shiro-abhyanga (scalp oil massage)":800,"Shirolepa (scalp paste)":1000,"Shirodhara":1600,"Nasya (nasal oil therapy)":600,"Abhyanga (whole-body oil massage)":1000,"Udvartana (dry powder massage)":1100,"Patra pinda sweda (leaf bolus fomentation)":1400,"Jambeera pinda sweda":1500,"Kati basti (lumbar oil pooling)":1200,"Janu basti (knee oil pooling)":1100,"Lekhana basti (scraping enema)":3500,"Raktamokshana (leech therapy)":2500,"Virechana (therapeutic purgation)":5500},score:84,last:addDays(new Date(),-75),status:"audited"},
 {id:"c3",name:"Kesha Care Clinic, Chennai (sample)",city:"Chennai",treat:{"Shirodhara":1700,"Shiro-abhyanga (scalp oil massage)":850,"Abhyanga (whole-body oil massage)":1100,"Udvartana (dry powder massage)":1200},score:68,last:addDays(new Date(),-150),status:"probation"}];
 L.forEach(c=>Object.assign(c,CAT_LOC[c.id]));return L
}
function catRefs(refs){return (refs||[]).map(r=>`<a href="${r[1]}" target="_blank" rel="noopener">${esc(r[0])}</a>`).join("<br>")}
const catAid=a=>a&&a.sum?(a.sum.kind==="gen"?a.sum.aid:"hair"):"";
const catPreg=a=>!!(a&&a.sum&&(a.sum.pg||a.sum.pp||(a.sum.cautions||[]).some(x=>/regnan|delivered/i.test(x))));
function catOpts(list,aid,label){const rel=list.filter(p=>(p.ail||[]).includes(aid)),oth=list.filter(p=>!(p.ail||[]).includes(aid));
 const o=p=>`<option value="${p.id}">${esc(label(p))}</option>`;
 return rel.length?`<optgroup label="Matches this ailment">${rel.map(o).join("")}</optgroup><optgroup label="Other products">${oth.map(o).join("")}</optgroup>`:oth.map(o).join("")}
function procOpts(aid,preg){const rel=PROCS.filter(n=>PROC_INFO[n].ail.includes(aid)),oth=PROCS.filter(n=>!PROC_INFO[n].ail.includes(aid));
 const o=n=>`<option ${preg&&PROC_INFO[n].sh?"disabled":""}>${esc(n)}</option>`;
 return rel.length?`<optgroup label="Matches this ailment">${rel.map(o).join("")}</optgroup><optgroup label="Other treatments">${oth.map(o).join("")}</optgroup>`:PROCS.map(o).join("")}
window._catFold=window._catFold||{};
function catView(DB,inr){
 const ids=AL.filter(a=>a.id!=="hair").map(a=>a.id);ids.unshift("hair");
 const f=window._catF||"";const nm=id=>(alById(id)||{n:id}).n;
 const ps=DB.products.filter(p=>!f||(p.ail||[]).includes(f)),pr=PROCS.filter(n=>!f||PROC_INFO[n].ail.includes(f));
 const hmTag=p=>p.hm?`<span class="tag a">herbo-mineral${p.ht?", assay on file":", assay missing"}</span>`:"";
 return `<h2>Catalogue by ailment</h2><div class="card"><label class="sm">Show items for<br><select onchange="window._catF=this.value;NC.render()"><option value="">All ailments</option>${ids.map(i=>`<option value="${i}" ${f===i?"selected":""}>${esc(nm(i))}</option>`).join("")}</select></label>
 <p class="mu sm" style="margin-top:8px">Each item cites an Ayush or NIH source. Where the source is a small study or only a definition, the note says so. This lists what the sources mention. It does not recommend a dose or a treatment. The doctor decides.</p></div>
 <div class="note sm"><b>Metal safety</b>NIH (NCCIH) warns that some Ayurvedic preparations contain lead, mercury or arsenic in toxic amounts. <a href="${CR.nccih[1]}" target="_blank" rel="noopener">NCCIH</a> · <a href="${CR.pmcC[1]}" target="_blank" rel="noopener">NLM case report</a>. Herbo-mineral items need a heavy-metal assay before approval.</div>
 <div class="note sm"><b>Gaps in this catalogue</b>${gapList(DB)}</div>
 <details class="card"${(window._catFold.m!==undefined?window._catFold.m:innerWidth>700)?" open":""} ontoggle="window._catFold.m=this.open"><summary><h3 style="display:inline">Medicines (${ps.length})</h3></summary><table><tr><th>Product</th><th>For</th><th>Status</th><th>Sources</th></tr>${ps.map(p=>`<tr><td>${esc(p.name)}<br><span class="mu sm">${esc(p.form)} · ${inr(p.price)}</span></td><td class="sm">${(p.ail||[]).map(a=>esc(nm(a))).join(", ")}${p.note?`<br><span class="mu">${esc(p.note)}</span>`:""}</td><td><span class="tag ${p.status==="approved"?"g":"a"}">${p.status}</span>${hmTag(p)}</td><td class="sm">${catRefs(p.ref)||"None reviewed"}</td></tr>`).join("")||"<tr><td colspan=4>None</td></tr>"}</table></details>
 <details class="card"${(window._catFold.t!==undefined?window._catFold.t:innerWidth>700)?" open":""} ontoggle="window._catFold.t=this.open"><summary><h3 style="display:inline">Clinic treatments (${pr.length})</h3></summary><table><tr><th>Treatment</th><th>For</th><th>Offered by</th><th>Sources</th></tr>${pr.map(n=>{const i=PROC_INFO[n];return `<tr><td>${esc(n)}${i.sh?`<br><span class="tag a">Shodhana: check pregnancy first</span>`:""}</td><td class="sm">${i.ail.map(a=>esc(nm(a))).join(", ")}${i.note?`<br><span class="mu">${esc(i.note)}</span>`:""}</td><td class="sm">${DB.clinics.filter(c=>c.treat[n]).map(c=>esc(c.city)+" "+inr(c.treat[n])).join("<br>")||"No clinic yet"}</td><td class="sm">${catRefs(i.ref)||"None reviewed"}</td></tr>`}).join("")||"<tr><td colspan=4>None</td></tr>"}</table></details>`}

function gapList(DB){const f=window._catF;const rows=AL.filter(a=>!f||a.id===f).map(a=>{const np=DB.products.filter(p=>p.ail.includes(a.id)).length,nt=PROCS.filter(n=>PROC_INFO[n].ail.includes(a.id)).length;return [a.n,np,nt]}).filter(r=>r[1]===0||r[2]===0);
 return rows.length?"No item was found in the Ayush or NIH pages reviewed for: "+rows.map(r=>esc(r[0])+" ("+(r[1]===0&&r[2]===0?"medicines and treatments":r[1]===0?"medicines":"clinic treatments")+")").join("; ")+". These are gaps in the sources reviewed here, not a finding that nothing helps. The doctor decides.":"None for this selection."}
