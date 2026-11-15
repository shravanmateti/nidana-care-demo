# Nidana Care prototype: handoff for Claude Code

## What this is
A single-file, clickable prototype (no backend) of an Ayurveda care platform for the owner, Mithun (repo: github.com/shravanmateti/nidana-care-demo, served by GitHub Pages from `index.html` at the repo root).
Roles: Patient, Doctor, Supplier, Clinic, Admin. Rollout stages 0 to 4 (assess+lead, doctors+follow-up, verified medicines, clinic treatments, subscriptions+revenue). All data is mock, stored in localStorage key `ncDB_v2`. No real payments. Not medical advice.

## Layout and build
- `src/` holds the sources. `python3 build.py` concatenates them into `dist/index.html` (copy that to the repo root as `index.html` to publish).
- Script order matters: intake.js, ailments.js, catalogue.js, platform1-4.js, then `NC.render()`.
- `intake.js`: original Khalitya hair-fall Nidana (scored, dosha pattern). Globals: `Q`, `ans`, `i`, `go`, `draw`.
- `ailments.js`: ailment picker + 31 ailment question sets (`AL`, `ALG` groups, `alq`, `alSteps`, `alSum`, `ALsumHtml`). Non-hair ailments give a doctor summary with red flags, never a dosha score. Hair fall keeps the scored flow.
- `catalogue.js`: 37 products (`CAT_PRODUCTS`), 18 treatments (`PROC_INFO`), 3 clinics (`CAT_CLINICS`), `catView(DB,inr)`, helpers `catAid`, `catPreg`, `catOpts`, `procOpts`.
- `platform1-4.js`: one IIFE `NC` (opens in platform1, closes in platform4). `DB` state, `S` UI state `{role,tab,stage,doc,sup,cli,caseId,pick,draft}`, `TABS`, `STAGES`, `VIEWS["role.tab"]`. Public API is the object returned at the end of platform4.js; HTML uses inline `onclick="NC.x()"`, so any new handler must be added to that return object.
- Intake/ailment/catalogue code is global scope, not inside `NC`; it talks to `NC` through hooks `onAssessmentStart/Step/Done` and `onResultHtml`.

## Safety rules built in (keep them)
- Red-flag answers show a red banner on the summary.
- Herbo-mineral products (`hm`) need a heavy-metal assay (`ht`) before admin approval.
- Shodhana procedures (`sh:1`) are disabled when pregnancy or recent delivery is reported.
- Herb lists are hidden from patients when pregnancy, a medicine or thyroid disorder is reported; doctor sees `herbLock`.
- Content sources are restricted to Ministry of Ayush family (ayush.gov.in, CCRAS, NCISM, AIIA) and NIH family (nih.gov, NCCIH, NIAMS, NIDDK, NIMH, NICHD, MedlinePlus, PMC). Do not add other sources.

## Recent UX work (already done)
Guided "What to do now" bar (`nextStep`, `nextBar`, `nextGo`), inline validation on the case sheet, ailment-specific "Tests advised" (`testsFor`), patient answers expanded, collapsed demo stage control, clinic list sorted by audited and offered treatments, Revenue tab available at all stages, "Turn on Stage N" button on locked tabs.

## Tests
Playwright (`npm i playwright`, needs a Chrome/Chromium). Run from repo root after `python3 build.py`: `node tests/t7.js` (full patient-doctor-clinic loop, 15 checks), t2/t3/t4/t5/t6/t8 for the rest. Avoid UI text containing the word "Next" outside the wizard's Next button, because tests and users match on it. Some tests take over 100 s (t5 runs all 31 flows).

## Known gaps / honest caveats
- No Vaidya has reviewed the content. Say so in any demo.
- New content is English only (the original hair flow had other languages).
- Thin sources for products or treatments for acne, pigmentation, hives, vitiligo, premature aging, graying, PCOS, periods, menopause.
- Some Ayurvedic terms unconfirmed (Vyanga, Vibandha, Rajonivritti).
- The "Tests advised" sets per ailment group were chosen by the assistant, not taken from Ayush/NIH sources; needs clinician review.
- Legal and regulatory review needed before any real use (telemedicine rules, e-prescription, drug sale, data protection).
- Role switching is a demo device; a real app needs separate logins.
- Never push without the owner asking; GitHub credentials live in the owner's GitHub Desktop.

## Ideas not yet done
- Add a "Proposed model" section to the sector-report Word file.
- Put the staged plan on a Whiteboard.
- Mobile polish: long doctor case sheet (~2,200px), long medicines page.
- Collect user-test feedback (patients, Ayurveda doctors, a clinic owner) and fix what they get stuck on.
