
// flags: d=diffuse, pa=patchy, sh=shock-shedding, he=hereditary, sP/sV/sK=scalp type, aV/aT/aM=agni vishama/tikshna/manda,
// am=ama, dh=dhatu depletion, st=stress, sl=sleep, ho=hormonal/systemic, nu=nutrition, ex=external, rd=red flag, ch=chronic
const Q=[
{s:"Pattern (Pareeksha)",q:"How would you describe the hair loss?",o:[
["Gradual thinning all over, wider parting",{d:1}],
["Receding hairline or crown thinning",{d:1,he:1}],
["Sudden round or oval bald patches",{pa:1}],
["Heavy shedding that began 2–3 months after illness, delivery, surgery or shock",{d:1,sh:1}]]},
{s:"Pattern (Pareeksha)",q:"How long has it been going on?",o:[
["Less than 3 months",{}],["3 to 12 months",{}],["More than a year",{ch:1}]]},
{s:"Scalp (Pareeksha)",q:"What does your scalp and hair feel like? Select all that apply.",m:1,o:[
["Hot, burning, sensitive or sweaty scalp; early greying",{p:2,sP:1}],
["Dry, tight scalp; hair rough, frizzy, brittle, splitting",{v:2,sV:1}],
["Oily, heavy scalp; flaking dandruff, itching",{k:2,sK:1}],
["None of these",{}]]},
{s:"Diet (Ahara)",q:"Which describes your usual food? Select all that apply.",m:1,o:[
["Lots of spicy, salty, sour, fried or processed food; tea, coffee or alcohol",{p:2,hP:1}],
["Skipped or irregular meals, dry or cold food, crash dieting",{v:2,hV:1}],
["Heavy, sweet, oily or dairy-rich food; overeating; cold drinks",{k:2,hK:1}],
["Low in protein, greens, nuts or iron-rich foods",{nu:1}]]},
{s:"Lifestyle (Vihara)",q:"What best describes your stress?",o:[
["Worry, anxiety, overthinking, fear",{v:2,st:1}],
["Anger, irritability, deadline pressure",{p:2,st:1}],
["Low mood, lethargy, attachment, withdrawal",{k:2,st:1}],
["Mostly calm",{}]]},
{s:"Lifestyle (Vihara)",q:"How is your sleep?",o:[
["Light, broken, or under 6 hours",{v:1,sl:1}],
["Late nights, screens, but I fall asleep",{p:1,sl:1}],
["Long and heavy, wake up groggy",{k:1}],
["Sound, 7–8 hours",{}]]},
{s:"Digestion (Agni)",q:"How is your digestion and appetite?",o:[
["Irregular hunger, gas, bloating, constipation",{v:1,aV:1}],
["Sharp hunger, acidity, heartburn, loose stools",{p:1,aT:1}],
["Low hunger, heaviness, nausea after eating",{k:1,aM:1}],
["Regular and comfortable",{}]]},
{s:"Digestion (Agni)",q:"Do you notice signs of undigested residue (Ama)? Select all that apply.",m:1,o:[
["Coated tongue in the morning",{am:1}],
["Heaviness or lethargy after meals",{am:1}],
["Sticky stools or foul breath",{am:1}],
["None",{}]]},
{s:"Tissues (Dhatu Posha)",q:"Any signs of Asthi or Majja dhatu depletion? Select all that apply.",m:1,o:[
["Brittle or ridged nails, weak teeth",{dh:1,v:1}],
["Joint cracking, bone or back aches",{dh:1,v:1}],
["Constant fatigue or weakness, easily exhausted",{dh:1}],
["Dry skin and lips, weight loss",{dh:1,v:1}],
["None",{}]]},
{s:"Systemic review",q:"Any of these? Select all that apply.",m:1,o:[
["Thyroid disorder",{ho:"thyroid"}],
["PCOS or irregular periods",{ho:"PCOS / hormonal"}],
["Delivery or breastfeeding in the last 12 months",{ho:"postpartum",pp:1,ca:"Recent delivery or breastfeeding: skip Nasya and Shodhana, and check any herb with your doctor."}],
["Anaemia, low ferritin, B12 or vitamin D",{ho:"nutrient deficiency",nu:1}],
["Fever, surgery or major illness in the last 6 months",{sh:1}],
["None",{}]]},
{s:"Heredity & habits",q:"Does baldness or thinning run in your family?",o:[
["Yes, parents or grandparents",{he:1}],["No / not sure",{}]]},
{s:"Heredity & habits",q:"External factors (Agantuja Hetu). Select all that apply.",m:1,o:[
["Hot showers, hard water, frequent shampooing",{ex:1}],
["Colouring, straightening or heat styling",{ex:1}],
["Tight hairstyles, helmet or cap all day",{ex:1}],
["I never oil my scalp",{ex:1,v:1}],
["None",{}]]},
{s:"Safety check",q:"Any warning signs? Select all that apply.",m:1,o:[
["Painful, pus-filled or scarring scalp",{rd:"Painful, pus-filled or scarring scalp can mean scarring alopecia, where early treatment prevents permanent loss."}],
["Eyebrows, lashes or body hair also falling",{rd:"Loss of eyebrows, lashes or body hair together with scalp hair suggests a systemic or autoimmune cause."}],
["Patches with rash, scaly plaques or nail pitting",{rd:"Patches with rash or scaling need a skin examination to rule out fungal infection or psoriasis."}],
["Unexplained weight loss, fever or very rapid loss",{rd:"Rapid hair loss with weight loss or fever needs blood tests to rule out a systemic illness."}],
["None",{}]]}
];
Q.forEach((q,ix)=>q.tid=ix);
Q.unshift(
{s:"About you",q:"What is the age group of the person this is for?",o:[
["Under 18",{rd:"Hair fall in children and teenagers needs a doctor's check first, because causes differ from adults."}],
["18 to 40",{}],["41 to 60",{}],
["Over 60",{ca:"At older ages, hair loss and any herbs need extra care. Review the plan with a doctor."}]]},
{s:"About you",q:"Are you pregnant or trying to conceive?",o:[
["Yes",{pg:1,ca:"Pregnancy: do not start herbs, Nasya or Shodhana without your own doctor's approval."}],
["No / not applicable",{}]]},
{s:"Medicines",q:"Do you take any regular medicines? Select all that apply.",m:1,o:[
["Thyroid medicine",{med:"thyroid medicine"}],
["Blood pressure or heart medicine",{med:"blood pressure or heart medicine"}],
["Diabetes medicine or insulin",{med:"diabetes medicine"}],
["Blood thinner",{med:"blood thinner"}],
["Other regular medicine",{med:"other regular medicine"}],
["None",{}]]}
);
const P={
v:{n:"Vata",ahara:["Warm, freshly cooked, moist meals at fixed times","Include sesame, ghee, soaked almonds, dates, mung dal, sweet and sour fruits","Avoid fasting, raw salads, cold drinks, dry snacks"],
vihara:["Sleep before 10:30 pm; wind down without screens","Daily 10-minute breathing practice (Anulom Vilom, Bhramari)","Keep a steady daily routine"],
local:["Warm Abhyanga of the scalp with Bhringaraja or Neelibhringadi taila, 3 times a week, 30 minutes before a lukewarm wash","Nasya with Anu taila (2 drops each nostril), ideally taught by a Vaidya"],
herbs:["Ashwagandha, Bala, Shatavari (nourish Majja and calm Vata)","Bhringaraja and Amalaki (Kesya rasayana)"],
sho:"Anuvasana or Matra Basti, if indicated"},
p:{n:"Pitta",ahara:["Cooling, mildly sweet and bitter foods: gourd, coriander, pomegranate, amla, coconut water, ghee","Cut back on chilli, pickles, excess salt, sour curd, fried food, tea, coffee, alcohol","Don’t skip lunch; eat by 1 pm"],
vihara:["Avoid anger, overwork and midday sun; cover your head outdoors","Cool, not hot, water for the final rinse","Shitali pranayama and a short evening walk"],
local:["Cooling scalp Abhyanga with coconut oil, Bhringaraja or Neelibhringadi taila 2–3 times a week","Lepana with Amalaki, Bhringaraja and Yashtimadhu powder paste","Shirodhara with Ksheerabala taila, under supervision, if stress is prominent"],
herbs:["Amalaki, Guduchi, Yashtimadhu, Shatavari (Pitta-Rakta shamana)","Bhringaraja and Brahmi"],
sho:"Mridu Virechana, if indicated"},
k:{n:"Kapha",ahara:["Light, warm, dry-cooked food with bitter, pungent and astringent tastes; barley, millet, mung, leafy greens","Reduce dairy, sweets, fried and cold food; avoid daytime sleep","Ginger-cumin or Trikatu water before meals"],
vihara:["Daily brisk exercise for at least 30 minutes","Wake before 6:30 am; no daytime naps","Wash scalp regularly to prevent build-up"],
local:["Light oiling only 1–2 times a week (Bhringaraja or sesame oil, warm), washed off within 30 minutes","Wash with Shikakai, Reetha or Triphala decoction","Lepana with Triphala and Nimba for flaking or itching"],
herbs:["Triphala, Trikatu, Guduchi (clear Ama and Srotorodha)","Bhringaraja, Nimba"],
sho:"Vamana or Lekhana therapy, if indicated"}};

let i=0,ans=Q.map(()=>[]);let app=null;
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
function _i0(){app.innerHTML=`<h1>Khalitya Nidana</h1><p class="mu" style="margin:6px 0 18px">An Ayurvedic hair fall assessment that follows classical Roga Pariksha: cause, scalp, digestion and tissues, then a root-cause diagnosis and plan.</p>
<div class="card"><h3>What happens next</h3><ul><li>14 short questions, about 4 minutes</li><li>You get a Dosha profile, root causes and a personalised plan</li><li>Nothing leaves your device unless you choose to share it</li></ul>
<p class="mu">This is an educational screening tool. It does not replace examination by a registered Ayurvedic physician (BAMS) or a dermatologist.</p></div>
<button class="btn" style="width:100%" onclick="go(0)">Start assessment</button>`}
function go(n){if(n===0&&window.onAssessmentStart)window.onAssessmentStart();if(window.onAssessmentStep)window.onAssessmentStep(n);i=n;draw()}
function _d0(){const q=Q[i],a=ans[i];
app.innerHTML=`<div class="bar" role="progressbar" aria-valuenow="${i+1}" aria-valuemax="${Q.length}"><i style="width:${(i+1)/Q.length*100}%"></i></div>
<div class="sec">${q.s} · Question ${i+1} of ${Q.length}</div><h2>${q.q}</h2>
${q.o.map((o,j)=>`<button class="opt ${a.includes(j)?"on":""}" onclick="pick(${j})">${esc(o[0])}</button>`).join("")}
<div class="row"><button class="btn g" onclick="${i?`go(${i-1})`:"intro()"}">Back</button>
<button class="btn" ${a.length?"":"disabled"} onclick="${i<Q.length-1?`go(${i+1})`:"result()"}">${i<Q.length-1?"Next":"See diagnosis"}</button></div>`;scrollTo(0,0)}
function pick(j){const q=Q[i],none=q.o.length-1;let a=ans[i];
if(!q.m){a=[j]}else{const isNone=q.o[j][0]==="None"||q.o[j][0]==="None of these"||q.o[j][0]==="No / not sure";
if(isNone)a=[j];else{a=a.filter(x=>!/^None/.test(q.o[x][0]));a=a.includes(j)?a.filter(x=>x!==j):[...a,j]}}
ans[i]=a;draw()}
function result(){cur=result;
const S={v:0,p:0,k:0},F={},H=[],R=[],MD=[],CA=[];
ans.forEach((a,qi)=>a.forEach(j=>{const f=Q[qi].o[j][1];for(const k in f){
if(k==="ho")H.push(f[k]);else if(k==="med")MD.push(f[k]);else if(k==="ca")CA.push(f[k]);else if(k==="rd")R.push(f[k]);else if(k==="v"||k==="p"||k==="k")S[k]+=f[k];else F[k]=(F[k]||0)+f[k]}}));
if(F.pa)R.push("Sudden patchy hair loss should be seen by a doctor or dermatologist first, because causes such as alopecia areata or fungal infection need different treatment.");
const tot=S.v+S.p+S.k||1,rank=Object.keys(S).sort((a,b)=>S[b]-S[a]);
const noPat=(S.v+S.p+S.k)===0,dual=S[rank[1]]>=S[rank[0]]*0.8&&S[rank[1]]>0,doms=noPat?[]:(dual?[rank[0],rank[1]]:[rank[0]]);
const dn=noPat?"No clear dosha pattern":doms.map(d=>P[d].n).join("–");
const type=F.pa?"Indralupta (patchy hair loss)":"Khalitya (diffuse hair loss)";
const agni=F.aV>=1&&F.aT>=1?"Mixed":F.aV?"Vishama Agni (irregular, Vata)":F.aT?"Tikshna Agni (excessive, Pitta)":F.aM?"Manda Agni (weak, Kapha)":"Sama Agni (balanced)";
const ama=F.am>=2?"Significant":F.am?"Mild":"Not evident";
const dhatu=F.dh>=3||(F.dh&&F.nu)?"Asthi–Majja Dhatu Kshaya (depletion) likely":F.dh?"Early Asthi–Majja strain":"No clear depletion";
// root causes
const rc=[];
if(F.hP)rc.push("Pitta-provoking diet (Ahara Nidana): heat reaches the hair roots and weakens them.");
if(F.hV)rc.push("Vata-provoking diet (Ahara Nidana): irregular, dry or restricted eating starves Asthi and Majja dhatu.");
if(F.hK)rc.push("Kapha-provoking diet (Ahara Nidana): heavy food causes Ama and blocks scalp channels.");
if(F.nu)rc.push("Low protein or iron intake: raw material for Asthi dhatu is short.");
if(F.st)rc.push("Mental stress (Manasika Nidana) disturbs Doshas and raises cortisol.");
if(F.sl)rc.push("Poor sleep (Vihara Nidana) aggravates Vata and Pitta and delays tissue repair.");
if(F.aV||F.aT||F.aM)rc.push("Disturbed Agni: food is not fully converted into nourishing Dhatus.");
if(F.am)rc.push("Ama (metabolic residue) is clogging the channels (Srotorodha) that carry nutrition to the scalp.");
if(F.dh)rc.push("Asthi–Majja Dhatu weakness: hair (Kesha) is the Mala of Asthi, so weak tissue shows first as thin hair.");
if(F.he)rc.push("Hereditary tendency (Sahaja or Kulaja): points to a longer course and need for sustained therapy.");
if(F.sh)rc.push("Recent shock to the body (Agantuja Hetu): a temporary surge of shedding is common 2–3 months after illness or delivery.");
if(H.length)rc.push("Systemic factors to confirm with blood tests: "+H.join(", ")+".");
if(F.ex)rc.push("External damage: washing, heat, chemicals or friction weakens hair shafts and scalp.");
const key=doms[0];
const sam={v:"Vata is aggravated by irregular food, stress and sleep loss. It dries and depletes Asthi–Majja dhatu, so roots lose nourishment and hair turns brittle and thin.",
p:"Pitta is aggravated by heat-producing diet and stress. It vitiates Rakta and burns the hair follicle (Kesha-bhumi), causing shedding with scalp heat and early greying.",
k:"Kapha and Ama block the scalp’s channels (Srotorodha), so nourishment doesn’t reach the roots. The scalp becomes oily and heavy, with flaking and shedding."};
const prog=F.pa?"Often self-limiting, but needs a skin check. Review at 4–6 weeks.":F.sh&&!F.he?"Good. Shedding usually settles within 3–6 months once the trigger is addressed.":F.he||F.ch?"Slower and managed rather than cured: Yapya to Krichra-sadhya. Expect 3–6 months before change, and sustained care.":"Generally favourable (Sadhya) if causes are corrected. Allow 3 months for visible change.";
const m=f=>doms.flatMap(d=>P[d][f]);
const bar=d=>`<div class="dos"><div><span>${P[d].n}</span><span>${Math.round(S[d]/tot*100)}%</span></div><s style="width:${Math.max(4,S[d]/tot*100)}%"></s></div>`;
const herbLock=!!(F.pg||F.pp||MD.length||H.indexOf("thyroid")>=0),noSho=!!(F.pg||F.pp),gated=R.length>0&&!window._gateOpen;
const lockWhy=[F.pg?"pregnancy":"",F.pp?"recent delivery or breastfeeding":"",MD.length?"regular medicines ("+MD.join(", ")+")":"",H.indexOf("thyroid")>=0?"thyroid disorder":""].filter(Boolean).join(", ");
const cautions=[...CA];if(herbLock)cautions.push("Herb suggestions are hidden because of: "+lockWhy+". Herbs can interact with medicines and conditions, so your Vaidya must choose them.");
const NOPLAN=`<div class="card"><h3>Next step</h3><p>Your answers did not point to one dosha, so no dosha-based plan is shown. A Vaidya can examine your scalp, pulse and digestion to find the pattern.</p></div>`;
const GATE=`<div class="card"><h3>Treatment plan</h3><p>Please see a doctor first (see the warning above). The plan is hidden until then.</p><button class="btn g" style="width:100%" onclick="window._gateOpen=true;result()">I have seen a doctor, show the plan</button></div>`;
const PLANHTML=()=>`<div class="card"><h3>Treatment plan</h3><div class="tabs" role="tablist">${[["p","Weekly plan"],["t","Track progress"],["a","Diet"],["v","Lifestyle"],["r","Therapy details"]].map((t,x)=>`<button class="${x?"":"on"}" onclick="tab('${t[0]}',this)">${t[1]}</button>`).join("")}</div><div id="tb"></div></div>`;
const sumOf=()=>({when:new Date().toISOString(),type,pattern:dn,split:{Vata:Math.round(S.v/tot*100),Pitta:Math.round(S.p/tot*100),Kapha:Math.round(S.k/tot*100)},noPat,agni,ama,dhatu,factors:rc.slice(),prognosis:prog,red:R.slice(),cautions:cautions.slice(),meds:MD.slice(),systemic:H.slice(),lang:L,sig:JSON.stringify(ans),pg:!!F.pg,pp:!!F.pp,herbLock,noSho,doms:doms.slice()});
window._SUM=sumOf();
app.innerHTML=`${head()}${L!=="en"?`<p class="mu">${U().rn}</p>`:""}<h1>Your assessment</h1><p class="mu" style="margin:4px 0 16px">Based on your ${Q.length} answers</p>
${cautions.length?`<div class="note"><b>Please note</b>${cautions.map(esc).join("<br>")}</div>`:""}
${R.length?`<div class="warn"><b>See a doctor before starting any therapy</b>${R.map(esc).join("<br>")}</div>`:""}
<div class="card"><h3>Likely pattern</h3><p class="mu">For your Vaidya to confirm. This is not a diagnosis.</p><p><b>${type}</b></p><span class="tag">${dn}${noPat?"":" predominant"}</span>${F.sh?'<span class="tag">Agantuja trigger</span>':""}${F.he?'<span class="tag">Hereditary</span>':""}
${noPat?"":["v","p","k"].map(bar).join("")}</div>
<div class="card"><h3>Samprapti: how it developed</h3><p>${noPat?"Your answers did not point to one dosha.":doms.map(d=>sam[d]).join(" ")}</p>
<p class="mu">Agni: <b>${agni}</b><br>Ama: <b>${ama}</b><br>Dhatu: <b>${dhatu}</b></p></div>
<div class="card"><h3>Likely contributing factors (Nidana)</h3><ul>${rc.length?rc.map(r=>`<li>${esc(r)}</li>`).join(""):"<li>No dominant cause found. A clinical examination is advised.</li>"}</ul>
<p class="mu"><b>Outlook (for your Vaidya to review):</b> ${prog}</p></div>
${noPat?NOPLAN:gated?GATE:PLANHTML()}
<div class="card"><h3>Before you buy anything</h3><ul><li>Choose oils and herbal formulations that are made by a licensed AYUSH manufacturer and show the licence number.</li><li>Take internal herbs only after consulting a BAMS Vaidya, especially if pregnant, breastfeeding or on medication.</li><li>Shodhana (Virechana, Basti, Vamana) is done only under a physician’s supervision.</li><li>Ask for tests where flagged: TSH, ferritin, haemoglobin, B12, vitamin D, and hormones for PCOS.</li></ul></div>
${window.onResultHtml?window.onResultHtml(window._SUM):""}<div class="card"><h3>Share with a doctor</h3><p class="mu">Send this summary only to a doctor you trust.</p><div class="row"><button class="btn" onclick="shareWA()">WhatsApp</button><button class="btn g" onclick="copySummary()">Copy text</button></div></div>
<div class="row"><button class="btn g" onclick="ans=Q.map(()=>[]);window._gateOpen=false;intro()">Retake</button></div>
<p class="mu" style="margin-top:14px">Educational screening only, based on classical Ayurvedic diagnostic principles. It is not a medical diagnosis.</p>`;
window._T={dm:doms,ama:!!F.am,ch:!!(F.he||F.ch),pa:!!F.pa,a:m("ahara"),v:m("vihara"),l:m("local"),h:herbLock?[]:m("herbs"),s:noSho?[]:doms.map(d=>`${P[d].sho?P[d].n+": "+P[d].sho:""}`).filter(Boolean),hl:herbLock,ns:noSho};
if(!noPat&&!gated)tab("p");scrollTo(0,0);if(window.onAssessmentDone)window.onAssessmentDone(window._SUM)}
function _t0(k,b){if(b){b.parentNode.querySelectorAll("button").forEach(x=>x.classList.remove("on"));b.classList.add("on")}
document.getElementById("tb").innerHTML="<ul>"+[...new Set(window._T[k])].map(x=>`<li>${esc(x)}</li>`).join("")+"</ul>"+(k==="s"?'<p class="mu">Only under a Vaidya’s supervision, after Agni and Ama are corrected.</p>':"")}
const LN={en:"English",hi:"हिन्दी",te:"తెలుగు",ta:"தமிழ்",ml:"മലയാളം"};
let L="en",cur=null;
const SEC=["Pattern (Pareeksha)","Scalp (Pareeksha)","Diet (Ahara)","Lifestyle (Vihara)","Digestion (Agni)","Tissues (Dhatu Posha)","Systemic review","Heredity & habits","Safety check"];
const T={
en:{t:"Khalitya Nidana",d:"An Ayurvedic hair fall assessment that follows classical Roga Pariksha: cause, scalp, digestion and tissues, then a root-cause diagnosis and plan.",h:"What happens next",b:["13 short questions, about 4 minutes","You get a Dosha profile, root causes and a personalised plan","Nothing leaves your device unless you choose to share it"],n:"This is an educational screening tool. It does not replace examination by a registered Ayurvedic physician (BAMS) or a dermatologist.",st:"Start assessment",bk:"Back",nx:"Next",sd:"See results",qn:"Question {x} of {n}",rn:"",ch:"Choose your language"},
hi:{t:"खालित्य निदान",d:"बाल झड़ने का आयुर्वेदिक मूल्यांकन: कारण, खोपड़ी, पाचन और धातुओं की जाँच, फिर मूल कारण का निदान और योजना।",h:"आगे क्या होगा",b:["13 छोटे प्रश्न, लगभग 4 मिनट","दोष प्रोफ़ाइल, मूल कारण और व्यक्तिगत योजना","आपका डेटा आपके फ़ोन में ही रहता है"],n:"यह केवल शैक्षिक स्क्रीनिंग है। यह पंजीकृत आयुर्वेद चिकित्सक (BAMS) या त्वचा रोग विशेषज्ञ की जाँच का विकल्प नहीं है।",st:"मूल्यांकन शुरू करें",bk:"वापस",nx:"आगे",sd:"निदान देखें",qn:"प्रश्न {x}/{n}",rn:"परिणाम अभी अंग्रेज़ी में दिखेंगे; अनुवाद अगले चरण में आएगा।",ch:"अपनी भाषा चुनें",
s:["स्वरूप (परीक्षा)","खोपड़ी (परीक्षा)","आहार","विहार","पाचन (अग्नि)","धातु पोषण","सामान्य स्वास्थ्य जाँच","आनुवंशिकता और आदतें","सुरक्षा जाँच"],
q:[["बालों का झड़ना कैसा है?",["पूरे सिर पर धीरे-धीरे पतलापन, मांग चौड़ी होना","माथे के पास से पीछे हटना या चाँद पर पतलापन","अचानक गोल या अंडाकार गंजे धब्बे","बीमारी, प्रसव, सर्जरी या सदमे के 2–3 महीने बाद गुच्छों में झड़ना"]],
["यह कब से है?",["3 महीने से कम","3 से 12 महीने","1 साल से ज़्यादा"]],
["खोपड़ी और बाल कैसे लगते हैं? सभी लागू चुनें।",["गर्म, जलन वाली, संवेदनशील या पसीने वाली खोपड़ी; जल्दी सफ़ेद बाल","रूखी, खिंची खोपड़ी; बाल खुरदरे, भंगुर, दोमुँहे","तैलीय, भारी खोपड़ी; रूसी, खुजली","इनमें से कोई नहीं"]],
["सामान्य भोजन कैसा है? सभी लागू चुनें।",["बहुत तीखा, नमकीन, खट्टा, तला या प्रोसेस्ड; चाय, कॉफ़ी, शराब","भोजन छोड़ना, अनियमित, रूखा या ठंडा खाना, क्रैश डाइट","भारी, मीठा, चिकना या डेयरी भोजन; ज़्यादा खाना; ठंडे पेय","प्रोटीन, हरी सब्ज़ियाँ, मेवे या आयरन युक्त भोजन कम"]],
["तनाव कैसा है?",["चिंता, घबराहट, ज़्यादा सोचना, डर","गुस्सा, चिड़चिड़ापन, काम का दबाव","उदासी, सुस्ती, अकेलापन","ज़्यादातर शांत"]],
["नींद कैसी है?",["हल्की, टूटती हुई या 6 घंटे से कम","देर रात तक जागना, स्क्रीन, पर नींद आ जाती है","लंबी और भारी, उठने पर सुस्ती","गहरी, 7–8 घंटे"]],
["पाचन और भूख कैसी है?",["भूख अनियमित, गैस, पेट फूलना, कब्ज़","तेज़ भूख, एसिडिटी, सीने में जलन, पतले दस्त","कम भूख, भारीपन, खाने के बाद मितली","नियमित और आरामदायक"]],
["क्या आम (अपचित अवशेष) के लक्षण हैं? सभी लागू चुनें।",["सुबह जीभ पर परत","खाने के बाद भारीपन या सुस्ती","चिपचिपा मल या मुँह की दुर्गंध","कोई नहीं"]],
["अस्थि–मज्जा धातु क्षय के संकेत? सभी लागू चुनें।",["नाखून भंगुर या धारीदार, कमज़ोर दाँत","जोड़ों में आवाज़, हड्डी या कमर दर्द","लगातार थकान, कमज़ोरी","रूखी त्वचा और होंठ, वज़न घटना","कोई नहीं"]],
["क्या इनमें से कुछ है? सभी लागू चुनें।",["थायरॉइड","PCOS या अनियमित माहवारी","पिछले 12 महीनों में प्रसव या स्तनपान","एनीमिया, कम फेरिटिन, B12 या विटामिन D","पिछले 6 महीनों में बुखार, सर्जरी या बड़ी बीमारी","कोई नहीं"]],
["क्या परिवार में गंजापन या बाल पतले होना है?",["हाँ, माता-पिता या दादा-दादी में","नहीं / पता नहीं"]],
["बाहरी कारण। सभी लागू चुनें।",["गर्म पानी से नहाना, कठोर पानी, बार-बार शैम्पू","रंगना, स्ट्रेटनिंग या हीट स्टाइलिंग","कसी चोटी, पूरे दिन हेलमेट या टोपी","मैं कभी सिर में तेल नहीं लगाता/लगाती","कोई नहीं"]],
["कोई चेतावनी संकेत? सभी लागू चुनें।",["दर्दनाक, मवाद वाली या निशान छोड़ने वाली खोपड़ी","भौंहें, पलकें या शरीर के बाल भी झड़ना","धब्बों के साथ चकत्ते, पपड़ी या नाखूनों में गड्ढे","अचानक वज़न घटना, बुखार या बहुत तेज़ झड़ना","कोई नहीं"]]]},
te:{t:"ఖాలిత్య నిదానం",d:"జుట్టు రాలడానికి ఆయుర్వేద మూల్యాంకనం: కారణాలు, తల చర్మం, జీర్ణం, ధాతువుల పరిశీలన, తర్వాత మూల కారణ నిర్ధారణ, ప్రణాళిక.",h:"తర్వాత ఏమవుతుంది",b:["13 చిన్న ప్రశ్నలు, సుమారు 4 నిమిషాలు","దోష ప్రొఫైల్, మూల కారణాలు, వ్యక్తిగత ప్రణాళిక","మీ సమాచారం మీ ఫోన్‌లోనే ఉంటుంది"],n:"ఇది విద్యాపరమైన స్క్రీనింగ్ మాత్రమే. నమోదైన ఆయుర్వేద వైద్యుడు (BAMS) లేదా చర్మవైద్యుని పరీక్షకు ప్రత్యామ్నాయం కాదు.",st:"మూల్యాంకనం ప్రారంభించండి",bk:"వెనుకకు",nx:"తరువాత",sd:"నిర్ధారణ చూడండి",qn:"ప్రశ్న {x}/{n}",rn:"ఫలితాలు ప్రస్తుతం ఆంగ్లంలో కనిపిస్తాయి; అనువాదం తదుపరి దశలో వస్తుంది.",ch:"మీ భాషను ఎంచుకోండి",
s:["స్వరూపం (పరీక్ష)","తల చర్మం (పరీక్ష)","ఆహారం","విహారం","జీర్ణం (అగ్ని)","ధాతు పోషణ","సాధారణ ఆరోగ్య సమీక్ష","వారసత్వం, అలవాట్లు","భద్రతా తనిఖీ"],
q:[["జుట్టు రాలడం ఎలా ఉంది?",["మొత్తం తలపై క్రమంగా పలుచబడటం","నుదురు వెనక్కి వెళ్లడం లేదా నడినెత్తి పలుచబడటం","అకస్మాత్తుగా గుండ్రని బట్టతల మచ్చలు","అనారోగ్యం, ప్రసవం, శస్త్రచికిత్స లేదా షాక్ తర్వాత 2–3 నెలలకు గుత్తులుగా రాలడం"]],
["ఇది ఎంతకాలంగా ఉంది?",["3 నెలల కంటే తక్కువ","3 నుండి 12 నెలలు","ఏడాదికి పైగా"]],
["తల చర్మం, జుట్టు ఎలా ఉన్నాయి? వర్తించేవన్నీ ఎంచుకోండి.",["వేడి, మంట, సున్నితత్వం లేదా చెమట; త్వరగా తెల్లబడటం","పొడి, బిగుతు చర్మం; జుట్టు గరుకు, పెళుసు","జిడ్డు, బరువైన తల; చుండ్రు, దురద","ఏదీ కాదు"]],
["మీ సాధారణ ఆహారం? వర్తించేవన్నీ ఎంచుకోండి.",["కారం, ఉప్పు, పులుపు, వేపుళ్లు, ప్రాసెస్డ్ ఆహారం; టీ, కాఫీ, మద్యం","భోజనం మానేయడం, క్రమరహితం, పొడి లేదా చల్లని ఆహారం, క్రాష్ డైట్","బరువైన, తీపి, నూనె లేదా పాల పదార్థాలు; అతిగా తినడం; చల్లని పానీయాలు","ప్రోటీన్, ఆకుకూరలు, గింజలు, ఐరన్ ఆహారం తక్కువ"]],
["మీ ఒత్తిడి ఎలా ఉంది?",["ఆందోళన, భయం, అతిగా ఆలోచించడం","కోపం, చిరాకు, పని ఒత్తిడి","నిరుత్సాహం, బద్ధకం, ఒంటరితనం","ఎక్కువగా ప్రశాంతం"]],
["నిద్ర ఎలా ఉంది?",["తేలికగా, చెదిరిపోతూ లేదా 6 గంటల కంటే తక్కువ","రాత్రి ఆలస్యం, స్క్రీన్లు, కానీ నిద్ర పడుతుంది","ఎక్కువ, బరువైన నిద్ర; లేచాక మత్తు","గాఢంగా, 7–8 గంటలు"]],
["జీర్ణం, ఆకలి ఎలా ఉన్నాయి?",["ఆకలి క్రమరహితం, గ్యాస్, ఉబ్బరం, మలబద్ధకం","ఎక్కువ ఆకలి, ఎసిడిటీ, గుండెల్లో మంట, పలుచని విరేచనాలు","ఆకలి తక్కువ, బరువుగా అనిపించడం, తిన్నాక వికారం","సక్రమంగా, సౌకర్యంగా"]],
["ఆమ (జీర్ణంకాని అవశేషం) లక్షణాలు ఉన్నాయా? వర్తించేవన్నీ ఎంచుకోండి.",["ఉదయం నాలుకపై పొర","తిన్నాక బరువు లేదా బద్ధకం","జిగట మలం లేదా నోటి దుర్వాసన","ఏదీ లేదు"]],
["అస్థి–మజ్జ ధాతు క్షయ సంకేతాలు? వర్తించేవన్నీ ఎంచుకోండి.",["గోర్లు పెళుసు లేదా చారలు, బలహీన దంతాలు","కీళ్ల శబ్దం, ఎముక లేదా నడుము నొప్పి","నిరంతర అలసట, బలహీనత","పొడి చర్మం, పెదవులు; బరువు తగ్గడం","ఏదీ లేదు"]],
["వీటిలో ఏమైనా ఉన్నాయా? వర్తించేవన్నీ ఎంచుకోండి.",["థైరాయిడ్","PCOS లేదా క్రమరహిత నెలసరి","గత 12 నెలల్లో ప్రసవం లేదా పాలివ్వడం","రక్తహీనత, తక్కువ ఫెరిటిన్, B12 లేదా విటమిన్ D","గత 6 నెలల్లో జ్వరం, శస్త్రచికిత్స లేదా పెద్ద అనారోగ్యం","ఏదీ లేదు"]],
["కుటుంబంలో బట్టతల లేదా జుట్టు పలుచబడటం ఉందా?",["అవును, తల్లిదండ్రులు లేదా తాతలలో","లేదు / తెలియదు"]],
["బాహ్య కారణాలు. వర్తించేవన్నీ ఎంచుకోండి.",["వేడి నీటి స్నానం, గట్టి నీరు, తరచు షాంపూ","రంగు వేయడం, స్ట్రెయిటెనింగ్, హీట్ స్టైలింగ్","బిగుతైన జడ, రోజంతా హెల్మెట్ లేదా టోపీ","నేను ఎప్పుడూ తలకు నూనె రాయను","ఏదీ లేదు"]],
["హెచ్చరిక సంకేతాలు? వర్తించేవన్నీ ఎంచుకోండి.",["నొప్పి, చీము లేదా మచ్చలు పడే తల చర్మం","కనుబొమ్మలు, కనురెప్పలు, శరీర వెంట్రుకలు కూడా రాలడం","మచ్చలతో పాటు దద్దుర్లు, పొలుసులు లేదా గోళ్లపై గుంతలు","వివరించలేని బరువు తగ్గడం, జ్వరం లేదా చాలా వేగంగా రాలడం","ఏదీ లేదు"]]]},
ta:{t:"காலித்ய நிதானம்",d:"முடி உதிர்வுக்கான ஆயுர்வேத மதிப்பீடு: காரணங்கள், உச்சந்தலை, செரிமானம், தாதுக்கள் ஆய்வு, பின்னர் மூலக் காரண நிர்ணயமும் திட்டமும்.",h:"அடுத்து என்ன நடக்கும்",b:["13 சிறு கேள்விகள், சுமார் 4 நிமிடம்","தோஷ சுயவிவரம், மூலக் காரணங்கள், தனிப்பட்ட திட்டம்","உங்கள் தரவு உங்கள் தொலைபேசியிலேயே இருக்கும்"],n:"இது கல்விசார் பரிசோதனை மட்டுமே. பதிவு பெற்ற ஆயுர்வேத மருத்துவர் (BAMS) அல்லது தோல் மருத்துவரின் பரிசோதனைக்கு மாற்றல்ல.",st:"மதிப்பீட்டைத் தொடங்கு",bk:"பின்",nx:"அடுத்து",sd:"முடிவைப் பார்",qn:"கேள்வி {x}/{n}",rn:"முடிவுகள் தற்போது ஆங்கிலத்தில் காட்டப்படும்; மொழிபெயர்ப்பு அடுத்த கட்டத்தில் வரும்.",ch:"உங்கள் மொழியைத் தேர்வு செய்யுங்கள்",
s:["தோற்றம் (பரீட்சை)","உச்சந்தலை (பரீட்சை)","ஆகாரம்","விஹாரம்","செரிமானம் (அக்னி)","தாது போஷணம்","பொது உடல்நல ஆய்வு","பரம்பரை, பழக்கங்கள்","பாதுகாப்பு சோதனை"],
q:[["முடி உதிர்வு எப்படி இருக்கிறது?",["தலை முழுவதும் படிப்படியாக மெலிதல்","நெற்றி பின்னோக்கி செல்லுதல் அல்லது உச்சந்தலை மெலிதல்","திடீரென வட்டமான வழுக்கைத் திட்டுகள்","நோய், பிரசவம், அறுவை சிகிச்சை அல்லது அதிர்ச்சிக்கு 2–3 மாதங்களுக்குப் பின் கொத்தாக உதிர்தல்"]],
["இது எவ்வளவு காலமாக உள்ளது?",["3 மாதங்களுக்கும் குறைவு","3 முதல் 12 மாதங்கள்","ஒரு வருடத்திற்கு மேல்"]],
["உச்சந்தலையும் முடியும் எப்படி உள்ளன? பொருந்துவன அனைத்தையும் தேர்வு செய்யுங்கள்.",["சூடு, எரிச்சல், உணர்திறன் அல்லது வியர்வை; இளநரை","வறண்ட, இறுக்கமான தோல்; முடி சொரசொரப்பு, எளிதில் உடைதல்","எண்ணெய்ப் பசை, கனமான தலை; பொடுகு, அரிப்பு","இவற்றில் எதுவுமில்லை"]],
["வழக்கமான உணவு? பொருந்துவன அனைத்தையும் தேர்வு செய்யுங்கள்.",["காரம், உப்பு, புளிப்பு, வறுத்த அல்லது பதப்படுத்திய உணவு; தேநீர், காபி, மது","உணவைத் தவிர்த்தல், ஒழுங்கற்ற நேரம், வறண்ட அல்லது குளிர் உணவு, கடும் டயட்","கனமான, இனிப்பு, எண்ணெய் அல்லது பால் உணவு; அதிகமாக உண்ணுதல்; குளிர் பானங்கள்","புரதம், கீரை, கொட்டைகள், இரும்புச்சத்து உணவு குறைவு"]],
["உங்கள் மன அழுத்தம் எப்படி?",["கவலை, பயம், அதிகமாக யோசித்தல்","கோபம், எரிச்சல், வேலை அழுத்தம்","சோர்வு, சோம்பல், தனிமை","பெரும்பாலும் அமைதி"]],
["தூக்கம் எப்படி?",["லேசான, துண்டிக்கப்படும் அல்லது 6 மணிக்கும் குறைவு","தாமதமாக படுத்தல், திரைகள், ஆனால் தூக்கம் வரும்","நீண்ட, கனமான தூக்கம்; எழுந்ததும் மந்தம்","ஆழ்ந்த, 7–8 மணி"]],
["செரிமானமும் பசியும் எப்படி?",["பசி ஒழுங்கற்றது, வாயு, வயிறு உப்புசம், மலச்சிக்கல்","அதிக பசி, அமிலத்தன்மை, நெஞ்செரிச்சல், தளர்ந்த மலம்","பசி குறைவு, கனமான உணர்வு, உண்டபின் குமட்டல்","சீராகவும் சுகமாகவும்"]],
["ஆமம் (செரிக்காத கழிவு) அறிகுறிகள் உள்ளனவா? பொருந்துவன அனைத்தையும் தேர்வு செய்யுங்கள்.",["காலையில் நாக்கில் படலம்","உண்டபின் கனம் அல்லது சோம்பல்","பிசுபிசுப்பான மலம் அல்லது வாய் துர்நாற்றம்","எதுவுமில்லை"]],
["அஸ்தி–மஜ்ஜா தாது குறைபாட்டு அறிகுறிகள்? பொருந்துவன அனைத்தையும் தேர்வு செய்யுங்கள்.",["நகங்கள் உடைதல் அல்லது கோடுகள், பலவீனமான பற்கள்","மூட்டு சத்தம், எலும்பு அல்லது முதுகு வலி","தொடர் சோர்வு, பலவீனம்","வறண்ட தோல், உதடுகள்; எடை குறைதல்","எதுவுமில்லை"]],
["இவற்றில் ஏதேனும் உள்ளதா? பொருந்துவன அனைத்தையும் தேர்வு செய்யுங்கள்.",["தைராய்டு","PCOS அல்லது ஒழுங்கற்ற மாதவிடாய்","கடந்த 12 மாதங்களில் பிரசவம் அல்லது பாலூட்டல்","இரத்தசோகை, குறைந்த ஃபெரிடின், B12 அல்லது வைட்டமின் D","கடந்த 6 மாதங்களில் காய்ச்சல், அறுவை சிகிச்சை அல்லது பெரிய நோய்","எதுவுமில்லை"]],
["குடும்பத்தில் வழுக்கை அல்லது முடி மெலிதல் உண்டா?",["ஆம், பெற்றோர் அல்லது தாத்தா பாட்டியிடம்","இல்லை / தெரியாது"]],
["வெளிக் காரணிகள். பொருந்துவன அனைத்தையும் தேர்வு செய்யுங்கள்.",["வெந்நீர் குளியல், கடின நீர், அடிக்கடி ஷாம்பு","சாயம், நேராக்குதல், வெப்ப ஸ்டைலிங்","இறுக்கமான பின்னல், நாள் முழுவதும் ஹெல்மெட் அல்லது தொப்பி","நான் ஒருபோதும் தலைக்கு எண்ணெய் தேய்ப்பதில்லை","எதுவுமில்லை"]],
["எச்சரிக்கை அறிகுறிகள்? பொருந்துவன அனைத்தையும் தேர்வு செய்யுங்கள்.",["வலி, சீழ் அல்லது தழும்பு ஏற்படும் உச்சந்தலை","புருவம், இமை, உடல் முடியும் உதிர்தல்","திட்டுகளுடன் தடிப்பு, செதில் அல்லது நகக் குழிகள்","காரணமின்றி எடை குறைதல், காய்ச்சல் அல்லது மிக வேகமான உதிர்வு","எதுவுமில்லை"]]]},
ml:{t:"ഖാലിത്യ നിദാനം",d:"മുടികൊഴിച്ചിലിന്റെ ആയുർവേദ വിലയിരുത്തൽ: കാരണങ്ങൾ, തലയോട്ടി, ദഹനം, ധാതുക്കൾ പരിശോധിച്ച്, മൂലകാരണ നിർണ്ണയവും പദ്ധതിയും.",h:"അടുത്തതായി എന്ത്",b:["13 ചെറിയ ചോദ്യങ്ങൾ, ഏകദേശം 4 മിനിറ്റ്","ദോഷ പ്രൊഫൈൽ, മൂലകാരണങ്ങൾ, വ്യക്തിഗത പദ്ധതി","നിങ്ങളുടെ വിവരങ്ങൾ ഫോണിൽ തന്നെ നിൽക്കും"],n:"ഇത് വിദ്യാഭ്യാസ സ്ക്രീനിംഗ് മാത്രമാണ്. രജിസ്റ്റർ ചെയ്ത ആയുർവേദ ഡോക്ടറുടെ (BAMS) അല്ലെങ്കിൽ ത്വക്ക് രോഗ വിദഗ്ധന്റെ പരിശോധനയ്ക്ക് പകരമല്ല.",st:"വിലയിരുത്തൽ തുടങ്ങുക",bk:"പിന്നോട്ട്",nx:"അടുത്തത്",sd:"നിർണ്ണയം കാണുക",qn:"ചോദ്യം {x}/{n}",rn:"ഫലങ്ങൾ ഇപ്പോൾ ഇംഗ്ലീഷിൽ കാണിക്കും; വിവർത്തനം അടുത്ത ഘട്ടത്തിൽ വരും.",ch:"നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
s:["സ്വരൂപം (പരീക്ഷ)","തലയോട്ടി (പരീക്ഷ)","ആഹാരം","വിഹാരം","ദഹനം (അഗ്നി)","ധാതു പോഷണം","പൊതു ആരോഗ്യ പരിശോധന","പാരമ്പര്യം, ശീലങ്ങൾ","സുരക്ഷാ പരിശോധന"],
q:[["മുടികൊഴിച്ചിൽ എങ്ങനെയാണ്?",["തല മുഴുവൻ ക്രമേണ കനം കുറയുന്നു","നെറ്റി പിന്നോട്ട് പോകുന്നു അല്ലെങ്കിൽ ഉച്ചി കനം കുറയുന്നു","പെട്ടെന്ന് വൃത്താകൃതിയിൽ കഷണ്ടി പാടുകൾ","അസുഖം, പ്രസവം, ശസ്ത്രക്രിയ, ആഘാതം എന്നിവയ്ക്ക് 2–3 മാസത്തിനു ശേഷം കൂട്ടമായി കൊഴിയുന്നു"]],
["ഇത് എത്ര കാലമായി?",["3 മാസത്തിൽ താഴെ","3 മുതൽ 12 മാസം വരെ","ഒരു വർഷത്തിൽ കൂടുതൽ"]],
["തലയോട്ടിയും മുടിയും എങ്ങനെ? ബാധകമായതെല്ലാം തിരഞ്ഞെടുക്കുക.",["ചൂട്, എരിച്ചിൽ, സംവേദനക്ഷമത, വിയർപ്പ്; അകാല നര","വരണ്ട, മുറുകിയ തോൽ; മുടി പരുപരുത്ത്, പൊട്ടുന്നത്","എണ്ണമയം, ഭാരമുള്ള തല; താരൻ, ചൊറിച്ചിൽ","ഇതൊന്നുമില്ല"]],
["സാധാരണ ഭക്ഷണം? ബാധകമായതെല്ലാം തിരഞ്ഞെടുക്കുക.",["എരിവ്, ഉപ്പ്, പുളി, വറുത്തതോ സംസ്കരിച്ചതോ; ചായ, കാപ്പി, മദ്യം","ഭക്ഷണം ഒഴിവാക്കൽ, ക്രമരഹിതം, വരണ്ടതോ തണുത്തതോ, ക്രാഷ് ഡയറ്റ്","ഭാരമുള്ള, മധുരം, എണ്ണ, പാൽ ഉൽപ്പന്നങ്ങൾ; അമിതഭക്ഷണം; തണുത്ത പാനീയങ്ങൾ","പ്രോട്ടീൻ, ഇലക്കറി, നട്സ്, ഇരുമ്പ് ഭക്ഷണം കുറവ്"]],
["മാനസിക സമ്മർദ്ദം എങ്ങനെ?",["ആകുലത, ഭയം, അമിത ചിന്ത","ദേഷ്യം, അസ്വസ്ഥത, ജോലി സമ്മർദ്ദം","വിഷാദം, അലസത, ഒറ്റപ്പെടൽ","മിക്കവാറും ശാന്തം"]],
["ഉറക്കം എങ്ങനെ?",["ലഘു, മുറിയുന്ന അല്ലെങ്കിൽ 6 മണിക്കൂറിൽ കുറവ്","വൈകി ഉറക്കം, സ്ക്രീൻ, പക്ഷേ ഉറങ്ങും","നീണ്ട, ഭാരമുള്ള ഉറക്കം; ഉണർന്നാൽ മന്ദത","ഗാഢം, 7–8 മണിക്കൂർ"]],
["ദഹനവും വിശപ്പും എങ്ങനെ?",["വിശപ്പ് ക്രമരഹിതം, ഗ്യാസ്, വയർ വീർപ്പ്, മലബന്ധം","നല്ല വിശപ്പ്, അസിഡിറ്റി, നെഞ്ചെരിച്ചിൽ, അയഞ്ഞ മലം","വിശപ്പ് കുറവ്, ഭാരം തോന്നൽ, കഴിച്ച ശേഷം ഓക്കാനം","ക്രമമായി, സുഖമായി"]],
["ആമം (ദഹിക്കാത്ത അവശിഷ്ടം) ലക്ഷണങ്ങൾ ഉണ്ടോ? ബാധകമായതെല്ലാം തിരഞ്ഞെടുക്കുക.",["രാവിലെ നാവിൽ പാട","കഴിച്ച ശേഷം ഭാരം അല്ലെങ്കിൽ അലസത","ഒട്ടുന്ന മലം അല്ലെങ്കിൽ വായ്നാറ്റം","ഒന്നുമില്ല"]],
["അസ്ഥി–മജ്ജ ധാതുക്ഷയ ലക്ഷണങ്ങൾ? ബാധകമായതെല്ലാം തിരഞ്ഞെടുക്കുക.",["നഖം പൊട്ടുന്നു അല്ലെങ്കിൽ വരകൾ, ദുർബല പല്ലുകൾ","സന്ധി ശബ്ദം, എല്ലിനോ നടുവിനോ വേദന","തുടർച്ചയായ ക്ഷീണം, ബലഹീനത","വരണ്ട ചർമ്മം, ചുണ്ടുകൾ; ഭാരം കുറയൽ","ഒന്നുമില്ല"]],
["ഇവയിൽ ഏതെങ്കിലും ഉണ്ടോ? ബാധകമായതെല്ലാം തിരഞ്ഞെടുക്കുക.",["തൈറോയ്ഡ്","PCOS അല്ലെങ്കിൽ ക്രമരഹിത ആർത്തവം","കഴിഞ്ഞ 12 മാസത്തിൽ പ്രസവം അല്ലെങ്കിൽ മുലയൂട്ടൽ","വിളർച്ച, കുറഞ്ഞ ഫെറിറ്റിൻ, B12 അല്ലെങ്കിൽ വിറ്റാമിൻ D","കഴിഞ്ഞ 6 മാസത്തിൽ പനി, ശസ്ത്രക്രിയ, വലിയ അസുഖം","ഒന്നുമില്ല"]],
["കുടുംബത്തിൽ കഷണ്ടിയോ മുടി കനം കുറയലോ ഉണ്ടോ?",["ഉണ്ട്, മാതാപിതാക്കളിലോ മുത്തശ്ശിമാരിലോ","ഇല്ല / അറിയില്ല"]],
["ബാഹ്യ കാരണങ്ങൾ. ബാധകമായതെല്ലാം തിരഞ്ഞെടുക്കുക.",["ചൂടുവെള്ളത്തിൽ കുളി, കടുത്ത വെള്ളം, ഇടയ്ക്കിടെ ഷാംപൂ","നിറം നൽകൽ, സ്ട്രെയ്റ്റനിംഗ്, ഹീറ്റ് സ്റ്റൈലിംഗ്","മുറുകിയ മെടച്ചിൽ, ദിവസം മുഴുവൻ ഹെൽമെറ്റ് അല്ലെങ്കിൽ തൊപ്പി","ഞാൻ ഒരിക്കലും തലയിൽ എണ്ണ തേക്കാറില്ല","ഒന്നുമില്ല"]],
["മുന്നറിയിപ്പ് ലക്ഷണങ്ങൾ? ബാധകമായതെല്ലാം തിരഞ്ഞെടുക്കുക.",["വേദന, പഴുപ്പ് അല്ലെങ്കിൽ പാടുകൾ വീഴുന്ന തലയോട്ടി","പുരികം, കൺപീലി, ശരീരരോമം എന്നിവയും കൊഴിയുന്നു","പാടുകളോടൊപ്പം തിണർപ്പ്, ചെതുമ്പൽ അല്ലെങ്കിൽ നഖത്തിൽ കുഴികൾ","വിശദീകരിക്കാനാകാത്ത ഭാരക്കുറവ്, പനി, വളരെ വേഗത്തിലുള്ള കൊഴിച്ചിൽ","ഒന്നുമില്ല"]]]}
};
const U=()=>T[L];
function head(){return `<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><select aria-label="Language" onchange="setL(this.value)" style="font:inherit;font-size:14px;padding:6px 10px;border-radius:8px;border:1.5px solid var(--ln);background:var(--sf);color:var(--tx)">${Object.keys(LN).map(k=>`<option value="${k}" ${k===L?"selected":""}>${LN[k]}</option>`).join("")}</select></div>`}
function setL(l){L=l;document.documentElement.lang=l;try{localStorage.setItem("khl",l)}catch(e){}cur===langPick?intro():cur()}
function langPick(){cur=langPick;app.innerHTML=`<h1>Khalitya Nidana</h1><p class="mu" style="margin:6px 0 18px">Choose your language · भाषा चुनें · భాష ఎంచుకోండి · மொழியைத் தேர்வு செய்க · ഭാഷ തിരഞ്ഞെടുക്കുക</p>${Object.keys(LN).map(k=>`<button class="opt" style="font-size:18px;padding:16px" onclick="setL('${k}')">${LN[k]}</button>`).join("")}`}
function intro(){cur=intro;const u=U();app.innerHTML=`${head()}<h1>${u.t}</h1><p class="mu" style="margin:6px 0 18px">${u.d}</p><div class="card"><h3>${u.h}</h3><ul>${u.b.map(x=>`<li>${x.replace(/\b13\b/,Q.length)}</li>`).join("")}</ul><p class="mu">${u.n}</p></div><button class="btn" style="width:100%" onclick="go(0)">${u.st}</button>`}
function draw(){cur=draw;const q=Q[i],a=ans[i],u=U(),tq=u.q&&q.tid!=null?u.q[q.tid]:null,sc=(u.s&&SEC.indexOf(q.s)>=0?u.s[SEC.indexOf(q.s)]:q.s);
app.innerHTML=`${head()}<div class="bar" role="progressbar" aria-valuenow="${i+1}" aria-valuemax="${Q.length}"><i style="width:${(i+1)/Q.length*100}%"></i></div>
<div class="sec">${sc} · ${u.qn.replace("{x}",i+1).replace("{n}",Q.length)}</div><h2>${tq?tq[0]:q.q}</h2>${!tq&&L!=="en"?'<p class="mu">English only for now</p>':""}
${q.o.map((o,j)=>`<button class="opt ${a.includes(j)?"on":""}" onclick="pick(${j})">${esc(tq?tq[1][j]:o[0])}</button>`).join("")}
<div class="row"><button class="btn g" onclick="${i?`go(${i-1})`:"intro()"}">${u.bk}</button>
<button class="btn" ${a.length?"":"disabled"} onclick="${i<Q.length-1?`go(${i+1})`:"result()"}">${i<Q.length-1?u.nx:u.sd}</button></div>`;scrollTo(0,0)}
const OIL={v:"warm Bhringaraja or Neelibhringadi oil scalp massage, 20–30 min, then lukewarm wash",p:"coconut or Neelibhringadi oil scalp massage, 20 min, then cool-water wash",k:"light warm oil (sesame or Bhringaraja), 15 min only, wash with Shikakai or Triphala decoction"},
LEP={p:"Lepana: Amalaki + Bhringaraja + Yashtimadhu paste on the scalp, 20–30 min",k:"Lepana: Triphala + Nimba paste on the scalp, 20 min"},
NAS="Morning Nasya: Anu taila, 2 drops each nostril (only after a Vaidya teaches you)",
DY={v:"Sleep by 10:30 pm; Anulom Vilom 10 min; warm cooked meals at fixed times",p:"Lunch by 1 pm; Shitali pranayama and an evening walk; no spicy or fried food",k:"30 min brisk exercise; wake by 6:30 am; no daytime nap; light early dinner"},
DN=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],OD={v:[0,2,5],p:[1,3,6],k:[5]},LD={p:[6],k:[2]},
li=a=>"<ul>"+a.map(x=>`<li>${x}</li>`).join("")+"</ul>";
function tab(k,b){if(b){b.parentNode.querySelectorAll("button").forEach(x=>x.classList.remove("on"));b.classList.add("on")}
const T=window._T,d=T.dm,p=d[0],el=document.getElementById("tb"),nm=d.map(x=>P[x].n).join("–");let h="";
if(k==="p"){
const wk=DN.map((n,i)=>{const it=[];if(OD[p].includes(i))it.push("Evening oiling: "+OIL[p]);d.forEach(x=>{if(LD[x]&&LD[x].includes(i))it.push(LEP[x]);if(x==="v"&&[2,5].includes(i)&&!T.ns)it.push(NAS)});return `<li><b>${n}:</b> ${esc(it.length?it.join(" • "):"daily routine only (scalp rest day)")}</li>`});
const ph=[["Weeks 1–2 · Prepare",["Fix meal times and sleep first; this matters more than any oil.","Start the oiling days from the weekly schedule.",T.ama?"Ama signs found: warm ginger water before meals and Triphala at bedtime, if your Vaidya agrees.":"Keep dinners light and early."]],
["Weeks 3–4 · Vaidya review",["Visit a BAMS Vaidya. They check Agni, Ama and pulse"+(T.ns?". Shodhana is not suggested in your situation.":" and decide whether Shodhana is needed ("+d.map(x=>P[x].sho).join("; ")+")."),(T.ns?"":"Shodhana is a supervised 1–2 week programme for chronic, hereditary or strongly dosha-marked cases. Not for mild cases, pregnancy, periods, fever or weakness.")]],
["Weeks 5–12 · Nourish",[(T.hl?"Herbs: not suggested by this tool because of your answers. Your Vaidya decides whether any are safe.":"Start herbs only as the Vaidya prescribes. Usual choices: "+T.h.join("; ")+". Dose and duration are the Vaidya’s call."),"Keep the weekly schedule unchanged."]],
["Week 13 onwards · Maintain",["Oil 1–2 times a week; keep diet and sleep habits.","Review at 3 and 6 months."+(T.ch?" Hereditary or long-standing loss usually needs 6+ months before density improves.":"")]]];
h=`<p class="mu">For your ${nm} profile. Keep the same weekdays each week.</p><h3>Every day</h3>${li(d.map(x=>esc(DY[x])))}<h3>Weekly schedule</h3><ul>${wk.join("")}</ul><h3>12-week timeline</h3>${ph.map(x=>`<p style="margin:8px 0 2px"><b>${x[0]}</b></p>${li(x[1].map(esc))}`).join("")}`}
else if(k==="t"){
h=`<h3>Day 0: record a baseline</h3>${li(["Photograph the parting, hairline and crown in the same light and pose.","For 7 days, count hairs on the comb and pillow each morning, then take the average. Up to 50–100 a day is normal.","Pull test: gently pull about 60 hairs from the crown. More than 6 coming out means active shedding."])}
<h3>What to check, and when</h3>${li(["<b>Week 2:</b> appetite and bowels more regular, tongue coating less, better sleep, scalp calmer (less heat, dryness or oiliness). Hair count may not change yet.","<b>Week 4:</b> daily count starting to fall; less breakage; scalp symptoms mostly settled.","<b>Weeks 8–12:</b> clearly fewer hairs on comb and pull test; short new hairs at the parting or hairline; thicker feel.","<b>Month 6:</b> compare photos. "+(T.ch?"With hereditary or long-standing loss, stopping the loss counts as success; regrowth is slower.":"Density should be visibly better.")])}
<h3>Not progressing? See a doctor if</h3>${li(["Shedding is higher than baseline after 6–8 weeks.","Itching, rash, burning or swelling after any oil or paste (stop that product).","Acidity, loose stools, nausea or dizziness on herbs (stop and call your Vaidya).","New bald patches, scaling, pain, or hair falling from eyebrows or body.","Unexplained weight loss, fatigue or fever."])}`+(T.pa?"<p class=\"mu\">Patchy loss: get a dermatologist’s opinion at 4–6 weeks even if patches look better.</p>":"")}
else if(k==="r"){h=`<h3>Local therapy</h3>${li(T.l.map(esc))}<h3>Herbs</h3>${T.h.length?li(T.h.map(esc)):"<p class=\"mu\">Not suggested by this tool for you. Ask your Vaidya.</p>"}<h3>Shodhana</h3>${T.s.length?li(T.s.map(esc)):"<p class=\"mu\">Not suggested in your situation.</p>"}<p class="mu">Herbs and Shodhana only under a Vaidya’s supervision.</p>`}
else h=li([...new Set(T[k])].map(esc));
el.innerHTML=h}
function init(){try{const s=localStorage.getItem("khl");if(s&&LN[s]){L=s;document.documentElement.lang=s;return intro()}}catch(e){}langPick()}

function summaryText(s){return ["Hair fall pre-consultation summary (not a diagnosis)","Pattern: "+s.type+" | "+s.pattern+(s.noPat?"":" (Vata "+s.split.Vata+"%, Pitta "+s.split.Pitta+"%, Kapha "+s.split.Kapha+"%)"),"Agni: "+s.agni+" | Ama: "+s.ama+" | Dhatu: "+s.dhatu,"Contributing factors:",...s.factors.map(x=>"- "+x),s.red.length?"WARNING SIGNS:":"",...s.red.map(x=>"! "+x),s.meds.length?"Regular medicines: "+s.meds.join(", "):"",s.pg?"Pregnant or trying to conceive: yes":"",s.pp?"Recent delivery or breastfeeding: yes":""].filter(x=>x!=="").join("\n")}
function shareWA(){window.open("https://wa.me/?text="+encodeURIComponent(summaryText(window._SUM)),"_blank")}
function copySummary(){const t=summaryText(window._SUM);try{navigator.clipboard.writeText(t).then(()=>window.toast("Copied"),()=>prompt("Copy this text",t))}catch(e){prompt("Copy this text",t)}}
