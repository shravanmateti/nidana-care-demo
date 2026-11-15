/* ===== Ailment picker + per-ailment pre-consultation intakes =====
   Sources allowed: Ministry of Ayush family (ayush.gov.in, CCRAS, NCISM, ayusoft) and NIH family (nih.gov incl. NIAMS, NIDDK, NIMH, NICHD, MedlinePlus, PMC).
   No dosha scoring here. The doctor decides the pattern. */
const ALS={
 stgM:["Ministry of Ayush: Standard Treatment Guidelines in Ayurveda, Metabolic Disorders","https://ayush.gov.in/assets/pdf/publichealth/STG_Ayuveda_Metabolc_Disorders.pdf"],
 skinD:["CCRAS: Ayurveda-based diet and lifestyle guidelines, skin diseases","https://ccras.nic.in/wp-content/uploads/2024/06/Ayurveda-Based-diet-lifeStyle-Guidelines-Skin-Diseases.pdf"],
 psoA:["CCRAS: Kitibha (psoriasis) FAQ","https://ccras.nic.in/wp-content/uploads/2023/06/Psoriasis.pdf"],
 amaA:["CCRAS: Ayurvedic guidelines for Amavata","http://www.ccras.nic.in/content/ayurvedic-guidelines-amavata-rheumatoid-arthritis"],
 ncK:["NCISM: MD Ayurveda curriculum (skin and other Kayachikitsa modules)","https://ncismindia.org/assets/pdf/NCISM_Sem3-6_AYPG-KB.pdf"],
 ncB:["NCISM: BAMS third-year Kayachikitsa curriculum","https://ncismindia.org/1.%20NCISM_IIIBAMS_AyUG-KC.pdf"],
 ncP:["NCISM: MD Ayurveda syllabus (Manovaha srotas, Swedavaha srotas, digestive)","https://ncismindia.org/pdf/pg-syllabus-2nd-year.pdf"],
 atis:["Ministry of Ayush AyuSoft: Atisaara Chikitsaa (Hetu, Upashaya, Dosha avastha)","https://ayusoft.ayush.gov.in/atisaara-chikitsaa/"],
 ccB:["CCRAS Bulletin Vol 2 Issue 3 (Dinacharya, Ritucharya)","https://ccras.nic.in/wp-content/uploads/2025/11/11112025-CCRAS-Bulletin_Vol-2-Issue-3.pdf"],
 nPso:["NIAMS: Psoriasis","https://www.niams.nih.gov/health-topics/psoriasis"],
 nAD:["NIAMS: Atopic dermatitis (eczema)","https://www.niams.nih.gov/health-topics/atopic-dermatitis"],
 nVit:["NIAMS: Vitiligo","https://www.niams.nih.gov/health-topics/vitiligo"],
 nArth:["NIAMS: Arthritis","https://www.niams.nih.gov/health-topics/arthritis"],
 nAS:["NIAMS: Ankylosing spondylitis","https://www.niams.nih.gov/health-topics/ankylosing-spondylitis"],
 nSkin:["NIH: Healthy skin","https://health.nih.gov/health-topics-a-z/healthy-skin"],
 nRash:["NIH News in Health: Red, itchy rash?","https://newsinhealth.nih.gov/2012/04/red-itchy-rash"],
 nCon:["NIDDK: Constipation, symptoms and causes","https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/symptoms-causes"],
 nIBS:["NIDDK: Diagnosis of irritable bowel syndrome","https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/diagnosis"],
 nGas:["NIDDK: Gas in the digestive tract","https://www.niddk.nih.gov/health-information/digestive-diseases/gas-digestive-tract/symptoms-causes"],
 mIBS:["MedlinePlus: Irritable bowel syndrome","https://medlineplus.gov/ency/article/000246.htm"],
 nGAD:["NIMH: Generalized anxiety disorder","https://www.nimh.nih.gov/health/publications/generalized-anxiety-disorder-gad"],
 nStr:["NIMH: I'm so stressed out","https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet"],
 nMH:["NIMH: Caring for your mental health","https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health"],
 nHelp:["NIMH: My mental health, do I need help?","https://www.nimh.nih.gov/health/publications/my-mental-health-do-i-need-help"],
 nPan:["NIMH: Panic disorder","https://www.nimh.nih.gov/health/publications/panic-disorder-when-fear-overwhelms"],
 nPCOS:["NIH: Polycystic ovary syndrome","https://health.nih.gov/health-topics-a-z/pcos"],
 mPCOS:["MedlinePlus: PCOS","https://medlineplus.gov/polycysticovarysyndrome.html"],
 nAmen:["NICHD: Amenorrhea","https://www.nichd.nih.gov/health/topics/factsheets/amenorrhea"],
 mPOI:["MedlinePlus: Primary ovarian insufficiency","https://medlineplus.gov/primaryovarianinsufficiency.html"],
 pMen:["NLM PMC: Indian Menopause Society clinical practice guidelines 2019-20","https://pmc.ncbi.nlm.nih.gov/articles/PMC7688016/"]
};
const ALG=["Skin","Hair","Digestive","Metabolic","Joints and muscles","Mental wellness","Women's health","Lifestyle and preventive care"];
/* question builder: opts are strings; "|!text" marks a warning sign, "|~text" marks a caution */
const alq=(tag,q,m,o)=>({tag,q,m,o:o.map(x=>{const p=x.split("|");const r={t:p[0]};if(p[1]){r.k=p[1][0];r.msg=p[1].slice(1)}return r})});
const alc={
 dur:()=>alq("Rupa (symptoms)","How long have you had this problem?",0,["Less than 2 weeks","2 weeks to 3 months","3 to 12 months","More than a year"]),
 imp:()=>alq("Rupa (symptoms)","How much does it affect your daily activities or sleep?",0,["Not at all","A little","A lot|!Problem interferes with daily activities or sleep"]),
 fam:()=>alq("Hetu (Nidana)","Does anyone in your family have the same or a related problem?",0,["No","Yes","Not sure"]),
 ahara:()=>alq("Hetu (Nidana)","Which describe your food habits? Choose all that apply.",1,["Mostly freshly cooked home food","Frequent fried, very spicy or oily food","Frequent sour or fermented food (curd, pickles)","Often combine incompatible foods (for example fish with milk)","Irregular meal times, or eating before the last meal is digested","None of these"]),
 vihara:()=>alq("Hetu (Nidana)","Which describe your routine? Choose all that apply.",1,["Sleep late at night","Sleep in the daytime","Often hold back natural urges (urine, stool, thirst, sleep)","Little physical activity","Long exposure to heat or sun","None of these"]),
 tried:()=>alq("Upashaya (what helps or worsens)","What have you tried so far? Choose all that apply.",1,["Nothing yet","Home remedies","Ayurvedic medicines","Medicines prescribed by a doctor of another system","Medicines bought without a prescription","None of these"]),
 better:(a,b)=>alq("Upashaya (what helps or worsens)","What tends to make it worse? Choose all that apply.",1,[...a,"Nothing I have noticed"]),
 stress:()=>alq("Hetu (Nidana)","Has stress or poor sleep been a problem in recent months?",0,["No","Some","Yes, a lot"])
};
const ALCOMMON=[
 alq("Basics","What is your age group?",0,["Under 18|~Under 18: a parent or guardian should be involved in the consultation","18 to 39","40 to 59","60 or above"]),
 alq("Basics","Are you pregnant, trying to conceive, or recently delivered or breastfeeding?",0,["No","Pregnant or trying to conceive|~Pregnant or trying to conceive: the doctor must review before any medicine or procedure","Recently delivered or breastfeeding|~Recently delivered or breastfeeding: the doctor must review before any medicine or procedure"]),
 alq("Basics","Do you take any regular medicines? Choose all that apply.",1,["No regular medicines","Blood thinners|~Takes blood thinners","Diabetes medicines|~Takes diabetes medicines","Steroid tablets or creams|~Uses steroids","Thyroid medicines|~Takes thyroid medicines","Other regular medicines|~Takes other regular medicines"])
];
const AL=[
/* ---------- SKIN ---------- */
{id:"acne",g:0,n:"Acne, pimples, oily skin",ay:"Yauvana pidika (acne vulgaris, listed in NCISM curriculum)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["ncK","nSkin","mPCOS","skinD"],lim:"",qs:[
 alq("Rupa (symptoms)","Where do the pimples or oiliness appear? Choose all that apply.",1,["Face","Chest","Back","Shoulders"]),
 alq("Rupa (symptoms)","How would you describe them?",0,["A few small pimples","Many pimples, some inflamed","Painful deep lumps|!Very painful or deep acne","Mostly oily skin without pimples"]),
 alc.dur(),
 alq("Hetu (Nidana)","Do you have any of these? Choose all that apply.",1,["Irregular or missed periods|~Irregular periods with acne can point to a hormonal cause such as PCOS (NIH)","Extra hair on face or body|~Extra hair growth with acne can point to a hormonal cause such as PCOS (NIH)","Dark thick patches on neck or armpits|~Dark thick skin patches can go with insulin resistance (NIH)","Weight gain recently","None of these"]),
 alc.ahara(),alc.stress(),
 alq("Upashaya (what helps or worsens)","What have you been applying or taking?",1,["Nothing","Home remedies","Ayurvedic medicines","Creams or tablets from a doctor","Steroid creams|~Using steroid creams on skin","None of these"]),alc.fam(),alc.imp()]},
{id:"eczema",g:0,n:"Eczema or atopic dermatitis",ay:"Vicharchika (eczema); Charmadala (atopic dermatitis) in NCISM curriculum",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nAD","nRash","ncK","skinD"],lim:"",qs:[
 alq("Rupa (symptoms)","Which describe your skin? Choose all that apply.",1,["Severe itching","Dry red patches","Oozing or weeping clear fluid","Thick hardened skin","Bleeding when scratched"]),
 alq("Rupa (symptoms)","Where is it? Choose all that apply.",1,["Hands","Neck","Bends of elbows or knees","Around the eyes","Ankles and feet","Face|!Rash on the face (NIH advises seeing a doctor)"]),
 alq("Rupa (symptoms)","Any signs of infection in the rash?",1,["No","Pus or yellow crust|!Pus or signs of infection in the rash","Increasing swelling, warmth or pain|!Pus or signs of infection in the rash","Fever|!Fever with a skin rash"]),
 alc.dur(),
 alq("Upashaya (what helps or worsens)","Does it come and go in flares?",0,["Constant","Flares and clear periods","First episode"]),
 alq("Hetu (Nidana)","Possible triggers. Choose all that apply.",1,["New medicine started recently|!Rash began after a new medicine (NIH)","Stress","Cold or dry weather","Soaps or chemicals","Sweat","Dietary incompatibility (for example fish with milk)","None of these"]),
 alq("Hetu (Nidana)","Do you have asthma, hay fever or food allergy?",0,["No","Yes"]),
 alq("Rupa (symptoms)","Does itching disturb your sleep?",0,["No","Sometimes","Most nights|~Poor sleep from itching"]),alc.tried(),alc.fam()]},
{id:"psoriasis",g:0,n:"Psoriasis",ay:"Kitibha, one of the Kshudra Kushta (CCRAS)",ts:1,dosha:"CCRAS says the Panchakarma procedure is chosen from the vitiated dosha. Which dosha applies is for the doctor.",src:["nPso","psoA","skinD","ncK"],lim:"",qs:[
 alq("Rupa (symptoms)","Which describe your skin? Choose all that apply.",1,["Thick red patches with silvery scales","Itching or burning","Dry cracked skin that bleeds","Pus-filled bumps|~Pustular pattern: needs earlier review (NIAMS)","Smooth red patches in folds","Pitted or ridged nails"]),
 alq("Rupa (symptoms)","Where? Choose all that apply.",1,["Scalp","Elbows","Knees","Trunk","Palms or soles","Nails"]),
 alq("Rupa (symptoms)","Do you have any joint or heel problems?",1,["No","Stiff, swollen or painful joints|!Joint symptoms with psoriasis: possible psoriatic arthritis, see a doctor soon (NIAMS)","Neck or back pain|!Joint symptoms with psoriasis: possible psoriatic arthritis, see a doctor soon (NIAMS)","Achilles heel pain|!Joint symptoms with psoriasis: possible psoriatic arthritis, see a doctor soon (NIAMS)"]),
 alc.dur(),
 alq("Hetu (Nidana)","Possible triggers. Choose all that apply.",1,["Stress","Cold weather","Skin injury","Infection or recent illness","A new medicine","Incompatible foods (fish with milk), sour, salty or heavy food (CCRAS)","None of these"]),
 alc.fam(),
 alq("Upashaya (what helps or worsens)","How is your mood because of the skin?",0,["Fine","Self-conscious","Low or anxious|~Low mood or anxiety with psoriasis (NIAMS notes higher risk)"]),alc.tried(),alc.imp()]},
{id:"dermatitis",g:0,n:"Dermatitis (contact or seborrheic) and rashes",ay:"Darunaka (seborrheic dermatitis) and Vicharchika in NCISM curriculum",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nRash","nAD","ncK"],lim:"",qs:[
 alq("Rupa (symptoms)","What does the rash look like? Choose all that apply.",1,["Red","Itchy","Painful","Blisters","Raw patches","Scaly or flaky"]),
 alq("Rupa (symptoms)","Where is the rash?",1,["Face|!Rash on the face (NIH advises seeing a doctor)","Scalp","Hands","Body folds","Trunk","Legs"]),
 alq("Hetu (Nidana)","Did it start after any of these? Choose all that apply.",1,["A new medicine|!Rash began after a new medicine (NIH)","A new soap, cosmetic, metal or chemical","Plant contact","Sweat or heat","Not sure"]),
 alq("Rupa (symptoms)","Does it look infected?",1,["No","Oozing, pus or swelling|!Rash looks infected (NIH)","Spreading quickly|!Rash looks worrisome or is spreading"]),
 alc.dur(),alc.imp(),alc.tried(),alc.fam()]},
{id:"pigment",g:0,n:"Pigmentation, melasma, dull skin",ay:"Vyanga (classical term; not confirmed in the fetched Ayush pages)",ts:0,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["mPCOS","nSkin","skinD"],lim:"No AYUSH or NIH page on melasma or dull skin was retrieved. Only NIH notes on dark patches linked to PCOS and the general healthy-skin page were used.",qs:[
 alq("Rupa (symptoms)","Where is the darkening or dullness?",1,["Cheeks or forehead","Upper lip","Neck or armpits","Hands","Overall dull skin"]),
 alq("Rupa (symptoms)","Are the patches thick and velvety?",0,["No","Yes|~Thick dark skin patches can go with insulin resistance or PCOS (NIH)"]),
 alq("Rupa (symptoms)","Any change in an existing mole?",0,["No","Yes, a mole changed size or colour|!A mole that changes size or colour (NIH)"]),
 alc.dur(),
 alq("Hetu (Nidana)","Do you have any of these? Choose all that apply.",1,["Irregular periods","Weight gain","Pregnancy or hormone medicines","Stress","None of these"]),
 alc.ahara(),alc.tried(),alc.fam()]},
{id:"fungal",g:0,n:"Fungal infections, itching",ay:"Dadru (listed under Kshudra Kushta by CCRAS) and Kandu",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["skinD","nRash"],lim:"No fungal-specific AYUSH or NIH page was retrieved. Questions follow the NIH rash advice and the CCRAS Kushta list.",qs:[
 alq("Rupa (symptoms)","Where is the itching or rash? Choose all that apply.",1,["Groin or body folds","Feet","Scalp","Nails","Trunk","Whole body"]),
 alq("Rupa (symptoms)","What does it look like? Choose all that apply.",1,["Red patches","Ring-shaped patches","Scaly","Oozing","Raw skin"]),
 alq("Rupa (symptoms)","Any sign of infection?",1,["No","Pus or swelling|!Rash looks infected (NIH)","Fever|!Fever with a skin rash"]),
 alq("Hetu (Nidana)","Do these apply? Choose all that apply.",1,["Heavy sweating","Damp clothes or shoes","Others at home have the same","Diabetes or high blood sugar|~Diabetes can make infections recur","Steroid cream use|~Uses steroid cream","None of these"]),
 alc.dur(),alc.tried(),alc.imp()]},
{id:"urticaria",g:0,n:"Urticaria (hives)",ay:"Sheetapitta, Udarda, Kotha (NCISM curriculum)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["ncK","nRash"],lim:"No NIH page on hives was retrieved. The swelling and breathing warning is standard emergency guidance and was not checked against an NIH page here.",qs:[
 alq("Rupa (symptoms)","Do you have any of these now? Choose all that apply.",1,["Raised itchy welts","Swelling of lips, tongue or face|!Swelling of lips, tongue or face needs urgent medical care","Difficulty breathing or throat tightness|!Breathing difficulty or throat tightness needs urgent medical care","None of these"]),
 alq("Rupa (symptoms)","How long do individual welts last?",0,["Less than 24 hours","More than 24 hours"]),
 alq("Hetu (Nidana)","Did it start after any of these? Choose all that apply.",1,["New medicine|!Rash began after a new medicine (NIH)","Particular food","Cold or heat exposure","Infection","Not sure"]),
 alc.dur(),alc.ahara(),alc.tried(),alc.imp()]},
{id:"vitiligo",g:0,n:"Vitiligo (supportive care)",ay:"Shvitra (NCISM curriculum)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nVit","ncK"],lim:"",qs:[
 alq("Rupa (symptoms)","Where are the white patches? Choose all that apply.",1,["Hands or feet","Face","Arms or legs","Inside mouth or nose","Anywhere on the body"]),
 alq("Rupa (symptoms)","Pattern of patches?",0,["On both sides of the body","On one side or one area only","Not sure"]),
 alq("Rupa (symptoms)","Is the patch area spreading quickly?",0,["No","Yes, in recent weeks|~Rapid spread reported"]),
 alq("Rupa (symptoms)","Any hair turning white in the patches?",0,["No","Yes"]),
 alq("Rupa (symptoms)","Any eye pain or vision change?",0,["No","Yes|!Eye pain or vision change with vitiligo can mean uveitis (NIAMS)"]),
 alq("Hetu (Nidana)","Related conditions or triggers. Choose all that apply.",1,["Thyroid disease|~Vitiligo is linked to thyroid disease and other autoimmune conditions (NIAMS)","Type 1 diabetes|~Linked autoimmune condition","Psoriasis or rheumatoid arthritis|~Linked autoimmune condition","Recent sunburn, chemical exposure or emotional distress","None of these"]),
 alc.dur(),alc.fam(),alq("Upashaya (what helps or worsens)","How is your confidence because of the patches?",0,["Fine","Self-conscious","Low or anxious"])]},
{id:"aging",g:0,n:"Premature aging of skin",ay:"Not mapped (no Ayush page on this was retrieved)",ts:0,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nSkin","skinD"],lim:"Only the NIH healthy-skin page and the CCRAS daily-routine notes were reviewed. No AYUSH or NIH page on premature aging was retrieved, so this set is short.",qs:[
 alq("Rupa (symptoms)","What concerns you most? Choose all that apply.",1,["Fine lines or wrinkles","Dryness","Dullness","Uneven colour","Loose skin"]),
 alq("Rupa (symptoms)","Any new or changing mole or skin growth?",0,["No","Yes|!New or changing skin growth: have it examined (NIH advises prompt review of worrisome changes)"]),
 alq("Hetu (Nidana)","Daily habits. Choose all that apply.",1,["Daily oil massage","Irregular sleep","Irregular meals","Low water intake","None of these"]),
 alc.stress(),alc.tried()]},
/* ---------- HAIR ---------- */
{id:"hair",g:1,n:"Hair fall, thinning, slow growth",special:"hair",ay:"Khalitya (existing scored flow)",ts:1,src:[],lim:"",qs:[]},
{id:"graying",g:1,n:"Premature graying",ay:"Palitya (NCISM syllabus, Swedavaha srotas)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["ncP","nVit"],lim:"No NIH page on premature graying was retrieved. NIAMS notes on hair whitening with vitiligo were used for the screening questions.",qs:[
 alq("Rupa (symptoms)","At what age did graying begin?",0,["Before 20","20 to 30","30 to 40","After 40"]),
 alq("Rupa (symptoms)","How much hair is affected?",0,["A few strands","Patches","Most of the hair"]),
 alq("Rupa (symptoms)","Any white patches on the skin?",0,["No","Yes|~White skin patches with white hair can mean vitiligo (NIAMS)"]),
 alq("Hetu (Nidana)","Related conditions. Choose all that apply.",1,["Thyroid disease|~Thyroid disease reported","Anaemia or low vitamin levels","Autoimmune condition|~Autoimmune condition reported","None of these"]),
 alc.stress(),alc.ahara(),alc.fam(),alc.tried()]},
{id:"dandruff",g:1,n:"Dandruff, scalp itching",ay:"Darunaka (seborrheic dermatitis, NCISM curriculum)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["ncK","nPso","nRash"],lim:"No NIH page on dandruff was retrieved. NIAMS psoriasis and NIH rash pages were used for screening.",qs:[
 alq("Rupa (symptoms)","What do you notice? Choose all that apply.",1,["White flakes","Itching","Oily scalp","Dry scalp","Redness","Burning"]),
 alq("Rupa (symptoms)","Are there thick silvery scaly patches?",0,["No","Yes|~Thick silvery scales on the scalp can be scalp psoriasis (NIAMS)"]),
 alq("Rupa (symptoms)","Any hair loss in round patches?",0,["No","Yes|~Round patchy hair loss can be alopecia areata (NIAMS)"]),
 alq("Rupa (symptoms)","Any oozing, pus or sores on the scalp?",0,["No","Yes|!Scalp looks infected (NIH)"]),
 alc.dur(),
 alq("Upashaya (what helps or worsens)","What makes it worse? Choose all that apply.",1,["Stress","Cold weather","Oily hair products","Infrequent washing","Sweat","None of these"]),
 alc.tried(),alc.imp()]},
{id:"scalppso",g:1,n:"Scalp psoriasis",ay:"Kitibha (CCRAS)",ts:1,dosha:"CCRAS says treatment is planned from dosha, dushya and pathya-apathya. Which dosha applies is for the doctor.",src:["nPso","psoA"],lim:"",qs:[
 alq("Rupa (symptoms)","What do you notice on the scalp? Choose all that apply.",1,["Thick red patches with silvery scales","Itching or burning","Cracking or bleeding","Spread beyond the hairline","Hair thinning in patches"]),
 alq("Rupa (symptoms)","Other areas affected? Choose all that apply.",1,["Elbows","Knees","Trunk","Nails (pitting or ridges)","None"]),
 alq("Rupa (symptoms)","Any joint, neck, back or heel pain?",1,["No","Yes|!Joint symptoms with psoriasis: possible psoriatic arthritis, see a doctor soon (NIAMS)"]),
 alq("Hetu (Nidana)","Possible triggers. Choose all that apply.",1,["Stress","Cold weather","Skin injury","Infection","New medicine","Sour, salty or heavy foods; incompatible combinations (CCRAS)","None of these"]),
 alc.fam(),alc.dur(),alc.tried(),alq("Upashaya (what helps or worsens)","Mood because of the condition?",0,["Fine","Self-conscious","Low or anxious|~Low mood or anxiety (NIAMS notes higher risk with psoriasis)"])]},
/* ---------- DIGESTIVE ---------- */
{id:"acidity",g:2,n:"Acidity",ay:"Amlapitta (Ayush STG family; classical term)",ts:1,dosha:"Not stated in the sources reviewed. Agni is the key to assess in digestive disorders (Ayush AyuSoft).",src:["atis","nCon","nIBS","ncP"],lim:"No GERD-specific NIH page was retrieved. The warning signs below come from NIDDK pages on constipation and IBS and apply to digestive complaints generally.",qs:[
 alq("Rupa (symptoms)","What do you feel? Choose all that apply.",1,["Burning in chest or throat","Sour belching","Nausea","Upper belly discomfort","Bloating"]),
 alq("Rupa (symptoms)","How often?",0,["Less than once a week","1 to 3 times a week","Most days"]),
 alq("Rupa (symptoms)","Any of these? Choose all that apply.",1,["Black tarry stools|!Black tarry stools (NIDDK)","Blood in stool or vomit|!Blood in stool (NIDDK)","Repeated vomiting|!Vomiting (NIDDK)","Unplanned weight loss|!Losing weight without trying (NIDDK)","Trouble swallowing","None of these"]),
 alq("Agni (digestion)","How is your appetite?",0,["Normal","Low","Excessive hunger","Variable"]),
 alc.ahara(),alc.vihara(),
 alq("Upashaya (what helps or worsens)","What worsens it? Choose all that apply.",1,["Spicy food","Sour or fermented food","Late meals","Empty stomach","Stress","Tea or coffee","None of these"]),alc.tried(),alc.dur()]},
{id:"ibs",g:2,n:"IBS (irritable bowel)",ay:"Grahani (Ayush; Agni disorder)",ts:1,dosha:"Not stated in the sources reviewed. Agni is the key to assess in digestive disorders (Ayush AyuSoft).",src:["nIBS","mIBS","atis","ncP"],lim:"",qs:[
 alq("Rupa (symptoms)","Do you have belly pain that changes with bowel movements?",0,["No","Yes, pain improves or worsens after a bowel movement","Pain without relation to bowel movement"]),
 alq("Rupa (symptoms)","Bowel pattern?",0,["Mostly loose","Mostly hard","Alternating","Normal"]),
 alq("Rupa (symptoms)","How long and how often?",0,["Less than 3 months","At least once a week for 3 months or more","At least once a week for 6 months or more"]),
 alq("Rupa (symptoms)","Any of these alarm signs? Choose all that apply.",1,["Blood from rectum|!Rectal bleeding (NIDDK/NIH)","Black tarry stools|!Black tarry stools (NIDDK)","Unplanned weight loss|!Unplanned weight loss (NIDDK)","Known anaemia|!Anaemia reported (NIDDK)","Pain that wakes me from sleep|!Pain waking from sleep (NIH)","Fever|!Fever (MedlinePlus)","Symptoms began after age 50|!Onset after age 50 (MedlinePlus)","None of these"]),
 alq("Agni (digestion)","Which fits your digestion? Choose all that apply.",1,["Heaviness after meals","Gas and bloating","Undigested food in stool","Mucus in stool","None of these"]),
 alc.ahara(),alc.stress(),alq("Hetu (Nidana)","Family history of colon or rectal cancer?",0,["No|","Yes|!Family history of colon or rectal cancer (NIDDK)","Not sure"]),alc.tried()]},
{id:"constip",g:2,n:"Constipation",ay:"Vibandha (classical term; not confirmed in fetched Ayush pages)",ts:0,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nCon","atis","skinD"],lim:"",qs:[
 alq("Rupa (symptoms)","Which fit you? Choose all that apply.",1,["Fewer than 3 bowel movements a week","Hard, dry or lumpy stools","Straining or painful passing","Feeling stool is not fully passed"]),
 alq("Rupa (symptoms)","Any of these? Choose all that apply.",1,["Blood from rectum or in stool|!Bleeding from rectum or blood in stool (NIDDK)","Constant belly pain|!Constant abdominal pain (NIDDK)","Unable to pass gas|!Inability to pass gas (NIDDK)","Vomiting|!Vomiting (NIDDK)","Fever|!Fever (NIDDK)","Lower back pain|!Lower back pain with constipation (NIDDK)","Unplanned weight loss|!Losing weight without trying (NIDDK)","None of these"]),
 alq("Hetu (Nidana)","Family history of colon or rectal cancer?",0,["No","Yes|!Family history of colon or rectal cancer (NIDDK)","Not sure"]),
 alc.dur(),
 alq("Hetu (Nidana)","Fibre and water through the day?",0,["Good","Low fibre","Low water","Both low"]),
 alc.vihara(),alq("Hetu (Nidana)","Do you hold back the urge to pass stool?",0,["Rarely","Often"]),alc.tried()]},
{id:"bloat",g:2,n:"Bloating, gut health",ay:"Agni and Ama assessment (Ayush AyuSoft)",ts:1,dosha:"Not stated in the sources reviewed. Agni is the key to assess in digestive disorders (Ayush AyuSoft).",src:["nGas","atis","mIBS"],lim:"",qs:[
 alq("Rupa (symptoms)","What bothers you? Choose all that apply.",1,["Belching","Passing gas","Bloated belly","Belly pain","Fullness after small meals"]),
 alq("Rupa (symptoms)","Did your symptoms change suddenly?",0,["No","Yes|!Sudden change in gas or bloating symptoms (NIDDK advises seeing a doctor)"]),
 alq("Rupa (symptoms)","Do you also have any of these? Choose all that apply.",1,["Belly pain","Constipation","Diarrhoea","Unplanned weight loss|!Weight loss with gas symptoms (NIDDK)","None of these"]),
 alq("Agni (digestion)","How is your appetite?",0,["Normal","Low","Excessive hunger","Variable"]),
 alc.ahara(),alc.tried(),alc.dur()]},
/* ---------- METABOLIC ---------- */
{id:"obesity",g:3,n:"Obesity, weight gain",ay:"Sthaulya (Ayush STG metabolic disorders)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["stgM"],lim:"The Ayush STG gives lifestyle and diet items. No NIH obesity page was retrieved this session.",qs:[
 alq("Rupa (symptoms)","How has your weight changed?",0,["Slow gain over years","Gain in the last year","Gain in the last 3 months","Stable but overweight"]),
 alq("Rupa (symptoms)","Where do you carry the weight?",0,["Mostly around the waist","All over","Hips and thighs"]),
 alq("Hetu (Nidana)","Which habits apply? Choose all that apply.",1,["Sleep in the daytime, especially after heavy meals","Sleep less than 5 or more than 10 hours","Little regular exercise","Sweet, oily or heavy food in large amounts","Sweetened drinks","None of these"]),
 alq("Hetu (Nidana)","How much activity do you get?",0,["Under 30 minutes a day","About 30 minutes a day","More than 30 minutes a day"]),
 alq("Hetu (Nidana)","Related conditions. Choose all that apply.",1,["Diabetes or high blood sugar|~Diabetes reported","High blood pressure|~High blood pressure reported","Thyroid disease|~Thyroid disease reported","Irregular periods|~Irregular periods with weight gain can point to PCOS (NIH)","None of these"]),
 alc.fam(),alc.tried(),alq("Upashaya (what helps or worsens)","How many past weight-loss attempts?",0,["None","One or two","Many"])]},
{id:"pcos",g:3,n:"PCOS",ay:"Artava dushti and Sthaulya features (doctor to map)",ts:0,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nPCOS","mPCOS","nAmen","stgM"],lim:"",qs:[
 alq("Rupa (symptoms)","Which fit your periods?",0,["Regular","Fewer than 9 periods a year","No periods for months|~No periods for months: pregnancy and other causes must be excluded (NICHD)","Very heavy periods|!Very heavy bleeding (NIH)"]),
 alq("Rupa (symptoms)","Which of these do you have? Choose all that apply.",1,["Extra hair on face, chest or belly","Acne","Oily skin","Thinning scalp hair","Dark thick skin patches","Weight gain around the waist","Poor sleep","None of these"]),
 alq("Rupa (symptoms)","Any of these? Choose all that apply.",1,["Milky discharge from the breasts|!Milky nipple discharge needs evaluation (NICHD)","Vision changes|!Vision changes with period problems (NICHD)","Severe headaches|!Headache with period problems (NICHD)","None of these"]),
 alq("Hetu (Nidana)","Could you be pregnant?",0,["No","Possibly|!Possible pregnancy: test before any treatment (NICHD)","Trying to conceive"]),
 alq("Hetu (Nidana)","How is your exercise and weight recently?",0,["Stable","Recently gained weight","Recently lost weight|~Recent weight loss or heavy exercise can also stop periods (NICHD)","Very heavy exercise|~Heavy exercise can stop periods (NICHD)"]),
 alq("Hetu (Nidana)","Related history. Choose all that apply.",1,["Diabetes or high blood sugar in family","Thyroid disease","Depression or anxiety","None of these"]),
 alc.fam(),alc.tried(),alq("Basics","Age at first period?",0,["Under 12","12 to 14","15 or older","Not yet started|~Never had a period: needs evaluation (NICHD)"])]},
{id:"thyroid",g:3,n:"Thyroid imbalance",ay:"Not mapped to one Ayurvedic disease (doctor to map)",ts:0,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nAmen","stgM"],lim:"Thin source base: only the NICHD amenorrhea page (which names thyroid function and the TSH test) and the Ayush endocrine syllabus mention were available. No NIH thyroid page was retrieved this session.",qs:[
 alq("Rupa (symptoms)","Do you already have a thyroid diagnosis?",0,["No","Yes, underactive","Yes, overactive","Yes, not sure which"]),
 alq("Rupa (symptoms)","Do you have changes in your periods?",0,["No","Yes|~Thyroid problems can cause menstrual irregularity (NICHD)","Not applicable"]),
 alq("Rupa (symptoms)","Hair loss recently?",0,["No","Yes"]),
 alq("Rupa (symptoms)","Weight change without trying?",0,["No","Gain","Loss"]),
 alq("Hetu (Nidana)","Has a TSH blood test been done?",0,["Never","Yes, normal","Yes, abnormal","Not sure"]),
 alc.fam(),alc.tried()]},
{id:"diabetes",g:3,n:"Early-stage diabetes support",ay:"Madhumeha (Ayush STG metabolic disorders)",ts:1,dosha:"The Ayush STG classifies Madhumeha by cause, for example depletion of dhatus with Vata aggravation. Classification is for the doctor.",src:["stgM"],lim:"No NIH diabetes page was retrieved this session; red flags use the referral list in the Ayush STG.",qs:[
 alq("Rupa (symptoms)","Which diagnosis status applies?",0,["Never tested","Prediabetes","Diabetes recently diagnosed","Diabetes for years"]),
 alq("Rupa (symptoms)","Which symptoms do you have? Choose all that apply.",1,["Increased thirst","Passing urine often","Tiredness","Slow-healing wounds","Recurrent infections","None of these"]),
 alq("Rupa (symptoms)","Any of these? Choose all that apply.",1,["Blurred or reduced vision|!Visual impairment: refer to an eye and diabetes check (Ayush STG referral criteria)","Repeated low blood sugar episodes|!Frequent hypoglycaemic episodes (Ayush STG referral criteria)","Foot sores or numbness|~Foot examination needed (Ayush STG)","Kidney problems|!Kidney involvement (Ayush STG referral criteria)","None of these"]),
 alq("Hetu (Nidana)","Which habits apply? Choose all that apply.",1,["Sleep in the daytime, especially after a heavy meal","Sleep less than 5 or more than 10 hours","Little exercise","Sweet, oily or heavy food","Sweetened drinks","None of these"]),
 alq("Hetu (Nidana)","Do you take diabetes medicines or insulin?",0,["No","Tablets|~On diabetes tablets: do not change without the treating doctor","Insulin|~On insulin: do not change without the treating doctor"]),
 alc.fam(),alc.tried(),alq("Upashaya (what helps or worsens)","How often do you check blood sugar?",0,["Never","Occasionally","Regularly"])]},
/* ---------- JOINTS ---------- */
{id:"arthritis",g:4,n:"Arthritis",ay:"Amavata (rheumatoid pattern) and Sandhigata Vata (osteoarthritis pattern)",ts:1,dosha:"CCRAS: in Amavata, vitiated Vata and Ama affect the joint lining. In Sandhigata Vata, Vata is involved (NCISM). The doctor decides which applies.",src:["nArth","amaA","ncB","ccB"],lim:"",qs:[
 alq("Rupa (symptoms)","Which joints? Choose all that apply.",1,["Knees","Hips","Hands or fingers","Wrists","Shoulders","Feet or ankles","Spine"]),
 alq("Rupa (symptoms)","What do the joints show? Choose all that apply.",1,["Pain","Swelling","Redness","Heat","Stiffness"]),
 alq("Rupa (symptoms)","How long does stiffness last after rest?",0,["A few minutes","Up to 30 minutes","Over an hour"]),
 alq("Rupa (symptoms)","Any other symptoms? Choose all that apply.",1,["Fever|!Fever with joint swelling","Skin psoriasis|~Psoriasis with joint pain: possible psoriatic arthritis (NIAMS)","Eye pain or redness|!Eye pain with joint disease (NIAMS)","Great toe attacks","Rash on face","None of these"]),
 alq("Hetu (Nidana)","Diet and routine. Choose all that apply.",1,["Heavy foods","Curd, fish or black gram often","Incompatible food combinations","Contaminated water or foods","Little activity","None of these"]),
 alq("Upashaya (what helps or worsens)","What eases it? Choose all that apply.",1,["Warmth","Movement","Rest","Nothing"]),
 alc.dur(),alc.fam(),alc.tried()]},
{id:"backpain",g:4,n:"Back pain",ay:"Katigraha (lumbar), Gridhrasi (sciatica) in NCISM curriculum",ts:1,dosha:"Not stated in the sources reviewed. Vata is classically involved in Vata vyadhi per NCISM; the doctor decides.",src:["ncB","nAS","nArth"],lim:"The red flags marked below follow standard back-pain warnings. The NIAMS back-pain page itself was not retrieved this session, so confirm them with a doctor.",qs:[
 alq("Rupa (symptoms)","Where is the pain?",0,["Lower back","Middle back","Lower back and down one leg","Lower back and hips"]),
 alq("Rupa (symptoms)","When is it worst?",0,["During or after activity","At rest or night, eases with movement|~Pain worse at rest or night can be inflammatory (NIAMS)","Constant"]),
 alq("Rupa (symptoms)","Any of these? Choose all that apply.",1,["Numbness or weakness in a leg|!Leg numbness or weakness","Loss of bladder or bowel control|!Loss of bladder or bowel control","Fever|!Fever with back pain","Unplanned weight loss|!Weight loss with back pain","Recent injury or fall|!Back pain after a fall or injury","None of these"]),
 alq("Rupa (symptoms)","Pain radiating down the leg?",0,["No","To the thigh","Below the knee"]),
 alc.dur(),alc.vihara(),alc.tried(),alc.imp()]},
{id:"spondylosis",g:4,n:"Cervical or lumbar spondylosis",ay:"Manyastambha (neck), Katigraha (lumbar), Gridhrasi (NCISM curriculum)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["ncB","ncP","nAS"],lim:"The neurological warning signs follow standard guidance. No NIAMS page on spondylosis was retrieved this session.",qs:[
 alq("Rupa (symptoms)","Which area?",0,["Neck","Lower back","Both"]),
 alq("Rupa (symptoms)","Which do you feel? Choose all that apply.",1,["Stiffness","Pain","Pain going to the arm","Pain going to the leg","Tingling or numbness","Headache"]),
 alq("Rupa (symptoms)","Any of these? Choose all that apply.",1,["Weakness in arm or leg|!Limb weakness","Trouble walking or balance|!Trouble walking or balance","Loss of bladder or bowel control|!Loss of bladder or bowel control","None of these"]),
 alq("Hetu (Nidana)","Which apply? Choose all that apply.",1,["Long hours at a desk or screen","Heavy lifting","Past injury","Poor sleep posture","None of these"]),
 alc.dur(),alc.tried(),alc.imp()]},
/* ---------- MENTAL ---------- */
{id:"stress",g:5,n:"Stress and burnout",ay:"Manovaha srotas disorders (NCISM syllabus)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nStr","nMH","nHelp","ncP"],lim:"",qs:[
 alq("Rupa (symptoms)","What do you notice? Choose all that apply.",1,["Constant tiredness","Irritability","Trouble concentrating","Headaches or body pain","Poor sleep","Loss of interest in usual activities"]),
 alq("Rupa (symptoms)","Do the symptoms interfere with daily life, make you avoid things, or seem always present?",0,["No","Some|~Symptoms partly interfere with daily life (NIMH)","Yes|!Symptoms interfere with daily life or are always present (NIMH advises professional help)"]),
 alq("Rupa (symptoms)","Have severe symptoms lasted 2 weeks or more?",0,["No","Yes|!Severe symptoms for 2 weeks or more (NIMH)"]),
 alq("Rupa (symptoms)","Are you having thoughts of harming yourself?",0,["No","Yes|!Thoughts of self-harm: get help from emergency services or a crisis line now"]),
 alq("Hetu (Nidana)","Main source of stress?",0,["Work","Family or relationships","Health","Money","Several"]),
 alq("Hetu (Nidana)","Habits. Choose all that apply.",1,["Irregular sleep","High caffeine","Little exercise","Skipped meals","None of these"]),
 alc.tried()]},
{id:"anxiety",g:5,n:"Anxiety",ay:"Manovaha srotas: Udvega, Bhaya (NCISM syllabus)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nGAD","nPan","nMH","ncP"],lim:"",qs:[
 alq("Rupa (symptoms)","Which do you notice? Choose all that apply.",1,["Excess worry about everyday things","Trouble controlling worry","On edge or irritable","Restlessness","Trouble concentrating","Poor sleep or fatigue","Muscle tension or aches","Sweating, trembling or breathlessness"]),
 alq("Rupa (symptoms)","How long has worry been difficult to control on most days?",0,["Less than 6 months","6 months or more|~Worry on most days for 6 months or more, with several symptoms, fits the NIMH criteria for GAD; the doctor to assess"]),
 alq("Rupa (symptoms)","Do you have sudden attacks of intense fear?",0,["No","Yes|~Panic-type attacks reported (NIMH). Chest pain or breathlessness needs urgent check"]),
 alq("Rupa (symptoms)","Are you having thoughts of harming yourself?",0,["No","Yes|!Thoughts of self-harm: get help from emergency services or a crisis line now"]),
 alq("Rupa (symptoms)","Does it interfere with work or daily life?",0,["No","Some","A lot|!Anxiety interferes with daily life (NIMH advises professional help)"]),
 alq("Hetu (Nidana)","Habits. Choose all that apply.",1,["High caffeine","Poor sleep","Little exercise","None of these"]),
 alc.tried()]},
{id:"insomnia",g:5,n:"Insomnia",ay:"Anidra (NCISM syllabus, Manovaha srotas)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nMH","nHelp","ncP"],lim:"No NIH page on insomnia itself was retrieved. The NIMH mental-health pages on sleep habits and the 2-week rule were used.",qs:[
 alq("Rupa (symptoms)","What is the sleep problem?",1,["Trouble falling asleep","Waking in the night","Waking too early","Unrefreshing sleep"]),
 alq("Rupa (symptoms)","How long?",0,["Less than 2 weeks","2 weeks to 3 months","More than 3 months|!Sleep difficulty with other severe symptoms for 2 weeks or more needs professional review (NIMH)"]),
 alq("Hetu (Nidana)","Evening habits. Choose all that apply.",1,["Caffeine or tea late in the day","Alcohol","Screens in bed (blue light, NIMH)","Irregular bedtime","Heavy late dinner","None of these"]),
 alq("Rupa (symptoms)","Any of these along with poor sleep? Choose all that apply.",1,["Low mood or loss of interest|~Low mood with poor sleep (NIMH)","Constant worry","Appetite or weight change","Difficulty concentrating","None of these"]),
 alq("Rupa (symptoms)","Are you having thoughts of harming yourself?",0,["No","Yes|!Thoughts of self-harm: get help from emergency services or a crisis line now"]),
 alc.tried(),alc.imp()]},
/* ---------- WOMEN ---------- */
{id:"periods",g:6,n:"Irregular periods",ay:"Artava vikara (doctor to map)",ts:0,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["nAmen","nPCOS","mPCOS"],lim:"",qs:[
 alq("Rupa (symptoms)","Which fits your cycle?",0,["Too frequent","Too far apart","Missed for months|~Missed period not due to pregnancy, breastfeeding or menopause is a sign of another problem (NICHD)","Never had a period|~Never had a period: needs evaluation (NICHD)"]),
 alq("Rupa (symptoms)","How heavy is the bleeding?",0,["Light","Normal","Very heavy|!Very heavy bleeding (NIH)"]),
 alq("Hetu (Nidana)","Could you be pregnant?",0,["No","Possibly|!Possible pregnancy: test first (NICHD)"]),
 alq("Hetu (Nidana)","Recent changes. Choose all that apply.",1,["Weight gain","Weight loss","Heavy exercise","Stress","None of these"]),
 alq("Rupa (symptoms)","Any of these? Choose all that apply.",1,["Extra face or body hair","Acne","Headache","Vision change|!Vision changes with period problems (NICHD)","Milky nipple discharge|!Milky nipple discharge (NICHD)","None of these"]),
 alq("Basics","Age at first period?",0,["Under 12","12 to 14","15 or older"]),alc.fam(),alc.tried()]},
{id:"menopause",g:6,n:"Menopause symptoms",ay:"Rajonivritti (classical term; not confirmed in fetched Ayush pages)",ts:0,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["pMen","mPOI","nAmen"],lim:"",qs:[
 alq("Rupa (symptoms)","What is happening with your periods?",0,["Still regular","Irregular","Stopped for under 12 months","Stopped for 12 months or more"]),
 alq("Rupa (symptoms)","Which symptoms do you have? Choose all that apply.",1,["Hot flushes","Night sweats","Sleep problems","Low mood or irritability","Anxiety","Poor concentration","Joint or muscle pain","Vaginal dryness","Pain during sex","Bladder trouble","Heart palpitations"]),
 alq("Rupa (symptoms)","How old were you when the changes began?",0,["Under 40|~Changes before 40 can be primary ovarian insufficiency (NIH)","40 to 44","45 to 55","Over 55"]),
 alq("Rupa (symptoms)","Chest discomfort or very fast heartbeat?",0,["No","Yes|!Heart symptoms: needs a medical check"]),
 alq("Hetu (Nidana)","Related conditions. Choose all that apply.",1,["Thyroid disease|~Thyroid disease reported","Osteoporosis or fractures","High blood pressure","None of these"]),
 alc.imp(),alc.tried()]},
/* ---------- LIFESTYLE ---------- */
{id:"immunity",g:7,n:"Immunity",ay:"Rasayana and Dinacharya (CCRAS)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["ccB","skinD"],lim:"No NIH page on general immunity was retrieved. Questions follow the CCRAS daily routine guidance only.",qs:[
 alq("Rupa (symptoms)","How often do you fall ill?",0,["Rarely","Few times a year","Every month or more|~Frequent illness: the doctor may want tests"]),
 alq("Rupa (symptoms)","Any of these? Choose all that apply.",1,["Unplanned weight loss|!Unplanned weight loss","Persistent fever|!Persistent fever","Slow-healing wounds","None of these"]),
 alq("Hetu (Nidana)","Daily routine. Choose all that apply.",1,["Regular sleep","Daily oil massage","Regular meals when hungry","Regular exercise","Irregular routine"]),
 alc.ahara(),alc.stress(),alc.tried()]},
{id:"panchakarma",g:7,n:"Detox (Panchakarma)",ay:"Panchakarma: Vamana, Virechana, Basti, Nasya, Raktamokshana (Ayush STG)",ts:1,dosha:"CCRAS: procedures are chosen from the vitiated dosha. Selection and eligibility are for the doctor.",src:["stgM","skinD","psoA"],lim:"No NIH page applies to Panchakarma. The questions only collect history the doctor needs to decide eligibility.",qs:[
 alq("Basics","Why do you want Panchakarma?",0,["General wellness","A health condition","Seasonal cleansing","Advised by a doctor"]),
 alq("Basics","Do you have any of these? Choose all that apply.",1,["Heart condition|~Heart condition: doctor to decide eligibility","Diabetes|~Diabetes: doctor to decide eligibility","High blood pressure|~High blood pressure: doctor to decide eligibility","Recent surgery or illness|~Recent surgery or illness: doctor to decide eligibility","Very weak or underweight|~Very low strength: doctor to decide eligibility","None of these"]),
 alq("Basics","Have you had Panchakarma before?",0,["No","Yes, no problems","Yes, had a problem|~Previous problem with Panchakarma"]),
 alc.dur(),alc.ahara(),alc.tried()]},
{id:"seasonal",g:7,n:"Seasonal routines",ay:"Ritucharya and Dinacharya (CCRAS)",ts:1,dosha:"Not stated in the sources reviewed. The doctor assesses the pattern.",src:["ccB","skinD"],lim:"No NIH page applies. The questions follow the CCRAS routine guidance only.",qs:[
 alq("Rupa (symptoms)","Which season troubles you most?",0,["Summer","Monsoon","Autumn","Winter","Spring","No pattern"]),
 alq("Rupa (symptoms)","What happens in that season? Choose all that apply.",1,["Skin trouble","Digestion trouble","Joint pain","Cough or cold","Low energy","None of these"]),
 alq("Hetu (Nidana)","Daily routine. Choose all that apply.",1,["Regular wake-up time","Daily oil massage","Meals only when hungry","Regular exercise","Irregular routine"]),
 alc.ahara(),alc.tried()]}
];
/* ---------- engine ---------- */
const ALS_st={id:null,i:0,ans:{}};
function alById(id){return AL.find(x=>x.id===id)}
function alSet(id){ALS_st.id=id;ALS_st.i=0;ALS_st.ans={};if(id==="hair"){i=0;ans=Q.map(()=>[]);window._gateOpen=false;cur=null}else if(window.onAssessmentStart)window.onAssessmentStart();alRender()}
function alChange(){ALS_st.id=null;ALS_st.i=0;ALS_st.ans={};cur=null;window._gateOpen=false;try{ans=Q.map(()=>[])}catch(e){}i=0;alRender()}
function alBar(){const b=document.getElementById("alBar");if(!b)return;const a=alById(ALS_st.id);b.innerHTML=a?`<div class="sm mu" style="margin-bottom:10px">Ailment: <b>${esc(a.n)}</b> · <button class="lnk" onclick="alChange()">Change ailment</button></div>`:""}
function alRender(){
 alBar();
 if(!ALS_st.id){alPicker();return}
 if(ALS_st.id==="hair"){if(typeof cur==="function"&&cur)cur();else init();return}
 alDraw();
}
function alPicker(){
 app.innerHTML=`<h1>What would you like help with?</h1><p class="mu" style="margin:6px 0 16px">Choose one ailment first. The questions after that are specific to it. This tool prepares a summary for a doctor. It does not diagnose.</p>
 ${ALG.map((g,gi)=>`<div class="card"><h3>${esc(g)}</h3><div class="chips">${AL.filter(a=>a.g===gi).map(a=>`<button onclick="alSet('${a.id}')">${esc(a.n)}</button>`).join("")}</div></div>`).join("")}
 <p class="mu sm">Question content is framed only from Ministry of Ayush and NIH sources. The sources behind each question set are shown on the summary. A registered Vaidya has not yet reviewed these questions.</p>`;scrollTo(0,0)}
function alSteps(){const a=alById(ALS_st.id);return [...ALCOMMON,...a.qs]}
function alDraw(){const st=alSteps(),n=ALS_st.i,q=st[n],a=ALS_st.ans[n]||[],last=n===st.length-1;
 app.innerHTML=`<div class="bar" role="progressbar" aria-valuenow="${n+1}" aria-valuemax="${st.length}"><i style="width:${(n+1)/st.length*100}%"></i></div>
 <div class="sec">${esc(q.tag)} · Question ${n+1} of ${st.length}</div><h2>${esc(q.q)}</h2>
 ${q.o.map((o,j)=>`<button class="opt ${a.includes(j)?"on":""}" onclick="alPick(${j})">${esc(o.t)}</button>`).join("")}
 <div class="row"><button class="btn g" onclick="${n?`alGo(${n-1})`:"alChange()"}">Back</button><button class="btn" ${a.length?"":"disabled"} onclick="${last?"alResult()":`alGo(${n+1})`}">${last?"See summary":"Next"}</button></div>`;scrollTo(0,0)}
function alGo(n){ALS_st.i=n;if(window.onAssessmentStep)window.onAssessmentStep(n);alDraw()}
function alPick(j){const q=alSteps()[ALS_st.i];let a=ALS_st.ans[ALS_st.i]||[];const neg=t=>/^(None|No regular|Nothing|No$)/.test(t);
 if(!q.m)a=[j];else if(neg(q.o[j].t))a=[j];else{a=a.filter(x=>!neg(q.o[x].t));a=a.includes(j)?a.filter(x=>x!==j):[...a,j]}
 ALS_st.ans[ALS_st.i]=a;alDraw()}
function alSum(){const ail=alById(ALS_st.id),st=alSteps(),groups={},red=[],cau=[],meds=[],rows=[];
 st.forEach((q,n)=>{const sel=(ALS_st.ans[n]||[]).map(j=>q.o[j]);const txt=sel.map(o=>o.t).join("; ");(groups[q.tag]=groups[q.tag]||[]).push({q:q.q,a:txt});rows.push(txt);
  sel.forEach(o=>{if(o.k==="!"&&!red.includes(o.msg))red.push(o.msg);if(o.k==="~"&&!cau.includes(o.msg))cau.push(o.msg)});
  if(q.q.startsWith("Do you take any regular")){sel.forEach(o=>{if(o.k==="~")meds.push(o.t)})}});
 const sig=ail.id+"|"+rows.join("#");
 return {kind:"gen",aid:ail.id,type:ail.n,pattern:"Pre-consultation summary. No dosha score; the doctor decides the pattern.",ay:ail.ay,dosha:ail.dosha,groups,red,cautions:cau.filter(x=>!meds.length||!/^Takes /.test(x)),meds,src:ail.src.map(k=>ALS[k]),lim:ail.lim,sig,split:{Vata:0,Pitta:0,Kapha:0},noPat:true,agni:"",ama:"",dhatu:"",factors:[]}}
function ALsumHtml(s){
 return `<p><b>${esc(s.type)}</b> <span class="tag">Summary only</span></p><p class="mu sm">Ayurvedic term: ${esc(s.ay)}<br>Dosha information: ${esc(s.dosha)}</p>
 ${s.red.length?`<div class="warn sm"><b>Warning signs reported</b>${s.red.map(esc).join("<br>")}</div>`:""}
 ${s.cautions.length?`<div class="note sm"><b>Cautions</b>${s.cautions.map(esc).join("<br>")}</div>`:""}
 ${s.meds.length?`<p class="sm"><b>Regular medicines:</b> ${esc(s.meds.join(", "))}</p>`:""}
 <details><summary class="sm">Answers grouped as Nidana, Rupa and Upashaya</summary>${Object.keys(s.groups).map(g=>`<p class="sm" style="margin:8px 0 2px"><b>${esc(g)}</b></p><ul class="sm">${s.groups[g].map(r=>`<li>${esc(r.q)} <b>${esc(r.a)}</b></li>`).join("")}</ul>`).join("")}</details>
 ${ALsrc(s)}`}
function ALsrc(s){return `<details><summary class="sm">Sources behind these questions (Ayush and NIH only)</summary><ul class="sm">${s.src.map(x=>`<li><a href="${x[1]}" target="_blank" rel="noopener">${esc(x[0])}</a></li>`).join("")}</ul>${s.lim?`<p class="sm"><b>Limit:</b> ${esc(s.lim)}</p>`:""}<p class="sm mu">Not reviewed by a registered Vaidya yet.</p></details>`}
function alResult(){const s=alSum();window._SUM=s;cur=null;
 app.innerHTML=`<h1>Your pre-consultation summary</h1><p class="mu" style="margin:6px 0 14px">This is not a diagnosis. It organises your answers so a doctor can review them.</p>
 ${s.red.length?`<div class="warn"><b>Please do not wait for an online booking</b>Some answers match warning signs that the NIH and Ayush sources say need a doctor's review soon. Tell the doctor first, or visit a clinic or hospital near you.<br><br>${s.red.map(esc).join("<br>")}</div>`:""}
 <div class="card">${ALsumHtml(s)}</div>
 ${window.onResultHtml?window.onResultHtml(s):""}
 <div class="card"><h3>Share with a doctor</h3><p class="mu">Send this summary only to a doctor you trust.</p><div class="row"><button class="btn" onclick="shareWA()">WhatsApp</button><button class="btn g" onclick="copySummary()">Copy text</button></div></div>
 <div class="row"><button class="btn g" onclick="alChange()">Start another ailment</button></div>`;scrollTo(0,0);
 if(window.onAssessmentDone)window.onAssessmentDone(s)}
const _stOrig=summaryText;
summaryText=function(s){if(s.kind!=="gen")return _stOrig(s);
 return [s.type+" pre-consultation summary (not a diagnosis)","Ayurvedic term: "+s.ay,"Dosha information: "+s.dosha,s.red.length?"WARNING SIGNS:":"",...s.red.map(x=>"! "+x),s.cautions.length?"Cautions:":"",...s.cautions.map(x=>"- "+x),s.meds.length?"Regular medicines: "+s.meds.join(", "):"",...Object.keys(s.groups).flatMap(g=>[g+":",...s.groups[g].map(r=>"- "+r.q+" "+r.a)])].filter(x=>x!=="").join("\n")};
