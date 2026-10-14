// Fresh test-only wallet. Never reads/exports an existing wallet or prints secrets.
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {randomBytes}=require('node:crypto');
const {spawnSync}=require('node:child_process');
const cliModules=process.env.REDUCER_CLI_MODULES||path.resolve(__dirname,'../../intent-firewall/node_modules');
let phase='dependencies';
(async()=>{
  const {Wallet}=require(require.resolve('ethers',{paths:[cliModules]}));
  const name='constraint-reducer-'+randomBytes(6).toString('hex');
  const password=randomBytes(32).toString('base64url');
  phase='create';
  const wallet=Wallet.createRandom();
  phase='encrypt';
  const encrypted=await wallet.encrypt(password);
  phase='DPAPI-password-protection';
  const protectedPassword=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',
    "Add-Type -AssemblyName System.Security; $secretBytes=[Text.Encoding]::UTF8.GetBytes([Console]::In.ReadToEnd()); $cipher=[Security.Cryptography.ProtectedData]::Protect($secretBytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($cipher))"],
    {input:password,encoding:'utf8',windowsHide:true});
  if(protectedPassword.status!==0||!protectedPassword.stdout.trim())throw Error('DPAPI unavailable');
  phase='encrypted-keystore';
  const directory=path.join(os.homedir(),'.genlayer','keystores');
  fs.mkdirSync(directory,{recursive:true});
  const keystore=path.join(directory,name+'.json');
  fs.writeFileSync(keystore,encrypted,{flag:'wx',mode:0o600});
  const recovery=path.join(directory,name+'.password.dpapi');
  fs.writeFileSync(recovery,protectedPassword.stdout.trim(),{flag:'wx',mode:0o600});
  console.log(JSON.stringify({name,address:wallet.address,keystore,network:'studionet',test_only:true,
    encrypted_password_recovery:recovery,windows_identity_bound:true}));
})().catch(()=>{console.error('Test-wallet setup failed at '+phase+'; no secrets displayed');process.exitCode=1;});
