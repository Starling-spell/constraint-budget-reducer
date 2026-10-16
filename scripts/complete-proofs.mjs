import fs from 'node:fs';
import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
const file='PROOFS.json';
const proofs=JSON.parse(fs.readFileSync(file,'utf8'));
const save=()=>fs.writeFileSync(file,JSON.stringify(proofs,null,2)+'\n');
const canonical=x=>x===null||typeof x!=='object'?JSON.stringify(x):Array.isArray(x)?'['+x.map(canonical).join(',')+']':
  '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
const digest=x=>crypto.createHash('sha256').update(canonical(x)).digest('hex');
const clauses='The operator must encrypt every backup before storing it and must retain the backups for exactly 30 days.\n'+
 'The operator must not export personal data, except when the data subject gives explicit written consent.\n'+
 'The operator must delete temporary logs within 24 hours after the related job finishes.';
const bundle=digest({contract:proofs.address,author:proofs.signer,nonce:'demo-input'});
const attempt=nonce=>digest({contract:proofs.address,proposer:proofs.signer,nonce});
async function child(script,args,onHash){
 return new Promise((resolve,reject)=>{
  const proc=spawn(process.execPath,['--dns-result-order=ipv4first','scripts/'+script,...args],{
   windowsHide:true,env:{...process.env,REDUCER_TEST_ACCOUNT:'studio-proof-deployer'},stdio:['ignore','pipe','pipe']});
  let output='',carry='';proc.stderr.resume();
  proc.stdout.on('data',chunk=>{output+=chunk.toString();carry+=chunk.toString();
   const lines=carry.split(/\r?\n/);carry=lines.pop();
   for(const line of lines)if(/^BROADCAST_HASH 0x[0-9a-fA-F]{64}$/.test(line))onHash?.(line.split(' ')[1]);});
  proc.on('error',()=>reject(Error('Process failed; inspect history')));
  proc.on('close',code=>resolve({code,output}));
 });
}
async function transact(step,args,error){
 let entry=proofs.transactions.find(x=>x.step===step);
 if(!entry){entry={step,verified:false,broadcast_unknown:true};proofs.transactions.push(entry);save();
  await child('run-cli.cjs',args,hash=>{entry.hash=hash;delete entry.broadcast_unknown;save();console.log(step+' '+hash);});
 }
 if(!entry.hash)throw Error('Unknown broadcast outcome; inspect history, do not retry');
 const result=await child('check.mjs',[error?'--error':'--success',entry.hash,...(error?[error]:[])]);
 if(result.code!==0)throw Error('Receipt not verified; resume only with known hash');
 const receipt=JSON.parse(result.output.trim());Object.assign(entry,receipt,{verified:true});save();
 console.log(JSON.stringify({step,status:entry.status,execution:entry.execution}));
}
try{
 const source=await child('check.mjs',['--source',proofs.address]);
 if(source.code!==0)throw Error('Source mismatch or unreadable');proofs.source=JSON.parse(source.output.trim());save();
 await transact('register',['write',proofs.address,'register','--args','demo-input',clauses]);
 await transact('generated',['write',proofs.address,'compact','--args','demo-generated',bundle,'230']);
 await transact('dropped',['write',proofs.address,'assess','--args','demo-dropped',bundle,'230',
  'The operator must encrypt backups before storage and retain them for exactly 30 days.']);
 await transact('invented',['write',proofs.address,'assess','--args','demo-invented',bundle,'230',
  'The operator must encrypt backups, retain them 30 days, export all personal data without consent, and keep temporary logs forever.']);
 await transact('replay',['write',proofs.address,'compact','--args','demo-generated',bundle,'230'],'Attempt nonce used');
 const client=createClient({chain:studionet});
 const read=(name,args)=>client.readContract({address:proofs.address,functionName:name,args});
 const input=await read('get_bundle',[bundle]);
 const {root:inputRoot,...inputBody}=input;
 if(inputRoot!==digest(inputBody))throw Error('Input root mismatch');
 const results=[];
 for(const [nonce,expected] of [['demo-generated','COMPACTED'],['demo-dropped','REJECTED'],['demo-invented','REJECTED']]){
  const key=attempt(nonce),record=await read('get_attempt',[key]);const {root,...body}=record;
  if(root!==digest(body)||record.status!==expected||record.report.binding.input_root!==input.root)throw Error('State/root mismatch');
  const allPass=record.report.audit.preserved.every(x=>x==='PASS')&&record.report.audit.no_additions==='PASS'&&record.report.audit.details_exact==='PASS';
  if(allPass!==(expected==='COMPACTED'))throw Error('Audit gate mismatch');
  const bytes=Buffer.byteLength(record.report.text,'utf8');if(bytes>230||bytes<1)throw Error('Budget mismatch');
  if(expected==='COMPACTED'){
   if(await read('get_compact_text',[key,input.root])!==record.report.text)throw Error('Consumer mismatch');
  }else{
   let rejected=false;try{await read('get_compact_text',[key,input.root]);}catch(e){rejected=e.code===-32000&&e.details==='execution failed';}
   if(!rejected)throw Error('Consumer rejection not verified');
  }
  results.push({nonce,key,bytes,...record});
 }
 let wrongRootRejected=false;
 try{await read('get_compact_text',[attempt('demo-generated'),'f'.repeat(64)]);}catch(e){wrongRootRejected=e.code===-32000&&e.details==='execution failed';}
 if(!wrongRootRejected)throw Error('Wrong-root rejection not verified');
 proofs.state={bundle_key:bundle,bundle:input,results,wrong_root_rejected:true};save();
 console.log(JSON.stringify({source_match:true,readback_verified:true,results:results.map(x=>({nonce:x.nonce,status:x.status,bytes:x.bytes}))}));
}catch{console.error('Proof workflow stopped; inspect recorded hashes and sanitized state checks before retrying');process.exitCode=1;}
