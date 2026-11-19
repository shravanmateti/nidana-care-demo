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

## Added in the UAT fixes
- Safety rules are enforced inside the functions (`approveProd`, `approveSup`, `placeOrder`, `bookClinic`, `drAddTreat`, `issueRx`, `confirmBook`), not only by hiding buttons. Keep it that way.
- Herbo-mineral products carry `assay {lab,no,date}`; admin sees it and can `rejectProd` with a reason.
- `fold(key,title,body,open)` makes a collapsible card whose open state lives in `S.fold`; closed by default on phones unless `open===true`. Catalogue uses `window._catFold`.
- `labelAll` gives every unlabelled field an aria-label after each render. `stackTables` stacks 3+ column tables on phones.
- CI: `.github/workflows/test.yml` builds, checks `index.html` equals the build, and runs `node tests/run.js` (t5 nightly). `npm test` does the same locally.

## Added after UAT round 2
- Every non-hair ailment gets a detailed analysis built from the patient's answers (`alAnalyse`, `alAnSections` in ailments.js): urgency, symptoms, contributing factors (Nidana), how it may have developed (Samprapti), digestion and routine strain count, outlook, what to do now, and how to prepare (plus the tests list from `testsFor`). No dosha score is invented. Stored as `sum.an`; the doctor sees it under "Detailed analysis".
- Login and registration gate the app (`authHtml`, `doLogin`, `doRegister`, `logout`, `realUser` in platform1.js). Patients self-register. Doctors, suppliers and clinics get logins when the admin onboards them (Admin > Onboarding: `onboardDoc`, `onboardSup`, `onboardClinic` in platform4.js; new doctors start `reg:"pending"` and cannot be booked until the admin verifies them; new clinics start `pending` until an audit of 80% or more). Real users are locked to their own role. Demo mode (`?demo=1` or the "Explore the demo" button) keeps the role switcher; all tests open `dist/index.html?demo=1` except t10, which tests the login itself.
- Passwords use a demo-only hash and live in localStorage. Sample password for the seeded accounts is `Demo@1234`. This is not real security. A real build needs a server.
- Known limit: the prototype keeps one patient record per browser, so two patient accounts in the same browser share assessments and bookings.

## Added after UAT round 3
- Password change (account bar, `changePw`) and forgot-password (`sendReset`, `doReset`, login page link). The reset code is shown on screen because the prototype has no email (6 digits, one use, 10 minutes, locks after 5 wrong tries). Admin can issue a new temporary password per onboarded login (`adminReset`, Admin > Onboarding > Onboarded logins). Temporary passwords (`user.tmp`) open the change-password form at login.
- Doctor registration certificate: the doctor uploads a JPG/PNG/WebP image (`certPick`, card `regCard` at the top of the doctor Requests tab); it is shrunk to a JPEG data URL (max 1200px) and kept in `doctor.cert`. Admin > Verification shows the image and can Approve (`verifyDoc`, refused without a certificate image and a registration number) or Reject with a reason (`rejectDoc`, `reg:"rejected"`, doctor can upload again). This is manual review, not a lookup on a state council register.
- Tests: `tests/t11.js` (40 checks) covers all of this.

## Added after UAT round 4 (bills and nearest clinics)
- Bills: one downloadable PDF per paid item, with the button where the patient already sees the item (My care for each consultation, Medicines for each order, Clinic treatment after booking). `billFor(kind,id)` builds the data (`a` consultation, `o` medicine order, `t` clinic booking), `billPages` lays it out, `makePdf` writes a real PDF by hand (no library; ASCII only, so the rupee sign prints as "Rs."). It is a receipt, not a GST invoice, and says so. Bill number: `NC-<A|O|T>-<yyyymmdd>-<last 4 of id>`. Clinic bills say "to be paid at the clinic".
- Nearest clinics (Clinic treatment tab, in `platform2.js`): patient gives a PIN code (also asked, optionally, at registration) or taps "Use my location". No paid map service and no API key. PIN is geocoded with OpenStreetMap Nominatim, falling back to India Post's PIN lookup plus Nominatim; results are cached in `DB.geo`. Device location is rounded to 2 decimals and used only in the browser. Distances are straight-line (haversine). If the lookup fails, clinics are ordered by PIN number closeness and the page says so. "Directions in Google Maps" is a plain link, free. With a treatment advised, audited clinics offering everything come first, then nearest. Clinic onboarding now requires a 6-digit PIN. Seeded clinic positions (`CAT_LOC`) are city-centre approximations.
- Tests: `tests/t12.js` (40 checks, geocoder mocked, PDF structure validated).

## Added after UAT round 5 (automatic supplier routing)
- Orders are routed automatically; the patient only sees the result on Medicines ("How it will ship": parcels, supplier, estimated arrival, shipping fee, total) and adds a PIN code once if none is saved (`pinAsk`, reuses `setPin`). Code is in platform2.js: `planFor`, `etaFor`, `makeOrders`, `fillBackorders`, `shipHtml`, `placeOrder`.
- Rule: exact prescribed product only, no substitution. `DB.stock[pid][supplierId]` holds units (a supplier can stock another supplier's approved product, same price). `planFor` tries every set of up to 12 verified suppliers (fastest first) that can cover the order and picks, in this order: soonest arrival of the slowest parcel, fewest parcels, lowest shipping fees. A quantity is split across suppliers only if no single supplier in the set holds enough. Shortages ship what is in stock and the rest becomes a waiting back-order (`DB.backorders`), paid for now, which ships automatically when a supplier saves stock (`saveStock`, `addDistrib` call `fillBackorders`). Stock is reduced when the order is placed, so two prescriptions cannot sell the same unit. Only verified suppliers are used.
- Delivery estimate: dispatch days (supplier sets, 1 to 7) + transit by straight-line km between supplier and patient (under 50 km 0 days, under 300 1, under 800 2, under 1500 3, else 4), shown as a two-day range, always labelled estimated. If the patient's location cannot be looked up it falls back to PIN prefixes. Real courier lookups need a server and an account; not built.
- Supplier screens (Products tab, "Stock and dispatch" fold): units per product, stock another supplier's product, PIN, dispatch days, shipping fee per parcel, restock days. Supplier onboarding now requires a 6-digit dispatch PIN. Orders now carry `grp, i, n, ship, lo, hi, eta, late`; `total` stays items only (commission is not charged on shipping). Bills for orders add a shipping line and parcel number. Old saved data is upgraded by `fixDB` in platform1.js (adds stock, back-orders, supplier PINs).
- Tests: `tests/t13.js` (50 checks). t2 and t7 now enter a PIN on the Medicines page before ordering.

## Added after UAT round 6 (delivery address and order tracking)
- Delivery address: asked once at the top of Medicines (`addrCard`, `saveAddr`, `addrOk` in platform2.js); name, mobile and PIN are prefilled from the profile. Stored as `DB.patient.addr`; its PIN also sets `DB.patient.pin` (and clears the saved location so it is looked up again). The delivery plan and the Place order button appear only once a valid address exists; `placeOrder` refuses without one. Each parcel copies the address at order time (`order.to`), so later edits do not change parcels already placed. Only the supplier shipping a parcel sees its address and mobile number.
- Tracking: `order.track` is a list of `{s,t}` (placed, dispatched, delivered). Supplier marks dispatched in Orders and must give a courier name and tracking number (`cr_<id>`, `tn_<id>`; `setOrder` refuses otherwise, refuses delivered before dispatched, ignores repeats). The patient sees an Ordered / Dispatched (courier, tracking no.) / Delivered timeline on each parcel in Medicines (`trackHtml`), a "Running later than estimated" tag when the estimate has passed, and a "Track your order" button on My care. Bills show who the parcel goes to and the courier details. Old orders without `to` or `track` still render.
- No courier integration: the tracking number is text the supplier types; there is no live status and no courier link. Patient cannot yet confirm receipt or report a problem.
- Tests: `tests/t14.js` (47 checks). t2, t7 and t13 now save an address before ordering, and t2 enters courier details when dispatching.

## Tests
Playwright (`npm i playwright`, needs a Chrome/Chromium). Run from repo root after `python3 build.py`: `node tests/run.js` runs t2,t3,t4,t6,t7,t8,t9,t10,t11,t12,t13,t14 and fails on any FAIL line; `node tests/t7.js` is the full patient-doctor-clinic loop (15 checks), t9 covers the guards, assay evidence, labels and folds, t10 covers the ailment analysis, login, registration and onboarding, t5 runs all ailment flows. Sections on the doctor case sheet, admin queue and catalogue are folded on phones: tests call `document.querySelectorAll('#view details').forEach(d=>d.open=true)` before touching them. Avoid UI text containing the word "Next" outside the wizard's Next button, because tests and users match on it. Some tests take over 100 s (t5 runs all 31 flows).

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
