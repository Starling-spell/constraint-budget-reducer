import fs from 'node:fs';
import crypto from 'node:crypto';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
async function rpc(method,params){
  const response=await fetch('https://studio.genlayer.com/api',{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const payload=await response.json();
  if(payload.error||payload.result==null)throw Error('RPC read failed');
  return payload.result;
}
const ascii=x=>JSON.stringify(x).replace(/[\u007f-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
const canonical=x=>x===null||typeof x!=='object'?ascii(x):Array.isArray(x)?'['+x.map(canonical).join(',')+']':
  '{'+Object.keys(x).sort().map(k=>ascii(k)+':'+canonical(x[k])).join(',')+'}';
const digest=x=>crypto.createHash('sha256').update(canonical(x)).digest('hex');
try{
  const [mode,value,extra]=process.argv.slice(2);
  if(mode==='--source'){
    const normalize=x=>x.replace(/\r\n/g,'\n').trimEnd()+'\n';
    const actual=normalize(Buffer.from(await rpc('gen_getContractCode',[value]),'base64').toString('utf8'));
    const local=normalize(fs.readFileSync('contracts/ConstraintBudgetReducer.py','utf8'));
    console.log(JSON.stringify({address:value,match:actual===local,sha256:crypto.createHash('sha256').update(actual).digest('hex')}));
    if(actual!==local)process.exitCode=1;
  }else if(mode==='--demo'){
    const client=createClient({chain:studionet});
    const key=digest({contract:value,author:extra,nonce:'demo-input'});
    const bundle=await client.readContract({address:value,functionName:'get_bundle',args:[key]});
    const {root,...body}=bundle;
    if(digest(body)!==root)throw Error('Input root mismatch');
    const results=[];
    for(const nonce of ['demo-generated','demo-dropped','demo-invented']){
      const id=digest({contract:value,proposer:extra,nonce});
      let record;
      try{
        record=await client.readContract({address:value,functionName:'get_attempt',args:[id]});
      }catch{results.push({nonce,key:id,not_readable:true});continue;}
        const {root:artifactRoot,...artifact}=record;
        if(digest(artifact)!==artifactRoot||record.report.binding.input_root!==root)throw Error('Artifact root mismatch');
        const audit=record.report.audit;
        const allowed=audit.preserved.every(x=>x==='PASS')&&audit.no_additions==='PASS'&&audit.details_exact==='PASS';
        if((record.status==='COMPACTED')!==allowed)throw Error('Fidelity gate mismatch');
        results.push({nonce,key:id,...record});
    }
    console.log(JSON.stringify({address:value,bundle_key:key,bundle,results}));
  }else{
    if(!['--success','--error'].includes(mode)||!/^0x[0-9a-fA-F]{64}$/.test(value??''))throw Error('Mode/hash required');
    let tx=await rpc('eth_getTransactionByHash',[value]);
    for(let i=0;tx.status!=='FINALIZED'&&i<15;i++){
      await new Promise(resolve=>setTimeout(resolve,2000));tx=await rpc('eth_getTransactionByHash',[value]);
    }
    const leader=tx.consensus_data?.leader_receipt?.find(x=>x.mode==='leader');
    const raw=leader?.genvm_result?.stderr||leader?.result;
    const decoded=typeof raw!=='string'?'':(/^[A-Za-z0-9+/]*={0,2}$/.test(raw)&&raw.length%4===0?Buffer.from(raw,'base64').toString('utf8'):raw);
    console.log(JSON.stringify({hash:value,address:tx.to_address??tx.to,status:tx.status,execution:leader?.execution_result,
      consensus:tx.result_name,...(extra?{expected_error_matched:decoded.includes(extra)}:{})}));
    if(tx.status!=='FINALIZED'||leader?.execution_result!==(mode==='--error'?'ERROR':'SUCCESS')||tx.result_name!=='MAJORITY_AGREE'
        ||(extra&&!decoded.includes(extra)))process.exitCode=1;
  }
}catch{console.error('Sanitized read failed; do not rebroadcast an uncertain transaction');process.exitCode=1;}
