# Nidana Care: UAT test report

Date: 15 Nov 2026 · Build tested: `index.html` after the mobile-polish changes · Method: automated Playwright runs (Chromium, 390px phone and 1280px desktop) acting as each of the five roles.

> This is a scripted walkthrough of a prototype with sample data. It is not a test with real users, real devices or a screen reader, and it is not a clinical or legal review.

## 1. Summary

| Area | Result |
|---|---|
| Existing suites t2–t8 (about 120 checks, including all 31 ailment flows) | All pass after one fix (see 2) |
| New per-role UAT script (37 checks, 5 roles) | 31 pass · 4 were mistakes in my script · 2 are real gaps |
| Console / JS errors across every role and tab, phone and desktop | None |
| Horizontal scroll on any tab at 390px | None |
| Runs with browser storage blocked | Yes, still renders |
| Catalogue render time (37 products, 18 treatments) | About 6 ms |
| Script injection through a product name | Blocked (text is escaped) |

**Overall:** the core loop (patient → doctor → medicines → clinic → follow-up) works for every role and the built-in safety rules hold. The remaining weaknesses are enforcement (rules live in the screen, not in the logic), page length on phones, a few accessibility gaps, and the lack of real-user evidence.

## 2. A regression I caused, now fixed

Stacking tables on phones hid each table's header row with `display:none`. That removed the column names from the page's text, and `t2` ("follow-up chart/table") failed on it. A screen reader would also have lost the headers.

Fix: the header row is now visually hidden but still readable, and the stacked tables carry table, row and cell roles. `t2` and `t7` now pass.

## 3. Results by role

### Patient
- Assessment picker, hair-fall flow, non-hair flow (summary only, no dosha score), pregnancy caution, next-step bar, booking, medicine order, clinic booking and follow-up log all work (t2, t3, t4, t5, t7 and the new script).
- Only verified doctors can be booked. The pending doctor is listed as "Registration under verification" with no slots.
- State survives a reload.
- Gap: the new questions are English only, and the hair flow's other languages were not tested.

### Doctor
- Case sheet shows answers, red flags, cautions and tests advised for the ailment. A prescription cannot be issued until Agree, Partly or Disagree is chosen.
- Herbs are hidden and the doctor sees a note when pregnancy, a medicine or a thyroid disorder is reported (t3). Shodhana procedures are disabled when pregnancy is reported (t6).
- Not conclusively tested: whether a medicine can be added with a blank dose. My check did not prove it either way.
- The case sheet is about 2,700px tall on a phone.

### Supplier
- The form rejects a missing batch number, a herbo-mineral without an assay tick, and a negative price. A valid herbo-mineral becomes "pending".
- **Gap:** "heavy-metal assay on file" is only a tick box. No document, lab name, lot or date is captured.
- 4 form fields have no label (placeholder only).
- The Products tab is about 4,350px tall on a phone.

### Clinic
- Bookings, audit and plan tabs work. A booked treatment can be marked done.
- **Gap:** "Save self-audit" with nothing ticked saves a 0% score with no warning or confirmation.

### Admin
- Verification works. Scores above 100 and non-numeric scores are rejected. A score of 55 suspends the clinic. Funnel, revenue, simulator, settings and reset all work.
- **Gap:** the rule "no approval of herbo-mineral products without an assay" is enforced only by hiding the button. The approve function itself has no check.
- 3 verification fields have no label. The Verification tab is about 3,150px tall on a phone.

## 4. Recommended changes, how to do them, and what they give you

Effort: S under half a day, M 1–3 days, L a week or more. Order is by value for the next step (user testing, then real use).

| # | Change | How to approach it | Impact | Effort |
|---|---|---|---|---|
| 1 | Enforce safety rules in the logic, not only the screen | Put the herbo-mineral assay check inside `approveProd`, the shodhana check inside the prescribing function, and the pregnancy check inside the order function. Add a test for each that calls the function directly. | A future screen change or a real backend cannot quietly drop a safety rule. Largest risk reduction for the least work. | S |
| 2 | Capture real assay evidence | Replace the tick box with lab name, report number, test date and a file or link. Admin sees these before approving and can reject. | Turns the heavy-metal rule from a promise into something an auditor can check. Needed before real supplier onboarding. | M |
| 3 | Confirm before saving an empty or low self-audit | Disable the button until at least one item is ticked, and ask for confirmation under a set score. | Prevents accidental 0% records and bad data in the audit history. | S |
| 4 | Shorten the long phone pages | Collapse sections by default on phones (doctor case sheet sections 4 and 5, supplier product list, admin verification groups), the same way the Catalogue now works. Keep a sticky "Issue prescription" bar. | Less scrolling for doctors using phones, and fewer abandoned case sheets. | M |
| 4b | Keep the Catalogue open/closed state when the filter changes | Store the open state in `S` and restore it after render. | Removes a small annoyance when filtering. | S |
| 5 | Label every field and enlarge links | Add `<label>` or `aria-label` to the 7 unlabelled fields. Pad inline source links to 44px on phones. | Usable with a screen reader and easier to tap, which matters for older patients. | S |
| 6 | Add automated checks to GitHub | Add a `package.json` with Playwright and a GitHub Actions workflow that runs `build.py`, then t2–t8 on every push. Run the slow t5 nightly. | Catches regressions like the table-header one before they are published. | S–M |
| 7 | Run real-user tests | 5 patients, 3 Ayurveda doctors, 1 clinic owner, 1 supplier. Give each a task, record where they hesitate, and fix the top 5 issues. Use the funnel page to see where people stop. | The only way to find what the scripts cannot: wording, trust, language. Drives every later priority. | M |
| 8 | Language support for the new flows | Move question text into a translation table. Start with Hindi plus one regional language chosen from your first users. | Opens the product to patients who do not read English. | L |
| 9 | Real accounts and roles | Separate logins, server-side permissions, audit trail. This is a rebuild step, not a patch. | Required for any real use. Removes the demo role switcher. | L |
| 10 | Clinician and legal review | A Vaidya reviews content and the "Tests advised" sets. A lawyer reviews telemedicine rules, e-prescription, drug sale and data protection. | Gates real use. Also fills the thin-source areas (acne, pigmentation, hives, vitiligo, PCOS and others). | L (mostly waiting) |

## 5. Not covered, so treat as unknown

- Real phones and Safari. I used Chromium at phone width.
- Screen readers, keyboard-only use and colour contrast.
- Slow networks and very old devices.
- Whether people understand the wording. This needs the user tests in item 7.
- Anything that needs a server, since there is none.

## 6. How to re-run

```bash
cd nidana-care-demo
npm i playwright --no-save && npx playwright install chromium
python3 build.py && node tests/t7.js   # t2 t3 t4 t6 t8, and t5 (slow)
```

## 7. Fixes applied after this report

Items 1, 2 (evidence fields), 3, 4, 4b, 5 and 6 are done and covered by `tests/t9.js` (27 checks). Items 7 to 10 need people, partners or a backend and are not code changes.

| Item | What changed |
|---|---|
| 1 | Guards now live inside `approveProd`, `approveSup`, `placeOrder`, `bookClinic`, `drAddTreat`, `issueRx` and `confirmBook` |
| 2 | Mineral products need lab name, report number and a past test date. Admin sees them and can reject with a reason. The files themselves are still not uploaded (needs a backend) |
| 3 | An empty self-audit is not saved, and a live "n of N ticked" count is shown |
| 4, 4b | Sections fold on phones and remember their state. Phone heights: supplier Products 4,357 to 1,329px, admin Verification 3,146 to 2,464px, doctor case sheet 2,744 to 2,505px. "Issue prescription" is a sticky bar |
| 5 | Every field gets an accessible name, and source links are at least 40px tall on phones |
| 6 | `package.json`, `tests/run.js` and a GitHub Actions workflow. t5 runs nightly |

## 8. Round 2: analysis for every ailment, login, registration and onboarding

Date: 15 Nov 2026. Four requests were built and tested: (1) the detailed analysis that hair fall had is now given for every other ailment, (2) a login page and patient registration, (3) admin onboarding of new suppliers, (4) admin onboarding of new clinics.

| Area | What was built | How it was tested |
|---|---|---|
| Detailed analysis | For all 30 non-hair ailments the patient sees urgency, symptoms reported, contributing factors (Nidana), how it may have developed (Samprapti), a digestion and routine strain count, outlook, what to do now, and how to prepare, with the tests list. The doctor sees the same under "Detailed analysis" on the case sheet. No dosha score is made up. | t10: every ailment shows all seven sections; a warning-sign answer raises urgency to "See a doctor soon" and calm answers stay "Routine"; analysis is stored with the assessment; copy text includes it. |
| Login and registration | The app opens on a login page. Patients register with name, mobile, email and password (8+ characters, letters and a number, confirm field, age and prototype consent). Wrong passwords are refused, 5 failures lock the form for 30 seconds, duplicates are refused, sessions survive a reload, logout works. Real users are locked to their own role. "Explore the demo" keeps the five-role switcher. | t10: 20 checks on validation, lockout, role lock, logout, reload, plus logins for admin, doctor, supplier and clinic. |
| Supplier onboarding | Admin > Onboarding > supplier form: company, contact, email, phone, state, licence number (required), GMP details and batch report (optional now). Creates a pending supplier and a login with a one-time temporary password. Approval still needs licence, GMP and report. | t10 and the end-to-end run: bad email, phone, licence, duplicate licence and email are refused; new supplier logs in, lists a product, admin approves it. |
| Clinic onboarding | Admin > Onboarding > clinic form: name, city, state, registration number, BAMS physician and registration number, contact, treatments with prices. Creates a clinic with status pending and score 0, and a login. It cannot take bookings until an audit of 80% or more is recorded. | t10 and the end-to-end run: validation, duplicate registration number, pending clinic cannot be booked, audit makes it bookable, clinic logs in. |

**Results:** t2, t3, t4, t6, t7, t8, t9 and the new t10 (62 checks) all pass, t5 (all 31 flows) passes, and a 13-step end-to-end run across patient, doctor, admin, supplier and clinic logins passes. No console errors. No sideways scroll on the login or onboarding pages at 375px and 390px.

**Limits, stated plainly:**
- Passwords use a demo-only hash and live in the browser. This is not real security. Real accounts need a server.
- The prototype keeps one patient record per browser, so two patient accounts in the same browser share assessments and bookings.
- There is no password reset or change. Admin can use "Reset all data" in Settings.
- The analysis uses general classical principles and the patient's own answers. It has not been reviewed by a Vaidya, and the contributing-factor wording needs that review before real use.
- Doctor onboarding was added afterwards (see section 9).

## 9. Doctor onboarding

Admin > Onboarding > doctor form: name, qualification (must include BAMS), experience, languages, fee (₹100 to ₹5000), state council registration number and council, contact, and weekly slots (for example "Mon 10:00, Wed 17:00"). The doctor starts as unverified with a login and a one-time temporary password. Patients cannot book an unverified doctor, and the admin cannot verify one without a registration number. Tested in t10 (validation, duplicates, pending state, login, booking refused until verified, booking works after verification) and in the end-to-end run.


## 10. Round 3: password reset, change password, doctor certificate review

Built: change password (current password required, strength check, must differ); forgot password with a one-use 6-digit code (shown on screen in the prototype, expires in 10 minutes, locked after 5 wrong tries, no hint whether the email exists); admin-issued temporary passwords that must be changed at first login; doctor upload of the council registration certificate as an image, admin review with Approve or Reject plus reason, re-upload after rejection. A doctor cannot be verified without a certificate image and a registration number.

Tests: t11 (40 checks) passes, as do t2-t10 and t5.

Limits: no email or SMS, so the reset code appears on the page (a real build must send it and hold it on a server). Passwords are still a demo-only hash in localStorage. The certificate image lives in the browser only, and the admin compares it by eye; there is no lookup against any state council register, no document authenticity or image-tampering check, and PDFs are not accepted.


## 11. Round 4: downloadable bills and nearest clinics

Built: a PDF receipt for each consultation, medicine order and clinic booking, one tap from the screen where the patient already sees it; a clinic list ordered by distance from the patient's PIN code or device location, with a Google Maps directions link per clinic. PIN can be given at registration, so the clinic page is already sorted when the patient gets there.

Tests: t12 (40 checks) covers PDF validity (offsets, stream lengths, page count, multi-page), bill contents, PIN and device-location ranking, the offline fallback, refused location permission, registration and onboarding PINs, and phone-width layout. t2-t11 and t5 still pass.

Limits: receipts are not tax invoices (no GST lines or GSTIN; legal review pending); distances are straight-line and PIN lookups depend on free OpenStreetMap coverage, which is patchy for some Indian PINs, so the offline order-by-PIN fallback matters; seeded clinic positions are approximate; the PIN is sent to OpenStreetMap (and India Post for the fallback) and the privacy note on the page says so.
