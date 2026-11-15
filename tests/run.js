// Runs the suites in order. A suite fails if it exits non-zero or prints a line starting with FAIL
// (t2, t3, t4 and t8 only print, they do not set an exit code).
const {spawnSync}=require('child_process');
const list=process.argv.slice(2).length?process.argv.slice(2):['t2','t3','t4','t6','t7','t8','t9','t10'];
let failed=[];
for(const t of list){
 console.log('== '+t);
 const r=spawnSync('node',['tests/'+t+'.js'],{encoding:'utf8'});
 const out=(r.stdout||'')+(r.stderr||'');process.stdout.write(out);
 if(r.status!==0||/^FAIL/m.test(out)||/TimeoutError|Uncaught/.test(out))failed.push(t);
}
console.log(failed.length?'\nFAILED: '+failed.join(', '):'\nAll suites passed: '+list.join(', '));
process.exit(failed.length?1:0);
