import {initializeProxy} from './proxy';
const title=document.getElementById('title')!,message=document.getElementById('message')!,retry=document.getElementById('retry') as HTMLButtonElement;
const key='orbit-proxy-recovery:'+location.href;
async function connect(){
 try{
  if(!location.pathname.startsWith('/uv/service/'))throw new Error('Open the Web proxy tab to start browsing.');
  const last=Number(sessionStorage.getItem(key)||0);
  if(Date.now()-last<30000)throw new Error('The proxy worker is not intercepting this page. Close other ORBIT tabs, refresh ORBIT, and try again. Your browser must allow service workers.');
  await initializeProxy();
  sessionStorage.setItem(key,String(Date.now()));
  location.reload();
 }catch(error){title.textContent='Connection needs attention';message.textContent=error instanceof Error?error.message:'The proxy could not start. Please retry.';retry.hidden=false;}
}
retry.addEventListener('click',()=>{sessionStorage.removeItem(key);retry.hidden=true;title.textContent='Connecting your proxy…';void connect();});
void connect();
