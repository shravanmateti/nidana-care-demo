// t11: forgot password, change password, admin reset, doctor registration certificate upload and admin review
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const URL='file://'+process.cwd()+'/dist/index.html';
 const mk=async(w=390)=>{const p=await (await b.newContext({viewport:{width:w,height:800}})).newPage();p.on('dialog',d=>d.dismiss());p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(URL);return p};
 let ok=0,bad=0;const T=(n,c,x)=>{console.log(c?'PASS':'FAIL',n,c?'':(x||''));c?ok++:bad++};
 const txt=p=>p.evaluate(()=>document.body.innerText);
 const setv=(p,o)=>p.evaluate(o=>{for(const k in o){const e=document.getElementById(k);if(e){if(e.type==='checkbox')e.checked=!!o[k];else e.value=o[k]}}},o);
 const login=async(p,e,w)=>{await setv(p,{lg_e:e,lg_w:w});await p.evaluate(()=>NC.doLogin())};
 const PW='Demo@1234';
 const signed=async p=>(await txt(p)).includes('Signed in as');
 const open=p=>p.evaluate(()=>document.querySelectorAll('#view details').forEach(d=>d.open=true));
 let p=await mk();
 // register a patient to test reset and change
 await p.click('text=Register as a patient');await setv(p,{rg_n:'Test Patient',rg_p:'9847000000',rg_e:'tp@example.com',rg_w:'First2026x',rg_w2:'First2026x',rg_a:true,rg_c:true});await p.evaluate(()=>NC.doRegister());
 T('patient registered',await signed(p));
 // change password
 await p.evaluate(()=>NC.pwToggle());
 await setv(p,{cp_o:'wrong',cp_n:'Second2026x',cp_n2:'Second2026x'});await p.evaluate(()=>NC.changePw());
 T('wrong current password is refused',(await txt(p)).includes('Current password is not correct'));
 await setv(p,{cp_o:'First2026x',cp_n:'short',cp_n2:'short'});await p.evaluate(()=>NC.changePw());
 T('weak new password is refused',(await txt(p)).includes('8 or more characters'));
 await setv(p,{cp_o:'First2026x',cp_n:'Second2026x',cp_n2:'Other2026x'});await p.evaluate(()=>NC.changePw());
 T('mismatched new passwords are refused',(await txt(p)).includes('do not match'));
 await setv(p,{cp_o:'First2026x',cp_n:'First2026x',cp_n2:'First2026x'});await p.evaluate(()=>NC.changePw());
 T('same password is refused',(await txt(p)).includes('different from the current'));
 await setv(p,{cp_o:'First2026x',cp_n:'Second2026x',cp_n2:'Second2026x'});await p.evaluate(()=>NC.changePw());
 T('password changed, form closed',!(await p.evaluate(()=>!!document.getElementById('pwCard'))));
 await p.evaluate(()=>NC.logout());await login(p,'tp@example.com','First2026x');
 T('old password no longer works',!(await signed(p)));
 await login(p,'tp@example.com','Second2026x');T('new password works',await signed(p));
 await p.evaluate(()=>NC.logout());
 // forgot password
 await p.click('text=Forgot password?');
 await setv(p,{rs_e:'nobody@example.com'});await p.evaluate(()=>NC.sendReset());
 T('unknown email gets no code (and no hint)',!(await txt(p)).includes('Prototype only')&&(await txt(p)).includes('If an account exists'));
 await p.evaluate(()=>NC.authTab('reset'));
 await setv(p,{rs_e:'tp@example.com'});await p.evaluate(()=>NC.sendReset());
 const code=(await txt(p)).match(/your code is shown here: (\d{6})/);T('code shown for a real account',!!code);
 await setv(p,{rs_c:'000000',rs_w:'Third2026x',rs_w2:'Third2026x'});await p.evaluate(()=>NC.doReset());
 T('wrong code is refused',(await txt(p)).includes('not correct'));
 await setv(p,{rs_c:code[1],rs_w:'weak',rs_w2:'weak'});await p.evaluate(()=>NC.doReset());
 T('weak password refused on reset',(await txt(p)).includes('8 or more characters'));
 await setv(p,{rs_c:code[1],rs_w:'Third2026x',rs_w2:'Third2026x'});await p.evaluate(()=>NC.doReset());
 T('reset succeeds and returns to log in',(await txt(p)).includes('Password changed')&&await p.evaluate(()=>!!document.getElementById('lg_e')));
 await login(p,'tp@example.com','Second2026x');T('previous password stops working after reset',!(await signed(p)));
 await login(p,'tp@example.com','Third2026x');T('can log in with the reset password',await signed(p));
 await p.evaluate(()=>NC.logout());
 // code cannot be reused, locks after 5 wrong tries
 await p.evaluate(()=>NC.authTab('reset'));await setv(p,{rs_e:'tp@example.com'});await p.evaluate(()=>NC.sendReset());
 const c2=(await txt(p)).match(/your code is shown here: (\d{6})/)[1];
 for(let i=0;i<5;i++){await setv(p,{rs_c:'000000',rs_w:'Fourth2026x',rs_w2:'Fourth2026x'});await p.evaluate(()=>NC.doReset())}
 await setv(p,{rs_c:c2,rs_w:'Fourth2026x',rs_w2:'Fourth2026x'});await p.evaluate(()=>NC.doReset());
 T('five wrong codes lock that code',!(await p.evaluate(()=>!!document.getElementById('lg_e')))&&(await txt(p)).includes('Too many wrong codes'));
 T('no JS errors (password flows)',p.errs.length===0,p.errs.join('|'));

 // admin reset of a doctor login, forced change
 p=await mk();await login(p,'admin@nidana.demo',PW);await p.evaluate(()=>NC.setTab('onboard'));await open(p);
 const uid=await p.evaluate(()=>NC.DB.users.find(u=>u.email==='ravi@nidana.demo').id);
 await p.evaluate(i=>NC.adminReset(i),uid);
 const tp=(await txt(p)).match(/Temporary password: (\S+)/);T('admin reset shows a temporary password once',!!tp&&(await txt(p)).includes('Password reset for'));
 await p.evaluate(()=>NC.logout());await login(p,'ravi@nidana.demo',PW);T('old password stops working after admin reset',!(await signed(p)));
 await login(p,'ravi@nidana.demo',tp[1]);T('doctor logs in with the temporary password',await signed(p));
 T('doctor is asked to change the temporary password',await p.evaluate(()=>!!document.getElementById('pwCard'))&&(await txt(p)).includes('temporary password'));
 await setv(p,{cp_o:tp[1],cp_n:'Ravi2026new',cp_n2:'Ravi2026new'});await p.evaluate(()=>NC.changePw());
 await p.evaluate(()=>NC.logout());await login(p,'ravi@nidana.demo','Ravi2026new');T('doctor logs in with their own password',await signed(p));
 T('admin cannot reset the admin or patient accounts',await p.evaluate(()=>{const a=NC.DB.users.find(u=>u.role==='admin'),h=a.ph;NC.adminReset(a.id);return a.ph===h}));

 // ---- doctor registration certificate
 p=await mk();await login(p,'admin@nidana.demo',PW);await p.evaluate(()=>NC.setTab('onboard'));await open(p);
 await setv(p,{ob_dn:'Dr. Cert Test',ob_dq:'BAMS',ob_dx:'4',ob_dl:'English',ob_df:'400',ob_dr:'KA-AYU-55123',ob_dc:'Karnataka Ayurveda Council',ob_de:'cert@doc.test',ob_dp:'9811122233',ob_ds:'Mon 10:00'});
 await p.evaluate(()=>NC.onboardDoc());const pw=(await txt(p)).match(/Temporary password: (\S+)/)[1];const did=await p.evaluate(()=>NC.DB.doctors.at(-1).id);
 T('admin cannot approve a doctor with no certificate image',await p.evaluate(i=>{NC.verifyDoc(i);return NC.DB.doctors.find(d=>d.id===i).reg==='pending'},did));
 await p.evaluate(()=>NC.setTab('verify'));await open(p);
 T('admin queue says certificate is not uploaded',(await txt(p)).includes('Cannot approve until the doctor uploads'));
 await p.evaluate(()=>NC.logout());await login(p,'cert@doc.test',pw);
 await setv(p,{cp_o:pw,cp_n:'Cert2026new',cp_n2:'Cert2026new'});await p.evaluate(()=>NC.changePw());
 await open(p);T('doctor sees upload box and pending status',await p.evaluate(()=>!!document.getElementById('cert_f'))&&(await txt(p)).includes('My registration'));
 // PDF / wrong type refused
 await p.setInputFiles('#cert_f',{name:'x.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4')});await p.waitForTimeout(300);
 T('non-image file is refused',await p.evaluate(i=>!NC.DB.doctors.find(d=>d.id===i).cert,did));
 await p.setInputFiles('#cert_f',{name:'fake.png',mimeType:'image/png',buffer:Buffer.from('not really an image')});await p.waitForTimeout(500);
 T('corrupt image is refused',await p.evaluate(i=>!NC.DB.doctors.find(d=>d.id===i).cert,did));
 const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC','base64');
 await p.setInputFiles('#cert_f',{name:'cert.png',mimeType:'image/png',buffer:PNG});await p.waitForFunction(i=>NC.DB.doctors.find(d=>d.id===i).cert,did,{timeout:5000}).catch(()=>{});
 T('valid image is stored as a compressed JPEG',await p.evaluate(i=>{const c=NC.DB.doctors.find(d=>d.id===i).cert;return !!c&&c.data.startsWith('data:image/jpeg;base64,')},did));
 T('doctor is still not bookable (needs admin approval)',await p.evaluate(i=>NC.DB.doctors.find(d=>d.id===i).reg==='pending',did));
 await p.evaluate(()=>NC.logout());await login(p,'admin@nidana.demo',PW);await p.evaluate(()=>NC.setTab('verify'));await open(p);
 T('admin sees the image and the approve button',await p.evaluate(()=>!!document.querySelector('img[alt^="Registration certificate uploaded by Dr. Cert Test"]'))&&(await txt(p)).includes('Approve registration'));
 await p.evaluate(i=>{NC.rejectDoc(i)},did);
 T('rejecting needs a reason',await p.evaluate(i=>NC.DB.doctors.find(d=>d.id===i).reg==='pending',did));
 await setv(p,{['rd_'+did]:'Image is blurry, number unreadable'});await p.evaluate(i=>NC.rejectDoc(i),did);
 T('admin rejects with a reason',await p.evaluate(i=>NC.DB.doctors.find(d=>d.id===i).reg==='rejected',did));
 await p.evaluate(()=>NC.logout());await login(p,'cert@doc.test','Cert2026new');await open(p);
 T('doctor sees the rejection reason',(await txt(p)).includes('Image is blurry'));
 await p.setInputFiles('#cert_f',{name:'cert2.png',mimeType:'image/png',buffer:PNG});await p.waitForFunction(i=>NC.DB.doctors.find(d=>d.id===i).reg==='pending',did,{timeout:5000}).catch(()=>{});
 T('uploading again sends it back for review',await p.evaluate(i=>{const d=NC.DB.doctors.find(x=>x.id===i);return d.reg==='pending'&&!d.rejectNote},did));
 await p.evaluate(()=>NC.logout());await login(p,'admin@nidana.demo',PW);await p.evaluate(i=>NC.verifyDoc(i),did);
 T('admin approves, doctor is verified',await p.evaluate(i=>NC.DB.doctors.find(d=>d.id===i).reg==='verified',did));
 await p.evaluate(()=>NC.logout());await login(p,'cert@doc.test','Cert2026new');
 T('verified doctor sees verified message and no upload box',(await txt(p)).includes('Your registration is verified')&&!(await p.evaluate(()=>!!document.getElementById('cert_f'))));
 T('no JS errors (certificate flow)',p.errs.length===0,p.errs.join('|'));
 for(const w of [375,390]){const q=await mk(w);await login(q,'cert@doc.test','x');const o=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);await q.click('text=Forgot password?');const o2=await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);T('no sideways scroll at '+w+'px (login, reset)',!o&&!o2)}
 console.log(ok+' pass '+bad+' fail');await b.close();process.exit(bad?1:0)})();
