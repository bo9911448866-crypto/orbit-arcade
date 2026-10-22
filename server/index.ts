import express from 'express';
import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {lookup} from 'mime-types';
import {server as wisp} from '@mercuryworkshop/wisp-js/server';
import {uvPath} from '@titaniumnetwork-dev/ultraviolet';
import {epoxyPath} from '@mercuryworkshop/epoxy-transport';
import {baremuxPath} from '@mercuryworkshop/bare-mux/node';
import {assetPath,games,commit} from './catalog';
wisp.options.allow_private_ips=false;
wisp.options.allow_loopback_ips=false;
wisp.options.allow_udp_streams=false;
wisp.options.port_whitelist=[80,443];
wisp.options.stream_limit_total=128;
const development=process.env.NODE_ENV!=='production' && Boolean(process.argv[1]?.endsWith('.ts'));
const app=express();
app.disable('x-powered-by');
app.use((_req,res,next)=>{res.setHeader('Cross-Origin-Opener-Policy','same-origin');res.setHeader('Cross-Origin-Embedder-Policy','require-corp');res.setHeader('X-Content-Type-Options','nosniff');next();});
app.get('/health',(_req,res)=>res.json({status:'ok',games:games.length,commit}));
app.get('/api/games',(_req,res)=>res.json({games,commit,source:'https://gitlab.com/barryjensen-dev/monkeygg2'}));
app.get('/sw.js',(_req,res)=>{res.setHeader('Service-Worker-Allowed','/');res.setHeader('Cache-Control','no-cache');res.sendFile(resolve('public/sw.js'));});
// Proxy navigations must never be served the arcade SPA or a static 404.
app.use('/uv/service',(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 const navigation=['document','iframe'].includes(String(req.headers['sec-fetch-dest']))||String(req.headers.accept).includes('text/html');
 if((req.method==='GET'||req.method==='HEAD')&&navigation){
  res.sendFile(resolve(development?'proxy-recovery.html':'dist/client/proxy-recovery.html'));return;
 }
 res.status(503).type('text/plain').send('The proxy service worker did not intercept this request. Reopen the Web proxy tab to reconnect.');
});
app.use(express.static(resolve('public')));
app.use('/uv',express.static(uvPath));app.use('/epoxy',express.static(epoxyPath));app.use('/baremux',express.static(baremuxPath));
// Serve original repository bytes without rewriting scripts, WASM, media, or Flash.
app.use(['/games','/imgs','/fonts','/js','/css'],async(req,res)=>{
 const path=assetPath(req.originalUrl.split('?')[0]);
 if(!path){res.status(400).send('Invalid game path');return;}
 const file=resolve('vendor/monkeygg2',path);
 if(existsSync(file)){res.sendFile(file);return;}
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),60000);
 res.on('close',()=>{controller.abort();clearTimeout(timer);});
 try{
 const url=`https://gitlab.com/api/v4/projects/barryjensen-dev%2Fmonkeygg2/repository/files/${encodeURIComponent(path)}/raw?ref=${commit}`;
 const upstream=await fetch(url,{headers:req.headers.range?{Range:req.headers.range}:{},signal:controller.signal});
 if(!upstream.ok){res.status(upstream.status===404?404:502).send('Game asset unavailable from upstream. Please retry.');return;}
 res.status(upstream.status);res.setHeader('Content-Type',lookup(path)||'application/octet-stream');res.setHeader('Cache-Control','public,max-age=86400,immutable');
 for(const key of ['content-length','content-range','accept-ranges']){const v=upstream.headers.get(key);if(v)res.setHeader(key,v);}
 if(upstream.body){const stream=Readable.fromWeb(upstream.body as any);stream.on('error',()=>res.destroy());res.on('close',()=>{controller.abort();clearTimeout(timer);});stream.pipe(res);}else res.end();
 }catch{if(!res.headersSent)res.status(502).send('The game source could not be reached. Retry shortly.');else res.destroy();}
});
if(development){
 const {createServer:createVite}=await import('vite');const vite=await createVite({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);
}else{
 app.use(express.static(resolve('dist/client')));app.get('*',(req,res)=>{if(req.path.startsWith('/uv/')||/\.[\w]+$/.test(req.path))res.sendStatus(404);else res.sendFile(resolve('dist/client/index.html'));});
}
const portArg=process.argv.indexOf('--port');
const port=Number(process.env.PORT||(portArg>=0?process.argv[portArg+1]:3000));
const server=createServer(app);
server.on('upgrade',(req,socket,head)=>{
 try{if(!req.headers.origin || new URL(req.headers.origin).host!==req.headers.host){socket.destroy();return;}}catch{socket.destroy();return;}
 if(req.url?.split('?')[0]==='/wisp/')wisp.routeRequest(req,socket,head);else socket.destroy();
});
server.listen(port,'0.0.0.0',()=>{const address=server.address();console.log('ORBIT ready on port '+(address&&typeof address==='object'?address.port:port));});
process.on('SIGTERM',()=>{server.close();setTimeout(()=>process.exit(0),5000).unref();});
