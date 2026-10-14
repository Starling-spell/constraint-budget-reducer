const {spawn,spawnSync}=require('node:child_process');
const path=require('node:path');
const os=require('node:os');
const fs=require('node:fs');
const args=process.argv.slice(2);
if(!['deploy','write'].includes(args[0]))throw Error('Only deploy/write supported');
const cli=process.env.REDUCER_CLI_PATH||path.resolve(__dirname,'../../intent-firewall/node_modules/genlayer/dist/index.js');
let password;
const name=process.env.REDUCER_TEST_ACCOUNT;
if(/^constraint-reducer-[0-9a-f]{12}$/.test(name??'')){
  const recovery=path.join(os.homedir(),'.genlayer','keystores',name+'.password.dpapi');
  const result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',
    "Add-Type -AssemblyName System.Security; $cipher=[Convert]::FromBase64String([Console]::In.ReadToEnd()); $secretBytes=[Security.Cryptography.ProtectedData]::Unprotect($cipher,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Text.Encoding]::UTF8.GetString($secretBytes))"],
    {input:fs.readFileSync(recovery,'utf8'),encoding:'utf8',windowsHide:true});
  if(result.status!==0||!result.stdout)throw Error('DPAPI recovery unavailable');
  password=result.stdout;
}
const child=spawn(process.execPath,['--require',path.join(__dirname,'pin_cli_context.cjs'),
  '--require',path.join(__dirname,'broadcast_once.cjs'),cli,...args],
  {windowsHide:true,stdio:['pipe','pipe','pipe']});
let promptBuffer='',passwordSent=false;
child.stdin.on('error',()=>{console.error('Signing input closed; inspect broadcast status before retrying');});
const deadline=setTimeout(()=>{
  child.kill();console.error('CLI timed out; inspect receipt/history before retrying');
},120000);
child.stdout.on('data',chunk=>{
  promptBuffer=(promptBuffer+chunk.toString('utf8')).slice(-2048);
  if(password&&!passwordSent&&promptBuffer.includes('Enter password to unlock')){
    passwordSent=true;child.stdin.write(password+'\n');password=undefined;
  }
});
let carry='',known=false;
child.stderr.on('data',chunk=>{
  carry+=chunk.toString('utf8');
  const lines=carry.split(/\r?\n/);carry=lines.pop();
  if(carry.length>65536)carry='';
  for(const line of lines)if(/^BROADCAST_HASH 0x[0-9a-fA-F]{64}$/.test(line)){known=true;console.log(line);}
});
child.on('error',()=>{console.error('CLI process failed; no blind retries');process.exitCode=1;});
child.on('close',code=>{
  clearTimeout(deadline);
  console.log(JSON.stringify({cli_exit:code,hash_observed:known}));
  if(code!==0||!known){console.error('Inspect receipt/history before retrying');process.exitCode=1;}
});
