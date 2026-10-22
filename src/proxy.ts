/** Resolve plain searches separately from website addresses. */
export function resolveProxyAddress(input:string):string{
 const value=input.trim();
 if(!value)throw new Error('Enter a website address or search.');
 if(/^https?:\/\//i.test(value))return new URL(value).href;
 if(/^[a-z][a-z\d+.-]*:/i.test(value)&&!/^localhost:\d/i.test(value)&&!/^([^\s/:]+\.)+[^\s/:]+:\d/.test(value))throw new Error('Use an HTTP or HTTPS website address.');
 const host=value.split(/[/?#]/)[0];
 if(!/\s/.test(value)&&(host.includes('.')||/^localhost(?::\d+)?$/.test(host)||/^\[[\da-f:]+\](?::\d+)?$/i.test(host))){
  return new URL('https://'+value).href;
 }
 return 'https://html.duckduckgo.com/html/?q='+encodeURIComponent(value);
}
export async function initializeProxy(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext)throw new Error('The proxy needs HTTPS (or localhost) and a browser with service worker support.');
 // Remove only ORBIT's old, narrower registration; otherwise it wins scope matching.
 const registrations=await navigator.serviceWorker.getRegistrations();
 await Promise.all(registrations.filter(r=>new URL(r.scope).pathname==='/uv/service/'&&[r.active,r.waiting,r.installing].some(w=>w&&new URL(w.scriptURL).pathname==='/sw.js')).map(r=>r.unregister()));
 const registration=await navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'});
 await registration.update();
 if(!registration.active){
  await new Promise<void>((resolve,reject)=>{
   const worker=registration.installing||registration.waiting;
   if(!worker){reject(new Error('Service worker unavailable.'));return;}
   const timer=setTimeout(()=>reject(new Error('The proxy worker took too long to start. Please retry.')),20000);
   const check=()=>{if(worker.state==='activated'){clearTimeout(timer);worker.removeEventListener('statechange',check);resolve();}else if(worker.state==='redundant'){clearTimeout(timer);worker.removeEventListener('statechange',check);reject(new Error('The proxy worker could not start.'));}};
   worker.addEventListener('statechange',check);check();
  });
 }
 const connection=new window.BareMux.BareMuxConnection('/baremux/worker.js');
 await connection.setTransport('/epoxy/index.mjs',[{wisp:(location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/wisp/'}]);
}
