// ORBIT proxy worker v2: root scope, proxy requests only.
importScripts('/uv/uv.bundle.js','/uv/uv.config.js','/uv/uv.sw.js');
const uv = new UVServiceWorker();
self.addEventListener('fetch',event=>{if(uv.route(event))event.respondWith(uv.fetch(event));});
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
