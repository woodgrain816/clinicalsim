/* Clinical Sim offline worker. The sim is the loader page plus one encrypted file, so once
   both are saved here it runs with no internet (school Wi-Fi drops, Chromebooks offline).
   Online, the page is always fetched fresh so updates arrive; the encrypted file is
   versioned (cs.dat?v=tag) and kept until a new one replaces it. */
const CACHE='clinicalsim-df5d0a11b7ce';
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','cs.dat?v=df5d0a11b7ce','hm.dat?v=df5d0a11b7ce','manifest.webmanifest','icon-192.png'])).then(()=>self.skipWaiting())) });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith('clinicalsim-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())) });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  if(r.mode==='navigate'){
    const net=fetch(r,{cache:'no-store'}).then(res=>{ if(res.ok&&!new URL(r.url).search){ const c=res.clone(); caches.open(CACHE).then(ca=>ca.put('./',c)) } return res });
    const slow=new Promise(ok=>setTimeout(ok,5000)).then(()=>caches.match('./'));
    e.respondWith(Promise.race([net.catch(()=>caches.match('./')),slow.then(hit=>hit||net)])); return }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok&&/\.dat/.test(r.url)){ const c=res.clone(); caches.open(CACHE).then(ca=>ca.put(r,c)) } return res }))) });
