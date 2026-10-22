import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {once} from 'node:events';

test('production serves covers and recovers deep proxy navigations without serving the arcade SPA',async(t)=>{
 const child=spawn(process.execPath,['dist/server/index.js'],{env:{...process.env,NODE_ENV:'production',PORT:'0'},stdio:['ignore','pipe','pipe']});
 let errors='';child.stderr.on('data',chunk=>errors+=chunk);
 t.after(async()=>{if(child.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}});
 const port=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{child.kill();reject(new Error('Server startup timed out: '+errors));},10000);
  child.once('exit',code=>{clearTimeout(timer);reject(new Error('Server exited '+code+': '+errors));});
  const lines=createInterface({input:child.stdout});lines.on('line',line=>{const match=line.match(/ORBIT ready on port (\d+)/);if(match){clearTimeout(timer);lines.close();resolve(match[1]);}});
 });
 const root='http://127.0.0.1:'+port;
 const health=await (await fetch(root+'/health')).json();assert.equal(health.status,'ok');assert.equal(health.games,177);
 const {games}=await (await fetch(root+'/api/games')).json();
 const covers=[...new Set(games.map(g=>g.cover).filter(Boolean))];assert.ok(covers.length>=120);
 for(const cover of covers){const response=await fetch(root+cover);assert.equal(response.status,200,cover);assert.match(response.headers.get('content-type'),/image\/webp/);assert.ok((await response.arrayBuffer()).byteLength>0);}
 for(const path of ['/uv/service/encoded-target','/uv/service/encoded-target/en/g/drive-mad','/uv/service/encoded-target/game.html?q=1']){
  const response=await fetch(root+path,{headers:{Accept:'text/html'}});assert.equal(response.status,200);const html=await response.text();assert.match(html,/Connecting your proxy/);assert.doesNotMatch(html,/Less scrolling|id="root"/);assert.match(html,/\/baremux\/index.js/);assert.match(response.headers.get('cache-control'),/no-store/);
 }
 const resource=await fetch(root+'/uv/service/missed-game.js',{headers:{Accept:'application/javascript'}});assert.equal(resource.status,503);assert.match(await resource.text(),/service worker/);
 const sw=await fetch(root+'/sw.js');assert.equal(sw.headers.get('service-worker-allowed'),'/');assert.match(await sw.text(),/uv.route\(event\)/);
 for(const path of ['/','/uv/uv.bundle.js','/baremux/worker.js','/epoxy/index.mjs'])assert.equal((await fetch(root+path)).status,200,path);
});
